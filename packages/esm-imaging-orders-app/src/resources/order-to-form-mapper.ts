/**
 * Order-to-Imaging-Result Form Mapping Utility
 *
 * This module provides utilities to transform OpenMRS Order data
 * into initial form values for Imaging result forms.
 *
 * Source: OpenMRS Order API response
 * Target: Imaging Result Form initialValues
 *
 * @module order-to-form-mapper
 */

import type { ConceptReference, Result } from '../types';

/**
 * Represents the OpenMRS Order object as returned from the REST API
 * Based on the full order response structure
 *
 * This is a flexible type that accepts both Result and Order structures
 * to support different API response formats
 */
export type Order =
  | Result
  | {
      uuid: string;
      orderNumber: string;
      accessionNumber?: string;
      patient: {
        uuid: string;
        display: string;
      };
      concept: {
        uuid: string;
        display: string;
        conceptClass?: {
          uuid: string;
          display?: string;
        };
      };
      action: 'NEW' | 'REVISE' | 'DISCONTINUE';
      careSetting?: {
        uuid: string;
        name: string;
        display: string;
      };
      orderer?: {
        uuid: string;
        display: string;
      };
      urgency: 'ROUTINE' | 'STAT' | 'ON_SCHEDULED_DATE';
      instructions?: string;
      orderReason?: {
        uuid?: string;
        display?: string;
      } | null;
      orderReasonNonCoded?: string | null;
      bodySite?:
        | {
            uuid: string;
            display: string;
            name?: {
              display: string;
              uuid: string;
            };
            conceptClass?: {
              uuid: string;
              display: string;
            };
          }
        | string;
      laterality?: 'LEFT' | 'RIGHT' | 'BILATERAL' | null;
      commentToFulfiller?: string;
      fulfillerStatus?: string;
      dateActivated: string;
      scheduledDate?: string | null;
      dateStopped?: string | null;
      autoExpireDate?: string | null;
      encounter?: {
        uuid: string;
        display: string;
      };
      clinicalHistory?: string;
      frequency?: string;
      numberOfRepeats?: number;
      type: string;
    };

/**
 * Form field types for imaging result forms
 */
export interface ImagingResultFormDefaults {
  // Procedure fields
  procedureCoded: string;
  bodySite: string;
  startDateTime: Date | null;
  endDateTime: Date | null;
  status: string;
  notes: string;
  estimatedStartDate: string;
  duration: number | null;
  durationUnit: string;
  outcomeCoded: string;
  // Extended fields
  laterality?: string;
  urgency?: string;
  orderReason?: string;
  // Imaging-specific observation fields
  imagingModality: string;
  contrastAgent: string;
  accessionNumber: string;
  dicomStudyUid: string;
  radiationDose: number | null;
  clinicalIndication: string;
  imagingFindings: string;
  imagingImpression: string;
  imagingImages: Array<string>;
  // Orphaned data
  _orphanedData?: {
    procedureOrder: string;
    procedureReason: string;
    category: string;
    accessionNumber?: string;
  };
}

/**
 * Combines notes from multiple sources into a single field
 * @param instructions - Order instructions
 * @param commentToFulfiller - Comments to fulfiller
 * @param existingNotes - Existing notes from procedure
 * @returns Combined notes string
 */
export function combineNotes(instructions?: string, commentToFulfiller?: string, existingNotes?: string): string {
  const parts = [];

  if (instructions?.trim() && !['NA', 'na', 'nA', 'N/A'].includes(instructions.trim())) {
    parts.push(instructions.trim());
  }

  if (commentToFulfiller?.trim() && !['NA', 'na', 'nA', 'N/A'].includes(commentToFulfiller.trim())) {
    parts.push(commentToFulfiller.trim());
  }

  if (existingNotes?.trim()) {
    parts.push(existingNotes.trim());
  }

  return parts.join('\n\n');
}

/**
 * Extracts bodySite UUID from various possible formats
 * @param bodySite - Body site from order (can be object or string)
 * @returns Body site UUID or empty string
 */
export function extractBodySiteUuid(bodySite?: { uuid?: string } | string): string {
  if (!bodySite) return '';

  if (typeof bodySite === 'string') return bodySite;

  return bodySite.uuid || '';
}

