# OpenMRS Concept Tables Investigation Summary

## Overview

This document summarizes the investigation of OpenMRS concept-related tables in the `epcare` database. The investigation focused on understanding concept structures, relationships, and mappings relevant to procedure and imaging orders.

## Core Concept Tables

### 1. concept
The main concept table containing all concept definitions.

**Key Fields:**
- `concept_id` - Primary key
- `uuid` - Unique identifier (38-char format)
- `datatype_id` - Foreign key to concept_datatype
- `class_id` - Foreign key to concept_class
- `retired` - Boolean indicating if concept is retired
- `is_set` - Boolean indicating if concept is a set (contains other concepts)

### 2. concept_name
Stores names for concepts in multiple locales.

**Key Fields:**
- `concept_name_id` - Primary key
- `concept_id` - Foreign key to concept
- `name` - The concept name
- `locale` - Language/locale (e.g., 'en')
- `locale_preferred` - Boolean for preferred name in locale
- `concept_name_type` - Type: 'FULLY_SPECIFIED', 'SHORT', 'INDEX_TERM'
- `voided` - Boolean indicating if name is voided

### 3. concept_class
Defines categories for concepts.

**Available Classes:**
- Anatomy
- ConvSet (Convenience Set)
- Diagnosis
- Drug
- Drug form
- Finding
- Frequency
- LabSet
- **Medical supply** (ID: 28)
- MedSet
- Misc
- **Misc Order** (ID: 15)
- NON IDC Diagnosis
- Organism
- Procedure
- Program
- Question
- **Radiology/Imaging Procedure** (ID: 22)
- Specimen
- State
- Stationery
- Symptom
- Symptom/Finding
- **Test** (ID: 1)
- Units of Measure

### 4. concept_datatype
Defines data types for concept values.

**Available Datatypes:**
- Boolean
- Coded
- Complex
- Date
- Datetime
- Document
- N/A
- Numeric
- Rule
- Structured Numeric
- Text
- Time

## Relationship Tables

### 5. concept_set
Defines hierarchical relationships between concepts (parent-child).

**Schema:**
- `concept_set_id` - Primary key
- `concept_id` - Child concept (member)
- `concept_set` - Parent concept (the set)
- `sort_weight` - Order weight

**Example:**
```
EAR DISORDERS (set)
  ├── OTITIS MEDIA (member)
  ├── OTITIS EXTERNA (member)
  └── OE (member, synonym)
```

### 6. concept_reference_map
Maps concepts to external reference terminologies (SNOMED, ICD-10, LOINC, etc.).

**Schema:**
- `concept_map_id` - Primary key
- `concept_id` - Local concept
- `concept_reference_term_id` - Foreign key to reference term
- `concept_map_type_id` - Type of mapping (SAME-AS, IS A, etc.)

**Available Sources:**
- SNOMED CT
- ICD-10-WHO
- ICD-11-WHO
- LOINC
- RxNORM
- AMPATH
- CIEL
- And many more...

### 7. concept_answer
Defines coded answers for question concepts.

**Schema:**
- `concept_answer_id` - Primary key
- `concept_id` - Parent question concept
- `answer_concept` - Answer concept (foreign key to concept)
- `answer_drug` - Answer drug (foreign key to drug)
- `sort_weight` - Order weight

**Example (X-RAY, CHEST answers):**
- NORMAL
- PLEURAL EFFUSION
- MILIARY CHANGES
- CARDIOMEGALY
- OTHER NON-CODED
- INFILTRATE
- YES

## Important Concept Sets Found

### Status-Related Concept Sets

#### 1. **Status** (UUID: `d97aaac8-b711-405e-b511-6801dd8f50d7`)
Members (3 total):
1. `ed1a8012-e074-426e-a701-f9470baae0cb` - **Pending** (State)
2. `50de13af-45e6-43f7-8708-a1243c3b17f7` - **In Service** (State)
3. `dca06bae-30ab-102d-86b0-7a5022ba4115` - **COMPLETED** (Finding)

