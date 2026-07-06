# Resolved Concept Mappings

**Project:** emr-esm-orders  
**Database:** epcare  
**Last Updated:** 2026-07-04  
**Based on:** concept-database-investigation-report.md

---

## ⚠️ CRITICAL ISSUE: statusConceptUuid

**Both `esm-procedure-orders-app` and `esm-imaging-orders-app` have a configured `statusConceptUuid` that points to a non-existent concept set (`163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`).**

**Current State:**
- ❌ Concept set `163021...` **DOES NOT EXIST** in database
- ✅ Individual status concepts **DO EXIST** and are properly configured (PREPARATION, COMPLETED, etc.)
- ⚠️ The `statusConceptSourceType` is set to "Concept set" which will fail

**Resolution Options:**
1. **Quick Fix:** Change `statusConceptSourceType` default to `"any"` in both config files
2. **Create Concept Set:** Create a concept set in database containing the status concepts
3. **Remove Config:** Remove `statusConceptUuid` from configuration entirely (use hardcoded statuses)

**Files Requiring Updates:**
- `packages/esm-procedure-orders-app/src/config-schema.ts` (line 109-113) ⚠️
- `packages/esm-imaging-orders-app/src/config-schema.ts` (line 118-122) ⚠️

**Individual Status Concepts (all valid - no changes needed):**
- PREPARATION: `167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` ✅
- IN_PROGRESS: `163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` ✅
- COMPLETED: `dca06bae-30ab-102d-86b0-7a5022ba4115` ✅
- STOPPED: `dca26b47-30ab-102d-86b0-7a5022ba4115` ✅
- NOT_DONE: `dc9825cf-30ab-102d-86b0-7a5022ba4115` ✅
- ON_HOLD: `167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` ✅
- ENTERED_IN_ERROR: `162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` ✅

---

## Overview

This document provides the **resolved** concept UUIDs to use in configuration, substituting missing concepts with valid alternatives from the database.

---

## 1. Procedure Status Concepts (EMRAPI) ✅ All Valid

All 7 status concepts exist - no changes needed.

| Status | UUID | Database Status |
|--------|------|-----------------|
| PREPARATION | `167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ✅ Valid |
| IN_PROGRESS | `163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ✅ Valid |
| NOT_DONE | `dc9825cf-30ab-102d-86b0-7a5022ba4115` | ✅ Valid |
| ON_HOLD | `167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ✅ Valid |
| STOPPED | `dca26b47-30ab-102d-86b0-7a5022ba4115` | ✅ Valid |
| COMPLETED | `dca06bae-30ab-102d-86b0-7a5022ba4115` | ✅ Valid |
| ENTERED_IN_ERROR | `162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ✅ Valid |

---

## 2. Procedure Outcome Concepts ⚠️ SUBSTITUTED

**⚠️ WARNING: All 3 configured outcome concept UUIDs don't exist in the database.**
**Use ONLY the UUIDs in the "USE THIS UUID" column below.**

