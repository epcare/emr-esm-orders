# Concept Database Investigation Report

## Project: emr-esm-orders
**Database:** epcare
**Date:** 2026-07-03
**Purpose:** Comprehensive validation of all configured concepts against the actual database state

---

## Executive Summary

This investigation validates all concept UUIDs configured in the imaging and procedure order applications against the actual OpenMRS database. It identifies which concepts exist, which are missing, and provides alternative concepts where available.

### Key Findings

| Category | Existing | Missing | Alternative Available |
|----------|----------|---------|---------------------|
| **Procedure Status Concepts** | 7/7 ✅ | 0 | N/A |
| **Procedure Outcome Concepts** | 0/3 ❌ | 3 | ✅ Yes |
| **Imaging Observation Concepts** | 10/10 ✅ | 0 | N/A |
| **Encounter Type** | 1/1 ✅ | 0 | N/A |
| **Concept Classes** | 2/2 ✅ | 0 | N/A |
| **Concept Sets** | 0/5 ❌ | 5 | ✅ Yes |
| **Complication Concepts** | 0/2 ❌ | 2 | ✅ Yes |

---

## 1. Procedure Status Concepts (EMRAPI)

All 7 status concepts exist in the database ✅

| Status | Config UUID | Database UUID | Status |
|--------|-------------|---------------|--------|
| PREPARATION | 167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | 167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | ✅ |
| IN_PROGRESS | 163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | 163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | ✅ |
| NOT_DONE | dc9825cf-30ab-102d-86b0-7a5022ba4115 | dc9825cf-30ab-102d-86b0-7a5022ba4115 | ✅ |
| ON_HOLD | 167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | 167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | ✅ |
| STOPPED | dca26b47-30ab-102d-86b0-7a5022ba4115 | dca26b47-30ab-102d-86b0-7a5022ba4115 | ✅ |
| COMPLETED | dca06bae-30ab-102d-86b0-7a5022ba4115 | dca06bae-30ab-102d-86b0-7a5022ba4115 | ✅ |
| ENTERED_IN_ERROR | 162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | 162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | ✅ |

---

## 2. Procedure Outcome Concepts (EMRAPI)

**All 3 outcome concepts are MISSING** ❌

| Outcome | Config UUID | Database UUID | Status |
|---------|-------------|---------------|--------|
| SUCCESSFUL | 160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | NULL | ❌ Missing |
| NOT_SUCCESSFUL | 160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | NULL | ❌ Missing |
| PARTIALLY_SUCCESSFUL | 160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | NULL | ❌ Missing |

### Alternative Outcome Concepts Available ✅

| Alternative Concept | UUID | Class | Description |
|---------------------|------|-------|-------------|
| **Successfully Treated** | eed11f33-313c-4fbd-b95b-d78e950f96c9 | State | Use for SUCCESSFUL |
| **Treatment complete** | 160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | State | Use for SUCCESSFUL |
| **CLINICAL TREATMENT FAILURE** | dcda6cd2-30ab-102d-86b0-7a5022ba4115 | Finding | Use for NOT_SUCCESSFUL |
| **TB Treatment Completed** | 99421... | Finding | Alternative for SUCCESSFUL |
| **TB Treatment Outcome** | 99423... | Finding | General outcome reference |

---

## 3. Imaging Observation Concepts

All 10 imaging observation concepts exist in the database ✅

| Concept ID | Config UUID | Name | Data Type | Class |
|------------|-------------|------|-----------|-------|
| 200129 | bbb8c439-712b-4fb2-9b09-6d56aa8dd25c | Imaging Modality | Coded | Finding |
| 200130 | 0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e | Contrast Agent | Coded | Finding |
| 200131 | 17fdb716-2c3a-4883-95a5-a4e39d104ca6 | Body Site | Coded | Test |
| 200132 | 0e163f39-bebd-455d-a9c2-5cec790461b8 | Accession Number | Text | Finding |
| 200133 | d55e0ae3-abad-4dee-a5de-6fd1db010453 | DICOM Study UID | Text | Finding |
| 200134 | 458bd4f7-9292-40db-8a9e-334faff7827c | Radiation Dose | Numeric | Finding |
| 200135 | f36f1463-90cc-4aa3-bffa-91ef24b31f21 | Clinical Indication | Text | Finding |
| 200136 | 7f39af1b-8d9d-43c1-ad2e-8fd848a0093a | Imaging Findings | Text | Finding |
| 159395 | 159395AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Clinical impression comment | Text | Finding |
| 186351 | 7cac8397-53cd-4f00-a6fe-028e8d743f8e | Image attachment | Complex | Question |

**Note:** None of the imaging observation concepts currently have coded answers configured via `concept_answer`. They are designed for free-text or numeric entry, or may need answers added later.

