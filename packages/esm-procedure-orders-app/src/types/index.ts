import { type OrderUrgency, type OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { type Link } from './patient-queue';
import type { OpenmrsResource, Workspace2DefinitionProps } from '@openmrs/esm-framework';

export enum SearchTypes {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  SEARCH_RESULTS = 'search_results',
  SCHEDULED_VISITS = 'scheduled-visits',
  VISIT_FORM = 'visit_form',
  QUEUE_SERVICE_FORM = 'queue_service_form',
  QUEUE_ROOM_FORM = 'queue_room_form',
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers: Array<any>;
  person: Person;
}

export interface Attribute {
  attributeType: OpenmrsResource;
  display: string;
  uuid: string;
  value: string | number;
}

export interface Person {
  age: number;
  attributes: Array<Attribute>;
  birthDate: string;
  gender: string;
  display: string;
  preferredAddress: OpenmrsResource;
  uuid: string;
}

export interface ServiceTypes {
  duration: number;
  name: string;
  uuid: string;
}

export interface AppointmentService {
  appointmentServiceId: number;
  color: string;
  creatorName: string;
  description: string;
  durationMins: string;
  endTime: string;
  initialAppointmentStatus: string;
  location: OpenmrsResource;
  maxAppointmentsLimit: number | null;
  name: string;
  speciality: OpenmrsResource;
  startTime: string;
  uuid: string;
  serviceTypes: Array<ServiceTypes>;
}

export interface Note {
  concept: OpenmrsResource;
  note: string;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}
export interface Order {
  uuid: string;
  dateActivated: string;
  dateStopped?: Date | null;
  dose: number;
  dosingInstructions: string | null;
  dosingType?: 'org.openmrs.FreeTextDosingInstructions' | 'org.openmrs.SimpleDosingInstructions';
  doseUnits: {
    uuid: string;
    display: string;
  };
  drug: {
    uuid: string;
    name: string;
    strength: string;
  };
  duration: number;
  durationUnits: {
    uuid: string;
    display: string;
  };
  frequency: {
    uuid: string;
    display: string;
  };
  numRefills: number;
  orderNumber: string;
  orderReason: string | null;
  orderReasonNonCoded: string | null;
  orderer: {
    uuid: string;
    person: {
      uuid: string;
      display: string;
    };
  };
  orderType: {
    uuid: string;
    display: string;
  };
  route: {
    uuid: string;
    display: string;
  };
  quantity: number;
  quantityUnits: OpenmrsResource;
  type: string;
  display: string;
  links: Link[];
}

export interface OrderItem {
  order: Order;
  provider: {
    name: string;
    role: string;
  };
  time: string;
}

export interface DiagnosisItem {
  diagnosis: string;
}

export interface Encounter {
  uuid: string;
  encounterDatetime: string;
  encounterProviders: Array<{
    uuid: string;
    display: string;
    encounterRole: {
      uuid: string;
      display: string;
    };
    provider: {
      uuid: string;
      person: {
        uuid: string;
        display: string;
      };
    };
  }>;
  encounterType: {
    uuid: string;
    display: string;
  };
  obs: Array<Observation>;
  form: OpenmrsResource;
  patient: OpenmrsResource;
  orders: Array<Order>;
}

export interface Observation {
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    conceptClass: {
      uuid: string;
      display: string;
    };
  };
  display: string;
  groupMembers: null | Array<{
    uuid: string;
    concept: {
      uuid: string;
      display: string;
    };
    value: {
      uuid: string;
      display: string;
    };
  }>;
  value: any;
  obsDatetime: string;
}

export interface PatientVitals {
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  temperature?: number;
  oxygenSaturation?: number;
  height?: number;
  weight?: number;
  bmi?: number | null;
  respiratoryRate?: number;
  muac?: number;
  provider?: {
    name: string;
    role: string;
  };
  time?: string;
}

export interface MappedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
  visitUuid?: string;
}

export interface FormattedEncounter {
  id: string;
  datetime: string;
  encounterType: string;
  form: OpenmrsResource;
  obs: Array<Observation>;
  provider: string;
}

export interface ObsMetaInfo {
  [_: string]: any;
  assessValue?: (value: number) => OBSERVATION_INTERPRETATION;
}

