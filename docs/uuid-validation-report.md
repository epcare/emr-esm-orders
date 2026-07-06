# UUID Validation Report for emr-esm-orders

**Database:** epcare  
**Date:** 2026-07-03  
**Purpose:** Validate all UUIDs referenced in form-fields-coverage-summary.md

---

## Executive Summary

| Category | Total | Exists | Missing | Status |
|----------|-------|--------|---------|--------|
| Procedure Status Concepts | 7 | 7 | 0 | ✅ All Valid |
| Procedure Outcome Concepts | 3 | 0 | 3 | ⚠️ All Missing |
| Order Types | 3 | 3 | 0 | ✅ All Valid |
| Encounter Config | 2 | 1 | 1 | ⚠️ Partial |
| Concept Sets | 2 | 0 | 2 | ⚠️ All Missing |

---

## Procedure Status Concepts ✅

All procedure status concept UUIDs exist in the database.

| Status Key | UUID | Concept Name | Status |
|------------|------|--------------|--------|
| PREPARATION | `167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Preparation | ✅ EXISTS |
| IN_PROGRESS | `163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | In progress | ✅ EXISTS |
| COMPLETED | `dca06bae-30ab-102d-86b0-7a5022ba4115` | COMPLETED | ✅ EXISTS |
| STOPPED | `dca26b47-30ab-102d-86b0-7a5022ba4115` | STOPPED | ✅ EXISTS |
| NOT_DONE | `dc9825cf-30ab-102d-86b0-7a5022ba4115` | NOT DONE | ✅ EXISTS |
| ON_HOLD | `167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | On hold | ✅ EXISTS |
| ENTERED_IN_ERROR | `162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Entered in error report status | ✅ EXISTS |

**Verdict:** All status concepts are valid and ready to use.

---

## Procedure Outcome Concepts ⚠️

**ALL MISSING** - The procedure outcome concepts do not exist in the database.

| Outcome Key | UUID | Status |
|-------------|------|--------|
| SUCCESSFUL | `160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |
| PARTIALLY_SUCCESSFUL | `160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |
| NOT_SUCCESSFUL | `160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |

**Impact:** 
- The procedure outcome field in the Procedure Result Form may not work correctly
- The enum → UUID mapping in the code references these UUIDs but they don't exist in the database

**Recommendation:** 
1. Create these concepts in the database, OR
2. Find alternative outcome concepts that already exist, OR
3. Update the code to use existing outcome-related concepts

**Alternative Outcome Concepts Found:**
- `eed11f33-313c-4fbd-b95b-d78e950f96c9` - Successfully Treated (State)
- `160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - Treatment complete (State)
- `47233296-9bb2-48bf-b6eb-e666b01731b5` - All attempts to locate partner have been unsuccessful (Finding)

---

## Order Types ✅

All order type UUIDs exist in the database.

| Order Type | UUID | Name | Status |
|------------|------|------|--------|
| Procedure | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | Procedure Order | ✅ EXISTS |
| Test | `52a447d3-a64a-11e3-9aeb-50e549534c5e` | Test Order | ✅ EXISTS |
| Medical Supply | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | Medical Supply Order | ✅ EXISTS |

**Verdict:** All order types are valid and ready to use.

---

## Encounter Configuration ✅

| Entity | UUID | Name | Status |
|--------|------|------|--------|
| Procedure Results Encounter Type | `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` | Procedure Results | ✅ EXISTS |
| Encounter Role | `a0b03050-c99b-11e0-9572-0800200c9a66` | Unknown (legacy default) | ✅ EXISTS |

**Note:** Previous documentation incorrectly checked `provider_role` table. The correct table is `encounter_role`, which contains 20 valid roles. The configured UUID exists and is valid.

---

## Concept Sets ⚠️

**ALL MISSING** - The concept set UUIDs do not exist in the database.

