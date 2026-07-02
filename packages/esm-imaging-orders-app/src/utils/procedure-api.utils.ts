import { openmrsFetch } from '@openmrs/esm-framework';
import { type ProcedureOrderRefObservation, type ProcedurePayload } from '../types';

/**
 * Build orphaned data JSON for notes field
 * Stores fields that don't have direct equivalents in EMRAPI
 */
export function buildOrphanedDataNotes(
  order: any,
  locationUuid?: string,
  additionalData?: Record<string, any>,
): string {
  const orphanedData = {
    procedureOrder: order?.uuid,
    procedureReason: order?.orderReason?.uuid,
    category: order?.orderType?.uuid,
    location: locationUuid,
    ...additionalData,
  };
  return JSON.stringify(orphanedData);
}

/**
 * Parse orphaned data from notes JSON
 */
export function parseOrphanedDataNotes(notes?: string): Record<string, any> {
  if (!notes) return {};
  try {
    return JSON.parse(notes);
  } catch {
    return {};
  }
}

/**
 * Build procedure order reference observation
 * This observation stores the link between the procedure and the original order
 */
export function buildOrderRefObservation(
  orderRefConceptUuid: string,
  procedureOrderUuid: string,
  encounterUuid: string,
  patientUuid: string,
): ProcedureOrderRefObservation {
  return {
    concept: orderRefConceptUuid,
    value: procedureOrderUuid,
    encounter: encounterUuid,
    obsDatetime: new Date().toISOString(),
    person: patientUuid,
  };
}

/**
 * Create observation via API
 */
export async function createObservation(observation: ProcedureOrderRefObservation) {
  try {
    const response = await openmrsFetch(`/ws/rest/v1/obs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(observation),
    });
    return response;
  } catch (error) {
    console.error('Failed to create observation:', error);
    // Don't throw - observation creation failure shouldn't break procedure creation
    return null;
  }
}

/**
 * Transform old ProcedurePayload to EMRAPI format
 * Handles the migration from old API structure to new EMRAPI structure
 */
export function transformProcedurePayload(oldPayload: Partial<ProcedurePayload>, config: any): ProcedurePayload {
  // Extract orphaned data from oldPayload if it exists
  const existingOrphanedData = oldPayload._orphanedData || {};

  return {
    patient: oldPayload.patient,
    encounter: oldPayload.encounter,
    procedureCoded: oldPayload.concept || oldPayload.procedureCoded,
    bodySiteCoded: oldPayload.bodySite || oldPayload.bodySiteCoded,
    startDateTime: oldPayload.startDatetime || oldPayload.startDateTime,
    endDateTime: oldPayload.endDatetime || oldPayload.endDateTime,
    status: oldPayload.status,
    outcomeCoded: oldPayload.outcome || oldPayload.outcomeCoded,
    notes: oldPayload.procedureReport || oldPayload.notes,
    _orphanedData: existingOrphanedData,
  };
}
