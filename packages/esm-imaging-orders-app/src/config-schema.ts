import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  radiologyConceptSetUuid: {
    _type: Type.String,
    _description: 'Radiology Concept SET UUID',
    _default: '164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  radiologyConceptClassUuid: {
    _type: Type.String,
    _description: 'Radiology Concept Class UUID',
    _default: '8caa332c-efe4-4025-8b18-3398328e1323',
  },
  orders: {
    radiologyOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Radiology' order type",
      _default: 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
    },
    imagingOrderableConcepts: {
      _type: Type.Array,
      _description:
        'UUIDs of concepts that represent orderable imaging tests or imaging sets. If an empty array `[]` is provided, every concept with class `Test` will be considered orderable.',
      _elements: {
        _type: Type.UUID,
      },
      _default: [],
    },
  },
  // Procedure Status Concepts (Concept UUIDs for emrapi Procedure status)
  procedureStatusConcepts: {
    _type: Type.Object,
    _description: 'Concept UUIDs for procedure statuses (used by emrapi Procedure)',
    _default: {
      PREPARATION: '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      IN_PROGRESS: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      NOT_DONE: 'dc9825cf-30ab-102d-86b0-7a5022ba4115',
      ON_HOLD: '167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      STOPPED: 'dca26b47-30ab-102d-86b0-7a5022ba4115',
      COMPLETED: 'dca06bae-30ab-102d-86b0-7a5022ba4115',
      ENTERED_IN_ERROR: '162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  // Procedure Outcome Concepts (Concept UUIDs for emrapi Procedure outcome)
  procedureOutcomeConcepts: {
    _type: Type.Object,
    _description: 'Concept UUIDs for procedure outcomes (used by emrapi Procedure)',
    _default: {
      SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9', // Successfully Treated
      NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115', // CLINICAL TREATMENT FAILURE
      PARTIALLY_SUCCESSFUL: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // IN_PROGRESS (proxy for partial success)
    },
  },
  // Procedure Order Reference Concept (for storing order reference as observation)
  procedureOrderRefConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for storing procedure order reference as an observation',
    _default: '4ef33ab9-ec5f-4b12-9ac8-226d302ca2e0', // Concept ID: 200137
  },
  // Additional fields for imaging result form
  conditionConceptClassUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept class UUID for conditions',
    _default: '8d4918b0-c2cc-11de-8d13-0010c6dffd0f',
  },
  procedureComplicationGroupingConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept UUID for grouping procedure complications obs',
    _default: '120202AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  procedureComplicationConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The concept UUID for capturing procedure complications',
    _default: '120198AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  // Procedure result encounter configuration (used when order doesn't have an encounter)
  procedureResultEncounterType: {
    _type: Type.String,
    _description:
      'The procedure results encounter type UUID (used when creating a new encounter if order has no encounter)',
    _default: 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf',
  },
  procedureResultEncounterRole: {
    _type: Type.String,
    _description: 'The encounter provider role UUID (used when creating a new encounter)',
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
  },
  procedureResultEncounterLocation: {
    _type: Type.String,
    _description: 'The encounter location UUID (optional - will use session location if not specified)',
    _default: '',
  },
  useOrderEncounter: {
    _type: Type.Boolean,
    _description: 'Use the order encounter for procedure results, or create a new one',
    _default: true,
  },
  // Procedure result form concept source configurations
  procedureConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The procedure concept set UUID for filtering procedures',
    _default: '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  procedureConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for procedure concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
  bodySiteConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The body site concept set UUID for filtering body sites',
    _default: 'dc9fab29-30ab-102d-86b0-7a5022ba4115', // ANATOMIC LOCATIONS concept set (17 members)
  },
  bodySiteConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for body site concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
  statusConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The status concept set UUID for filtering status options',
    _default: '1668e2ab-0112-431a-9d21-ee7ef9ec9fe3',
  },
  statusConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for status concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
  durationUnitConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The duration unit concept UUID (coded with answers: Days, Hours, Minutes, etc.)',
    _default: '1732AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Duration units concept (9 answers available)
  },
  durationUnitConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for duration unit concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },

  // ============================================================================
  // Imaging Observation Concepts
  // These concepts are used to capture imaging-specific data as observations
  // within the encounter, following the architecture where Procedure = event
  // and Observations = details (see IMAGING_ARCHITECTURE.md)
  // ============================================================================

  // Imaging Details Observations
  imagingModalityConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing imaging modality (CT, MRI, US, XRAY, etc.) as an observation',
    _default: 'bbb8c439-712b-4fb2-9b09-6d56aa8dd25c', // Concept ID: 200129 - Imaging Modality (7 answers: CAT SCAN, MRI, Ultrasound, X-ray, Fluoroscopy, Doppler, Angiography)
  },
  contrastAgentConceptUuid: {
    _type: Type.ConceptUuid,
    _description:
      'Concept UUID for capturing contrast agent used (none, iodinated, gadolinium, etc.) as an observation',
    _default: '0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e', // Concept ID: 200130
  },
  accessionNumberConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing radiology accession number as an observation',
    _default: '0e163f39-bebd-455d-a9c2-5cec790461b8', // Concept ID: 200132
  },
  dicomStudyUidConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing DICOM Study UID as an observation',
    _default: 'd55e0ae3-abad-4dee-a5de-6fd1db010453', // Concept ID: 200133
  },
  radiationDoseConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing radiation dose (mSv or mGy) as a numeric observation',
    _default: '458bd4f7-9292-40db-8a9e-334faff7827c', // Concept ID: 200134
  },
  clinicalIndicationConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing clinical indication/reason for imaging as a text observation',
    _default: 'f36f1463-90cc-4aa3-bffa-91ef24b31f21', // Concept ID: 200135
  },

  // Imaging Results Observations
  imagingFindingsConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing radiology findings as a text observation',
    _default: '7f39af1b-8d9d-43c1-ad2e-8fd848a0093a', // Concept ID: 200136
  },
  imagingImpressionConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing radiology impression/conclusion as a text observation',
    _default: '159395AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Concept ID: 159395 - "Clinical impression comment"
  },
  imagingImagesConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for capturing image attachments as complex observations',
    _default: '7cac8397-53cd-4f00-a6fe-028e8d743f8e', // Concept ID: 186351 - "Image attachment"
  },
};

