# Imaging Architecture Design

## Overview

This document outlines the architectural approach for handling imaging orders and results in OpenMRS, following the principle that **imaging is a type of diagnostic procedure** with specialized requirements.

## Core Principle

> **Imaging IS a procedure**, but it's a special kind of procedure where the act of performing produces a separate clinical artifact (the images) that then requires interpretation.

## Domain Analysis

### What is Imaging?

Imaging/Radiology exams include:
- X-rays, CT scans, MRI, Ultrasound
- PET scans, Fluoroscopy
- Nuclear medicine studies
- Mammography, Interventional radiology

### What is a Procedure?

In clinical terminology, a "procedure" is any medical intervention or test performed on a patient:
- **Surgical procedures** (appendectomy, joint replacement)
- **Diagnostic procedures** (endoscopy, biopsy, cardiac cath)
- **Therapeutic procedures** (dialysis, chemotherapy)
- **Imaging procedures** (CT abdomen, chest X-ray)

### Why Imaging is a Procedure

| Reason | Explanation |
|--------|-------------|
| **Lifecycle** | Follows standard procedure workflow: Order → Schedule → Perform → Document → Outcome |
| **Data Captured** | Who performed it? When did it happen? What was the outcome? |
| **Billable Event** | Imaging CPT codes are procedure codes; insurance treats it as a performed service |
| **Can be Cancelled/Rescheduled** | Like other procedures, imaging can be not done or rescheduled |
| **Complications Possible** | Contrast reactions, sedation issues - procedure-like events |

### Why Imaging Feels Different

| Attribute | Surgical Procedure | Imaging Procedure |
|-----------|-------------------|-------------------|
| **Physical invasiveness** | Cutting into body | Non-invasive (usually) |
| **Primary output** | Tissue removed, anatomy altered | Images + Report |
| **Performer role** | Surgeon | Technologist + Radiologist |
| **Documentation** | Operative note | Images + Radiology report |
| **Follow-up** | Wound care, recovery | No recovery needed |

## Proposed Architecture

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────┐
│                    ENCOUNTER                              │
│  (e.g., "Radiology Encounter on 2025-01-15")            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  PROCEDURE (EMRAPI)                                      │
│  ├─ Type: CT Abdomen with Contrast                       │
│  ├─ Start: 2025-01-15 09:30                              │
│  ├─ End: 2025-01-15 09:45                                │
│  ├─ Status: COMPLETED                                    │
│  ├─ Outcome: SUCCESSFUL                                  │
│  └─ Notes: Basic procedure info                          │
│                                                           │
│  OBSERVATIONS (all the rich details)                      │
│  ├─ Imaging Modality → CT (coded)                        │
│  ├─ Contrast Agent → Iodinated contrast (coded)          │
│  ├─ Body Site → Abdomen (coded)                          │
│  ├─ Accession # → ACC-2025-001234 (text)                │
│  ├─ DICOM Study UID → 1.2.840... (text)                  │
│  ├─ Radiation Dose → 12.5 mSv (numeric)                  │
│  ├─ Clinical Indication → "Abdominal pain..." (text)     │
│  ├─ Images → [Complex Obs: image attachments]            │
│  ├─ Findings → "Liver is normal..." (text)               │
│  └─ Impression → "No acute pathology" (text)            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Why This Separation?

| Aspect | Procedure (EMRAPI) | Observations |
|--------|-------------------|--------------|
| **Purpose** | Record the clinical event | Capture clinical data |
| **Scope** | What happened, when, outcome | All the rich details |
| **Standardization** | Consistent across all procedures | Flexible, imaging-specific |
| **Querying** | "What procedures did this patient have?" | "What were the details of the CT?" |
| **Images** | Not the right place | Complex obs (native home) |

## Data Model

### Procedure (EMRAPI)

| Field | Description |
|-------|-------------|
| `patient` | Patient UUID |
| `encounter` | Encounter UUID |
| `procedureCoded` | Imaging type (e.g., "CT Abdomen") |
| `procedureType` | Procedure type (optional) |
| `bodySiteCoded` | Body site (optional) |
| `startDateTime` | When the scan started |
| `endDateTime` | When the scan ended |
| `status` | COMPLETED, NOT_DONE, IN_PROGRESS, etc. |
| `outcomeCoded` | SUCCESSFUL, NOT_SUCCESSFUL, PARTIALLY_SUCCESSFUL |
| `duration` | Procedure duration in minutes |
| `durationUnit` | Duration unit concept |
| `notes` | Basic procedure notes |

### Observations

| Observation | Data Type | Purpose |
|-------------|-----------|---------|
| Imaging Modality | Coded | CT, MRI, US, XRAY, etc. |
| Contrast Agent | Coded | With/without contrast, contrast type |
| Body Site | Coded | Anatomical region |
| Accession Number | Text | Radiology accession identifier |
| DICOM Study UID | Text | DICOM unique identifier |
| Radiation Dose | Numeric | Dose in mSv or mGy |
| Clinical Indication | Text | Why the scan was ordered |
| Images | Complex | Image attachments (complex obs) |
| Findings | Text | Detailed radiology findings |
| Impression | Text | Radiologist's impression/conclusion |
| Procedure Order Ref | Text | Link to original order UUID |

### Observation Grouping (Optional)

For structured reporting, observations can be grouped:

