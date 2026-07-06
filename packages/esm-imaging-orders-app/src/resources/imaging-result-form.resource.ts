import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl, useDebounce } from '@openmrs/esm-framework';
import { buildOrderRefObservation, createObservation, buildOrphanedDataNotes } from '../utils/procedure-api.utils';
import { updateOrder } from '../imaging-tabs/test-ordered/pick-imaging-order/add-to-worklist-dialog.resource';
import type { ConfigObject } from '../config-schema';
import type { ConceptReference, ProcedureType, CodedProvider, CodedCondition } from '../types';

export type ConceptSource = { uuid: string; sourceType: string };

const sourceTypeToRestParam: Record<string, string> = {
  'Concept class': 'class',
  'Concept set': 'memberOf',
  'Answer to': 'answerTo',
};

const buildConceptSearchUrl = (query: string, source: ConceptSource): string => {
  const params = new URLSearchParams({ v: 'custom:(uuid,display)' });
  if (query) {
    params.set('name', query);
    params.set('searchType', 'fuzzy');
  }
  if (source.uuid && source.sourceType !== 'any') {
    params.set(sourceTypeToRestParam[source.sourceType] || source.sourceType, source.uuid);
  }
  return `${restBaseUrl}/concept?${params.toString()}`;
};

/**
 * Fetch procedure types from EMRAPI (used for imaging procedures)
 */
export const useProcedureTypes = () => {
  const url = `${restBaseUrl}/proceduretype?v=full`;
  const { data, isLoading } = useSWR<{ data: { results: Array<ProcedureType> } }, Error>(url, openmrsFetch);
  return { procedureTypes: data?.data?.results ?? [], isLoading };
};

/**
 * Fetch body site options (anatomic locations)
 */
export const useBodySites = (bodySiteConceptUuid?: string, sourceType?: string) => {
  const source = bodySiteConceptUuid && sourceType ? { uuid: bodySiteConceptUuid, sourceType } : null;
  const { searchResults, isSearching, error } = useConceptSearch('', source || { uuid: '', sourceType: 'any' });

  return { bodySites: searchResults, isLoading: isSearching, error };
};

/**
 * Search for concepts by query and source filter
 */
export const useConceptSearch = (query: string, source: ConceptSource) => {
  const hasSourceFilter = Boolean(source.uuid) && source.sourceType !== 'any';
  const url = query || hasSourceFilter ? buildConceptSearchUrl(query, source) : null;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<ConceptReference> } }, Error>(url, openmrsFetch);

  const results = data?.data?.results ?? [];

  // Remove duplicates
  const uniqueSearchResults = Array.from(new Map(results.map((concept) => [concept.uuid, concept])).values());

  return { searchResults: uniqueSearchResults, isSearching: isLoading, error };
};

/**
 * Fetch answers for a coded question concept
 * Used for concepts with Coded datatype (e.g., Imaging Modality, Contrast Agent)
 */
export const useConceptAnswers = (conceptUuid: string) => {
  const url = conceptUuid ? `${restBaseUrl}/concept/${conceptUuid}?v=custom:(answers:(uuid,display))` : null;

  const fetcher = async (url: string) => {
    const response = await openmrsFetch(url);
    return response.data;
  };

  const { data, error, isLoading } = useSWR<{ answers: Array<{ uuid: string; display: string }> }, Error>(url, fetcher);

  const answers = data?.answers ?? [];

  return { answerOptions: answers, isLoading, error };
};

/**
 * Search for providers
 */
export const useProvidersSearch = (query: string) => {
  const apiUrl = query ? `/ws/rest/v1/provider?q=${query}&v=custom:(uuid,display,person:(uuid,display))` : null;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedProvider> } }, Error>(apiUrl, openmrsFetch);

  const results = data?.data?.results ?? [];
  return { providerSearchResults: results, isProviderSearching: isLoading, error };
};

/**
 * Search for conditions (diagnoses)
 */
export const useConditionsSearch = (query: string) => {
  const apiUrl = query
    ? `/ws/rest/v1/concept?q=${query}&classUuid=8d4918b0-c2cc-11de-8d13-0010c6dffd0f&v=custom:(uuid,display,concept:(uuid,display))`
    : null;
  const { data, error, isLoading } = useSWR<
    { data: { results: Array<{ display: string; concept: { uuid: string; display: string } }> } },
    Error
  >(apiUrl, openmrsFetch);

  // Transform to match CodedCondition interface
  const results = (data?.data?.results ?? []).map((item) => ({
    display: item.display,
    concept: item.concept,
    conceptName: item.concept,
  }));

  return { conditionSearchResults: results, isConditionSearching: isLoading, error };
};

/**
 * Hook for concept search field
 */
export const useConceptSearchField = (source: ConceptSource) => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const { searchResults, isSearching, error } = useConceptSearch(debouncedSearchTerm, source);
  const clear = () => setSearchTerm('');
  return { searchTerm, setSearchTerm, searchResults, isSearching, error, clear };
};

/**
 * Create imaging observation
 * Helper function to create observations for imaging-specific fields
 */
