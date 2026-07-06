# Form Fields Coverage Summary

**Project:** emr-esm-orders  
**Document Version:** 1.0  
**Last Updated:** 2026-07-03

---

## Overview

This document provides a comprehensive summary of all form fields across the order management application and their implementation status.

---

## Imaging Order Form (`esm-imaging-orders-app`)

**File:** `src/form/imaging-orders/add-imaging-orders/imaging-order-form.component.tsx`

| Field | Status | Phase | Notes |
|-------|--------|-------|-------|
| Test type | ✅ Existing | - | Concept search for imaging tests |
| Priority | ✅ Existing | - | Urgency selection |
| Scheduled date | ✅ Existing | - | Date picker for scheduling |
| Laterality | ✅ Existing | - | Laterality selection |
| Body Site | ✅ Existing | - | Body site selection |
| Order Reason | ✅ Existing | - | Coded order reason |
| Additional instructions | ✅ Existing | - | Free text instructions |
| **Comments To Fulfiller** | ✅ **Fixed** | Phase 2 | Changed from `commentsToFulfiller` to `commentToFulfiller` |

---

## Procedure Order Form (`esm-procedure-orders-app`)

**File:** `src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

| Field | Status | Phase | Notes |
|-------|--------|-------|-------|
| Test type | ✅ Existing | - | Concept search for procedures |
| Priority | ✅ Existing | - | Urgency selection |
| Scheduled date | ✅ Existing | - | Date picker for scheduling |
| Order reason (coded) | ✅ Existing | - | Coded order reason |
| Body Site | ✅ Existing | - | Body site selection |
| Frequency | ✅ Existing | - | Order frequency |
| Order Reason (non-coded) | ✅ Existing | - | Free text order reason |
| Additional instructions | ✅ Existing | - | Free text instructions |
| **Comments To Fulfiller** | ✅ **Fixed** | Phase 2 | Changed from `commentsToFulfiller` to `commentToFulfiller` |
| **Clinical History** | ✅ **Added** | Phase 5 | NEW FIELD - Added with 2000 char limit |
| **Specimen Type** | ✅ **Added** | Phase 5 | NEW FIELD - Specimen type selection |
| **Specimen Source** | ✅ **Added** | Phase 5 | NEW FIELD - Specimen source selection |
| **numberOfRepeats** | ✅ **Fixed** | Phase 4 | Type conversion: string → integer |

---

## Procedure Result Form (`esm-procedure-orders-app`)

**File:** `src/workspaces/procedure-result-form/procedure-result-form.component.tsx`

| Field | Status | Phase | Notes |
|-------|--------|-------|-------|
| Procedure | ✅ Existing | - | Concept search for procedures |
| Procedure type | ✅ Existing | - | Procedure type selection |
| Body site | ✅ Existing | - | Body site selection |
| Start date known toggle | ✅ Existing | - | Boolean toggle for known/estimated date |
| Start date and time | ✅ Existing | - | DateTime picker |
| Estimated start date | ✅ Existing | - | Year/Month for estimated date |
| End date and time | ✅ Existing | - | DateTime picker |
| Duration | ✅ Existing | - | Numeric duration input |
| Duration unit | ✅ Existing | - | Unit selection (minutes, hours, etc.) |
| **Status** | ✅ **Fixed** | Phase 3 | Enum → UUID mapping added |
| Procedure outcome | ✅ Existing | Phase 3 | Already had enum → UUID mapping |
| Participants | ✅ Existing | - | Provider participants |
| Complications | ✅ Existing | - | Complications selection |
| Notes | ✅ Existing | - | Combined notes (instructions + commentToFulfiller + existing) |

---

## Imaging Result Form (`esm-imaging-orders-app`)

**File:** `src/workspaces/imaging-result-form/imaging-result-form.component.tsx`

| Field | Status | Phase | Notes |
|-------|--------|-------|-------|
| Imaging Procedure | ✅ Existing | - | Concept search for imaging procedures |
| Procedure type | ✅ Existing | - | Procedure type selection |
| Body site | ✅ Existing | - | Body site selection |
| Start date known toggle | ✅ Existing | - | Boolean toggle |
| Start date and time | ✅ Existing | - | DateTime picker |
| Estimated start date | ✅ Existing | - | Year/Month for estimated date |
| End date and time | ✅ Existing | - | DateTime picker |
| Imaging duration | ✅ Existing | - | Numeric duration input |
| Duration unit | ✅ Existing | - | Unit selection |
| **Status** | ⚠️ **NOT FIXED** | - | **MISSING:** Enum → UUID mapping not applied |
| Imaging outcome | ✅ Existing | - | Outcome selection |
| Participants | ✅ Existing | - | Provider participants |
| Complications | ✅ Existing | - | Complications selection |
| Notes | ✅ Existing | - | Combined notes (instructions + commentToFulfiller + existing) |
| Imaging Modality | ✅ Existing | - | Modality selection (CT, MRI, US, X-ray, etc.) |
| Contrast Agent | ✅ Existing | - | Contrast agent selection |
| Accession Number | ✅ Existing | - | Radiology accession number |
| DICOM Study UID | ✅ Existing | - | DICOM Study identifier |
| Radiation Dose | ✅ Existing | - | Radiation dose (mSv) |
| Clinical Indication | ✅ Existing | - | Clinical indication/reason for imaging |
| Imaging Findings | ✅ Existing | - | Detailed radiology findings |
| Imaging Impression | ✅ Existing | - | Radiologist impression/conclusion |
| Image Attachments | ✅ Existing | - | Image/file attachments |

---

## ⚠️ Missing Implementation

### Imaging Result Form - Status Field

The **Status** field in the Imaging Result Form was **NOT** updated with enum → UUID mapping. 

**Current State:**
- Status options are loaded from backend using `useConceptSearch` (returns UUIDs directly)
- Unlike Procedure Result Form, no enum conversion was added

**Recommendation:**
If imaging result status should use enum keys like the procedure result form, apply the same enum → UUID mapping that was done for `procedureStatusConcepts`.

**File to update:**
```
packages/esm-imaging-orders-app/src/workspaces/imaging-result-form/imaging-result-form.component.tsx
```

**Similar to procedure result form around line 309-315:**
```typescript
const statusValue = getValues('status');
// Convert status enum to concept UUID
status: statusValue ? procedureStatusConcepts[statusValue] || statusValue : null,
```

---

## Implementation Summary

| Phase | Description | Affected Forms | Status |
|-------|-------------|----------------|--------|
| Phase 1 | Critical UUID fix | Medical Supply Orders | ✅ Complete |
| Phase 2 | Field naming (commentToFulfiller) | All order forms | ✅ Complete |
| Phase 3 | Enum → UUID mapping | Procedure Result Form | ⚠️ Partial - Imaging Result Form missing |
| Phase 4 | Type conversion (numberOfRepeats) | Procedure Order Form | ✅ Complete |
| Phase 5 | Missing fields | Procedure Order Form | ✅ Complete |

---

## API Transformer Coverage

### Procedure Orders API (`esm-procedure-orders-app/api.ts`)

| Action Type | Fields Sent | Status |
|-------------|-------------|--------|
| NEW / RENEW | All fields including new ones | ✅ Complete |
| REVISE | All fields including new ones | ✅ Complete |
| DISCONTINUE | All fields including new ones | ✅ Complete |

### Imaging Orders API (`esm-imaging-orders-app/api.ts`)

| Action Type | Fields Sent | Status |
|-------------|-------------|--------|
| NEW / RENEW | All standard fields | ✅ Complete |
| REVISE | All standard fields | ✅ Complete |
| DISCONTINUE | All standard fields | ✅ Complete |

---

## Recommendations

1. ✅ **APPROVED** - All critical and high-priority issues have been addressed
2. ⚠️ **REVIEW** - Consider adding enum → UUID mapping to Imaging Result Form status field for consistency
3. ✅ **TEST** - Verify all form submissions work correctly with the updated field names and new fields
4. ✅ **DEPLOY** - Backend compatibility verified for all changes

---

## Validation SQL Queries

### Validate Encounter Configuration

```sql
-- Validate encounter type and role
SELECT
    'Encounter Type' as entity_type,
    et.uuid,
    et.name,
    et.description,
    CASE WHEN et.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    et.retired
