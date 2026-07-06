import { type OrderUrgency, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import type { Workspace2DefinitionProps } from '@openmrs/esm-framework';
import type { Result } from '../imaging-tabs/work-list/work-list.resource';

// Re-export Result for convenience
export type { Result } from '../imaging-tabs/work-list/work-list.resource';

export interface Concept {
  uuid: string;
  display: string;
  conceptClass: {
    uuid: string;
    display: string;
    name: string;
  };
  answers: [];
  setMembers: [];
  hiNormal: number;
  hiAbsolute: number;
  hiCritical: number;
  lowNormal: number;
  lowAbsolute: number;
  lowCritical: number;
  units: string;
  allowDecimal: boolean;
  displayPrecision: null;
  attributes: [];
}

export interface ImagingOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  urgency?: OrderUrgency;
  instructions?: string;
  orderReason?: string;
  orderReasonNonCoded?: string;
  scheduleDate?: Date | string;
  commentToFulfiller?: string;
  laterality?: string;
  bodySite?: string;
}

export type OrderFrequency = CommonImagingValueCoded;
export type DurationUnit = CommonImagingValueCoded;

interface CommonImagingProps {
  value: string;
  default?: boolean;
}

export interface CommonImagingValueCoded extends CommonImagingProps {
  valueCoded: string;
}
export type DateFilterContext = {
  dateRange: Array<Date>;
  setDateRange: React.Dispatch<React.SetStateAction<Array<Date>>>;
};

export interface Order {
  uuid: string;
  orderNumber: string;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: {
    name: string;
  };
  orderer: Orderer;
  urgency: string;
  instructions: any;
  bodySite: any;
  laterality: string;
  commentToFulfiller: any;
  procedures: Procedure[];
  display: string;
  fulfillerStatus: string;
  dateStopped: any;
  scheduledDate: any;
  dateActivated: string;
  fulfillerComment: string;
  isApproved: boolean;
}
interface Patient {
  uuid: string;
  display: string;
  identifiers: Identifier[];
  person: Person;
}
interface Identifier {
  identifier: string;
  identifierType: {
    display: string;
  };
  location: Location;
}

interface Location {
  display: string;
}
export interface Person {
  uuid: string;
  display: string;
  age: number;
  gender: string;
}

interface Orderer {
  uuid: string;
  display: string;
}

export interface Procedure {
  uuid: string;
  display: string;
  patient: {
    uuid: string;
    display: string;
  };
  procedureType?: {
    uuid: string;
    display: string;
  };
  encounter?: {
    uuid: string;
    display: string;
  };
  procedureCoded?: {
    uuid: string;
    display: string;
  };
  bodySite?: {
    uuid: string;
    display: string;
  };
  startDateTime: string;
  endDateTime?: string;
  status?: {
    uuid: string;
    display: string;
  };
  outcomeCoded?: {
    uuid: string;
    display: string;
  };
  notes?: string; // Contains procedure report and orphaned data as JSON
  voided: boolean;
  // Extended fields for imaging result form
  estimatedStartDate?: string;
  duration?: number;
  durationUnit?: {
    uuid: string;
    display: string;
  };
}

/**
 * Reference to a concept (minimal version)
 */
export interface ConceptReference {
  uuid: string;
  display: string;
}

/**
 * Procedure type from EMRAPI
 */
export interface ProcedureType {
  uuid: string;
  display?: string;
  name?: string;
  description?: string;
}

/**
 * Coded provider (person/provider with uuid)
 */
export interface CodedProvider {
  uuid: string;
  display: string;
  person?: {
    uuid: string;
    display: string;
  };
}

/**
 * Coded condition (diagnosis)
 */
export interface CodedCondition {
  display: string;
  concept: {
    uuid: string;
    display: string;
  };
  conceptName?: {
    uuid: string;
    display: string;
  };
}

