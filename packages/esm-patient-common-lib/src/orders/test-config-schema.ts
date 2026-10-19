import { Type } from '@openmrs/esm-framework';

/**
 * Local stand-in for the `esm-patient-tests-app` config schema this test file
 * referenced in the patient-chart monolith. The hook under test takes its
 * orderable concepts as arguments, so only the `orders` shape is stubbed.
 */
export const configSchema = {
  orders: {
    labOrderableConcepts: {
      _type: Type.Array,
      _description: 'The concepts that can be ordered as lab orders',
      _default: [],
    },
    labOrderTypeUuid: {
      _type: Type.String,
      _description: 'The uuid of the lab order type',
      _default: 'lab-order-type-uuid',
    },
  },
};

export type ConfigObject = {
  orders: {
    labOrderableConcepts: Array<string>;
    labOrderTypeUuid: string;
  };
};
