# Frontend Implementation Guide

**Project:** emr-esm-orders  
**Affected Packages:** esm-imaging-orders-app, esm-procedure-orders-app, esm-medical-supply-order-app, esm-medical-supply-dispensing-app  
**Complexity:** Medium  
**Estimated Time:** 3-4 days

---

## Overview

This guide provides step-by-step instructions to fix critical and high-priority issues in the frontend order forms.

### Issues to Fix

| Priority | Issue | Package | Impact |
|----------|-------|---------|--------|
| CRITICAL | Wrong UUID for medical supply orders | esm-medical-supply-order-app | Orders route to wrong backend class |
| HIGH | Field naming: commentsToFulfiller → commentToFulfiller | All order apps | Potential data loss |
| HIGH | Procedure result enum → Concept mapping | esm-procedure-orders-app | Results may not persist |
| MEDIUM | Type conversion: numberOfRepeats | esm-procedure-orders-app | Incorrect type sent to backend |
| MEDIUM | Missing form fields | Multiple | Incomplete data capture |

---

## Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- TypeScript 5+
- Access to frontend repository
- Running backend with fixes deployed

---

## Phase 1: Critical UUID Fix

### 1.1 Medical Supply Order UUID

**Package:** `esm-medical-supply-order-app`

**Current (WRONG):** `dab3ab30-2feb-48ec-b4af-8332a0831b49`  
**Should Be:** `4237a01f-29c5-4167-9d8e-96d6e590aa33`

### 1.2 Locate Files to Update

```
packages/esm-medical-supply-order-app/
├── src/
│   ├── config-schema.ts         ← UPDATE
│   └── config-types.ts         ← Check if exists, update
└── package.json
```

### 1.3 Update config-schema.ts

**Step 1:** Open `packages/esm-medical-supply-order-app/src/config-schema.ts`

**Step 2:** Find the UUID constant:

```typescript
// CURRENT (WRONG):
medicalSupplyOrderTypeUuid: z.string().default('dab3ab30-2feb-48ec-b4af-8332a0831b49'),
```

**Step 3:** Replace with correct UUID:

```typescript
// CORRECT (matches database order_type_id=5):
medicalSupplyOrderTypeUuid: z.string().default('4237a01f-29c5-4167-9d8e-96d6e590aa33'),
```

### 1.4 Search for Other References

Search the entire package for the old UUID:

```bash
cd packages/esm-medical-supply-order-app
grep -r "dab3ab30-2feb-48ec-b4af-8332a0831b49" src/
```

Replace any occurrences found with `4237a01f-29c5-4167-9d8e-96d6e590aa33`.

### 1.5 Verify No Other Packages Affected

```bash
cd packages
grep -r "dab3ab30-2feb-48ec-b4af-8332a0831b49" . --exclude-dir=node_modules
```

---

## Phase 2: Field Naming Standardization

### 2.1 Standardize to `commentToFulfiller`

The backend uses `commentToFulfiller` (single word). Update all frontend packages.

### 2.2 Imaging Orders Package

**File:** `packages/esm-imaging-orders-app/src/form/imaging-orders/add-imaging-orders/imaging-order-form.component.tsx`

**Update form schema:**

```typescript
// BEFORE:
commentsToFulfiller: z.string().optional(),

// AFTER:
commentToFulfiller: z.string().optional(),
```

**Update form state and handlers:**

```typescript
// Find and replace all occurrences
const [formData, setFormData] = useState({
  // ... other fields
  commentToFulfiller: '',  // Changed from commentsToFulfiller
});

// Update handleChange calls
<TextField
  label={t('commentsToFulfiller', 'Comments to Fulfiller')}
  value={formData.commentToFulfiller}
  onChange={(value) => handleChange('commentToFulfiller', value)}
/>
```

**Update API transformer:**

**File:** `packages/esm-imaging-orders-app/src/form/imaging-orders/api.ts`

```typescript
// BEFORE:
export function prepImagingOrderPostData(formData: ImagingOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... other fields
    commentsToFulfiller: formData.commentsToFulfiller,
  };
}

// AFTER:
export function prepImagingOrderPostData(formData: ImagingOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... other fields
    commentToFulfiller: formData.commentToFulfiller,
  };
}
```

