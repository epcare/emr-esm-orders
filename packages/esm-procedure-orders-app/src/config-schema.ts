import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  procedureOrderTypeUuid: {
    _type: Type.String,
    _description: 'Procedure Order type UUID',
    _default: 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
  },
  procedureConceptSetUuid: {
    _type: Type.String,
    _description: 'Procedure Concept SET UUID',
    _default: '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  testOrderTypeUuid: {
    _type: Type.String,
    _description: 'Test Order type UUID',
    _default: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
  },
  orders: {
    _type: Type.Object,
    _description: 'List of lab orderable concepts',
    _default: {
      labOrderableConcepts: [],
      labOrderTypeUuid: '',
    },
  },
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

export interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}

export interface ConfigObject {
  procedureOrderTypeUuid: string;
  procedureConceptSetUuid: string;
  testOrderTypeUuid: string;
  labTestsWithOrderReasons: Array<OrderReason>;
  showPrintButton: boolean;
  orders: {
    labOrderTypeUuid: string;
    labOrderableConcepts: Array<string>;
  };
  conditionConceptClassUuid: string;
  procedureComplicationGroupingConceptUuid: string;
  procedureComplicationConceptUuid: string;
  procedureResultEncounterType: string;
  procedureResultEncounterRole: string;
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
  useOrderEncounter: boolean;
  // Procedure result form concept source configurations
  procedureConceptUuid: string;
  procedureConceptSourceType: string;
  bodySiteConceptUuid: string;
  bodySiteConceptSourceType: string;
  statusConceptUuid: string;
  statusConceptSourceType: string;
  durationUnitConceptUuid: string;
  durationUnitConceptSourceType: string;
}

export const StringPath =
  'M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z';
