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
 * Create a new encounter for imaging results
 */
export async function createImagingResultEncounter(
  patientUuid: string,
  encounterTypeUuid: string,
  locationUuid?: string,
) {
  const encounterPayload = {
    patient: patientUuid,
    encounterType: encounterTypeUuid,
    encounterDatetime: new Date().toISOString(),
    location: locationUuid,
  };

  const response = await openmrsFetch(`${restBaseUrl}/encounter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(encounterPayload),
  });

  if (response.ok) {
    return response.data.uuid;
  }
  throw new Error('Failed to create encounter');
}

/**
 * Save imaging result via EMRAPI
 * Handles procedure creation, observations, and order status update
 */
export async function saveImagingResult(
  payload: any,
  orderUuid?: string,
  encounterUuid?: string,
  useOrderEncounter = true,
  config?: ConfigObject,
) {
  const abortController = new AbortController();

  // Extract extended fields
  const { participants, complications, _orphanedData, ...procedurePayload } = payload;

  // Determine encounter UUID
  const finalEncounterUuid = encounterUuid;
  if (!useOrderEncounter && !encounterUuid) {
    throw new Error('Encounter UUID required when useOrderEncounter is false');
  }

  // Add encounter to procedure payload
  procedurePayload.encounter = finalEncounterUuid;

  // Create the procedure using EMRAPI endpoint
  const procedureResponse = await openmrsFetch(`${restBaseUrl}/emrapi/procedure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: abortController.signal,
    body: JSON.stringify(procedurePayload),
  });

  if (!procedureResponse.ok) {
    throw new Error('Imaging procedure creation failed');
  }

  const procedure = procedureResponse.data;

  // Create observations for complications
  if (complications && complications.length > 0 && finalEncounterUuid) {
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

  await openmrsFetch(`${restBaseUrl}/obs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obsPayload),
  });
}
