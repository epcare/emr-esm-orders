/**
 * Imaging Observation Utilities
 *
 * Helper functions for creating and managing imaging-specific observations
 * following the Procedure + Observations architecture.
 *
 * See IMAGING_ARCHITECTURE.md for more details.
 */

import type { ImagingConfig } from '../config-schema';
import type { ImagingObservationType } from '../constants/imaging-observations';
import { IMAGING_OBSERVATIONS, getObservationConceptUuid } from '../constants/imaging-observations';

/**
 * Base observation structure for OpenMRS
 */
export interface BaseObservation {
  concept: string; // Concept UUID
  value?: string | number | boolean | CodedObservationValue; // Single value
  obsDatetime?: string; // When the observation was recorded
  person: string; // Patient UUID
  encounter?: string; // Encounter UUID
  order?: string; // Optional order UUID
  comment?: string;
}

/**
 * Complex observation structure (for image attachments)
 */
export interface ComplexObservation extends Omit<BaseObservation, 'value'> {
  value: unknown; // Complex value structure
  groupMembers?: Array<BaseObservation | ComplexObservation>; // For obs groups
}

/**
 * Coded observation value
 */
export interface CodedObservationValue {
  uuid: string; // Answer concept UUID
  display?: string;
}

/**
 * Imaging observation value based on data type
 */
export type ImagingObservationValue =
  | string // Text value
  | number // Numeric value
  | CodedObservationValue // Coded value
  | ComplexObservation['value']; // Complex value (images)

/**
 * Create an observation for imaging details
 *
 * @param config - The imaging configuration
 * @param observationType - The type of observation to create
 * @param value - The observation value
 * @param patientUuid - The patient UUID
 * @param encounterUuid - The encounter UUID
 * @param obsDatetime - Optional observation datetime (defaults to now)
 * @returns The observation object
 */
export function createImagingObservation(
  config: ImagingConfig,
  observationType: ImagingObservationType,
  value: ImagingObservationValue,
  patientUuid: string,
  encounterUuid: string,
  obsDatetime?: string,
): BaseObservation | ComplexObservation {
  const conceptUuid = getObservationConceptUuid(config, observationType);

  if (!conceptUuid) {
    const configKey = String(IMAGING_OBSERVATIONS[observationType].configKey);
    throw new Error(
      `Cannot create observation for type "${observationType}": Concept UUID not configured. ` +
        `Please configure ${configKey} in spa-config.json.`,
    );
  }

  const metadata = IMAGING_OBSERVATIONS[observationType];

  // Build the observation based on data type
  const baseObservation: BaseObservation = {
    concept: conceptUuid,
    person: patientUuid,
    encounter: encounterUuid,
    obsDatetime: obsDatetime || new Date().toISOString(),
  };

  // Handle different value types
  if (metadata.dataType === 'coded' && typeof value === 'object' && 'uuid' in value) {
    // Coded value - store as concept UUID
    baseObservation.value = (value as CodedObservationValue).uuid;
  } else if (metadata.dataType === 'numeric') {
    // Numeric value
    baseObservation.value = typeof value === 'number' ? value : parseFloat(String(value));
  } else if (metadata.dataType === 'complex') {
    // Complex value (images) - use ComplexObservation
    return {
      ...baseObservation,
      value: value as ComplexObservation['value'],
    } as ComplexObservation;
  } else {
    // Text value
    baseObservation.value = String(value);
  }

  return baseObservation;
}

/**
 * Create multiple imaging observations at once
 *
 * @param config - The imaging configuration
 * @param observations - Map of observation type to value
 * @param patientUuid - The patient UUID
 * @param encounterUuid - The encounter UUID
 * @param obsDatetime - Optional observation datetime
 * @returns Array of observations
 */
export function createImagingObservations(
  config: ImagingConfig,
  observations: Partial<Record<ImagingObservationType, ImagingObservationValue>>,
  patientUuid: string,
  encounterUuid: string,
  obsDatetime?: string,
): Array<BaseObservation | ComplexObservation> {
  const result: Array<BaseObservation | ComplexObservation> = [];

  for (const [type, value] of Object.entries(observations)) {
    if (value !== undefined && value !== null && value !== '') {
      const obs = createImagingObservation(
        config,
        type as ImagingObservationType,
        value,
        patientUuid,
        encounterUuid,
        obsDatetime,
      );
      result.push(obs);
    }
  }

  return result;
}

/**
 * Create an observation group
 *
 * @param groupConceptUuid - The concept UUID for the group itself
 * @param members - The member observations
 * @param patientUuid - The patient UUID
 * @param encounterUuid - The encounter UUID
 * @param obsDatetime - Optional observation datetime
 * @returns The grouped observation
 */
export function createImagingObservationGroup(
  groupConceptUuid: string,
  members: Array<BaseObservation | ComplexObservation>,
  patientUuid: string,
  encounterUuid: string,
  obsDatetime?: string,
): ComplexObservation {
  return {
    concept: groupConceptUuid,
    person: patientUuid,
    encounter: encounterUuid,
    obsDatetime: obsDatetime || new Date().toISOString(),
    groupMembers: members,
    value: null, // Groups don't have a direct value
  };
}

/**
 * Validate that required observation values are present
 *
 * @param config - The imaging configuration
 * @param observations - The observations to validate
 * @returns Object with validation results
 */
export function validateImagingObservations(
  config: ImagingConfig,
  observations: Partial<Record<ImagingObservationType, ImagingObservationValue>>,
): {
  isValid: boolean;
  missing: Array<{ type: ImagingObservationType; label: string }>;
} {
  const missing: Array<{ type: ImagingObservationType; label: string }> = [];

  for (const [type, metadata] of Object.entries(IMAGING_OBSERVATIONS)) {
    if (metadata.required) {
      const value = observations[type as ImagingObservationType];
      if (value === undefined || value === null || value === '') {
        missing.push({ type: type as ImagingObservationType, label: metadata.label });
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Get the data type for an observation type
 */
export function getObservationDataType(
  observationType: ImagingObservationType,
): 'coded' | 'text' | 'numeric' | 'complex' {
  return IMAGING_OBSERVATIONS[observationType].dataType;
}

/**
 * Check if an observation type is required
 */
export function isObservationRequired(observationType: ImagingObservationType): boolean {
  return IMAGING_OBSERVATIONS[observationType].required;
}