export type OBSERVATION_INTERPRETATION =
  | 'NORMAL'
  | 'HIGH'
  | 'CRITICALLY_HIGH'
  | 'OFF_SCALE_HIGH'
  | 'LOW'
  | 'CRITICALLY_LOW'
  | 'OFF_SCALE_LOW'
  | '--';
export interface PatientProgram {
  uuid: string;
  display: string;
  patient: OpenmrsResource;
  program: OpenmrsResource;
  dateEnrolled: string;
  dateCompleted: string;
  location: OpenmrsResource;
}

export interface AppointmentCountMap {
  allAppointmentsCount: number;
  missedAppointmentsCount;
  appointmentDate: number;
  appointmentServiceUuid: string;
}

export interface AppointmentSummary {
  appointmentService: { name: string };
  appointmentCountMap: Record<string, AppointmentCountMap>;
}
export interface QueueEntryPayload {
  visit: { uuid: string };
  queueEntry: {
    status: { uuid: string };
    priority: { uuid: string };
    queue: { uuid: string };
    patient: { uuid: string };
    startedAt: Date;
    sortWeight: number;
  };
}

export interface QueueServiceInfo {
  uuid: string;
  display: string;
  name: string;
  description: string;
}

export interface MappedServiceQueueEntry {
  id: string;
  name: string;
  age: string;
  gender: string;
  phoneNumber: string;
  visitType: string;
  returnDate: string;
  patientUuid: string;
}

export enum FilterTypes {
  SHOW,
  HIDE,
}
export interface Provider {
  uuid: string;
  display: string;
  comments: string;
  response?: string;
  person: OpenmrsResource;
  location: string;
  serviceType: string;
}

export interface MappedQueueEntry {
  id: string;
  name: string;
  patientAge: string;
  patientSex: string;
  patientDob: string;
  patientUuid: string;
  priority: string;
  priorityComment: string;
  priorityUuid: string;
  service: string;
  status: string;
  statusUuid: string;
  visitStartDateTime: string;
  visitType: string;
  visitUuid: string;
  waitTime: string;
  queueUuid: string;
  queueEntryUuid: string;
  queueLocation: string;
  sortWeight: string;
  visitNumber: string;
  dateCreated: string;
}

export interface EndVisitPayload {
  location: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime: Date;
}

export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export interface LocationEntry {
  resource: Resource;
}
export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  status: 'active' | 'inactive';
  meta?: {
    tag?: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  };
}

export interface Identifer {
  identifier: string;
  display: string;
  uuid: string;
  identifierType: {
    uuid: string;
    display: string;
  };
}

export interface NewVisitPayload {
  uuid?: string;
  location: string;
  patient?: string;
  startDatetime: Date;
  visitType: string;
  stopDatetime?: Date;
  attributes?: Array<{
    attributeType: string;
    value: string;
  }>;
}

export interface QueueRoom {
  uuid: string;
  display: string;
  name: string;
  description: string;
}

export interface ProvidersQueueRoom {
  uuid: string;
  provider: {
    uuid: string;
    display: string;
  };
  queueRoom: {
    uuid: string;
    name: string;
    display: string;
  };
}

export interface WaitTime {
  metric: string;
  averageWaitTime: string;
}

export interface ProcedureOrderBasketItem extends OrderBasketItem {
  testType?: {
    label: string;
    conceptUuid: string;
  };
  labReferenceNumber?: string;
  urgency?: OrderUrgency;
  instructions?: string;
  previousOrder?: string;
  orderReason?: string;
  orderReasonNonCoded?: string;
  scheduledDate?: Date;
  commentToFulfiller?: string;
  clinicalHistory?: string;
  laterality?: string;
  numberOfRepeats?: string;
  frequency?: string;
  specimenSource?: string;
  specimenType?: string;
  scheduleDate?: Date;
  bodySite?: string;
}

export type OrderFrequency = CommonProceduresValueCoded;
export type DurationUnit = CommonProceduresValueCoded;

interface CommonProceduresProps {
  value: string;
  default?: boolean;
}

export interface CommonProceduresValueCoded extends CommonProceduresProps {
  valueCoded: string;
}

export type * from './patient-queue';

