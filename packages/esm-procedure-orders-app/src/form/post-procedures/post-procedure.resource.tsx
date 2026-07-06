import useSWR from 'swr';
import { type OpenmrsResource, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type CodedProvider, type CodedCondition, type ProcedurePayload } from '../../types';
import { updateOrder } from '../../procedures-ordered/pick-procedure-order/add-to-worklist-dialog.resource';
import { buildOrderRefObservation, createObservation, buildOrphanedDataNotes } from '../../utils/procedure-api.utils';
import { type ConfigObject } from '../../config-schema';

type Provider = {
  uuid: string;
  display: string;
  person: OpenmrsResource;
};

export const useProviders = () => {
  const url = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))`;
  const { data, error, isLoading } = useSWR<{
    data: { results: Array<Provider> };
  }>(url, openmrsFetch);

  return {
    providers: data?.data.results ?? [],
    isLoadingProviders: isLoading,
    loadingProvidersError: error,
  };
};

export async function savePostProcedure(
  reportPayload: Partial<ProcedurePayload>,
  config: ConfigObject,
  encounterUuid?: string,
  useOrderEncounter = true,
) {
  const abortController = new AbortController();

  // Extract orphaned data, participants, and complications before sending to API
  const { _orphanedData, participants, complications, ...apiPayload } = reportPayload;

  // Use encounter datetime from procedure startDateTime, or current time
  const encounterDatetime = apiPayload.startDateTime
    ? new Date(apiPayload.startDateTime).toISOString()
    : new Date().toISOString();
  const procedureOrderUuid = _orphanedData?.procedureOrder || reportPayload.procedureOrder;

  // Build observation array to include in encounter payload
  const obs = [];

  // Add procedure notes as observation (if configured)
  if (apiPayload.notes && config.procedureNotesConceptUuid) {
    obs.push({
      concept: config.procedureNotesConceptUuid,
      valueText: apiPayload.notes,
      obsDatetime: encounterDatetime,
      person: apiPayload.patient,
    });
  }

  // Add order reference observation
  if (procedureOrderUuid && config.procedureOrderRefConceptUuid) {
    obs.push({
      concept: config.procedureOrderRefConceptUuid,
      value: procedureOrderUuid,
      obsDatetime: encounterDatetime,
      person: apiPayload.patient,
    });
  }

  // Add complications observations (grouped)
  if (complications && complications.length > 0) {
    for (const complication of complications) {
      obs.push({
        concept: complication.concept,
        obsDatetime: encounterDatetime,
        person: apiPayload.patient,
        groupMembers: complication.groupMembers || [],
      });
    }
  }

  // Determine encounter UUID - reuse order's encounter if it exists and useOrderEncounter is true
  let finalEncounterUuid = encounterUuid;

  // If no encounter provided or not using order encounter, we need to create one
  if (!finalEncounterUuid || !useOrderEncounter) {
    const encounterPayload: any = {
      patient: apiPayload.patient,
      encounterType: config.procedureResultEncounterType,
      encounterDatetime: encounterDatetime,
      location: config.procedureResultEncounterLocation || undefined,
      obs: obs.length > 0 ? obs : undefined,
    };

    // Add encounter participants
    if (participants && participants.length > 0) {
      encounterPayload.encounterProviders = participants;
    }

    const encounterResponse = await openmrsFetch('/ws/rest/v1/encounter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify(encounterPayload),
    });

    if (!encounterResponse.ok) {
      throw new Error('Failed to create encounter for procedure report');
    }

    finalEncounterUuid = encounterResponse.data.uuid;
  } else {
    // Update existing encounter with new observations and participants
    const encounterUpdatePayload: any = {
      obs: obs.length > 0 ? obs : undefined,
    };

    // Add encounter providers if updating
    if (participants && participants.length > 0) {
      encounterUpdatePayload.encounterProviders = participants;
    }

    const encounterResponse = await openmrsFetch(`/ws/rest/v1/encounter/${finalEncounterUuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify(encounterUpdatePayload),
    });

    if (!encounterResponse.ok) {
      throw new Error('Failed to update encounter for procedure report');
    }
  }

  // Link the procedure to the encounter
  apiPayload.encounter = finalEncounterUuid;

  // Create the procedure using EMRAPI (accessed via standard procedure resource)
  const updateResults = await openmrsFetch(`/ws/rest/v1/procedure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: JSON.stringify(apiPayload),
  });

  if (updateResults.status !== 201 && updateResults.status !== 200) {
    throw new Error('Procedure creation failed');
  }

  // Update order fulfiller status
  return await updateOrder(procedureOrderUuid, {
    fulfillerStatus: 'COMPLETED',
  });
}

export function useConditionsSearch(conditionToLookup: string) {
  const config = useConfig();
  const conditionConceptClassUuid = config?.conditionConceptClassUuid;
  const conditionsSearchUrl = `${restBaseUrl}/conceptsearch?conceptClasses=${conditionConceptClassUuid}&q=${conditionToLookup}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedCondition> } }, Error>(
    conditionToLookup ? conditionsSearchUrl : null,
    openmrsFetch,
  );

  return {
    searchResults: data?.data?.results ?? [],
    error: error,
    isSearching: isLoading,
  };
}

export function useProvidersSearch(providerToLookup: string) {
  const providerSearchUrl = `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))&q=${providerToLookup}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<CodedProvider> } }, Error>(
    providerToLookup ? providerSearchUrl : null,
    openmrsFetch,
  );

  return {
    providerSearchResults: data?.data?.results ?? [],
    error: error,
    isProviderSearching: isLoading,
  };
}
