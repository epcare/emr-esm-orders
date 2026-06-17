import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  medicalSupplyQuantityUnitsConceptSetUuid: {
    _type: Type.String,
    _description: 'Medical Supply Quantity Units Concept SET UUID',
    _default: '162402AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  },
  medicalSupplyConceptSetUuid: {
    _type: Type.String,
    _description: 'Medical Supply Concept SET UUID',
    _default: '2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8',
  },
  medicalSupplyConceptClassUuid: {
    _type: Type.String,
    _description: 'Medical Supply Concept Class UUID',
    _default: '0dcf23d4-3008-4d8e-b12c-4ec95d1cfd97',
  },
  orders: {
    medicalSupplyOrderTypeUuid: {
      _type: Type.UUID,
      _description: "UUID for the 'Medical Supply' order type",
      _default: 'dab3ab30-2feb-48ec-b4af-8332a0831b49',
    },
  },
};

interface OrderReason {
  medicalSupplyUuid: string;
  required: boolean;
  orderReasons: Array<string>;
}
export type MedicalSupplyConfig = {
  medicalSupplyQuantityUnitsConceptSetUuid: string;
  medicalSupplyConceptSetUuid: string;
  medicalSupplyConceptClassUuid: string;
  orders: {
    medicalSupplyOrderTypeUuid: string;
  };
  medicalSupplyWithOrderReasons: Array<OrderReason>;
};
