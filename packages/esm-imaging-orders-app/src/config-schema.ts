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
    labOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Lab' order type",
      _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
    },
    labOrderableConcepts: {
      _type: Type.Array,
      _description:
        'UUIDs of concepts that represent orderable lab tests or lab sets. If an empty array `[]` is provided, every concept with class `Test` will be considered orderable.',
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
      SUCCESSFUL: '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      NOT_SUCCESSFUL: '160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      PARTIALLY_SUCCESSFUL: '160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
  },
  // Procedure Order Reference Concept (for storing order reference as observation)
  procedureOrderRefConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'Concept UUID for storing procedure order reference as an observation',
    _default: '94b88a9e-81d7-4c28-bda0-802d9313aa19',
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
  procedureResultEncounterType: {
    _type: Type.String,
    _description: 'The procedure results encounter type UUID',
    _default: '99a7a6ba-59f4-484e-880d-01cbeaead62f',
  },
  procedureResultEncounterRole: {
    _type: Type.String,
    _description: 'The encounter provider role UUID',
    _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
  },
  // Procedure result form configuration
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
    _default: '163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  bodySiteConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for body site concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
  statusConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The status concept set UUID for filtering status options',
    _default: '163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  statusConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for status concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
  durationUnitConceptUuid: {
    _type: Type.ConceptUuid,
    _description: 'The duration unit concept set UUID for filtering duration units',
    _default: '163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  durationUnitConceptSourceType: {
    _type: Type.String,
    _description: 'The source type for duration unit concept filtering (Concept set, Concept class, Answer to, or any)',
    _default: 'Concept set',
  },
};

interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}

export interface ConfigObject {
  radiologyConceptSetUuid: string;
  orders: {
    labOrderTypeUuid: string;
    labOrderableConcepts: Array<string>;
    radiologyOrderTypeUuid: string;
  };
  labTestsWithOrderReasons: Array<OrderReason>;
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
  procedureResultEncounterType: string;
  procedureResultEncounterRole: string;
  useOrderEncounter: boolean;
  procedureConceptUuid: string;
  procedureConceptSourceType: string;
  bodySiteConceptUuid: string;
  bodySiteConceptSourceType: string;
  statusConceptUuid: string;
  statusConceptSourceType: string;
  durationUnitConceptUuid: string;
  durationUnitConceptSourceType: string;
}

export type ImagingConfig = ConfigObject;