export type CodedCondition = {
  concept: {
    uuid: string;
    display: string;
  };
  conceptName: {
    uuid: string;
    display: string;
  };
  display: string;
};

export type CodedProvider = {
  uuid: string;
  display: string;
};
export type DateFilterContext = {
  dateRange: Array<Date>;
  setDateRange: React.Dispatch<React.SetStateAction<Array<Date>>>;
};

export type ProcedurePayload = {
  patient: string;
  encounter?: string; // Single encounter UUID (for EMRAPI)
  procedureCoded: string; // Renamed from 'concept' for EMRAPI
  bodySiteCoded?: string; // Renamed from 'bodySite' for EMRAPI
  startDateTime: string; // camelCase for EMRAPI
  endDateTime: string; // camelCase for EMRAPI
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

// Procedure type (from emrapi Procedure resource)
export interface ProcedureType {
  uuid: string;
  name: string;
}

export interface ConceptReference {
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
  estimatedStartDate?: string;
  duration?: number;
  durationUnit?: {
    uuid: string;
    display: string;
  };
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
}

export type OrderStatusFilterType =
  | 'All'
  | 'EXCEPTION'
  | 'RECEIVED'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'DECLINED';

export interface WorklistProps {
  fulfillerStatus: string;
}

export interface ResultsOrderProps {
  order: Result;
  patientUuid: string;
}

export interface RejectOrderProps {
  order: Result;
}

export interface InstructionsProps {
  order: Result;
}

export interface GroupedOrders {
  patientId: string;
  orders: Array<Result>;
}
export interface GroupedOrdersTableProps {
  orders: Array<Result>;
  showStatus: boolean;
  showActions: boolean;
  showOrderType: boolean;
  showStatusFilter: boolean;
  showDateFilter: boolean;
  actions: Array<OrderAction>;
}

export interface ListOrdersDetailsProps {
  groupedOrders: GroupedOrders;
  showStatus: boolean;
  showActions: boolean;
  showOrderType: boolean;
  actions: Array<OrderAction>;
}

export interface OrderAction {
  actionName: string;
  displayPosition: 0 | number;
}

export interface Result {
  uuid: string;
  orderNumber: string;
  accessionNumber: string;
  patient: Patient;
  concept: Concept;
  action: string;
  careSetting: CareSetting;
  previousOrder: PreviousOrder;
  dateActivated: string;
  scheduledDate: any;
  dateStopped: any;
  autoExpireDate: any;
  encounter: Encounter;
  orderer: Orderer;
  orderReason: any;
  orderReasonNonCoded: any;
  orderType: OrderType;
  urgency: string;
  instructions: any;
  commentToFulfiller: any;
  display: string;
  auditInfo: AuditInfo;
  fulfillerStatus: string;
  fulfillerComment: any;
  specimenSource: SpecimenSource;
  laterality: any;
  bodySite?: string;
  clinicalHistory: any;
  frequency: any;
  numberOfRepeats: any;
  procedures?: any; // Made optional - procedures now fetched separately via emrapi
  links: Link[];
  type: string;
  resourceVersion: string;
}

export interface Concept {
  conceptClass: ConceptClass;
  uuid: string;
  display: string;
  links: Link[];
}

export interface ConceptClass {
  uuid: string;
}

export interface CareSetting {
  uuid: string;
  name: string;
  description: string;
  retired: boolean;
  careSettingType: string;
  display: string;
  links: Link[];
  resourceVersion: string;
}

export interface PreviousOrder {
  uuid: string;
  display: string;
  links: Link[];
  type: string;
}

export interface Encounter {
  uuid: string;
  display: string;
  links: Link[];
}

export interface Orderer {
  uuid: string;
  display: string;
  links: Link[];
}

export interface OrderType {
  uuid: string;
  display: string;
  name: string;
  javaClassName: string;
  retired: boolean;
  description: string;
  conceptClasses: any[];
  parent: any;
  links: Link[];
  resourceVersion: string;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: any;
  dateChanged: any;
}

export interface Creator {
  uuid: string;
  display: string;
  links: Link[];
}

export interface SpecimenSource {
  uuid: string;
  display: string;
  links: Link[];
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
 * Standardized across all procedure orders workspaces to ensure consistent
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
