# Alternative Outcome Concepts for Procedure Results

**Database:** epcare  
**Date:** 2026-07-03  
**Purpose:** Identify existing concepts that can replace the missing procedure outcome concepts

---

## Problem Statement

The configured procedure outcome concepts do not exist in the database:

| Outcome Key | Configured UUID | Status |
|-------------|-----------------|--------|
| SUCCESSFUL | `160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |
| PARTIALLY_SUCCESSFUL | `160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |
| NOT_SUCCESSFUL | `160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |

---

## Recommended Alternatives

### Option 1: Use Generic Treatment/Outcome Concepts ✅

**Recommended for Procedure Results**

| Outcome Key | Alternative UUID | Concept Name | Concept Class | Notes |
|-------------|------------------|--------------|---------------|-------|
| SUCCESSFUL | `eed11f33-313c-4fbd-b95b-d78e950f96c9` | **Successfully Treated** | State | Generic treatment success |
| SUCCESSFUL | `160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Treatment complete** | State | Alternative success option |
| NOT_SUCCESSFUL | `dcda6cd2-30ab-102d-86b0-7a5022ba4115` | **CLINICAL TREATMENT FAILURE** | Finding | Generic treatment failure |
| NOT_SUCCESSFUL | `160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Died** | State | For fatal outcomes |
| NOT_SUCCESSFUL | `ef032260-4c35-4c28-82d6-5af55297562d` | **TB treatment not completed** | Finding | Alternative failure option |

**Advantages:**
- Generic enough to apply to various procedures
- Already exist in the database
- Clear semantic meaning

**Disadvantages:**
- May not perfectly align with "procedure outcome" terminology
- Some are TB-specific (though generic enough)

---

### Option 2: Use Existing Status Concepts ⚠️

**Alternative: Repurpose the existing status concepts**

The existing status concepts could potentially serve as outcomes:

| UUID | Concept Name | Current Use | Potential As |
|------|--------------|-------------|--------------|
| `dca06bae-30ab-102d-86b0-7a5022ba4115` | **COMPLETED** | Status | Could indicate successful completion |
| `dca26b47-30ab-102d-86b0-7a5022ba4115` | **STOPPED** | Status | Could indicate unsuccessful outcome |
| `dc9825cf-30ab-102d-86b0-7a5022ba4115` | **NOT DONE** | Status | Could indicate procedure not performed |

**Advantages:**
- Already in use and familiar
- Consistent with existing status workflow

**Disadvantages:**
- Semantically different from "outcome"
- May cause confusion between status and outcome

---

### Option 3: Create New Procedure Outcome Concepts 🔧

**Create dedicated procedure outcome concepts**

This would involve creating the missing concepts in the database:

```sql
-- Create SUCCESSFUL outcome
INSERT INTO concept (uuid, datatype_id, class_id, description, creator, date_created, retired)
SELECT 
    '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    d.concept_datatype_id,
    cc.concept_class_id,
    'Procedure was successful',
    1,
    NOW(),
    0
FROM concept_datatype d, concept_class cc
WHERE d.name = 'N/A' AND cc.name = 'Finding';

