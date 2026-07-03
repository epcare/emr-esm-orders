/**
 * Concept UUID mappings for procedure status and outcome
 * These UUIDs should match the concept dictionary in the database
 */

export const PROCEDURE_STATUS_CONCEPTS = {
  PREPARATION: '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  IN_PROGRESS: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  COMPLETED: 'dca06bae-30ab-102d-86b0-7a5022ba4115',
  STOPPED: 'dca26b47-30ab-102d-86b0-7a5022ba4115',
  NOT_DONE: 'dc9825cf-30ab-102d-86b0-7a5022ba4115',
  ON_HOLD: '167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  ENTERED_IN_ERROR: '162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

export const PROCEDURE_OUTCOME_CONCEPTS = {
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9', // Successfully Treated
  PARTIALLY_SUCCESSFUL: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // IN_PROGRESS (proxy for partial success)
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115', // CLINICAL TREATMENT FAILURE
} as const;

export type ProcedureStatus = keyof typeof PROCEDURE_STATUS_CONCEPTS;
export type ProcedureOutcome = keyof typeof PROCEDURE_OUTCOME_CONCEPTS;

/**
 * Get concept UUID for a procedure status enum
 * @param status - The status enum key
 * @returns The concept UUID or undefined if not found
 */
export function getStatusConceptUuid(status: string): string | undefined {
  return PROCEDURE_STATUS_CONCEPTS[status as ProcedureStatus];
}

/**
 * Get concept UUID for a procedure outcome enum
 * @param outcome - The outcome enum key
 * @returns The concept UUID or undefined if not found
 */
export function getOutcomeConceptUuid(outcome: string): string | undefined {
  return PROCEDURE_OUTCOME_CONCEPTS[outcome as ProcedureOutcome];
}

/**
 * Reverse lookup: Get status enum from concept UUID
 * @param uuid - The concept UUID
 * @returns The status enum key or undefined if not found
 */
export function getStatusFromUuid(uuid: string): ProcedureStatus | undefined {
  const entry = Object.entries(PROCEDURE_STATUS_CONCEPTS).find(([, conceptUuid]) => conceptUuid === uuid);
  return entry?.[0] as ProcedureStatus;
}

/**
 * Reverse lookup: Get outcome enum from concept UUID
 * @param uuid - The concept UUID
 * @returns The outcome enum key or undefined if not found
 */
export function getOutcomeFromUuid(uuid: string): ProcedureOutcome | undefined {
  const entry = Object.entries(PROCEDURE_OUTCOME_CONCEPTS).find(([, conceptUuid]) => conceptUuid === uuid);
  return entry?.[0] as ProcedureOutcome;
}
