# Order to Result Form Field Mapping

This document provides comprehensive documentation for mapping OpenMRS Order API data to Procedure and Imaging Result Form initial values.

## Overview

The `order-to-form-mapper` utilities transform OpenMRS Order data into form default values for capturing procedure and imaging results. This enables automatic prefilling of result forms based on order details.

**Source:** OpenMRS Order API response  
**Target:** Procedure/Imaging Result Form `initialValues`

## Architecture

```
┌─────────────────────┐
│  OpenMRS Order API  │
│      Response       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  order-to-form-mapper.ts             │
│  - orderToProcedureFormDefaults()   │
│  - orderToImagingFormDefaults()     │
│  - combineNotes()                   │
│  - extractBodySiteUuid()            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Form Workspace                     │
│  - procedure-result-form.workspace  │
│  - imaging-result-form.workspace    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Result Form Component              │
│  - Prefilled form values            │
└─────────────────────────────────────┘
```

## Procedure Result Form Mapping

### Core Fields

| Order Field | Form Field | Transformation | Notes |
|-------------|------------|----------------|-------|
| `concept.uuid` | `procedureCoded` | Direct mapping | Procedure type UUID |
| `bodySite.uuid` | `bodySite` | Extract UUID | From object or string |
| `bodySite.display` | Display value | For dropdown | Human-readable label |
| `laterality` | `laterality` | Direct mapping | LEFT/RIGHT/BILATERAL |
| `instructions` | `notes` | Combined with commentToFulfiller | Order instructions |
| `commentToFulfiller` | `notes` | Combined with instructions | Fulfiller comments |
| `urgency` | `urgency` | Direct mapping | ROUTINE/STAT/ON_SCHEDULED_DATE |
| `orderReasonNonCoded` | `orderReason` | Direct mapping | Free text reason |
| `orderReason.display` | `orderReason` | Fallback to nonCoded | Coded reason display |
| `uuid` | `_orphanedData.procedureOrder` | For reference | Order UUID |
| `accessionNumber` | `_orphanedData.accessionNumber` | For reference | Imaging accession number |

### Procedure Fields (from existing procedure)

| Procedure Field | Form Field | Transformation | Notes |
|-----------------|------------|----------------|-------|
| `procedureType.uuid` | `procedureType` | Direct mapping | Procedure type UUID |
| `startDateTime` | `startDateTime` | Date object | ISO string to Date |
| `endDateTime` | `endDateTime` | Date object | ISO string to Date |
| `status.uuid` | `status` | Direct mapping | Status concept UUID |
| `outcomeCoded.uuid` | `outcomeCoded` | Direct mapping | Outcome concept UUID |
| `estimatedStartDate` | `estimatedStartDate` | Direct mapping | YYYY-MM format |
| `duration` | `duration` | Number | Duration value |
| `durationUnit.uuid` | `durationUnit` | Direct mapping | Duration unit UUID |
| `notes` | `notes` | Combined with order notes | Existing procedure notes |

## Imaging Result Form Mapping

The imaging result form includes all procedure fields plus imaging-specific observation fields:

### Imaging Observation Fields

| Order/Procedure Field | Form Field | Transformation | Notes |
|-----------------------|------------|----------------|-------|
| `accessionNumber` | `accessionNumber` | Direct mapping | From order if available |
| `orderReasonNonCoded` | `clinicalIndication` | Direct mapping | Reason for imaging |
| `orderReason.display` | `clinicalIndication` | Fallback to nonCoded | Coded indication |
| N/A | `imagingModality` | Must select | Not in order |
| N/A | `contrastAgent` | Must select | Not in order |
| N/A | `dicomStudyUid` | Must enter | Not in order |
| N/A | `radiationDose` | Must enter | Not in order |
| N/A | `imagingFindings` | Must enter | Not in order |
| N/A | `imagingImpression` | Must enter | Required field |
| N/A | `imagingImages` | Must upload | Not in order |

## Order API Response Structure

```typescript
interface Order {
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
      display: string;
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
  bodySite?: {
    uuid: string;
    display: string;
    conceptClass?: {
      uuid: string;
      display: string;
    };
  } | string;
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
  type: string;
}
```

## Form Default Values Structure

### Procedure Result Form

```typescript
interface ProcedureResultFormDefaults {
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
  // Orphaned data
  _orphanedData?: {
    procedureOrder: string;
    procedureReason: string;
    category: string;
    accessionNumber?: string;
  };
}
```

### Imaging Result Form

```typescript
interface ImagingResultFormDefaults extends ProcedureResultFormDefaults {
  // Imaging-specific observation fields
  imagingModality: string;
  contrastAgent: string;
  accessionNumber: string;
  dicomStudyUid: string;
  radiationDose: number | null;
  clinicalIndication: string;
  imagingFindings: string;
  imagingImpression: string;
  imagingImages: string[];
}
```

## Utility Functions

### `combineNotes()`

Combines notes from multiple sources into a single field.

```typescript
function combineNotes(
  instructions?: string,
  commentToFulfiller?: string,
  existingNotes?: string,
): string
```

**Logic:**
1. Filters out placeholder values: "NA", "na", "nA", "N/A"
2. Combines non-empty values with double newlines
3. Preserves existing procedure notes

### `extractBodySiteUuid()`

Extracts body site UUID from various possible formats.

```typescript
function extractBodySiteUuid(bodySite?: { uuid?: string } | string): string
```