-- Create concept name
INSERT INTO concept_name (concept_id, name, locale, locale_preferred, creator, date_created, concept_name_type, voided)
VALUES
((SELECT concept_id FROM concept WHERE uuid = '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
 'SUCCESSFUL',
 'en',
 1,
 1,
 NOW(),
 'FULLY_SPECIFIED',
 0);
```

**Advantages:**
- Matches the configured UUIDs exactly
- No code changes needed

**Disadvantages:**
- Requires database write access
- Need to verify with implementation team

---

## Detailed Alternative Concepts

### SUCCESSFUL Outcome Alternatives

| UUID | Concept Name | Concept Class | Datatype | Best For |
|------|--------------|---------------|----------|----------|
| `eed11f33-313c-4fbd-b95b-d78e950f96c9` | **Successfully Treated** | State | N/A | General procedures |
| `160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Treatment complete** | State | N/A | Treatment-based procedures |
| `031d9b15-62d5-4f73-a374-5503f0421427` | **TB Treatment Completed** | Finding | Boolean | TB-specific procedures |
| `dca06bae-30ab-102d-86b0-7a5022ba4115` | **COMPLETED** | Finding | N/A | Generic completion |

### NOT_SUCCESSFUL Outcome Alternatives

| UUID | Concept Name | Concept Class | Datatype | Best For |
|------|--------------|---------------|----------|----------|
| `dcda6cd2-30ab-102d-86b0-7a5022ba4115` | **CLINICAL TREATMENT FAILURE** | Finding | N/A | Treatment failures |
| `160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Died** | State | N/A | Fatal outcomes |
| `ef032260-4c35-4c28-82d6-5af55297562d` | **TB treatment not completed** | Finding | Boolean | TB-specific |
| `843AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **REGIMEN FAILURE** | Finding | N/A | Medication-related |
| `20fae105-7ed4-4f91-a389-7e77dfe30f81` | **VIROLOGICAL FAILURE** | Finding | N/A | Lab-related failures |

### PARTIAL_SUCCESSFUL Outcome Alternatives

**No direct matches found.** The search for "partial", "incomplete", or "stalled" returned mostly unrelated diagnoses.

**Options:**
1. Use a combination of status and outcome
2. Create a new "PARTIALLY SUCCESSFUL" concept
3. Use "IN_PROGRESS" status as an indicator

---

## Additional Outcome-Related Concepts Found

| UUID | Concept Name | Concept Class | Potential Use |
|------|--------------|---------------|--------------|
| `159791AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Cure, outcome** | Finding | General outcome indicator |
| `e44c8c4c-db50-4d1e-9d6e-092d3b31cfd6` | **TB Treatment Outcome** | Finding | TB treatment outcomes |
| `d0a568f1-fd17-4327-aba2-24619aa24273` | **ADR Outcome** | Finding | Adverse drug reaction outcomes |
| `cf7544d3-d25c-4b63-8b19-a76017158a4b` | **Baby's outcome at delivery** | Misc | Obstetric outcomes |
| `161033AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | **Pregnancy outcome** | Finding | Pregnancy-related outcomes |

---

## Recommended Configuration Mapping

### Mapping File: `procedure-outcome-mapping.ts`

```typescript
// Alternative outcome concept mapping using existing concepts
export const procedureOutcomeConcepts = {
  // SUCCESSFUL alternatives
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9', // Successfully Treated
  TREATMENT_COMPLETE: '160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Treatment complete
  COMPLETED: 'dca06bae-30ab-102d-86b0-7a5022ba4115', // COMPLETED
  
  // NOT_SUCCESSFUL alternatives
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115', // CLINICAL TREATMENT FAILURE
  DIED: '160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // Died
  STOPPED: 'dca26b47-30ab-102d-86b0-7a5022ba4115', // STOPPED
  
  // PARTIAL_SUCCESSFUL - no direct alternative, use status
  PARTIAL_SUCCESSFUL: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // In progress (as proxy)
};
```

---

## Implementation Options

### Option A: Update Code to Use Alternative Concepts

**Files to modify:**
1. `packages/esm-procedure-orders-app/src/config-schema.ts`
2. `packages/esm-procedure-orders-app/src/workspaces/procedure-result-form/procedure-result-form.component.tsx`

**Steps:**
1. Update the `procedureOutcomeConcepts` configuration with alternative UUIDs
2. Update form labels if needed
3. Test the procedure result form

### Option B: Create Missing Concepts in Database

**Steps:**
1. Run SQL scripts to create the missing outcome concepts
2. Verify concepts are created correctly
3. Test the procedure result form

### Option C: Use Status Concepts as Outcomes

**Steps:**
1. Repurpose existing status concepts for outcome field
2. Update form to clarify the meaning
3. Test the procedure result form

---

## Validation Queries

### Verify Alternative Concepts Exist

```sql
-- Verify Successfully Treated exists
SELECT uuid, name FROM concept c
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id
WHERE c.uuid = 'eed11f33-313c-4fbd-b95b-d78e950f96c9';

-- Verify Clinical Treatment Failure exists
SELECT uuid, name FROM concept c
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id
WHERE c.uuid = 'dcda6cd2-30ab-102d-86b0-7a5022ba4115';

-- Verify Died exists
SELECT uuid, name FROM concept c
INNER JOIN concept_name cn ON c.concept_id = cn.concept_id
WHERE c.uuid = '160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
```

---

## Decision Matrix

| Option | Pros | Cons | Effort | Recommendation |
|--------|------|------|---------|----------------|
| Use Alternative Concepts | No DB changes needed, concepts already exist | May not perfectly match semantics | Low | ✅ **Recommended** |
| Create New Concepts | Matches config exactly, clear semantics | Requires DB write access | Medium | ⚠️ If DB access available |
| Repurpose Status | Already in use, familiar | May cause confusion | Low | ⚠️ Last resort |

---

## Next Steps

1. **Choose an approach** - Decide which option best fits your requirements
2. **Update configuration** - Modify config files with chosen UUIDs
3. **Test thoroughly** - Verify procedure result form works correctly
4. **Document changes** - Update documentation with new UUID mappings

---

**Report Generated:** 2026-07-03  
**Database:** epcare  
**Status:** Ready for implementation decision
