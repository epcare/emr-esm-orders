import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import fuzzy from 'fuzzy';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';
import { type ConfigObject } from '../../../config-schema';
import { type Concept } from '../api';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ setMembers: Array<Concept> }>;

export interface ProceduresType {
  label: string;
  conceptUuid: string;
}

export interface UseProceduresType {
  testTypes: Array<ProceduresType>;
  isLoading: boolean;
  error: Error;
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useProceduresConceptsSWR(procedureOrderableConcepts?: Array<string>) {
  const config = useConfig<ConfigObject>();
  const { data, isLoading, error } = useSWRImmutable(
    () =>
      procedureOrderableConcepts
        ? procedureOrderableConcepts.map((c) => `${restBaseUrl}/concept/${c}`)
        : `${restBaseUrl}/concept/${config.procedureConceptSetUuid}?v=custom:setMembers`,
    (procedureOrderableConcepts ? openmrsFetchMultiple : openmrsFetch) as any,
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
    return procedureOrderableConcepts
      ? (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers)
      : ((data as ConceptResults)?.data.setMembers ?? ([] as Concept[]));
  }, [data, isLoading, error]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useProceduresTypes(searchTerm = ''): UseProceduresType {
  const {
    orders: { procedureOrderableConcepts },
  } = useConfig<ConfigObject>();

  const { data, isLoading, error } = useProceduresConceptsSWR(
    procedureOrderableConcepts.length ? procedureOrderableConcepts : null,
  );

  useEffect(() => {
    if (error) {
      reportError(error);
    }
  }, [error]);

  const testConcepts = useMemo(() => {
    return data?.map((concept) => ({
      label: concept.display,
      conceptUuid: concept.uuid,
    }));
  }, [data]);

  const filteredTestTypes = useMemo(() => {
    return searchTerm && !isLoading && !error
      ? fuzzy.filter(searchTerm, testConcepts, { extract: (c) => c.label }).map((result) => result.original)
      : testConcepts;
  }, [testConcepts, searchTerm]);

  return {
    testTypes: filteredTestTypes,
    isLoading: isLoading,
    error: error,
  };
}