#### 2. **Medication dispense status** (UUID: `167157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)
Members (9 total):
1. `167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **Preparation**
2. `163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **In progress**
3. `165170AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **Cancelled**
4. `167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **On hold**
5. `dca06bae-30ab-102d-86b0-7a5022ba4115` - **COMPLETED**
6. `162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **Entered in error report status**
7. `dca26b47-30ab-102d-86b0-7a5022ba4115` - **STOPPED**
8. `127750AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **REFUSAL OF TREATMENT BY PATIENT**
9. `1067AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - **UNKNOWN**

#### 3. **LAB RESULT SET** (UUID: `9deeba77-cc1b-47ef-b4ab-84b22fb527f3`)
Members (5 total):
1. `e3977d09-5f8b-40a1-804e-28b427c0e7a4` - **TEST RESULT TYPE** (Coded)
2. `bfd0ac71-cd88-47a3-a320-4fc2e6f5993f` - **LAB RESULT TXT** (Text)
3. `472b6d0f-3f63-4647-8a5c-8223dd1207f5` - **Test** (Text)
4. `2cab2216-1aec-49d2-919b-d910bae973fb` - **Test Result** (Text)
5. `3074a7fa-6b55-4521-8270-1227a63b8b55` - **Date Sample collected** (Date)

### Procedure/Imaging Concept Sets

#### 1. **Imaging modalities** (UUID: `4557f916-4f42-410a-96ad-39c59ad82553`)
Members: 62 imaging procedure types

#### 2. **Obs/gyn procedures** (UUID: `92056126-9c67-4f3d-8cfa-dc30d0a6b661`)
Members: 7 procedure types

#### 3. **Procedure sequence construct** (UUID: `83bdfa6a-0c51-428a-a08d-3922db216858`)
Members: 58 related procedures

## Key Status Concepts Found

| UUID | Name | Class | Datatype |
|------|------|-------|-----------|
| `dca06bae-30ab-102d-86b0-7a5022ba4115` | COMPLETED | Finding | N/A |
| `165170AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Cancelled | Misc | N/A |
| `ed1a8012-e074-426e-a701-f9470baae0cb` | Pending | State | N/A |
| `50de13af-45e6-43f7-8708-a1243c3b17f7` | In Service | State | N/A |
| `160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Died | State | N/A |
| `160036AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Patient transferred out | State | Coded |
| `160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Treatment complete | State | N/A |

## Imaging Procedure Examples

| UUID | Name | Class | Datatype |
|------|------|-------|-----------|
| `dc5458a6-30ab-102d-86b0-7a5022ba4115` | X-RAY, CHEST | Radiology/Imaging Procedure | Coded |
| `dc66040a-30ab-102d-86b0-7a5022ba4115` | X-RAY, ABDOMEN | Radiology/Imaging Procedure | Coded |
| `dc74ba13-30ab-102d-86b0-7a5022ba4115` | X-RAY, OTHER | Radiology/Imaging Procedure | Coded |
| `dc8d4f5a-30ab-102d-86b0-7a5022ba4115` | ULTRASOUND, ABDOMEN | Radiology/Imaging Procedure | Coded |
| `dc8d53a2-30ab-102d-86b0-7a5022ba4115` | COMPUTED TOMOGRAPHY SCAN, HEAD | Radiology/Imaging Procedure | Coded |

## Concept Map Types (Sample)

| ID | Name | Description |
|----|------|-------------|
| 1 | SAME-AS | Direct equivalence |
| 65 | IS A | Hierarchical relationship |
| 66 | MAY BE A | Possible hierarchical |
| 3 | BROADER-THAN | Broader concept |
| 2 | NARROWER-THAN | Narrower concept |

## Queries for Investigation

### Check if a specific UUID exists
```sql
SELECT 
    c.uuid,
    cn.name as concept_name,
    cc.name as concept_class,
    cd.name as datatype,
    c.retired
FROM concept c
INNER JOIN concept_class cc ON c.class_id = cc.concept_class_id
INNER JOIN concept_datatype cd ON c.datatype_id = cd.concept_datatype_id
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id 
    AND cn.locale = 'en' 
    AND cn.voided = 0 
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = 'YOUR_UUID_HERE';
```

### Find all members of a concept set
```sql
SELECT 
    c.uuid,
    cn.name as member_name,
    cc.name as concept_class,
    cd.name as datatype,
    cs.sort_weight
FROM concept_set cs
INNER JOIN concept c ON cs.concept_id = c.concept_id
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id 
    AND cn.locale = 'en' 
    AND cn.voided = 0 
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
INNER JOIN concept_class cc ON c.class_id = cc.concept_class_id
INNER JOIN concept_datatype cd ON c.datatype_id = cd.concept_datatype_id
WHERE cs.concept_set = (SELECT concept_id FROM concept WHERE uuid = 'SET_UUID_HERE')
  AND c.retired = 0
ORDER BY cs.sort_weight, cn.name;
```

### Find concepts by class and name pattern
```sql
SELECT 
    c.uuid,
    cn.name as concept_name,
    cc.name as concept_class,
    cd.name as datatype,
    c.retired
FROM concept c
INNER JOIN concept_class cc ON c.class_id = cc.concept_class_id
INNER JOIN concept_datatype cd ON c.datatype_id = cd.concept_datatype_id
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id 
    AND cn.locale = 'en' 
    AND cn.voided = 0 
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE cc.name = 'CLASS_NAME'
  AND cn.name LIKE '%PATTERN%'
  AND c.retired = 0;
```

## Recommendations

1. **Status Mapping**: The "Status" concept set (`d97aaac8-b711-405e-b511-6801dd8f50d7`) provides a standard set of status values that can be used for procedure and imaging results.

2. **COMPLETED Status**: The UUID `dca06bae-30ab-102d-86b0-7a5022ba4115` represents "COMPLETED" status and is used in both the "Status" and "Medication dispense status" concept sets.

3. **Imaging Results**: The X-RAY, CHEST concept (`dc5458a6-30ab-102d-86b0-7a5022ba4115`) has multiple possible answers defined via the concept_answer table, including NORMAL, PLEURAL EFFUSION, CARDIOMEGALY, etc.

4. **Reference Mappings**: Concepts can be mapped to external terminologies via concept_reference_map, allowing interoperability with SNOMED CT, ICD-10/11, LOINC, and other standards.

## Database Access

- **Username**: openmrs
- **Database**: epcare
- **Access**: Read-only

## Related Documentation

- [Encounter Configuration Summary](./encounter-configuration-summary.md)
- [Form Fields Coverage Summary](./form-fields-coverage-summary.md)