---

## 4. Concept Classes

All required concept classes exist ✅

| Config UUID | Name | Status |
|-------------|------|--------|
| 8d4918b0-c2cc-11de-8d13-0010c6dffd0f | Diagnosis | ✅ |
| 8caa332c-efe4-4025-8b18-3398328e1323 | Radiology/Imaging Procedure | ✅ |

### Available Concept Classes in Database

| Class ID | UUID | Name | Concept Count |
|----------|------|------|---------------|
| 1 | 8d4907b2-c2cc-11de-8d13-0010c6dffd0f | Test | 608 |
| 2 | 8d490bf4-c2cc-11de-8d13-0010c6dffd0f | Procedure | 90 |
| 22 | 8caa332c-efe4-4025-8b18-3398328e1323 | Radiology/Imaging Procedure | 80 |
| 28 | 0dcf23d4-3008-4d8e-b12c-4ec95d1cfd97 | Medical supply | 52 |
| 5 | 8d491a9a-c2cc-11de-8d13-0010c6dffd0f | Finding | 3248 |
| 17 | 1edca23c-768a-102f-83f4-12313b04a615 | State | 10 |
| 4 | 8d4918b0-c2cc-11de-8d13-0010c6dffd0f | Diagnosis | 17641 |
| 7 | 8d491e50-c2cc-11de-8d13-0010c6dffd0f | Question | 1017 |

---

## 5. Concept Sets

### Missing Configured Concept Sets ❌

| Config UUID | Intended Purpose | Status |
|-------------|------------------|--------|
| 165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Procedure Concept Set | ❌ Missing |
| 164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Radiology Concept Set | ❌ Missing |
| 163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Body Site (procedure) | ❌ Missing |

### Alternative Concept Sets Available ✅

| Set UUID | Name | Member Count | Purpose | Use For |
|----------|------|--------------|---------|---------|
| 4557f916-4f42-410a-96ad-39c59ad82553 | Imaging modalities | 62 | Radiology procedures | **Radiology Concept Set** |
| dc9fab29-30ab-102d-86b0-7a5022ba4115 | ANATOMIC LOCATIONS | 17 | Body sites | **Body Site (imaging)** |
| 162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Dosing unit | 92 | Time/Duration units | **Duration Unit** |
| 200127 | 2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8 | Medical Supplies | 70 | Medical supplies | Medical Supply |
| 199363 | 83bdfa6a-0c51-428a-a08d-3922db216858 | Procedure sequence construct | 58 | Procedures | **Procedure Concept Set** |

---

## 6. Procedure Complication Concepts

### Missing Configured Concepts ❌

| Config UUID | Intended Purpose | Status |
|-------------|------------------|--------|
| 120202AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Procedure Complication Grouping | ❌ Missing |
| 120198AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | Procedure Complication | ❌ Missing |

### Alternative Complication Concepts ✅

| Concept UUID | Name | Class | Description |
|--------------|------|-------|-------------|
| c2ff3c0b-1d02-4f45-96a4-8b5087f232fc | Complications | Finding | General complications concept |
| 167796... | COMPLICATION OF CHILD BIRTH | Anatomy | Specific complication type |

---

## 7. Encounter Configuration

### Encounter Type ✅

| Config UUID | Name | Status |
|-------------|------|--------|
| a4870f6d-ea06-4bbe-b775-bcbfb0816dbf | Procedure Result Encounter Type | ✅ Exists |

### Encounter Role ✅

| Config UUID | Name | Status |
|-------------|------|--------|
| a0b03050-c99b-11e0-9572-0800200c9a66 | Unknown (legacy default) | ✅ EXISTS |

**Note:** The configured UUID exists in the `encounter_role` table (named "Unknown" - a legacy default role for providers with no specific encounter role set). There are 20 total encounter roles available in the system including Doctor, Clinician, Nurse, Radiology Technician, etc. Previous documentation incorrectly checked `provider_role` table.

---

## 8. Largest Concept Sets in Database

| Set UUID | Name | Class | Member Count |
|----------|------|-------|--------------|
| 941d42f3-1901-47d7-826f-403736388a62 | Cause of Death Set | ConvSet | 17,234 |
| 9fcafaf4-55ee-4a17-a201-35b0f9ed3f5d | OPD Diagnosis Set | ConvSet | 13,434 |
| dca07f4a-30ab-102d-86b0-7a5022ba4115 | TESTS ORDERED | Question | 130 |
| 162384... | Dosing unit | ConvSet | 92 |
| 2f6f34a4... | Medical Supplies | Medical supply | 70 |
| 4557f916... | Imaging modalities | ConvSet | 62 |
| 83bdfa6a... | Procedure sequence construct | ConvSet | 58 |
| 160855... | Medication frequency | Question | 35 |