### 2.3 Procedure Orders Package

Repeat the same changes for:

**Files:**
- `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`
- `packages/esm-procedure-orders-app/src/form/procedures-orders/api.ts`

### 2.4 Medical Supply Orders Package

Repeat the same changes for:

**Files:**
- `packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/medical-supply-order/medical-supply-form.component.tsx`
- `packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/api.ts`

---

## Phase 3: Procedure Result Enum Mapping

⚠️ **IMPORTANT:** Many configured concept UUIDs were found to be missing from the database. Use the resolved mappings from `resolved-concept-mappings.md` based on the `concept-database-investigation-report.md`.

### 3.1 Create Concept Mapping Configuration

**File:** `packages/esm-procedure-orders-app/src/concept-mappings.ts`

```typescript
/**
 * Concept UUID mappings for procedure status and outcome
 * 
 * SOURCE: resolved-concept-mappings.md (based on concept-database-investigation-report.md)
 * DATABASE: epcare
 * LAST UPDATED: 2026-07-04
 * 
 * STATUS CONCEPTS: All valid - no changes needed
 * OUTCOME CONCEPTS: Substituted with alternatives (originals were missing from database)
 */

// Status concepts - all exist in database ✅
export const PROCEDURE_STATUS_CONCEPTS = {
  PREPARATION: '167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  IN_PROGRESS: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  COMPLETED: 'dca06bae-30ab-102d-86b0-7a5022ba4115',
  STOPPED: 'dca26b47-30ab-102d-86b0-7a5022ba4115',
  NOT_DONE: 'dc9825cf-30ab-102d-86b0-7a5022ba4115',
  ON_HOLD: '167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  ENTERED_IN_ERROR: '162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

// Outcome concepts - SUBSTITUTED (originals missing from database) ⚠️
// Using alternatives from concept-database-investigation-report.md
export const PROCEDURE_OUTCOME_CONCEPTS = {
  // Original was 160718... (missing) → Using "Successfully Treated" concept
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9',
  
  // Original was 160720... (missing) → Using "CLINICAL TREATMENT FAILURE" concept  
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115',
  
  // Original was 160717... (missing) → Using "Treatment complete" concept
  PARTIALLY_SUCCESSFUL: '160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
} as const;

// Type guards for safe access
export function getStatusConceptUuid(status: string): string | undefined {
  return PROCEDURE_STATUS_CONCEPTS[status as keyof typeof PROCEDURE_STATUS_CONCEPTS];
}

export function getOutcomeConceptUuid(outcome: string): string | undefined {
  return PROCEDURE_OUTCOME_CONCEPTS[outcome as keyof typeof PROCEDURE_OUTCOME_CONCEPTS];
}
```

### 3.2 Add to Config Schema

**File:** `packages/esm-procedure-orders-app/src/config-schema.ts`

```typescript
import { z } from 'zod';

export const procedureOrdersConfigSchema = z.object({
  // ... existing config fields
  
  // Add procedure status concept mappings (all valid, no changes)
  procedureStatusConcepts: z.object({
    PREPARATION: z.string().default('167153AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    IN_PROGRESS: z.string().default('163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    COMPLETED: z.string().default('dca06bae-30ab-102d-86b0-7a5022ba4115'),
    STOPPED: z.string().default('dca26b47-30ab-102d-86b0-7a5022ba4115'),
    NOT_DONE: z.string().default('dc9825cf-30ab-102d-86b0-7a5022ba4115'),
    ON_HOLD: z.string().default('167154AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
    ENTERED_IN_ERROR: z.string().default('162983AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
  }),
  
  // Add procedure outcome concept mappings (SUBSTITUTED - use these values)
  procedureOutcomeConcepts: z.object({
    SUCCESSFUL: z.string().default('eed11f33-313c-4fbd-b95b-d78e950f96c9'),      // Successfully Treated
    NOT_SUCCESSFUL: z.string().default('dcda6cd2-30ab-102d-86b0-7a5022ba4115'),  // CLINICAL TREATMENT FAILURE
    PARTIALLY_SUCCESSFUL: z.string().default('160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'), // Treatment complete
  }),
    PREPARATION: z.string().optional(),
    IN_PROGRESS: z.string().optional(),
    COMPLETED: z.string().optional(),
    STOPPED: z.string().optional(),
    NOT_DONE: z.string().optional(),
    ON_HOLD: z.string().optional(),
    ENTERED_IN_ERROR: z.string().optional(),
  }).optional(),
  
  // Add procedure outcome concept mappings
  procedureOutcomeConcepts: z.object({
    SUCCESSFUL: z.string().optional(),
    PARTIALLY_SUCCESSFUL: z.string().optional(),
    NOT_SUCCESSFUL: z.string().optional(),
  }).optional(),
});
```

