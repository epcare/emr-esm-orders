di# Encounter Configuration Summary

**Project:** emr-esm-orders  
**Document Version:** 1.0  
**Last Updated:** 2026-07-03

---

## Overview

This document summarizes the encounter-related configuration across the order management packages, including default UUIDs for encounter types and roles used in procedure and imaging orders.

---

## Encounter-Related Concept UUIDs

### Imaging Report & Post Procedure Report Encounter UUIDs

Both imaging results and procedure results share the **same encounter type** for consistency across the application.

| Report Type | Encounter Type UUID | Encounter Role UUID |
|-------------|---------------------|---------------------|
| **Imaging Report** | `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` | `a0b03050-c99b-11e0-9572-0800200c9a66` |
| **Post Procedure Report** | `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` | `a0b03050-c99b-11e0-9572-0800200c9a66` |

> **Note:** Both report types use the same encounter type UUID. This ensures that all procedure-related results (whether imaging or other procedures) are captured within the same encounter context.

---

### Shared Configuration

Both `esm-procedure-orders-app` and `esm-imaging-orders-app` use the same encounter configuration for consistency.

| Config Property | Description | Default UUID |
|-----------------|-------------|---------------|
| `procedureResultEncounterType` | Procedure results encounter type UUID | `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf` |
| `procedureResultEncounterRole` | Encounter provider role UUID | `a0b03050-c99b-11e0-9572-0800200c9a66` |
| `useOrderEncounter` | Use order encounter or create new one | `true` (boolean) |

---

## Configuration Details

### procedureResultEncounterType (Imaging & Post Procedure Reports)

**UUID:** `a4870f6d-ea06-4bbe-b775-bcbfb0816dbf`

- **Description:** The encounter type used when creating imaging report and post procedure report encounters
- **Used By:** Both `esm-imaging-orders-app` and `esm-procedure-orders-app`
- **Usage:** When saving imaging or procedure results, a new encounter may be created of this type
- **Typical Name:** "Procedure" or "Diagnostic" encounter type in OpenMRS

### procedureResultEncounterRole

**UUID:** `a0b03050-c99b-11e0-9572-0800200c9a66`

- **Description:** The provider role within the encounter
- **Typical Name:** "Provider" or "Clinician" role
- **Usage:** Used to associate the provider with the encounter when recording procedure or imaging results

### useOrderEncounter

**Default:** `true`

- **When `true`:** The system uses the encounter from the original order
- **When `false`:** A new encounter is created for the procedure result using the configured encounter type and role

---

## Package-Specific Configurations

### esm-procedure-orders-app

**File:** `packages/esm-procedure-orders-app/src/config-schema.ts`

```typescript
procedureResultEncounterType: {
  _type: Type.String,
  _description: 'The procedure results encounter type UUID',
  _default: 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf',
},
procedureResultEncounterRole: {
  _type: Type.String,
  _description: 'The encounter provider role UUID',
  _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
},
useOrderEncounter: {
  _type: Type.Boolean,
  _description: 'Use the order encounter for procedure results, or create a new one',
  _default: true,
},
```

### esm-imaging-orders-app

**File:** `packages/esm-imaging-orders-app/src/config-schema.ts`

```typescript
procedureResultEncounterType: {
  _type: Type.String,
  _description: 'The procedure results encounter type UUID',
  _default: 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf',
},
procedureResultEncounterRole: {
  _type: Type.String,
  _description: 'The encounter provider role UUID',
  _default: 'a0b03050-c99b-11e0-9572-0800200c9a66',
},
useOrderEncounter: {
  _type: Type.Boolean,
  _description: 'Use the order encounter for procedure results, or create a new one',
  _default: true,
},
```

---

## Verification SQL Queries

To verify if these encounter types and roles exist in your OpenMRS system, run the following queries:

### Check Imaging Report Encounter Type

```sql
SELECT uuid, name, description, retired
FROM encounter_type
WHERE uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf';
```

### Check Post Procedure Report Encounter Type

```sql
SELECT uuid, name, description, retired
FROM encounter_type
WHERE uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf';
```

> **Note:** Both imaging and post procedure reports use the same encounter type UUID (`a4870f6d-ea06-4bbe-b775-bcbfb0816dbf`).

### Check Encounter Provider Role

```sql
SELECT uuid, name, description, retired
FROM provider_role
WHERE uuid = 'a0b03050-c99b-11e0-9572-0800200c9a66';
```

### Verify Both Encounter Type and Role in One Query

```sql
SELECT
    'Encounter Type' as entity_type,
    uuid,
    name,
    description,
    retired
FROM encounter_type
WHERE uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf'

UNION ALL

SELECT
    'Provider Role' as entity_type,
    uuid,
    name,
    description,
    retired
FROM provider_role
WHERE uuid = 'a0b03050-c99b-11e0-9572-0800200c9a66';
```

### List All Encounter Types

```sql
SELECT uuid, name, description, retired
FROM encounter_type
WHERE retired = 0
ORDER BY name;
```

### List All Provider Roles