---

## 9. Imaging Modalities Set Details

The "Imaging modalities" concept set (UUID: 4557f916-4f42-410a-96ad-39c59ad82553) contains 62 imaging procedures including:

- X-RAY CHEST, ABDOMEN, ARM, LEG, etc.
- CT scans (HEAD, CHEST, Paranasal Sinuses)
- Ultrasound (Abdominal, Ankle, Breast, Carotid, Cranial, Doppler, etc.)
- Angiography
- Fluoroscopy
- Barium studies
- Mammography
- MRI studies
- Obstetric ultrasound
- And many more...

---

## 10. ANATOMIC LOCATIONS Set Details

The "ANATOMIC LOCATIONS" concept set (UUID: dc9fab29-30ab-102d-86b0-7a5022ba4115) contains 17 body sites:

(Requires additional query to list all members)

---

## Recommendations

### Immediate Actions Required

1. **Update Outcome Concept Configuration** - Replace missing outcome UUIDs with alternatives:
   - SUCCESSFUL: Use `eed11f33-313c-4fbd-b95b-d78e950f96c9` (Successfully Treated)
   - NOT_SUCCESSFUL: Use `dcda6cd2-30ab-102d-86b0-7a5022ba4115` (CLINICAL TREATMENT FAILURE)
   - PARTIALLY_SUCCESSFUL: Use combination or create new concept

2. **Update Concept Set Configuration** - Replace missing concept set UUIDs:
   - Radiology Concept Set: Use `4557f916-4f42-410a-96ad-39c59ad82553` (Imaging modalities)
   - Body Site (imaging): Use `dc9fab29-30ab-102d-86b0-7a5022ba4115` (ANATOMIC LOCATIONS)
   - Duration Unit: Use `162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` (Dosing unit)

### Optional Future Actions

**Note:** Provider role is NOT an issue - the configured UUID exists in `encounter_role` table. Previous documentation incorrectly checked `provider_role` table.

1. **Add Coded Answers** - Consider adding coded answers to imaging observation concepts:
   - Imaging Modality (200129): CT, MRI, XRAY, US, etc.
   - Contrast Agent (200130): None, Iodinated, Gadolinium, etc.

2. **Create Missing Concepts** - If exact matching to original configuration is desired:
   - Create the three outcome concepts (SUCCESSFUL, NOT_SUCCESSFUL, PARTIALLY_SUCCESSFUL)
   - Create procedure complication concepts

3. **Populate Concept Sets** - Create the missing concept sets if specific grouping is needed beyond available alternatives

---

## Concept Class Reference

| Class ID | Name | Description |
|----------|------|-------------|
| 1 | Test | Acquired during patient encounter (vitals, labs, etc.) |
| 2 | Procedure | Describes a clinical procedure |
| 22 | Radiology/Imaging Procedure | A radiology or imaging test or procedure |
| 28 | Medical supply | Durable medical equipment and other supplies |
| 5 | Finding | Practitioner observation/finding |
| 17 | State | Workflow state |
| 4 | Diagnosis | Conclusion drawn through findings |
| 25 | Units of Measure | For prescribing and dispensing |
| 23 | Frequency | Used for capturing frequency information |
| 7 | Question | Question (eg, patient history, SF36 items) |

---

## Database Tables Used

- `concept` - Main concept definitions
- `concept_name` - Concept names in multiple locales
- `concept_class` - Concept categorization
- `concept_datatype` - Data types for concept values
- `concept_set` - Hierarchical relationships
- `concept_answer` - Coded answers for questions
- `encounter_type` - Encounter type definitions
- `encounter_role` - Encounter role definitions (20 roles available, configured UUID exists)
- `encounter_provider` - Junction table linking encounters, providers, and roles

---

## Appendix: Query Reference

### Verify a concept exists
```sql
SELECT uuid, concept_id FROM concept WHERE uuid = '...';
```

### Get concept details
```sql
SELECT c.concept_id, c.uuid, cn.name, cc.name as class_name
FROM concept c
JOIN concept_name cn ON c.concept_id = cn.concept_id
JOIN concept_class cc ON c.class_id = cc.concept_class_id
WHERE c.uuid = '...';
```

### Get concept set members
```sql
SELECT cs.concept_id, c.uuid, cn.name
FROM concept_set cs
JOIN concept c ON cs.concept_id = c.concept_id
JOIN concept_name cn ON c.concept_id = cn.concept_id
WHERE cs.concept_set = <set_id>;
```

---

*Report generated: 2026-07-03*
*Database: epcare*
*Investigation scope: Imaging and Procedure Order Applications*
