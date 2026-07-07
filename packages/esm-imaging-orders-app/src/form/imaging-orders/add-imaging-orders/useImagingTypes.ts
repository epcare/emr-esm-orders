import { useEffect, useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import fuzzy from 'fuzzy';
import { type FetchResponse, openmrsFetch, useConfig, restBaseUrl, reportError } from '@openmrs/esm-framework';
import { type Concept } from '../../../types';
import { type ImagingConfig } from '../../../config-schema';

type ConceptResult = FetchResponse<Concept>;
type ConceptResults = FetchResponse<{ setMembers: Array<Concept> }>;

export interface ImagingType {
  label: string;
  conceptUuid: string;
}

export interface UseImagingType {
  testTypes: Array<ImagingType>;
  isLoading: boolean;
  error: Error;
}

function openmrsFetchMultiple(urls: Array<string>) {
  // SWR has an RFC for `useSWRList`:
  // https://github.com/vercel/swr/discussions/1988
  // If that ever is implemented we should switch to using that.
  return Promise.all(urls.map((url) => openmrsFetch<{ results: Array<Concept> }>(url)));
}

function useImagingConceptsSWR(imagingOrderableConcepts?: Array<string>) {
  const config = useConfig<ImagingConfig>();
  const { data, isLoading, error } = useSWRImmutable(
    () =>
      imagingOrderableConcepts
        ? imagingOrderableConcepts.map((c) => `${restBaseUrl}/concept/${c}`)
        : `${restBaseUrl}/concept/${config.radiologyConceptSetUuid}?v=custom:setMembers`,
    (imagingOrderableConcepts ? openmrsFetchMultiple : openmrsFetch) as any,
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
    return imagingOrderableConcepts
      ? (data as Array<ConceptResult>)?.flatMap((d) => d.data.setMembers)
      : ((data as ConceptResults)?.data.setMembers ?? ([] as Concept[]));
  }, [data, isLoading, error, imagingOrderableConcepts]);

  return {
    data: results,
    isLoading,
    error,
  };
}

export function useImagingTypes(searchTerm = ''): UseImagingType {
  const { imagingOrderableConcepts } = useConfig<ImagingConfig>().orders;

  const { data, isLoading, error } = useImagingConceptsSWR(
    imagingOrderableConcepts.length ? imagingOrderableConcepts : null,
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
  }, [testConcepts, searchTerm, isLoading, error]);

  return {
    testTypes: filteredTestTypes,
    isLoading: isLoading,
    error: error,
  };
}