async function createImagingObservation(
  conceptUuid: string,
  value: any,
  encounterUuid: string,
  patientUuid: string,
  valueType: 'coded' | 'text' | 'numeric' = 'text',
) {
  if (!value && value !== 0) return; // Skip empty values (but allow 0 for numeric)

  const obsPayload: any = {
    concept: conceptUuid,
    obsDatetime: new Date().toISOString(),
    person: patientUuid,
    encounter: encounterUuid,
  };

  // Set value based on type
  if (valueType === 'coded') {
    obsPayload.valueCoded = value;
  } else if (valueType === 'numeric') {
    obsPayload.valueNumeric = value;
  } else {
    obsPayload.valueText = value;
  }

  try {
    await openmrsFetch(`${restBaseUrl}/obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obsPayload),
    });
  } catch (error) {
    console.error('Failed to create imaging observation:', error);
    // Don't throw - observation creation failure shouldn't break procedure creation
  }
}

/**
 * Save imaging result via EMRAPI
 * Creates or reuses encounter, creates procedure, creates observations, and updates order status
 *
 * IMPORTANT: This function first tries to reuse the order's encounter if it exists.
 * If the order doesn't have an encounter, it creates a new one.
 */
export async function saveImagingResult(
  payload: any,
  orderUuid?: string,
  encounterUuid?: string,
  config?: ConfigObject,
) {
  const abortController = new AbortController();

  // Extract extended fields
  const participants = payload.participants || [];
  const complications = payload.complications || [];
  // Exclude complications and participants from procedure payload since they're handled separately
  const { _orphanedData, complications: _, participants: __, ...procedurePayload } = payload;

  // Determine encounter UUID - reuse order's encounter if it exists, otherwise create new
  let finalEncounterUuid = encounterUuid;

  // If no encounter provided, we need to create one
  if (!finalEncounterUuid) {
    // Use encounter datetime from procedure startDateTime, or current time
    const encounterDatetime = procedurePayload.startDateTime
      ? new Date(procedurePayload.startDateTime).toISOString()
      : new Date().toISOString();

    // Create new encounter with participants, location, and datetime
    const encounterPayload: any = {
      patient: payload.patient,
      encounterType: config?.procedureResultEncounterType,
      encounterDatetime: encounterDatetime,
      location: config?.procedureResultEncounterLocation,
    };

    // Add encounter participants
    if (participants.length > 0) {
      encounterPayload.encounterProviders = participants.map((p: any) => ({
        provider: p.provider || p,
        encounterRole: p.encounterRole || config?.procedureResultEncounterRole,
      }));
    }

    // Create the encounter
    const encounterResponse = await openmrsFetch(`${restBaseUrl}/encounter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify(encounterPayload),
    });

    if (!encounterResponse.ok) {
      throw new Error('Imaging encounter creation failed');
    }

    finalEncounterUuid = encounterResponse.data.uuid;
  }

  // Add encounter to procedure payload
  procedurePayload.encounter = finalEncounterUuid;

  // Create the procedure using EMRAPI (accessed via standard procedure resource)
  const procedureResponse = await openmrsFetch(`${restBaseUrl}/procedure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
    body: JSON.stringify(procedurePayload),
  });

  if (!procedureResponse.ok) {
    throw new Error('Imaging procedure creation failed');
  }

  const procedure = procedureResponse.data;

  // Create imaging observations in the existing encounter
  if (finalEncounterUuid && config) {
    // Imaging Details
    await createImagingObservation(
      config.imagingModalityConceptUuid,
      payload.imagingModality,
      finalEncounterUuid,
      payload.patient,
      'coded',
    );

    await createImagingObservation(
      config.contrastAgentConceptUuid,
      payload.contrastAgent,
      finalEncounterUuid,
      payload.patient,
      'coded',
    );

    await createImagingObservation(
      config.accessionNumberConceptUuid,
      payload.accessionNumber,
      finalEncounterUuid,
      payload.patient,
      'text',
    );

    await createImagingObservation(
      config.dicomStudyUidConceptUuid,
      payload.dicomStudyUid,
      finalEncounterUuid,
      payload.patient,
      'text',
    );

    await createImagingObservation(
      config.radiationDoseConceptUuid,
      payload.radiationDose,
      finalEncounterUuid,
      payload.patient,
      'numeric',
    );

    await createImagingObservation(
      config.clinicalIndicationConceptUuid,
      payload.clinicalIndication,
      finalEncounterUuid,
      payload.patient,
      'text',
    );

    // Imaging Results
    await createImagingObservation(
      config.imagingFindingsConceptUuid,
      payload.imagingFindings,
      finalEncounterUuid,
      payload.patient,
      'text',
    );

    await createImagingObservation(
      config.imagingImpressionConceptUuid,
      payload.imagingImpression,
      finalEncounterUuid,
      payload.patient,
      'text',
    );
  }

  // Create observations for complications
  if (complications.length > 0 && finalEncounterUuid) {
    for (const complication of complications) {
      await createComplicationObservation(complication, finalEncounterUuid, payload.patient);
    }
  }

  // Create order reference observation
  if (orderUuid && finalEncounterUuid && config?.procedureOrderRefConceptUuid) {
    const orderRefObs = buildOrderRefObservation(
      config.procedureOrderRefConceptUuid,
      orderUuid,
      finalEncounterUuid,
      payload.patient,
    );
    await createObservation(orderRefObs);
  }

  // Update order fulfiller status
  if (orderUuid) {
    await updateOrder(orderUuid, { fulfillerStatus: 'COMPLETED' });
  }

  return procedure;
}

/**
 * Create complication observation
 */
async function createComplicationObservation(complication: any, encounterUuid: string, patientUuid: string) {
  const obsPayload = {
    concept: complication.concept,
    obsDatetime: new Date().toISOString(),
    person: patientUuid,
    encounter: encounterUuid,
    groupMembers: complication.groupMembers || [],
  };

  try {
    await openmrsFetch(`${restBaseUrl}/obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obsPayload),
    });
  } catch (error) {
    console.error('Failed to create complication observation:', error);
    // Don't throw - observation creation failure shouldn't break procedure creation
  }
}
