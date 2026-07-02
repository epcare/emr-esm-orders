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
};

interface OrderReason {
  labTestUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}
export type ImagingConfig = {
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
};