| Concept Set | UUID | Status |
|-------------|------|--------|
| Procedure Concept Set | `165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | ❌ MISSING |
| Medical Supply Concept Set | `2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8` | ❌ MISSING |

**Impact:**
- These concept sets may not be actively used in the current implementation
- They may be references to concept dictionaries that haven't been imported

**Existing Concept Sets Found:**
- `229EA71E-D440-9F47-BA48-94B9E9136FA6` - MENTAL DISORDERS (5 members)
- `F601143B-A5FC-BB44-91FF-F52362B281C6` - SKIN DISORDERS (8 members)
- `d97aaac8-b711-405e-b511-6801dd8f50d7` - Status (3 members)
- `167157AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` - Medication dispense status (9 members)
- `9deeba77-cc1b-47ef-b4ab-84b22fb527f3` - LAB RESULT SET (5 members)
- `4557f916-4f42-410a-96ad-39c59ad82553` - Imaging modalities (62 members)
- `83bdfa6a-0c51-428a-a08d-3922db216858` - Procedure sequence construct (58 members)

---

## Encounter Types Found in Database

The following encounter types exist (partial list):

| UUID | Name | Description |
|------|------|-------------|
| `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` | **Procedure Results** | Encounter type for processing procedure results |
| `ee4780f5-b5eb-423b-932f-00b5879df5ab` | OPD Encounter | Outpatient Clinical Encounter |
| `214e27a1-606a-4b1e-a96e-d736c87069d5` | LAB Encounter | Lab Encounter |
| `22902411-19c1-4a02-b19a-bf1a9c24fd51` | Medication Dispense | This encounter type is for dispensing of medication at facility |
| `dbe038cd-cad5-439d-a761-a6d6d680219c` | Medication Order | The encounter for ordering drugs for patient |
| `67a71486-1a54-468f-ac3e-7091a9a79584` | Vitals | For capturing vital signs |
| `0f1ec66d-61db-4575-8248-94e10a88178f` | Triage | This is a form to capture information on triage |

---

## Recommendations Summary

### High Priority 🔴

1. **Create Procedure Outcome Concepts** - The outcome concepts (SUCCESSFUL, PARTIALLY_SUCCESSFUL, NOT_SUCCESSFUL) are completely missing and need to be created or alternative concepts identified.

### Medium Priority 🟡

3. **Concept Set References** - The procedure and medical supply concept set UUIDs don't exist. Verify if these are actively used or need to be created.

### Low Priority 🟢

4. **Imaging Result Form Status** - Consider adding enum → UUID mapping to the Imaging Result Form status field for consistency with the Procedure Result Form.

---

## SQL Queries for Validation

### Check All Status Concepts
```sql
SELECT 
    'PREPARATION' as status_key,
    '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    c.uuid as actual_uuid,
    cn.name as concept_name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0
WHERE c.uuid = '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

-- Repeat for other status concepts...
```

### Check All Critical UUIDs
```sql
SELECT 
    'Encounter Type' as type, 
    'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf' as uuid,
    (SELECT uuid FROM encounter_type WHERE uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf') as is_valid
UNION ALL
SELECT 'Provider Role', 'a0b03050-c99b-11e0-9572-0800200c9a66', 
    (SELECT uuid FROM provider_role WHERE uuid = 'a0b03050-c99b-11e0-9572-0800200c9a66')
UNION ALL
SELECT 'Procedure Order Type', 'b4a7c280-369e-4d12-9ce8-18e36783fed6',
    (SELECT uuid FROM order_type WHERE uuid = 'b4a7c280-369e-4d12-9ce8-18e36783fed6')
UNION ALL
SELECT 'Medical Supply Order Type', '4237a01f-29c5-4167-9d8e-96d6e590aa33',
    (SELECT uuid FROM order_type WHERE uuid = '4237a01f-29c5-4167-9d8e-96d6e590aa33')
UNION ALL
SELECT 'Status: COMPLETED', 'dca06bae-30ab-102d-86b0-7a5022ba4115',
    (SELECT uuid FROM concept WHERE uuid = 'dca06bae-30ab-102d-86b0-7a5022ba4115');
```

---

## Next Steps

1. **Review Missing Concepts** - Decide whether to create the missing outcome concepts or use alternatives
2. **Resolve Provider Role** - Determine the best approach for handling provider roles
3. **Update Configuration** - If needed, update configuration files with valid UUIDs
4. **Test Forms** - After resolving issues, test the procedure and imaging result forms

---

**Report Generated:** 2026-07-03  
**Database:** epcare  
**Schema:** OpenMRS standard
