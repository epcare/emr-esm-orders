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
  useOrderEncounter = true,
) {
  const abortController = new AbortController();

  // Extract extended fields
  const participants = payload.participants || [];
  const complications = payload.complications || [];

  // Exclude fields that are only for observations from procedure payload
  const {
    _orphanedData,
    complications: _c,
    participants: _p,
    imagingModality: _im,
    contrastAgent: _ca,
    accessionNumber: _an,
    dicomStudyUid: _dsu,
    radiationDose: _rd,
    clinicalIndication: _ci,
    imagingFindings: _if,
    imagingImpression: _ii,
    imagingImages: _iis,
    ...procedurePayload
  } = payload;

  // Use encounter datetime from procedure startDateTime, or current time
  const encounterDatetime = procedurePayload.startDateTime
    ? new Date(procedurePayload.startDateTime).toISOString()
    : new Date().toISOString();

  // Build observation array to include in encounter payload
  const obs = [];

  // Add imaging observations
  if (config) {
    // Imaging Details
    if (payload.imagingModality) {
      obs.push({
        concept: config.imagingModalityConceptUuid,
        valueCoded: payload.imagingModality,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.contrastAgent) {
      obs.push({
        concept: config.contrastAgentConceptUuid,
        valueCoded: payload.contrastAgent,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.accessionNumber) {
      obs.push({
        concept: config.accessionNumberConceptUuid,
        valueText: payload.accessionNumber,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.dicomStudyUid) {
      obs.push({
        concept: config.dicomStudyUidConceptUuid,
        valueText: payload.dicomStudyUid,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.radiationDose != null) {
      obs.push({
        concept: config.radiationDoseConceptUuid,
        valueNumeric: payload.radiationDose,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.clinicalIndication) {
      obs.push({
        concept: config.clinicalIndicationConceptUuid,
        valueText: payload.clinicalIndication,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    // Imaging Results
    if (payload.imagingFindings) {
      obs.push({
        concept: config.imagingFindingsConceptUuid,
        valueText: payload.imagingFindings,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    if (payload.imagingImpression) {
      obs.push({
        concept: config.imagingImpressionConceptUuid,
        valueText: payload.imagingImpression,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
    // Order reference
    if (orderUuid && config.procedureOrderRefConceptUuid) {
      obs.push({
        concept: config.procedureOrderRefConceptUuid,
        value: orderUuid,
        obsDatetime: encounterDatetime,
        person: payload.patient,
      });
    }
  }

  // Add complications observations
  if (complications.length > 0) {
    for (const complication of complications) {
      obs.push({
        concept: complication.concept,
        obsDatetime: encounterDatetime,
        person: payload.patient,
        groupMembers: complication.groupMembers || [],
      });
    }
  }

  // Determine encounter UUID - reuse order's encounter if it exists and useOrderEncounter is true
  let finalEncounterUuid = encounterUuid;

  // If no encounter provided or not using order encounter, we need to create one
  if (!finalEncounterUuid || !useOrderEncounter) {
    // Create new encounter with participants, location, datetime, and observations
    const encounterPayload: any = {
      patient: payload.patient,
      encounterType: config?.procedureResultEncounterType,
      encounterDatetime: encounterDatetime,
      location: config?.procedureResultEncounterLocation,
      obs: obs.length > 0 ? obs : undefined,
    };

    // Add encounter participants
    if (participants.length > 0) {
      encounterPayload.encounterProviders = participants.map((p: any) => ({
        provider: p.provider || p,
        encounterRole: p.encounterRole || config?.procedureResultEncounterRole,
      }));
    }

    // Create the encounter WITH observations included
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
  } else {
    // Update existing encounter with new observations
    const encounterUpdatePayload: any = {
      obs: obs.length > 0 ? obs : undefined,
    };

    const encounterResponse = await openmrsFetch(`${restBaseUrl}/encounter/${finalEncounterUuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify(encounterUpdatePayload),
    });

    if (!encounterResponse.ok) {
      throw new Error('Imaging encounter update failed');
    }
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
