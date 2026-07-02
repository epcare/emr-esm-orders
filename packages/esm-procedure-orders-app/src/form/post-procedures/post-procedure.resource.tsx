import useSWR from 'swr';
import { type OpenmrsResource, openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { type CodedProvider, type CodedCondition, type ProcedurePayload } from '../../types';
import { updateOrder } from '../../procedures-ordered/pick-procedure-order/add-to-worklist-dialog.resource';
import {
  buildOrderRefObservation,
  createObservation,
  buildOrphanedDataNotes,
} from '../../utils/procedure-api.utils';
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
  encounterUuid?: string
) {
  const abortController = new AbortController();

  // Extract orphaned data before sending to API
  const { _orphanedData, ...apiPayload } = reportPayload;

  // Create the procedure using EMRAPI endpoint
  const updateResults = await openmrsFetch(`/ws/rest/v1/emrapi/procedure`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: abortController.signal,
    body: JSON.stringify(apiPayload),
  });

  if (updateResults.status === 201 || updateResults.status === 200) {
    // Create order reference observation
    const procedureOrderUuid = _orphanedData?.procedureOrder || reportPayload.procedureOrder;
    const patientUuid = reportPayload.patient;

    if (procedureOrderUuid && patientUuid && encounterUuid && config.procedureOrderRefConceptUuid) {
      const orderRefObs = buildOrderRefObservation(
        config.procedureOrderRefConceptUuid,
        procedureOrderUuid,
        encounterUuid,
        patientUuid
      );
      await createObservation(orderRefObs);
    }

    // Update order fulfiller status
    return await updateOrder(procedureOrderUuid, {
      fulfillerStatus: 'COMPLETED',
    });
  }

  throw new Error('Procedure creation failed');
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
