/**
 * Imaging Observation Constants
 *
 * This file defines the structure for imaging-specific observations.
 * These observations capture the rich details of imaging procedures
 * following the architecture: Procedure = event, Observations = details.
 *
 * See IMAGING_ARCHITECTURE.md for more details.
 */

import type { ImagingConfig } from '../config-schema';

/**
 * Imaging observation types
 * These represent the different observations that can be captured
 * for imaging procedures within an encounter.
 */
export type ImagingObservationType =
  | 'imagingModality'
  | 'contrastAgent'
  | 'accessionNumber'
  | 'dicomStudyUid'
  | 'radiationDose'
  | 'clinicalIndication'
  | 'imagingFindings'
  | 'imagingImpression'
  | 'imagingImages';

/**
 * Imaging observation metadata
 * Describes the data type and validation rules for each observation type
 */
export interface ImagingObservationMetadata {
  /** The observation type key */
  type: ImagingObservationType;
  /** Display label for the observation */
  label: string;
  /** Description of what this observation captures */
  description: string;
  /** Expected data type */
  dataType: 'coded' | 'text' | 'numeric' | 'complex';
  /** Whether this observation is required */
  required: boolean;
  /** Config key to get the concept UUID */
  configKey: keyof ImagingConfig;
  /** Concept class UUID for filtering answer concepts (for coded observations) */
  conceptClassUuid?: string;
}

/**
 * Metadata for all imaging observation types
 */
export const IMAGING_OBSERVATIONS: Record<ImagingObservationType, ImagingObservationMetadata> = {
  imagingModality: {
    type: 'imagingModality',
    label: 'Imaging Modality',
    description: 'The imaging modality used (CT, MRI, Ultrasound, X-ray, etc.)',
    dataType: 'coded',
    required: true,
    configKey: 'imagingModalityConceptUuid',
    conceptClassUuid: '8caa332c-efe4-4025-8b18-3398328e1323', // Radiology concept class
  },
  contrastAgent: {
    type: 'contrastAgent',
    label: 'Contrast Agent',
    description: 'The contrast agent used during imaging',
    dataType: 'coded',
    required: false,
    configKey: 'contrastAgentConceptUuid',
  },
  accessionNumber: {
    type: 'accessionNumber',
    label: 'Accession Number',
    description: 'The radiology accession number for the study',
    dataType: 'text',
    required: false,
    configKey: 'accessionNumberConceptUuid',
  },
  dicomStudyUid: {
    type: 'dicomStudyUid',
    label: 'DICOM Study UID',
    description: 'The DICOM unique identifier for the study',
    dataType: 'text',
    required: false,
    configKey: 'dicomStudyUidConceptUuid',
  },
  radiationDose: {
    type: 'radiationDose',
    label: 'Radiation Dose',
    description: 'The radiation dose delivered during imaging (in mSv or mGy)',
    dataType: 'numeric',
    required: false,
    configKey: 'radiationDoseConceptUuid',
  },
  clinicalIndication: {
    type: 'clinicalIndication',
    label: 'Clinical Indication',
    description: 'The clinical reason for performing the imaging study',
    dataType: 'text',
    required: false,
    configKey: 'clinicalIndicationConceptUuid',
  },
  imagingFindings: {
    type: 'imagingFindings',
    label: 'Imaging Findings',
    description: 'Detailed radiology findings from the study',
    dataType: 'text',
    required: false,
    configKey: 'imagingFindingsConceptUuid',
  },
  imagingImpression: {
    type: 'imagingImpression',
    label: 'Imaging Impression',
    description: 'Radiologist impression and conclusion',
    dataType: 'text',
    required: true,
    configKey: 'imagingImpressionConceptUuid',
  },
  imagingImages: {
    type: 'imagingImages',
    label: 'Imaging Images',
    description: 'Image attachments from the imaging study',
    dataType: 'complex',
    required: false,
    configKey: 'imagingImagesConceptUuid',
  },
} as const;

/**
 * Get the concept UUID for an observation type from config
 *
 * @param config - The imaging configuration object
 * @param observationType - The observation type to look up
 * @returns The concept UUID for the observation
 */
export function getObservationConceptUuid(config: ImagingConfig, observationType: ImagingObservationType): string {
  const metadata = IMAGING_OBSERVATIONS[observationType];
  const conceptUuid = config[metadata.configKey] as string;

  if (!conceptUuid) {
    const configKey = String(metadata.configKey);
    console.warn(
      `Concept UUID not configured for observation type: ${observationType}. ` +
        `Please configure ${configKey} in spa-config.json.`,
    );
  }

  return conceptUuid || '';
}

/**
 * Get all required observation types
 */
export function getRequiredObservationTypes(): ImagingObservationType[] {
  return Object.values(IMAGING_OBSERVATIONS)
    .filter((obs) => obs.required)
    .map((obs) => obs.type);
}

/**
 * Get all optional observation types
 */
export function getOptionalObservationTypes(): ImagingObservationType[] {
  return Object.values(IMAGING_OBSERVATIONS)
    .filter((obs) => !obs.required)
    .map((obs) => obs.type);
}

/**
 * Observation groupings for structured reporting
 * These define how observations are grouped together in the UI
 */
export const OBSERVATION_GROUPS = {
  IMAGING_DETAILS: ['imagingModality', 'contrastAgent', 'accessionNumber', 'dicomStudyUid', 'radiationDose'],
  CLINICAL_CONTEXT: ['clinicalIndication'],
  IMAGING_RESULTS: ['imagingFindings', 'imagingImpression', 'imagingImages'],
} as const;

/**
 * Get observation types for a specific group
 */
export function getObservationTypesForGroup(
  group: keyof typeof OBSERVATION_GROUPS,
): readonly [ImagingObservationType, ...ImagingObservationType[]] {
  return OBSERVATION_GROUPS[group];
}
