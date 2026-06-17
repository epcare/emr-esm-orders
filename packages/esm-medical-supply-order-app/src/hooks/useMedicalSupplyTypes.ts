import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import fuzzy from 'fuzzy';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';

import { type MedicalSupplyConfig } from '../config-schema';
import { type Concept } from '../types';
import useSWR from 'swr';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ setMembers: Array<Concept> }>;

export interface MedicalSupplyType {
  label: string;
  conceptUuid: string;
}

export interface UseMedicalSupplyType {
  medicalSupplyTypes: Array<MedicalSupplyType>;
  isLoading: boolean;
  error: Error;
}

export function useQuantityUnits() {
  const config = useConfig<MedicalSupplyConfig>();
  const apiUrl = `${restBaseUrl}/concept/${config.medicalSupplyQuantityUnitsConceptSetUuid}?v=custom:setMembers`;
  const { data, error, isLoading } = useSWR<{ data: Concept }, Error>(apiUrl, openmrsFetch);
  return {
    quantityUnits: data?.data?.setMembers ? data?.data?.setMembers : [],
    isLoading,
    isError: error,
  };
}

function useMedicalSupplyConceptsSWR() {
  const config = useConfig<MedicalSupplyConfig>();
  const { data, isLoading, error } = useSWRImmutable(
    `${restBaseUrl}/concept/${config.medicalSupplyConceptSetUuid}?v=custom:setMembers`,
    openmrsFetch,
    {
      shouldRetryOnError(err) {
        return err instanceof Response;
      },
    },
  );

  const results = useMemo(() => {
    if (isLoading || error) {
      return null;
    }
    return (data as ConceptResults)?.data?.setMembers ?? ([] as Concept[]);
  }, [data, isLoading, error]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useMedicalSupplyTypes(searchTerm = ''): UseMedicalSupplyType {
  const { data, isLoading, error } = useMedicalSupplyConceptsSWR();

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const medicalSupplyConcepts = useMemo(() => {
    return data?.map((concept) => ({
      label: concept.display,
      conceptUuid: concept.uuid,
    }));
  }, [data]);

  const filteredMedicalSupplyTypes = useMemo(() => {
    return searchTerm && !isLoading && !error
      ? fuzzy.filter(searchTerm, medicalSupplyConcepts, { extract: (c) => c.label }).map((result) => result.original)
      : medicalSupplyConcepts;
  }, [medicalSupplyConcepts, searchTerm, isLoading, error]);

  return {
    medicalSupplyTypes: filteredMedicalSupplyTypes,
    isLoading: isLoading,
    error: error,
  };
}