```
Imaging Result (Obs Group)
├─ Modality (coded)
├─ Accession # (text)
├─ Images (complex obs)
├─ Findings (text)
└─ Impression (text)

Technical Details (Obs Group)
├─ Contrast Agent (coded)
├─ Radiation Dose (numeric)
├─ DICOM UID (text)
└─ Body Site (coded)
```

## Implementation

### Configuration Structure

The imaging observation concepts are configured through `spa-config.json`:

```typescript
// config-schema.ts
imagingModalityConceptUuid: '' // TODO: Create concept
contrastAgentConceptUuid: '' // TODO: Create concept
accessionNumberConceptUuid: '' // TODO: Create concept
dicomStudyUidConceptUuid: '' // TODO: Create concept
radiationDoseConceptUuid: '' // TODO: Create concept
clinicalIndicationConceptUuid: '' // TODO: Create concept
imagingFindingsConceptUuid: '' // TODO: Create concept
imagingImpressionConceptUuid: '' // TODO: Create concept
imagingImagesConceptUuid: '' // TODO: Create concept
```

### Using the Observation Utilities

```typescript
import {
  createImagingObservation,
  createImagingObservations,
  createImagingObservationGroup,
  validateImagingObservations,
} from '../utils/imaging-observations.utils';

// Create a single observation
const modalityObs = createImagingObservation(
  config,
  'imagingModality', // Observation type
  { uuid: 'ctConceptUuid', display: 'CT' }, // Coded value
  patientUuid,
  encounterUuid
);

// Create multiple observations at once
const observations = createImagingObservations(
  config,
  {
    imagingModality: { uuid: '...', display: 'CT' },
    contrastAgent: { uuid: '...', display: 'With contrast' },
    accessionNumber: 'ACC-2025-001234',
    clinicalIndication: 'Abdominal pain',
    imagingFindings: 'Liver is normal...',
    imagingImpression: 'No acute pathology',
  },
  patientUuid,
  encounterUuid
);

// Validate required observations
const validation = validateImagingObservations(config, observations);
if (!validation.isValid) {
  console.error('Missing required observations:', validation.missing);
}
```

### Observation Metadata

The `constants/imaging-observations.ts` file defines the metadata for each observation type:

```typescript
export const IMAGING_OBSERVATIONS = {
  imagingModality: {
    type: 'imagingModality',
    label: 'Imaging Modality',
    description: 'The imaging modality used',
    dataType: 'coded',
    required: true,
    configKey: 'imagingModalityConceptUuid',
  },
  // ... other observations
};
```

## Workflow

### 1. Ordering
- Clinician places imaging order
- Order contains: test type, urgency, clinical indication, body site, laterality

### 2. Scheduling
- Order is scheduled for a specific date/time
- May be assigned to a specific modality/room

### 3. Performance
- Technologist performs the imaging
- Procedure record created with start/end times
- Images captured and uploaded (as complex obs)

### 4. Interpretation
- Radiologist reviews images
- Findings and impression documented (as observations)
- Status updated to COMPLETED

### 5. Order-Procedure Linkage
- Original order UUID stored in observation (`procedureOrderRef`)
- Enables traceability from order → procedure → result

## Benefits of This Approach

✅ **Clean Separation**: Procedure = event, Observations = details

✅ **OpenMRS-Native**: Using observations for clinical data is exactly what they're designed for

✅ **Image Handling**: Complex observations properly support image attachments with metadata

✅ **Flexibility**: Different facilities can capture different observation details without changing the procedure model

✅ **Queryability**:
- "What procedures did this patient have?" → Query procedures
- "What CT scans with contrast?" → Query observations
- "Show me the images from this scan" → Query complex obs

✅ **Report Generation**: Radiology reports composed from multiple observations (findings + impression + images)

✅ **Standards Alignment**: Aligns with FHIR where Procedure represents the event and DiagnosticReport represents the results

## Implementation Considerations

### Order-Procedure Linkage

Options for linking orders to procedures:

1. **Observation-based**: Store order UUID in `procedureOrderRef` observation
2. **Encounter-based**: Link via encounter (order encounter = procedure encounter)
3. **Hybrid**: Both for traceability

### Image Storage

- Complex observations support file attachments
- Can store multiple images per procedure
- Each image can have metadata (timestamp, view, position)

### Encounter Strategy

Two approaches:
1. **Reuse Order Encounter**: Store procedure and observations in the same encounter as the order
2. **Create Dedicated Encounter**: Create a new "Radiology Procedure" encounter

Choice depends on facility workflow and data governance preferences.

### Status Synchronization

- Order status: NEW, IN_PROGRESS, COMPLETED, DISCONTINUED
- Procedure status: PREPARATION, IN_PROGRESS, COMPLETED, NOT_DONE
- These should be synchronized as the workflow progresses

## Future Enhancements

- **DICOM Integration**: Direct integration with PACS/RIS
- **Structured Reporting**: Template-based findings for common studies
- **Decision Support**: Alerts for abnormal findings or critical results
- **Charge Capture**: Automated billing code generation from procedure + observations
- **Quality Metrics**: Radiation dose tracking, contrast utilization

## References

- OpenMRS EMRAPI Module Documentation
- HL7 FHIR Procedure Resource
- HL7 FHIR ImagingStudy Resource
- HL7 FHIR DiagnosticReport Resource
- DICOM Standards