### 3.3 Update Procedure Result Transformer

**File:** `packages/esm-procedure-orders-app/src/workspaces/procedure-result-form/procedure-result-form.component.tsx`

```typescript
import { getStatusConceptUuid, getOutcomeConceptUuid } from '../../concept-mappings';

// In the submit handler
const handleSubmit = async () => {
  const payload = {
    // ... other fields
    
    // Convert enum status to Concept UUID
    status: getStatusConceptUuid(formData.status) || formData.status,
    
    // Convert enum outcome to Concept UUID
    outcomeCoded: getOutcomeConceptUuid(formData.outcome) || formData.outcome,
    
    // ... rest of payload
  };
  
  await submitProcedureResult(payload);
};
```

---

## Phase 4: Type Conversion Fixes

### 4.1 numberOfRepeats Conversion

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/api.ts`

```typescript
// BEFORE:
export function prepProceduresOrderPostData(formData: ProceduresOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... other fields
    numberOfRepeats: formData.numberOfRepeats,
  };
}

// AFTER:
export function prepProceduresOrderPostData(formData: ProceduresOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... other fields
    // Convert string to integer for backend
    numberOfRepeats: formData.numberOfRepeats ? parseInt(formData.numberOfRepeats, 10) : undefined,
  };
}
```

### 4.2 Update Form Schema

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

```typescript
// Update validation to ensure valid integer
numberOfRepeats: z.string()
  .optional()
  .refine((val) => !val || /^\d+$/.test(val), {
    message: 'Number of repeats must be a whole number',
  })
  .refine((val) => !val || parseInt(val, 10) > 0, {
    message: 'Number of repeats must be greater than 0',
  }),
```

---

## Phase 5: Add Missing Fields

### 5.1 Clinical History for Procedure Orders

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

**Add to form schema:**

```typescript
clinicalHistory: z.string().max(2000).optional(),
```

**Add to form UI:**

```typescript
<TextArea
  label={t('clinicalHistory', 'Clinical History')}
  value={formData.clinicalHistory}
  onChange={(event) => handleChange('clinicalHistory', event.target.value)}
  maxLength={2000}
  rows={3}