**Logic:**
- Returns empty string if no body site
- Returns UUID if object with `uuid` property
- Returns string value if primitive string

### `orderToProcedureFormDefaults()`

Transforms order data to procedure result form defaults.

```typescript
function orderToProcedureFormDefaults(
  order: Order | null | undefined,
  procedure?: ProcedureData,
): ProcedureResultFormDefaults
```

### `orderToImagingFormDefaults()`

Transforms order data to imaging result form defaults.

```typescript
function orderToImagingFormDefaults(
  order: Order | null | undefined,
  procedure?: ProcedureData,
): ImagingResultFormDefaults
```

## Usage Examples

### In Procedure Result Form Workspace

```typescript
import { orderToProcedureFormDefaults } from '../../resources/order-to-form-mapper';

// In workspace component
const formDefaults = useMemo(
  () => orderToProcedureFormDefaults(order, procedure),
  [order, procedure],
);

const methods = useForm<ProcedureResultFormSchema>({
  defaultValues: {
    procedureCoded: formDefaults.procedureCoded,
    bodySite: formDefaults.bodySite,
    notes: formDefaults.notes,
    // ... other fields
  },
});
```

### In Imaging Result Form Workspace

```typescript
import { orderToImagingFormDefaults } from '../../resources/order-to-form-mapper';

// In workspace component
const formDefaults = useMemo(
  () => orderToImagingFormDefaults(order, procedure),
  [order, procedure],
);

const methods = useForm<ImagingResultFormSchema>({
  defaultValues: {
    // All procedure fields
    ...formDefaults,
    // Imaging-specific fields
    imagingModality: formDefaults.imagingModality,
    clinicalIndication: formDefaults.clinicalIndication,
    // ... other imaging fields
  },
});
```

## Data Flow Examples

### Example 1: Basic Procedure Order

**Order Data:**
```json
{
  "uuid": "c553c85e-4df9-40f9-88e4-d1aec15b9eaf",
  "orderNumber": "ORD-16",
  "concept": {
    "uuid": "dc78dcd9-30ab-102d-86b0-7a5022ba4115",
    "display": "CLEAN AND DRESSING"
  },
  "urgency": "STAT",
  "instructions": "Clean wound with saline",
  "commentToFulfiller": "Use sterile technique"
}
```

**Form Defaults:**
```json
{
  "procedureCoded": "dc78dcd9-30ab-102d-86b0-7a5022ba4115",
  "bodySite": "",
  "urgency": "STAT",
  "notes": "Clean wound with saline\n\nUse sterile technique",
  "_orphanedData": {
    "procedureOrder": "c553c85e-4df9-40f9-88e4-d1aec15b9eaf",
    "category": "CLEAN AND DRESSING"
  }
}
```

### Example 2: Imaging Order with Body Site

**Order Data:**
```json
{
  "uuid": "f1bd8dab-0803-44e3-961d-c269373320a3",
  "orderNumber": "ORD-11",
  "concept": {
    "uuid": "dc76e25b-30ab-102d-86b0-7a5022ba4115",
    "display": "X-RAY, SHOULDER"
  },
  "bodySite": {
    "uuid": "8134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "display": "Left Shoulder"
  },
  "laterality": "LEFT",
  "accessionNumber": "ACN-2024-001",
  "orderReasonNonCoded": "Patient fell on left shoulder"
}
```

**Form Defaults:**
```json
{
  "procedureCoded": "dc76e25b-30ab-102d-86b0-7a5022ba4115",
  "bodySite": "8134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  "laterality": "LEFT",
  "accessionNumber": "ACN-2024-001",
  "clinicalIndication": "Patient fell on left shoulder",
  "_orphanedData": {
    "procedureOrder": "f1bd8dab-0803-44e3-961d-c269373320a3",
    "category": "X-RAY, SHOULDER",
    "accessionNumber": "ACN-2024-001"
  }
}
```

## Configuration Requirements

The following config properties are used by the mapper:

### Procedure Orders App

- `procedureStatusConcepts`: Status concept UUIDs
- `procedureOutcomeConcepts`: Outcome concept UUIDs
- `procedureOrderRefConceptUuid`: For storing order reference

### Imaging Orders App

- All procedure orders app config plus:
- `imagingModalityConceptUuid`: Imaging modality observation concept
- `clinicalIndicationConceptUuid`: Clinical indication observation concept
- `accessionNumberConceptUuid`: Accession number observation concept
- `imagingFindingsConceptUuid`: Findings observation concept
- `imagingImpressionConceptUuid`: Impression observation concept
- `imagingImagesConceptUuid`: Image attachment observation concept

## Related Files

- `packages/esm-procedure-orders-app/src/resources/order-to-form-mapper.ts`
- `packages/esm-imaging-orders-app/src/resources/order-to-form-mapper.ts`
- `packages/esm-procedure-orders-app/src/workspaces/procedure-result-form/procedure-result-form.workspace.tsx`
- `packages/esm-imaging-orders-app/src/workspaces/imaging-result-form/imaging-result-form.workspace.tsx`

## See Also

- [OpenMRS Order API Documentation](https://wiki.openmrs.org/display/docs/REST+Web+Services+Sub+Modules#RESTWebServicesSubModules-Order)
- [EMRAPI Procedure Module](https://wiki.openmrs.org/display/docs/EMRAPI+Module)
- [Imaging Architecture Documentation](./imaging-architecture.md)