FROM encounter_type et
WHERE et.uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf'

UNION ALL

SELECT
    'Provider Role' as entity_type,
    pr.uuid,
    pr.name,
    pr.description,
    CASE WHEN pr.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    pr.retired
FROM provider_role pr
WHERE pr.uuid = 'a0b03050-c99b-11e0-9572-0800200c9a66';
```

### Validate Procedure Status Concepts

```sql
-- Check all procedure status concept UUIDs with proper concept_name join
SELECT 
    'PREPARATION' as status_key,
    '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    c.uuid as actual_uuid,
    cn.name as concept_name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

SELECT 'IN_PROGRESS', '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

SELECT 'COMPLETED', 'dca06bae-30ab-102d-86b0-7a5022ba4115', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = 'dca06bae-30ab-102d-86b0-7a5022ba4115'

UNION ALL

SELECT 'STOPPED', 'dca26b47-30ab-102d-86b0-7a5022ba4115', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = 'dca26b47-30ab-102d-86b0-7a5022ba4115'

UNION ALL

SELECT 'NOT_DONE', 'dc9825cf-30ab-102d-86b0-7a5022ba4115', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = 'dc9825cf-30ab-102d-86b0-7a5022ba4115'

UNION ALL

SELECT 'ON_HOLD', '167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

