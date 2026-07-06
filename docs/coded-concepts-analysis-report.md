# Coded Concepts Analysis Report - emr-esm-orders

**Project:** emr-esm-orders  
**Database:** epcare  
**Date:** 2026-07-03  
**Purpose:** Analyze coded concepts and their answers based on architecture and database state

---

## Architecture Overview

Based on the [IMAGING_ARCHITECTURE.md](../IMAGING_ARCHITECTURE.md) document, the system follows this principle:

> **Imaging IS a procedure**, but it's a special kind of procedure where the act of performing produces a separate clinical artifact (the images) that then requires interpretation.

### Data Model Separation

```
┌─────────────────────────────────────────────────────────┐
│                    ENCOUNTER                              │
│  (e.g., "Radiology Encounter on 2025-01-15")            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  PROCEDURE (EMRAPI) - Clinical Event                     │
│  ├─ Type: CT Abdomen with Contrast                       │
│  ├─ Start: 2025-01-15 09:30                              │
│  ├─ End: 2025-01-15 09:45                                │
│  ├─ Status: COMPLETED                                    │
│  ├─ Outcome: SUCCESSFUL                                  │
│  └─ Notes: Basic procedure info                          │
│                                                           │
│  OBSERVATIONS - Rich Clinical Details                    │
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

---

## Coded Concepts with Answers (concept_answer)

### Imaging Procedure Concepts

**All imaging procedures that have coded answers:**

| Procedure UUID | Procedure Name | Answer Count | Answer Options |
|----------------|----------------|--------------|----------------|
| `dc5458a6-30ab-102d-86b0-7a5022ba4115` | **X-RAY, CHEST** | 11 | NORMAL, PLEURAL EFFUSION, MILIARY CHANGES, CARDIOMEGALY, INFILTRATE, DIFFUSE NON-MILIARY CHANGES, CAVITARY LESION, OTHER NON-CODED, YES, NO, UNKNOWN |
| `dc66040a-30ab-102d-86b0-7a5022ba4115` | **X-RAY, ABDOMEN** | 2 | ABNORMAL, NORMAL |
| `dc76301c-30ab-102d-86b0-7a5022ba4115` | **X-RAY, ARM** | 2 | ABNORMAL, NORMAL |
| `dc763c65-30ab-102d-86b0-7a5022ba4115` | **X-RAY, LEG** | 2 | ABNORMAL, NORMAL |
| `dc76448a-30ab-102d-86b0-7a5022ba4115` | **X-RAY, HAND** | 2 | ABNORMAL, NORMAL |
| `dc764cb6-30ab-102d-86b0-7a5022ba4115` | **X-RAY, FOOT** | 2 | ABNORMAL, NORMAL |
| `dc7656dc-30ab-102d-86b0-7a5022ba4115` | **X-RAY, SKULL** | 2 | ABNORMAL, NORMAL |
| `dc76931f-30ab-102d-86b0-7a5022ba4115` | **X-RAY, SPINE** | 2 | ABNORMAL, NORMAL |
| `dc76a4e5-30ab-102d-86b0-7a5022ba4115` | **X-RAY, PELVIS** | 2 | ABNORMAL, NORMAL |
| `dc76e25b-30ab-102d-86b0-7a5022ba4115` | **X-RAY, SHOULDER** | 2 | ABNORMAL, NORMAL |
| `dc74ba13-30ab-102d-86b0-7a5022ba4115` | **X-RAY, OTHER** | 2 | ABNORMAL, NORMAL |
| `dc8d4f5a-30ab-102d-86b0-7a5022ba4115` | **ULTRASOUND, ABDOMEN** | 2 | ABNORMAL, NORMAL |
| `dc8d53a2-30ab-102d-86b0-7a5022ba4115` | **COMPUTED TOMOGRAPHY SCAN, HEAD** | 2 | ABNORMAL, NORMAL |
| `ace41f66-864b-46aa-83a5-8d86e538b800` | **Obstetric ultrasound** | 2 | ABNORMAL, NORMAL |

**Key Finding:** 
- **X-RAY, CHEST** is the ONLY imaging procedure with detailed radiology findings as answers
- All other imaging procedures only have binary NORMAL/ABNORMAL answers
- The YES/NO/UNKNOWN options in X-RAY CHEST may be for a different purpose (possibly follow-up)

---

### Detailed X-RAY, CHEST Answers

| Answer UUID | Answer Name | Sort Weight | Type |
|-------------|-------------|--------------|------|
| `dc9816bd-30ab-102d-86b0-7a5022ba4115` | NORMAL | - | Finding |
| `dc98dffe-30ab-102d-86b0-7a5022ba4115` | PLEURAL EFFUSION | - | Finding |
| `1137AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | MILIARY CHANGES | - | Finding |
| `dcad8a96-30ab-102d-86b0-7a5022ba4115` | CARDIOMEGALY | - | Finding |
| `5622AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | OTHER NON-CODED | - | Misc |
| `dcd555fc-30ab-102d-86b0-7a5022ba4115` | INFILTRATE | - | Finding |
| `dcd55c78-30ab-102d-86b0-7a5022ba4115` | DIFFUSE NON-MILIARY CHANGES | - | Finding |
| `dcd5655d-30ab-102d-86b0-7a5022ba4115` | CAVITARY LESION | - | Finding |
| `dcd695dc-30ab-102d-86b0-7a5022ba4115` | YES | 9 | Misc |
| `dcd69c06-30ab-102d-86b0-7a5022ba4115` | NO | 10 | Misc |
| `dcd6865a-30ab-102d-86b0-7a5022ba4115` | UNKNOWN | 11 | Misc |

**Notes:**
- Synonyms exist (PL EFFUSION = PLEURAL EFFUSION, EVIDENCE OF CARDIAC ENLARGEMENT = CARDIOMEGALY)
- The YES/NO/UNKNOWN options (weights 9-11) appear to be separate from the findings
- This suggests X-RAY CHEST may serve dual purposes: radiology findings AND a binary question

---

### Top Coded Concepts by Answer Count

**Concepts with the most coded answers:**

| Rank | UUID | Concept Name | Class | Answer Count |
|------|------|--------------|-------|--------------|
| 1 | `dd2b0b4d-30ab-102d-86b0-7a5022ba4115` | CURRENT ARV REGIMEN | Finding | 45 |
| 2 | `c8727d0a-46fc-11ee-be56-0242ac120002` | Reason for referral | Question | 45 |
| 3 | `dc9b9dd2-30ab-102d-86b0-7a5022ba4115` | PEDS CDC SPECIFIC CONDITION QUERY | Finding | 44 |
| 4 | `dc9f2f77-30ab-102d-86b0-7a5022ba4115` | PEDS WHO SPECIFIC CONDITION QUERY | Finding | 41 |
| 5 | `e5a81b8f-1998-4f94-a814-000199900000` | Lab Container Types | Misc | 39 |
| 6 | `dce0e02a-30ab-102d-86b0-7a5022ba4115` | SYMPTOM, DIAGNOSIS, OR OPPORTUNISTIC INFECTION | Question | 39 |

---

## Observation Concepts (Per Architecture)

The architecture document specifies these observation concepts for imaging results. **Current Status: NEED TO CREATE**

| Observation Type | Config Key | Description | Data Type | Status |
|------------------|------------|-------------|-----------|--------|
| Imaging Modality | `imagingModalityConceptUuid` | CT, MRI, US, XRAY | Coded | 🔴 TODO |
| Contrast Agent | `contrastAgentConceptUuid` | With/without contrast | Coded | 🔴 TODO |
| Accession Number | `accessionNumberConceptUuid` | Radiology accession identifier | Text | 🔴 TODO |
| DICOM Study UID | `dicomStudyUidConceptUuid` | DICOM unique identifier | Text | 🔴 TODO |
| Radiation Dose | `radiationDoseConceptUuid` | Dose in mSv | Numeric | 🔴 TODO |
| Clinical Indication | `clinicalIndicationConceptUuid` | Why scan was ordered | Text | 🔴 TODO |
| Imaging Findings | `imagingFindingsConceptUuid` | Detailed findings | Text | 🔴 TODO |
| Imaging Impression | `imagingImpressionConceptUuid` | Radiologist conclusion | Text | 🔴 TODO |
| Imaging Images | `imagingImagesConceptUuid` | Image attachments | Complex | 🔴 TODO |

**Gap:** None of these observation concepts exist in the configuration schema. They are marked as TODO in the architecture document.

---

## Procedure vs Imaging Result Form Fields

Based on the architecture, here's how fields should be distributed:

### Procedure (EMRAPI) Fields
| Field | Data Type | Purpose |
|-------|-----------|---------|
| patient | UUID | Patient identifier |
| encounter | UUID | Encounter reference |
| procedureCoded | UUID | Imaging type (e.g., CT Abdomen) |
| procedureType | UUID | Procedure type (optional) |
| bodySiteCoded | UUID | Body site (optional) |
| startDateTime | DateTime | When scan started |
| endDateTime | DateTime | When scan ended |
| **status** | UUID | **COMPLETED, NOT_DONE, IN_PROGRESS** |
| **outcomeCoded** | UUID | **SUCCESSFUL, NOT_SUCCESSFUL, PARTIALLY_SUCCESSFUL** |
| duration | Numeric | Duration in minutes |
| durationUnit | UUID | Duration unit |
| notes | Text | Basic procedure notes |

### Observation Fields (Rich Details)
| Field | Data Type | Purpose |
|-------|-----------|---------|
| Imaging Modality | Coded | CT, MRI, US, XRAY |
| Contrast Agent | Coded | With/without contrast, contrast type |
| Body Site | Coded | Anatomical region |
| Accession Number | Text | Radiology accession identifier |
| DICOM Study UID | Text | DICOM unique identifier |
| Radiation Dose | Numeric | Dose in mSv |
| Clinical Indication | Text | Why the scan was ordered |
| Images | Complex | Image attachments |
| Findings | Text | Detailed radiology findings |
| Impression | Text | Radiologist's impression |

---

## Gap Analysis: Architecture vs Implementation

### Critical Gaps

#### 1. **Outcome Concepts Missing** 🔴

**Required by Architecture:**
- SUCCESSFUL (160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) - Missing
- PARTIALLY_SUCCESSFUL (160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) - Missing
- NOT_SUCCESSFUL (160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA) - Missing

**Impact:** Cannot record procedure outcomes

**Alternatives Available:**
- Successfully Treated (`eed11f33-313c-4fbd-b95b-d78e950f96c9`)
- Treatment complete (`160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)
- CLINICAL TREATMENT FAILURE (`dcda6cd2-30ab-102d-86b0-7a5022ba4115`)
- Died (`160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)

---

#### 2. **Observation Concepts Not Created** 🔴

**Required by Architecture but marked TODO:**
- Imaging Modality concept
- Contrast Agent concept
- Accession Number concept
- DICOM Study UID concept
- Radiation Dose concept
- Clinical Indication concept
- Imaging Findings concept
- Imaging Impression concept
- Imaging Images concept

**Impact:** Cannot capture rich imaging details as specified in architecture

**Current Workaround:** 
- These details may be captured in free-text notes field
- Or captured using a different mechanism

---

#### 3. **X-RAY CHEST Findings Implementation** ⚠️

**Current State:**
- X-RAY CHEST has detailed findings as concept_answer options
- These findings are radiology-specific (NORMAL, PLEURAL EFFUSION, MILIARY CHANGES, etc.)
- It's unclear how these findings should be captured in the current form

**Architectural Question:**
Should X-RAY CHEST findings be captured as:
1. **Observation** (as per architecture for "Findings")
2. **Procedure outcome** (using the concept_answer mechanism)
3. **Separate coded field** specific to X-RAY results

**Recommendation:** 
Use the observation mechanism for findings, as this aligns with the architecture and provides more flexibility for different imaging types.

---

### What IS Working ✅

1. **Procedure Status Concepts** - All 7 exist
2. **Order Types** - All 3 exist
3. **Imaging Procedures** - Have basic answers (NORMAL/ABNORMAL)
4. **X-RAY CHEST** - Has detailed radiology findings

---

## Implementation Recommendations

### Phase 1: Address Outcome Concepts (HIGH PRIORITY)

**Option A: Use Existing Alternatives**
```typescript
// Update config with alternative outcome concepts
procedureOutcomeConcepts: {
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9', // Successfully Treated
  PARTIALLY_SUCCESSFUL: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // In progress (proxy)
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115', // CLINICAL TREATMENT FAILURE
}
```

**Option B: Create Missing Concepts**
- Run SQL scripts to create the 3 missing outcome concepts
- Matches architecture exactly
- Requires database write access

### Phase 2: Implement Observation Strategy (MEDIUM PRIORITY)

**Option A: Create Dedicated Observation Concepts**
- Create the 9 observation concepts specified in architecture
- Implement observation creation logic
- Most aligned with architecture

**Option B: Use Existing Mechanisms**
- Capture imaging details in existing fields
- Use notes field for findings/impression
- Less elegant but functional

### Phase 3: X-RAY CHEST Findings (LOW PRIORITY)

**Recommendation:**
Implement findings as a coded observation that uses the existing concept_answer options for X-RAY CHEST.

---

## Validation Queries

### Check if Imaging Procedure Has Answers
```sql
SELECT 
    c.uuid,
    cn.name as concept_name,
    COUNT(DISTINCT ca.answer_concept) as answer_count
FROM concept c
INNER JOIN concept_class cc ON c.class_id = cc.concept_class_id
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id 
    AND cn.locale = 'en' 
    AND cn.voided = 0 
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
LEFT JOIN concept_answer ca ON c.concept_id = ca.concept_id
WHERE cc.name = 'Radiology/Imaging Procedure'
  AND c.retired = 0
GROUP BY c.uuid, cn.name;
```

### Get Answers for Specific Procedure
```sql
SELECT 
    cn_answer.name as answer_name,
    ca.sort_weight
FROM concept_answer ca
INNER JOIN concept c_question ON ca.concept_id = c_question.concept_id
INNER JOIN concept c_answer ON ca.answer_concept = c_answer.concept_id
INNER JOIN concept_name cn_answer ON c_answer.concept_id = cn_answer.concept_id 
    AND cn_answer.locale = 'en' 
    AND cn_answer.voided = 0
WHERE c_question.uuid = 'dc5458a6-30ab-102d-86b0-7a5022ba4115'
ORDER BY ca.sort_weight;
```

---

## Summary

### Coded Concepts with Answers: 50+ concepts found

**Imaging-specific:** 14 imaging procedures have coded answers
- 1 with detailed findings (X-RAY CHEST - 11 answers)
- 13 with binary results (NORMAL/ABNORMAL)

### Key Gaps

1. **Outcome Concepts** (3) - Missing, blocking procedure outcome recording
2. **Observation Concepts** (9) - Not created, blocking rich imaging detail capture
3. **Provider Role** (1) - Missing, may block encounter creation

### Recommendations

1. **Immediate:** Update outcome config with alternative concepts
2. **Short-term:** Implement observation strategy for imaging details
3. **Long-term:** Create dedicated observation concepts per architecture

---

**Report Generated:** 2026-07-03  
**Database:** epcare  
**Architecture Reference:** [IMAGING_ARCHITECTURE.md](../IMAGING_ARCHITECTURE.md)
