import { type ProcedureOrderBasketItem } from '../../../types';
import { type ProceduresType } from './useProceduresTypes';

export const priorityOptions = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'STAT', label: 'Stat' },
  { value: 'ON_SCHEDULED_DATE', label: 'Scheduled' },
];

export function createEmptyProcedureOrder(testType: ProceduresType, orderer: string): ProcedureOrderBasketItem {
  return {
    action: 'NEW',
    display: testType.label,
    testType,
    orderer,
    // pcl 13 requires `visit` on OrderBasketItem, but the basket itself never reads it
    // (see pcl's own useOrderBasket tests); our save flow passes the visit separately.
    visit: null,
  } as ProcedureOrderBasketItem;
}