| Outcome | ❌ DO NOT USE | ✅ USE THIS UUID | Concept Name |
|---------|--------------|------------------|--------------|
| SUCCESSFUL | `160718...` (missing) | `eed11f33-313c-4fbd-b95b-d78e950f96c9` | Successfully Treated |
| NOT_SUCCESSFUL | `160720...` (missing) | `dcda6cd2-30ab-102d-86b0-7a5022ba4115` | CLINICAL TREATMENT FAILURE |
| PARTIALLY_SUCCESSFUL | `160717...` (missing) | `160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Treatment complete |

### TypeScript Constants

```typescript
export const PROCEDURE_OUTCOME_CONCEPTS = {
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9',
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115',
  PARTIALLY_SUCCESSFUL: '160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;
```

---

## 3. Imaging Observation Concepts ✅ All Valid

All 10 imaging concepts exist - no changes needed.

| Concept | UUID | Name | Data Type |
|---------|------|------|-----------|
| Imaging Modality | `bbb8c439-712b-4fb2-9b09-6d56aa8dd25c` | Imaging Modality | Coded |
| Contrast Agent | `0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e` | Contrast Agent | Coded |
| Body Site | `17fdb716-2c3a-4883-95a5-a4e39d104ca6` | Body Site | Coded |
| Accession Number | `0e163f39-bebd-455d-a9c2-5cec790461b8` | Accession Number | Text |
| DICOM Study UID | `d55e0ae3-abad-4dee-a5de-6fd1db010453` | DICOM Study UID | Text |
| Radiation Dose | `458bd4f7-9292-40db-8a9e-334faff7827c` | Radiation Dose | Numeric |
| Clinical Indication | `f36f1463-90cc-4aa3-bffa-91ef24b31f21` | Clinical Indication | Text |
| Imaging Findings | `7f39af1b-8d9d-43c1-ad2e-8fd848a0093a` | Imaging Findings | Text |
| Clinical Impression | `159395AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Clinical impression comment | Text |
| Image Attachment | `7cac8397-53cd-4f00-a6fe-028e8d743f8e` | Image attachment | Complex |

---

## 4. Concept Sets ⚠️ SUBSTITUTED

**⚠️ WARNING: Several configured concept set UUIDs don't exist in the database.**
**Use ONLY the UUIDs in the "USE THIS UUID" column below.**

| Config Field | ❌ DO NOT USE | ✅ USE THIS UUID | Set Name | Member Count |
|--------------|--------------|------------------|----------|--------------|
| `statusConceptUuid` | `163021...` (missing) | ⚠️ **No alternative** - See note below | Status Set | N/A |
| Radiology Concept Set | `164068...` (missing) | `4557f916-4f42-410a-96ad-39c59ad82553` | Imaging modalities | 62 |
| Procedure Concept Set | `165418...` (missing) | `83bdfa6a-0c51-428a-a08d-3922db216858` | Procedure sequence construct | 58 |
| Medical Supplies | (already correct) | `2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8` | Medical Supplies | 70 |
| Duration Unit | (already correct) | `162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Dosing unit | 92 |

### ⚠️ SPECIAL NOTE: statusConceptUuid

**The configured `statusConceptUuid` (`163021...`) doesn't exist in the database.**

**Options:**
1. **Remove the configuration** - The individual status concepts are all valid and can be used directly without a concept set
2. **Create a concept set** - Create a new concept set in the database containing the status concepts
3. **Hardcode the statuses** - Use the individual status UUIDs directly in code (all are valid - see Section 1)

**Valid individual status concepts (use these directly):**
- PREPARATION: `167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`
- IN_PROGRESS: `163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`
- COMPLETED: `dca06bae-30ab-102d-86b0-7a5022ba4115`
- STOPPED: `dca26b47-30ab-102d-86b0-7a5022ba4115`
- NOT_DONE: `dc9825cf-30ab-102d-86b0-7a5022ba4115`
- ON_HOLD: `167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`
- ENTERED_IN_ERROR: `162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`

### TypeScript Constants (excluding statusConceptUuid)

```typescript
export const CONCEPT_SETS = {
  RADIOLOGY_CONCEPT_SET: '4557f916-4f42-410a-96ad-39c59ad82553',  // Imaging modalities
  BODY_SITE_CONCEPT_SET: 'dc9fab29-30ab-102d-86b0-7a5022ba4115',   // ANATOMIC LOCATIONS
  PROCEDURE_CONCEPT_SET: '83bdfa6a-0c51-428a-a08d-3922db216858',   // Procedure sequence construct
  MEDICAL_SUPPLIES_CONCEPT_SET: '2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8',
  DURATION_UNIT_CONCEPT_SET: '162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;
```

---

## 5. Procedure Complication Concepts ⚠️ SUBSTITUTED

**⚠️ WARNING: Configured complication concept UUIDs don't exist in the database.**
**Use ONLY the UUIDs in the "USE THIS UUID" column below.**

| Purpose | ❌ DO NOT USE | ✅ USE THIS UUID | Concept Name |
|---------|--------------|------------------|--------------|
| Procedure Complication | `120198...` (missing) | `c2ff3c0b-1d02-4f45-96a4-8b5087f232fc` | Complications |
| Complication Grouping | `120202...` (missing) | `c2ff3c0b-1d02-4f45-96a4-8b5087f232fc` | Complications |

### TypeScript Constants

```typescript
export const COMPLICATION_CONCEPTS = {
  COMPLICATION: 'c2ff3c0b-1d02-4f45-96a4-8b5087f232fc',
  COMPLICATION_GROUPING: 'c2ff3c0b-1d02-4f45-96a4-8b5087f232fc',  // Same as above
} as const;
```

---

## 6. Encounter Configuration ✅ All Valid

| Configuration | UUID | Name | Status |
|---------------|------|------|--------|
| Encounter Type | `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` | Procedure Result Encounter Type | ✅ Valid |
| Encounter Role | `a0b03050-c99b-11e0-9572-0800200c9a66` | Unknown | ✅ Valid |

---

## 7. Concept Classes ✅ All Valid

| Purpose | UUID | Name | Status |
|---------|------|------|--------|
| Diagnosis | `8d4918b0-c2cc-11de-8d13-0010c6dffd0f` | Diagnosis | ✅ Valid |
| Radiology/Imaging Procedure | `8caa332c-efe4-4025-8b18-3398328e1323` | Radiology/Imaging Procedure | ✅ Valid |

---

## 8. Complete Configuration File

### imaging-orders-app/config-schema.ts

```typescript
import { z } from 'zod';

export const imagingOrdersConfigSchema = z.object({
  // Order Type UUID
  radiologyOrderTypeUuid: z.string().default('b4a7c280-369e-4d12-9ce8-18e36783fed6'),
  
  // Procedure Status Concepts (all valid, no changes)
  procedureStatusConcepts: z.object({
    PREPARATION: z.string().default('167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    IN_PROGRESS: z.string().default('163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    NOT_DONE: z.string().default('dc9825cf-30ab-102d-86b0-7a5022ba4115'),
    ON_HOLD: z.string().default('167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    STOPPED: z.string().default('dca26b47-30ab-102d-86b0-7a5022ba4115'),
    COMPLETED: z.string().default('dca06bae-30ab-102d-86b0-7a5022ba4115'),
    ENTERED_IN_ERROR: z.string().default('162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
  }),
  
  // Procedure Outcome Concepts (SUBSTITUTED - use these values)
  procedureOutcomeConcepts: z.object({
    SUCCESSFUL: z.string().default('eed11f33-313c-4fbd-b95b-d78e950f96c9'),      // Successfully Treated
    NOT_SUCCESSFUL: z.string().default('dcda6cd2-30ab-102d-86b0-7a5022ba4115'),  // CLINICAL TREATMENT FAILURE
    PARTIALLY_SUCCESSFUL: z.string().default('160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'), // Treatment complete
  }),
  
  // Imaging Observation Concepts (all valid, no changes)
  imagingModalityConceptUuid: z.string().default('bbb8c439-712b-4fb2-9b09-6d56aa8dd25c'),
  imagingFindingsConceptUuid: z.string().default('7f39af1b-8d9d-43c1-ad2e-8fd848a0093a'),
  imagingImpressionConceptUuid: z.string().default('159395AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
  accessionNumberConceptUuid: z.string().default('0e163f39-bebd-455d-a9c2-5cec790461b8'),
  contrastAgentConceptUuid: z.string().default('0028c9c3-2bc2-4d75-9cbc-9d06f6951c2e'),
  radiationDoseConceptUuid: z.string().default('458bd4f7-9292-40db-8a9e-334faff7827c'),
  clinicalIndicationConceptUuid: z.string().default('f36f1463-90cc-4aa3-bffa-91ef24b31f21'),
  imageAttachmentConceptUuid: z.string().default('7cac8397-53cd-4f00-a6fe-028e8d743f8e'),
  
  // Concept Sets (SUBSTITUTED - use these values)
  radiologyConceptSetUuid: z.string().default('4557f916-4f42-410a-96ad-39c59ad82553'),      // Imaging modalities
  bodySiteConceptSetUuid: z.string().default('dc9fab29-30ab-102d-86b0-7a5022ba4115'),       // ANATOMIC LOCATIONS
  
  // Encounter Configuration (all valid, no changes)
  procedureResultEncounterTypeUuid: z.string().default('a4870f6d-ea06-4bbe-b775-bcbfb0816dbf'),
  encounterRoleUuid: z.string().default('a0b03050-c99b-11e0-9572-0800200c9a66'),
});
```

### procedure-orders-app/config-schema.ts

```typescript
import { z } from 'zod';

export const procedureOrdersConfigSchema = z.object({
  // Order Type UUIDs
  procedureOrderTypeUuid: z.string().default('b4a7c280-369e-4d12-9ce8-18e36783fed6'),
  testOrderTypeUuid: z.string().default('52a447d3-a64a-11e3-9aeb-50e549534c5e'),
  
  // Procedure Status Concepts (all valid, no changes)
  procedureStatusConcepts: z.object({
    PREPARATION: z.string().default('167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    IN_PROGRESS: z.string().default('163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    NOT_DONE: z.string().default('dc9825cf-30ab-102d-86b0-7a5022ba4115'),
    ON_HOLD: z.string().default('167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    STOPPED: z.string().default('dca26b47-30ab-102d-86b0-7a5022ba4115'),
    COMPLETED: z.string().default('dca06bae-30ab-102d-86b0-7a5022ba4115'),
    ENTERED_IN_ERROR: z.string().default('162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
  }),
  
  // Procedure Outcome Concepts (SUBSTITUTED - use these values)
  procedureOutcomeConcepts: z.object({
    SUCCESSFUL: z.string().default('eed11f33-313c-4fbd-b95b-d78e950f96c9'),
    NOT_SUCCESSFUL: z.string().default('dcda6cd2-30ab-102d-86b0-7a5022ba4115'),
    PARTIALLY_SUCCESSFUL: z.string().default('160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
  }),
  
  // Concept Sets (SUBSTITUTED - use these values)
  procedureConceptSetUuid: z.string().default('83bdfa6a-0c51-428a-a08d-3922db216858'),  // Procedure sequence construct
  bodySiteConceptSetUuid: z.string().default('dc9fab29-30ab-102d-86b0-7a5022ba4115'),     // ANATOMIC LOCATIONS
  labTestsWithOrderReasons: z.array(z.object({
    labTestUuid: z.string(),
    required: z.boolean(),
    orderReasons: z.array(z.string()),
  })),
  
  // Complication Concepts (SUBSTITUTED - use these values)
  complicationConceptUuid: z.string().default('c2ff3c0b-1d02-4f45-96a4-8b5087f232fc'),
  
  // Encounter Configuration
  procedureResultEncounterTypeUuid: z.string().default('a4870f6d-ea06-4bbe-b775-bcbfb0816dbf'),
});
```

### medical-supply-order-app/config-schema.ts

```typescript
import { z } from 'zod';

export const medicalSupplyOrderConfigSchema = z.object({
  // Order Type UUID (updated based on database)
  medicalSupplyOrderTypeUuid: z.string().default('4237a01f-29c5-4167-9d8e-96d6e590aa33'),
  
  // Concept Sets (all valid or substituted)
  medicalSupplyConceptSetUuid: z.string().default('2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8'),
  medicalSupplyQuantityUnitsConceptSetUuid: z.string().default('162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
});
```

---

## 9. Migration Steps

### Step 1: Backup Current Configuration

Before making changes, document current values:

```bash
# Backup current config files
cp packages/esm-imaging-orders-app/src/config-schema.ts packages/esm-imaging-orders-app/src/config-schema.ts.backup
cp packages/esm-procedure-orders-app/src/config-schema.ts packages/esm-procedure-orders-app/src/config-schema.ts.backup
```

### Step 2: Update Configuration Files

Update each `config-schema.ts` file with the resolved UUIDs shown above.

### Step 3: Update Code References

Search for and update any hardcoded UUID references in components:

```bash
# Search for old missing UUIDs
grep -r "160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" packages/
grep -r "164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" packages/
grep -r "165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" packages/

# Replace with new UUIDs from this document
```

### Step 4: Test Configuration

Verify schemas load correctly:

```typescript
import { imagingOrdersConfigSchema } from './config-schema';

const testConfig = {
  radiologyOrderTypeUuid: 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
  procedureOutcomeConcepts: {
    SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9',
    // ...
  },
};

const result = imagingOrdersConfigSchema.parse(testConfig);
console.log('Config validation passed:', result);
```

---

## 10. Validation Checklist

After implementing these changes:

- [ ] All config schemas updated with substituted UUIDs
- [ ] No hardcoded references to old missing UUIDs remain
- [ ] Config schemas validate successfully
- [ ] Forms load without errors
- [ ] Concept lookups return valid results
- [ ] Procedure results submit with correct outcome UUIDs
- [ ] Imaging orders use correct modality concept set
- [ ] Body site lookups return valid concepts

---

## 11. Rollback Procedure

If issues occur after substituting UUIDs:

### Option 1: Revert to Original

```bash
# Restore from backup
cp packages/esm-imaging-orders-app/src/config-schema.ts.backup packages/esm-imaging-orders-app/src/config-schema.ts
```

### Option 2: Configuration Override

Override via OpenMRS admin configuration without code changes.

### Option 3: Create Missing Concepts

If preferred over using alternatives, create the missing concepts in the database:
- Outcome concepts (SUCCESSFUL, NOT_SUCCESSFUL, PARTIALLY_SUCCESSFUL)
- Missing concept sets
- Complication concepts

---

**Document Version:** 1.0  
**Based on Investigation:** concept-database-investigation-report.md (2026-07-03)  
**Resolved:** 2026-07-04