```sql
SELECT uuid, name, description, retired
FROM provider_role
WHERE retired = 0
ORDER BY name;
```

### Check for Encounters Created with This Type

```sql
SELECT
    e.uuid,
    e.encounter_datetime,
    e.voided,
    et.name as encounter_type_name,
    p.uuid as patient_uuid,
    p.given_name,
    p.family_name
FROM encounter e
JOIN encounter_type et ON e.encounter_type = et.uuid
JOIN person_name pn ON e.patient_id = pn.person_id AND pn.voided = 0
JOIN person p ON pn.person_id = p.person_id
WHERE et.uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf'
ORDER BY e.encounter_datetime DESC
LIMIT 20;
```

### Create Missing Encounter Type (if not exists)

If the encounter type does not exist in your system, you can create it:

```sql
INSERT INTO encounter_type (uuid, name, description, creator, date_created, retired)
VALUES (
    'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf',
    'Procedure Result',
    'Encounter type for imaging and procedure results',
    1,
    NOW(),
    0
);
```

### Create Missing Provider Role (if not exists)

If the provider role does not exist in your system, you can create it:

```sql
INSERT INTO provider_role (uuid, name, description, creator, date_created, retired)
VALUES (
    'a0b03050-c99b-11e0-9572-0800200c9a66',
    'Provider',
    'Default provider role for encounters',
    1,
    NOW(),
    0
);
```
```

---

## Complete Validation Queries

### Comprehensive Existence Check

Run this query to verify all required encounter types and roles exist:

```sql
-- Check both encounter type and provider role
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

### Check by Name (Alternative)

If UUIDs don't match, search by name:

```sql
-- Find encounter type by name
SELECT uuid, name, description, retired
FROM encounter_type
WHERE name IN ('Procedure Result', 'Procedure', 'Diagnostic', 'Imaging Result')
  AND retired = 0;

-- Find provider role by name
SELECT uuid, name, description, retired
FROM provider_role
WHERE name IN ('Provider', 'Clinician', 'Doctor', 'Nurse')
  AND retired = 0;
```

### Validate Configuration Package

Check if the configured encounter type is valid in your system:

```sql
-- Validate procedure result encounter type
SELECT 
    'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf' as configured_uuid,
    et.uuid as actual_uuid,
    et.name as actual_name,
    CASE 
        WHEN et.uuid IS NOT NULL THEN 'VALID'
        ELSE 'INVALID - UUID NOT FOUND'
    END as validation_status
FROM encounter_type et
WHERE et.uuid = 'a4870f6d-ea06-4bbe-b775-bcbfb0816dbf';
```

### List All Provider Roles

```sql
SELECT uuid, name, description 
FROM provider_role 
WHERE retired = 0
ORDER BY name;
```

---

## Implementation Notes

1. **Consistency:** Both procedure and imaging orders use identical encounter configurations to ensure consistent behavior across the application.

2. **Configuration Override:** These UUIDs can be overridden via OpenMRS configuration management if different encounter types or roles are needed for specific deployments.

3. **Creation Logic:** When `useOrderEncounter` is `false`, the application will create a new encounter using the configured encounter type and provider role for saving procedure results.

4. **Retirement Status:** Always verify that encounter types and roles are not retired before using them in production configurations.

---

## Related Configuration Files

| Package | Config File |
|---------|--------------|
| esm-procedure-orders-app | `packages/esm-procedure-orders-app/src/config-schema.ts` |
| esm-imaging-orders-app | `packages/esm-imaging-orders-app/src/config-schema.ts` |

---

## Frontend Implementation Summary

This project recently completed a comprehensive frontend implementation to fix critical and high-priority issues across order forms. The following phases were completed:

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Critical UUID fix (medical supply orders) | ✅ Complete |
| Phase 2 | Field naming standardization (commentToFulfiller) | ✅ Complete |
| Phase 3 | Procedure result enum → Concept mapping | ✅ Complete |
| Phase 4 | Type conversion fixes (numberOfRepeats) | ✅ Complete |
| Phase 5 | Add missing form fields | ✅ Complete |

### Files Modified

**esm-medical-supply-order-app:**
- `config-schema.ts` - UUID fix

**esm-procedure-orders-app:**
- `concept-mappings.ts` - NEW FILE
- `config-schema.ts` - Already had concept mappings
- `types/index.ts` - Added clinicalHistory, fixed field names
- `api.ts` - Fixed field names, added type conversions, added new fields
- `procedures-order-form.component.tsx` - Form schema, validation, UI
- `procedure-result-form.workspace.tsx` - Field name fix
- `procedure-result-form.component.tsx` - Status enum mapping

**esm-imaging-orders-app:**
- `types/index.ts` - Fixed field name
- `api.ts` - Fixed field names
- `imaging-order-form.component.tsx` - Form schema and UI
- `imaging-result-form.workspace.tsx` - Field name fix

---

## References

- [Frontend Implementation Guide](./frontend-implementation-guide.md)
- OpenMRS Encounter Type Documentation
- OpenMRS Provider Role Documentation