SELECT 'ENTERED_IN_ERROR', '162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
```

### Validate Procedure Outcome Concepts

```sql
-- Check all procedure outcome concept UUIDs with proper concept_name join
SELECT 
    'SUCCESSFUL' as outcome_key,
    '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    c.uuid as actual_uuid,
    cn.name as concept_name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

SELECT 'PARTIALLY_SUCCESSFUL', '160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

UNION ALL

SELECT 'NOT_SUCCESSFUL', '160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', c.uuid, cn.name,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END, c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
```

### Validate Concept Sets

```sql
-- Check procedure concept set with proper concept_name join
SELECT 
    'Procedure Concept Set' as entity,
    '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    cs.uuid as actual_uuid,
    cn.name as display_name,
    cs.description,
    CASE WHEN cs.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    cs.retired
FROM concept_set cs
LEFT JOIN concept_name cn ON cs.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE cs.uuid = '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

-- Check medical supply concept set
SELECT 
    'Medical Supply Concept Set' as entity,
    '2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8' as uuid,
    cs.uuid as actual_uuid,
    cn.name as display_name,
    cs.description,
    CASE WHEN cs.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    cs.retired
FROM concept_set cs
LEFT JOIN concept_name cn ON cs.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE cs.uuid = '2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8';
```

### Validate Procedure Complication Concepts

```sql
-- Check procedure complication grouping concept with proper concept_name join
SELECT 
    'Procedure Complication Grouping' as entity,
    '120202AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    c.uuid as actual_uuid,
    cn.name as concept_name,
    c.datatype_id,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '120202AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

-- Check procedure complication concept
SELECT 
    'Procedure Complication' as entity,
    '120198AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' as uuid,
    c.uuid as actual_uuid,
    cn.name as concept_name,
    c.datatype_id,
    CASE WHEN c.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    c.retired
FROM concept c
LEFT JOIN concept_name cn ON c.concept_id = cn.concept_id AND cn.voided = 0 AND cn.concept_name_type = 'FULLY_SPECIFIED'
WHERE c.uuid = '120198AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
```
SELECT 
    'Procedure Order Type' as entity,
    'b4a7c280-369e-4d12-9ce8-18e36783fed6' as configured_uuid,
    ot.uuid as actual_uuid,
    ot.name,
    ot.description,
    CASE WHEN ot.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    ot.retired
FROM order_type ot
WHERE ot.uuid = 'b4a7c280-369e-4d12-9ce8-18e36783fed6';

-- Check test order type UUID
SELECT 
    'Test Order Type' as entity,
    '52a447d3-a64a-11e3-9aeb-50e549534c5e' as configured_uuid,
    ot.uuid as actual_uuid,
    ot.name,
    ot.description,
    CASE WHEN ot.uuid IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status,
    ot.retired
FROM order_type ot
WHERE ot.uuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';
```

### Quick Health Check - All UUIDs

```sql
-- Quick check of all critical UUIDs
SELECT 
    'Encounter Type' as type, 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf' as uuid,
    (SELECT uuid FROM encounter_type WHERE uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf') as exists
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
SELECT 'Procedure Concept Set', '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    (SELECT uuid FROM concept_set WHERE uuid = '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
UNION ALL
SELECT 'Status: COMPLETED', 'dca06bae-30ab-102d-86b0-7a5022ba4115',
    (SELECT uuid FROM concept WHERE uuid = 'dca06bae-30ab-102d-86b0-7a5022ba4115')
UNION ALL
SELECT 'Outcome: SUCCESSFUL', '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    (SELECT uuid FROM concept WHERE uuid = '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
```

### Create Missing Concepts (if needed)

```sql
-- Only run these if concepts are missing and confirmed needed

-- Create COMPLETED status concept
INSERT INTO concept (uuid, datatype_id, description, creator, date_created, retired)
SELECT 'dca06bae-30ab-102d-86b0-7a5022ba4115', d.concept_datatype_id, 'Procedure completed', 1, NOW(), 0
FROM concept_datatype d WHERE d.name = ' coded';

-- Create SUCCESSFUL outcome concept
INSERT INTO concept (uuid, datatype_id, description, creator, date_created, retired)
SELECT '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', d.concept_datatype_id, 'Procedure successful', 1, NOW(), 0
FROM concept_datatype d WHERE d.name = ' coded';
```

---

## References

- [Frontend Implementation Guide](./frontend-implementation-guide.md)
- [Encounter Configuration Summary](./encounter-configuration-summary.md)