/>
```

**Add to API transformer:**

```typescript
export function prepProceduresOrderPostData(formData: ProceduresOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... existing fields
    clinicalHistory: formData.clinicalHistory,
  };
}
```

### 5.2 Specimen Type and Source

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

**Add to form schema:**

```typescript
specimenType: z.string().optional(),
specimenSource: z.string().optional(),
```

**Add to form UI (conditionally):**

```typescript
{showSpecimenFields && (
  <>
    <ConceptSearch
      label={t('specimenType', 'Specimen Type')}
      conceptClassUuid="specimen-concept-class-uuid" // Replace with actual UUID
      onChange={(concept) => handleChange('specimenType', concept?.uuid)}
    />
    <ConceptSearch
      label={t('specimenSource', 'Specimen Source')}
      conceptClassUuid="specimen-source-concept-class-uuid" // Replace with actual UUID
      onChange={(concept) => handleChange('specimenSource', concept?.uuid)}
    />
  </>
)}
```

---

## Phase 5b: Concept Set Configuration Updates ⚠️

Several concept set UUIDs configured in the apps don't exist in the database. These must be substituted with valid alternatives.

### 5b.1 Imaging Orders Concept Sets

**File:** `packages/esm-imaging-orders-app/src/config-schema.ts`

```typescript
// Add to config schema with substituted values
export const imagingOrdersConfigSchema = z.object({
  // ... existing fields
  
  // Radiology Concept Set - SUBSTITUTED
  // Old (missing): 164068AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  // New: 4557f916-4f42-410a-96ad-39c59ad82553 (Imaging modalities)
  radiologyConceptSetUuid: z.string().default('4557f916-4f42-410a-96ad-39c59ad82553'),
  
  // Body Site Concept Set - SUBSTITUTED  
  // Old (missing): 163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  // New: dc9fab29-30ab-102d-86b0-7a5022ba4115 (ANATOMIC LOCATIONS)
  bodySiteConceptSetUuid: z.string().default('dc9fab29-30ab-102d-86b0-7a5022ba4115'),
});
```

### 5b.2 Procedure Orders Concept Sets

**File:** `packages/esm-procedure-orders-app/src/config-schema.ts`

```typescript
// Add to config schema with substituted values
export const procedureOrdersConfigSchema = z.object({
  // ... existing fields
  
  // Procedure Concept Set - SUBSTITUTED
  // Old (missing): 165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  // New: 83bdfa6a-0c51-428a-a08d-3922db216858 (Procedure sequence construct)
  procedureConceptSetUuid: z.string().default('83bdfa6a-0c51-428a-a08d-3922db216858'),
  
  // Body Site Concept Set - SUBSTITUTED
  // Old (missing): 163021AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  // New: dc9fab29-30ab-102d-86b0-7a5022ba4115 (ANATOMIC LOCATIONS)
  bodySiteConceptSetUuid: z.string().default('dc9fab29-30ab-102d-86b0-7a5022ba4115'),
  
  // Duration Unit - Valid (no change needed)
  durationUnitConceptSetUuid: z.string().default('162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
});
```

### 5b.3 Medical Supply Concept Sets

**File:** `packages/esm-medical-supply-order-app/src/config-schema.ts`

```typescript
// Medical Supplies concept set - Valid (no change needed)
// UUID: 2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8
export const medicalSupplyOrderConfigSchema = z.object({
  medicalSupplyConceptSetUuid: z.string().default('2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8'),
  medicalSupplyQuantityUnitsConceptSetUuid: z.string().default('162384AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'),
});
```

---

## Phase 6: Testing

### 6.1 Unit Tests

**Create:** `packages/esm-medical-supply-order-app/src/config-schema.test.ts`

```typescript
import { z } from 'zod';
import { medicalSupplyOrderConfigSchema } from './config-schema';

describe('Medical Supply Order Config', () => {
  it('should accept correct UUID', () => {
    const result = medicalSupplyOrderConfigSchema.parse({
      medicalSupplyOrderTypeUuid: '4237a01f-29c5-4167-9d8e-96d6e590aa33',
    });
    expect(result.medicalSupplyOrderTypeUuid).toBe('4237a01f-29c5-4167-9d8e-96d6e590aa33');
  });
  
  it('should reject old wrong UUID', () => {
    // This test documents that the old UUID should not be used
    const oldUuid = 'dab3ab30-2feb-48ec-b4af-8332a0831b49';
    expect(oldUuid).not.toBe('4237a01f-29c5-4167-9d8e-96d6e590aa33');
  });
});
```

**Create:** `packages/esm-procedure-orders-app/src/concept-mappings.test.ts`

```typescript
import { getStatusConceptUuid, getOutcomeConceptUuid } from './concept-mappings';

describe('Concept Mappings', () => {
  it('should return UUID for COMPLETED status', () => {
    const uuid = getStatusConceptUuid('COMPLETED');
    expect(uuid).toBeDefined();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
  
  it('should return undefined for invalid status', () => {
    const uuid = getStatusConceptUuid('INVALID_STATUS');
    expect(uuid).toBeUndefined();
  });
});
```

### 6.2 Integration Tests

**Test Medical Supply Order:**

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { MedicalSupplyForm } from './medical-supply-form.component';

describe('Medical Supply Order', () => {
  it('should submit with correct UUID', async () => {
    const mockSubmit = jest.fn();
    render(<MedicalSupplyForm onSubmit={mockSubmit} />);
    
    // Fill form and submit
    // ...
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'medicalsupplyorder',
        })
      );
    });
  });
});
```

### 6.3 Manual Testing

**Test Checklist:**

- [ ] Imaging order: Submit and verify in database
- [ ] Procedure order: Submit with numberOfRepeats and verify
- [ ] Medical supply order: Submit and verify correct order type
- [ ] Procedure result: Submit and verify status/outcome persisted
- [ ] All forms: Verify commentToFulfiller field works
- [ ] Procedure order: Verify clinicalHistory captured
- [ ] Order basket: Add multiple orders and submit

---

## Phase 7: Build and Deploy

### 7.1 Build Packages

```bash
cd /path/to/emr-esm-orders

# Build all packages
npm run build

# Or build specific package
npm run build --workspace=esm-medical-supply-order-app
```

### 7.2 Run Tests

```bash
# Run all tests
npm test

# Run specific package tests
npm test --workspace=esm-medical-supply-order-app
```

### 7.3 Local Development

```bash
# Start development server
npm run start

# Or use specific app
npm run start --workspace=esm-imaging-orders-app
```

### 7.4 Deploy to Test Environment

```bash
# Deploy to test
npm run deploy:test

# Or specific package
npm run deploy:test --workspace=esm-medical-supply-order-app
```

---

## Rollback Procedure

If issues arise after deployment:

### Option 1: Revert Changes

```bash
# Revert the commit
git revert <commit-hash>

# Rebuild and redeploy
npm run build
npm run deploy:test
```

### Option 2: Hotfix Configuration

If only UUID needs to be reverted:

1. Update `config-schema.ts` back to old UUID
2. Rebuild affected package
3. Redeploy

### Option 3: Frontend Configuration Override

Some configs can be overridden via admin panel without code deployment:

```typescript
// In OpenMRS config admin, add override:
{
  "esm-medical-supply-order-app": {
    "config": {
      "medicalSupplyOrderTypeUuid": "dab3ab30-2feb-48ec-b4af-8332a0831b49"
    }
  }
}
```

---

## Verification Checklist

After implementation, verify:

- [ ] All TypeScript errors resolved
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed for each form
- [ ] Backend logs show correct order types
- [ ] No console errors in browser
- [ ] Forms submit successfully
- [ ] Data persists correctly in database
- [ ] Storybook components updated (if applicable)

---

## Next Steps

After frontend fixes are complete:

1. Coordinate with backend team to ensure compatibility
2. Update component documentation
3. Create user documentation for new fields
4. Schedule QA testing
5. Plan production deployment

---

## File Changes Summary

| Package | File | Changes |
|---------|------|---------|
| esm-medical-supply-order-app | config-schema.ts | Update UUID (Critical) |
| esm-imaging-orders-app | config-schema.ts | Update concept sets (Radiology, Body Site) |
| esm-imaging-orders-app | imaging-order-form.component.tsx | Field naming |
| esm-imaging-orders-app | api.ts | Field naming |
| esm-procedure-orders-app | config-schema.ts | Update concept sets (Procedure, Body Site), outcome concepts |
| esm-procedure-orders-app | procedures-order-form.component.tsx | Field naming, type conversion, clinical history |
| esm-procedure-orders-app | api.ts | Field naming, type conversion |
| esm-procedure-orders-app | concept-mappings.ts | **New file** - Status/outcome mappings |
| esm-procedure-orders-app | procedure-result-form.component.tsx | Enum mapping |
| esm-medical-supply-order-app | medical-supply-form.component.tsx | Field naming |

### Additional Reference Documents

| Document | Purpose |
|----------|---------|
| resolved-concept-mappings.md | Complete reference for all substituted concept UUIDs |
| concept-database-investigation-report.md | Source database investigation findings |

---

## Contact

For questions or issues during implementation:
- Frontend Lead: [Contact info]
- Code Reviewer: [Contact info]
- QA Team: [Contact info]

---

**Document Version:** 1.1  
**Last Updated:** 2026-07-04  
**Changes:** Added concept set substitutions and resolved concept mappings