interface OrderReason {
  imagingTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}

export interface ConfigObject {
  radiologyConceptSetUuid: string;
  orders: {
    radiologyOrderTypeUuid: string;
    imagingOrderableConcepts: Array<string>;
  };
  imagingTestsWithOrderReasons: Array<OrderReason>;
  radiologyConceptClassUuid: string;
  // Procedure status/outcome concepts (for emrapi Procedure)
  procedureStatusConcepts: {
    PREPARATION: string;
    IN_PROGRESS: string;
    NOT_DONE: string;
    ON_HOLD: string;
    STOPPED: string;
    COMPLETED: string;
    ENTERED_IN_ERROR: string;
  };
  procedureOutcomeConcepts: {
    SUCCESSFUL: string;
    NOT_SUCCESSFUL: string;
    PARTIALLY_SUCCESSFUL: string;
  };
  procedureOrderRefConceptUuid: string;
  // Additional fields for imaging result form
  conditionConceptClassUuid: string;
  procedureComplicationGroupingConceptUuid: string;
  procedureComplicationConceptUuid: string;
  // Procedure result encounter configuration (used when order doesn't have an encounter)
  procedureResultEncounterType: string;
  procedureResultEncounterRole: string;
  procedureResultEncounterLocation?: string;
  useOrderEncounter: boolean;
  procedureConceptUuid: string;
  procedureConceptSourceType: string;
  bodySiteConceptUuid: string;
  bodySiteConceptSourceType: string;
  statusConceptUuid: string;
  statusConceptSourceType: string;
  durationUnitConceptUuid: string;
  durationUnitConceptSourceType: string;
  // Imaging observation concepts
  imagingModalityConceptUuid: string;
  contrastAgentConceptUuid: string;
  accessionNumberConceptUuid: string;
  dicomStudyUidConceptUuid: string;
  radiationDoseConceptUuid: string;
  clinicalIndicationConceptUuid: string;
  imagingFindingsConceptUuid: string;
  imagingImpressionConceptUuid: string;
  imagingImagesConceptUuid: string;
}

export type ImagingConfig = ConfigObject;