// Procedure payload for EMRAPI
export type ProcedurePayload = {
  patient: string;
  encounter?: string; // Single encounter UUID (for EMRAPI)
  procedureCoded: string; // Renamed from 'concept' for EMRAPI
  bodySiteCoded?: string; // Renamed from 'bodySite' for EMRAPI
  startDateTime: string; // camelCase for EMRAPI
  endDateTime?: string; // camelCase for EMRAPI
  status: string; // Concept UUID (not enum!)
  outcomeCoded?: string; // Concept UUID (not enum!)
  notes?: string; // Renamed from 'procedureReport'
  // Internal field for orphaned data stored as JSON in notes
  _orphanedData?: {
    procedureOrder?: string;
    procedureReason?: string;
    category?: string;
    location?: string;
    modality?: string;
    statusReason?: string;
  };
  // Legacy fields (for backward compatibility during migration)
  // TODO: Remove after migration is complete
  concept?: string;
  bodySite?: string;
  startDatetime?: string;
  endDatetime?: string;
  outcome?: string;
  procedureReport?: string;
  procedureOrder?: string;
  encounters?: Array<any>;
};

// Type for procedure order reference observation
export type ProcedureOrderRefObservation = {
  concept: string;
  value: string; // procedureOrderUuid
  encounter: string;
  obsDatetime: string;
  person: string;
};
interface ProcedureOrder {
  uuid: string;
  orderNumber: string;
  accessionNumber: any;
  action: string;
  previousOrder: any;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: any;
  autoExpireDate: any;
  encounter: Encounter;
  orderReason: any;
  orderReasonNonCoded: string;
  orderType: OrderType;
  urgency: string;
  instructions: any;
  commentToFulfiller: any;
  display: string;
  specimenSource: any;
  laterality: string;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  specimenType: any;
  bodySite: any;
  relatedProcedure: any;
  type: string;
  resourceVersion: string;
}

interface Encounter {
  uuid: string;
  display: string;
}

interface OrderType {
  uuid: string;
  display: string;
  name: string;
}

// ============================================================================
// Workspace Types (Shared Pattern for Standalone Workspaces)
// ============================================================================

/**
 * Base workspace props for all order workspaces.
 * Defines the common form context that all workspaces should support.
 */
export interface BaseOrderWorkspaceProps {
  /** Indicates whether the workspace is creating, editing, or reviewing an order */
  formContext?: 'creating' | 'editing' | 'reviewing';
  /** Optional order data for editing or reviewing */
  order?: Result | Order;
  /** Optional procedure data for editing procedure results */
  procedure?: Procedure;
}

/**
 * Window props for patient context.
 * Standardized across all imaging orders workspaces to ensure consistent
 * patient information passing.
 */
export interface BaseOrderWindowProps {
  /** The patient UUID - required for all workspace operations */
  patientUuid: string;
  /** Optional full patient object - can be passed to avoid additional API calls */
  patient?: any;
  /** Optional encounter UUID - used for procedure results and orders */
  encounterUuid?: string;
}

/**
 * Combined workspace definition props type.
 * This type combines workspace props and window props into a single
 * Workspace2DefinitionProps type for workspace components.
 *
 * @example
 * ```typescript
 * type MyWorkspaceProps = OrderWorkspaceDefinitionProps<
 *   { order: Result; formContext: 'editing' },
 *   { patientUuid: string }
 * >;
 *
 * const MyWorkspace: React.FC<MyWorkspaceProps> = ({
 *   closeWorkspace,
 *   workspaceProps: { order, formContext },
 *   windowProps: { patientUuid }
 * }) => { ... }
 * ```
 */
export type OrderWorkspaceDefinitionProps<
  TWorkspaceProps extends object = BaseOrderWorkspaceProps,
  TWindowProps extends object = BaseOrderWindowProps,
> = Workspace2DefinitionProps<TWorkspaceProps & BaseOrderWorkspaceProps, TWindowProps & BaseOrderWindowProps>;