/**
 * Transforms order data to imaging result form defaults
 * @param order - The OpenMRS Order object
 * @param procedure - Existing procedure data (for editing)
 * @returns Form default values object
 */
export function orderToImagingFormDefaults(
  order: Order | null | undefined,
  procedure?: {
    procedureType?: { uuid?: string };
    startDateTime?: string;
    endDateTime?: string;
    status?: { uuid?: string };
    outcomeCoded?: { uuid?: string };
    estimatedStartDate?: string;
    duration?: number;
    durationUnit?: { uuid?: string };
    notes?: string;
  },
): ImagingResultFormDefaults {
  if (!order) {
    return {
      procedureCoded: '',
      bodySite: '',
      startDateTime: null,
      endDateTime: null,
      status: '',
      notes: '',
      estimatedStartDate: '',
      duration: null,
      durationUnit: '',
      outcomeCoded: '',
      laterality: undefined,
      urgency: undefined,
      orderReason: '',
      imagingModality: '',
      contrastAgent: '',
      accessionNumber: '',
      dicomStudyUid: '',
      radiationDose: null,
      clinicalIndication: '',
      imagingFindings: '',
      imagingImpression: '',
      imagingImages: [],
    };
  }

  // Get body site UUID (order may have it as object or string)
  const bodySiteUuid = extractBodySiteUuid(order.bodySite);

  // Combine notes from instructions, commentToFulfiller, and existing procedure notes
  const notes = combineNotes(order.instructions, order.commentToFulfiller, procedure?.notes);

  // Derive clinical indication from order reason
  const clinicalIndication = order?.orderReason?.display || order?.orderReasonNonCoded || '';

  return {
    procedureCoded: order.concept.uuid || '',
    bodySite: bodySiteUuid,
    // Use procedure dates if available, otherwise use order dates
    startDateTime: procedure?.startDateTime ? new Date(procedure.startDateTime) : null,
    endDateTime: procedure?.endDateTime ? new Date(procedure.endDateTime) : null,
    status: procedure?.status?.uuid || '',
    notes: notes,
    estimatedStartDate: procedure?.estimatedStartDate || '',
    duration: typeof procedure?.duration === 'number' ? procedure.duration : null,
    durationUnit: procedure?.durationUnit?.uuid || '',
    outcomeCoded: procedure?.outcomeCoded?.uuid || '',
    // Extended fields from order
    laterality: order.laterality || undefined,
    urgency: order.urgency,
    orderReason: order.orderReasonNonCoded || order.orderReason?.display || '',
    // Imaging-specific observation fields
    imagingModality: '', // Not available in order, must be selected
    contrastAgent: '', // Not available in order, must be selected
    accessionNumber: order.accessionNumber || '',
    dicomStudyUid: '', // Not available in order
    radiationDose: null, // Not available in order
    clinicalIndication: clinicalIndication,
    imagingFindings: '',
    imagingImpression: '',
    imagingImages: [],
    // Orphaned data for reference
    _orphanedData: {
      procedureOrder: order.uuid,
      procedureReason: order.orderReasonNonCoded || '',
      category: order.concept.display || '',
      accessionNumber: order.accessionNumber,
    },
  };
}

/**
 * Order Field → Imaging Form Field Mapping Reference
 *
 * Imaging Result Form includes all procedure fields plus imaging-specific observations:
 *
 * ┌─────────────────────────┬────────────────────────────────────────────┐
 * │ Order/Procedure Field    │ Form Field                                 │
 * ├─────────────────────────┼────────────────────────────────────────────┤
 * │ accessionNumber          │ accessionNumber                             │
 * │ orderReasonNonCoded      │ clinicalIndication                          │
 * │ N/A (not in order)       │ imagingModality (must select)              │
 * │ N/A (not in order)       │ contrastAgent (must select)                 │
 * │ N/A (not in order)       │ dicomStudyUid                               │
 * │ N/A (not in order)       │ radiationDose                               │
 * │ N/A (not in order)       │ imagingFindings (must enter)               │
 * │ N/A (not in order)       │ imagingImpression (must enter)             │
 * │ N/A (not in order)       │ imagingImages (must upload)                │
 * └─────────────────────────┴────────────────────────────────────────────┘
 */
