import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type Procedure } from '../types';
import { type ImagingConfig } from '../config-schema';
import { parseOrphanedDataNotes } from '../utils/procedure-api.utils';

/**
 * Fetch procedures for a patient
 * Uses the emrapi Procedure resource
 */
export function useProcedures(patientUuid: string | undefined, includeAll = false) {
  const apiUrl = patientUuid
    ? `/ws/rest/v1/emrapi/procedure?patient=${patientUuid}&includeAll=${includeAll}&v=full`
    : null;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Array<Procedure> } }, Error>(
    apiUrl,
    openmrsFetch,
  );

  return {
    procedures: data?.data?.results || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Fetch procedures for a specific order
 * This filters procedures by checking the notes JSON for the procedure order reference
 */
export function useProceduresByOrder(patientUuid: string | undefined, orderUuid: string | undefined) {
  const { procedures, isLoading, error, mutate } = useProcedures(patientUuid);

  const filteredProcedures = procedures.filter((procedure) => {
    if (!procedure.notes) return false;
    try {
      const orphanedData = parseOrphanedDataNotes(procedure.notes);
      return orphanedData.procedureOrder === orderUuid;
    } catch {
      return false;
    }
  });

  return {
    procedures: filteredProcedures,
    isLoading,
    error,
    mutate,
  };
}

/**
 * Get the first procedure for an order (if exists)
 */
export function useProcedureByOrder(patientUuid: string | undefined, orderUuid: string | undefined) {
  const { procedures, isLoading, error, mutate } = useProceduresByOrder(patientUuid, orderUuid);

  return {
    procedure: procedures[0] || null,
    isLoading,
    error,
    mutate,
  };
}
