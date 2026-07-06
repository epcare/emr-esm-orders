# Gap Analysis Report - emr-esm-orders Implementation

**Project:** emr-esm-orders  
**Database:** epcare  
**Date:** 2026-07-03  
**Purpose:** Identify gaps between configured code and actual database state

---

## Executive Summary

| Category | Configured Items | Existing in DB | Missing | Gap % |
|----------|------------------|----------------|---------|-------|
| Procedure Status Concepts | 7 | 7 | 0 | 0% ✅ |
| Procedure Outcome Concepts | 3 | 0 | 3 | 100% 🔴 |
| Order Types | 3 | 3 | 0 | 0% ✅ |
| Encounter Configuration | 2 | 2 | 0 | 0% ✅ |
| Concept Sets | 2 | 0 | 2 | 100% 🔴 |

**Overall Gap:** 5 out of 17 configured items (29%) are missing from the database

**Note:** Previous report incorrectly listed Provider Role as missing. The `encounter_role` table contains 20 valid roles including the configured UUID. Documentation was checking wrong table (`provider_role` instead of `encounter_role`).

---

## Critical Gaps 🔴

### Gap #1: Procedure Outcome Concepts (100% Missing)

**Impact:** HIGH  
**Risk:** Procedure result forms will not function correctly

| Configured UUID | Configured Name | Status | Root Cause |
|-----------------|-----------------|--------|------------|
| `160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | SUCCESSFUL | ❌ Missing | Concept not created in DB |
| `160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | PARTIALLY_SUCCESSFUL | ❌ Missing | Concept not created in DB |
| `160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | NOT_SUCCESSFUL | ❌ Missing | Concept not created in DB |

**Impact on Application:**
- Procedure result outcome dropdown will be empty or error
- Enum → UUID mapping in code will fail
- Users cannot save procedure results with outcomes

**Affected Code:**
```typescript
// packages/esm-procedure-orders-app/src/config-schema.ts
procedureOutcomeConcepts: {
  SUCCESSFUL: '160718AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',     // MISSING
  PARTIALLY_SUCCESSFUL: '160717AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // MISSING
  NOT_SUCCESSFUL: '160720AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'   // MISSING
}
```

**Alternatives Available:**
- ✅ Successfully Treated (`eed11f33-313c-4fbd-b95b-d78e950f96c9`)
- ✅ Treatment complete (`160035AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)
- ✅ CLINICAL TREATMENT FAILURE (`dcda6cd2-30ab-102d-86b0-7a5022ba4115`)
- ✅ Died (`160034AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`)

---

### ~~Gap #2: Provider Role Configuration~~ ~~(100% Missing)~~ ✅ RESOLVED

**Previously Reported as:** Missing  
**Actual Status:** ✅ EXISTS

| Configured UUID | Configured Name | Status | Notes |
|-----------------|-----------------|--------|-------|
| `a0b03050-c99b-11e0-9572-0800200c9a66` | Encounter Role | ✅ Exists | "Unknown" - legacy default role |

**Note:** Previous documentation incorrectly checked `provider_role` table. The correct table is `encounter_role`, which contains 20 valid roles including the configured UUID. This is **NOT** a gap.

---

### Gap #3: Concept Sets (100% Missing)

**Impact:** MEDIUM  
**Risk:** May affect order basket filtering and concept lookup

| Configured UUID | Configured Name | Status | Root Cause |
|-----------------|-----------------|--------|------------|
| `165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` | Procedure Concept Set | ❌ Missing | Not imported |
| `2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8` | Medical Supply Concept Set | ❌ Missing | Not imported |

**Impact on Application:**
- Order basket may not filter concepts correctly
- Concept search may return unexpected results
- Order type routing may be affected

**Affected Code:**
```typescript
// packages/esm-procedure-orders-app/src/config-schema.ts
procedureConceptSet: '165418AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // MISSING

// packages/esm-medical-supply-order-app/src/config-schema.ts
medicalSupplyConceptSet: '2f6f34a4-6a1c-11f1-9b7d-5d5590d478d8', // MISSING
```

**Alternative Concept Sets Available:**
- ✅ Imaging modalities (62 members)
- ✅ Procedure sequence construct (58 members)
- ✅ Circumcision procedure (18 members)

---

## Medium Gaps ⚠️

### Gap #4: Imaging Result Form Status Field Inconsistency

**Impact:** MEDIUM  
**Risk:** Inconsistent user experience across result forms

**Issue:**
- Procedure Result Form has enum → UUID mapping for status
- Imaging Result Form loads status directly from backend (UUIDs)
- Inconsistency between the two forms

**Current State:**
```typescript
// Procedure Result Form - Has enum mapping
const statusValue = getValues('status');
status: statusValue ? procedureStatusConcepts[statusValue] || statusValue : null,

// Imaging Result Form - No enum mapping (loads UUIDs directly)
<ConceptSearch {...statusProps} />
```

**Recommendation:**
Apply the same enum → UUID mapping to Imaging Result Form for consistency.

---

## What IS Working ✅

### No Gaps Found

1. **Procedure Status Concepts (7/7)** ✅
   - All status concepts exist and are valid
   - Status dropdowns will work correctly
   - PREPARATION, IN_PROGRESS, COMPLETED, STOPPED, NOT_DONE, ON_HOLD, ENTERED_IN_ERROR

2. **Order Types (3/3)** ✅
   - All order types exist
   - Orders will route correctly
   - Procedure Order, Test Order, Medical Supply Order all valid

3. **Encounter Type (1/1)** ✅
   - Procedure Results encounter type exists
   - Encounter creation will work for results

---

## Gap Impact Matrix

| Gap | Severity | Affected Forms | User Impact | Backend Impact |
|-----|----------|----------------|-------------|----------------|
| Procedure Outcome Concepts | 🔴 HIGH | Procedure Result | Cannot save outcomes | API errors |
| Concept Sets | 🟡 MEDIUM | Order baskets | Concept filtering issues | Possible errors |
| Imaging Status Inconsistency | 🟢 LOW | Imaging Result | Confusing UX | None |

**Note:** Provider Role is NOT a gap - the configured UUID exists in `encounter_role` table.

---

## Root Cause Analysis

### Why are these concepts missing?

1. **Outcome Concepts:**
   - Never created in this OpenMRS installation
   - May be from a different concept dictionary (CIEL, AMPATH, PIH)
   - Not imported during initial setup

2. **Concept Sets:**
   - May be from a different implementation
   - Concept dictionaries vary between installations
   - Custom sets not created during migration

### ~~Provider Role~~ ✅ RESOLVED

Previous documentation incorrectly reported the encounter role as missing. The configured UUID `a0b03050-c99b-11e0-9572-0800200c9a66` exists in the `encounter_role` table (named "Unknown" - a legacy default role). The previous analysis was checking the wrong table (`provider_role` instead of `encounter_role`).

---

## Gap Remediation Options

### Option A: Create Missing Concepts in Database 🔧

**Pros:**
- Matches configuration exactly
- No code changes needed
- Proper semantic meaning

**Cons:**
- Requires database write access
- Need to verify with implementation team
- Must coordinate concept UUIDs across environments

**Effort:** MEDIUM

---

### Option B: Update Configuration to Use Existing Concepts 🔄

**Pros:**
- No database changes needed
- Immediate deployment possible
- Uses already-validated concepts

**Cons:**
- May not perfectly match semantics
- Requires code changes
- Need to validate with clinical team

**Effort:** LOW

**Recommended Mapping:**
```typescript
procedureOutcomeConcepts: {
  SUCCESSFUL: 'eed11f33-313c-4fbd-b95b-d78e950f96c9',      // Successfully Treated
  PARTIALLY_SUCCESSFUL: '163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // In progress (proxy)
  NOT_SUCCESSFUL: 'dcda6cd2-30ab-102d-86b0-7a5022ba4115',    // CLINICAL TREATMENT FAILURE
}
```

---

### Option C: Remove/Disable Affected Features 🚫

**Pros:**
- Eliminates errors
- Simplifies implementation

**Cons:**
- Loses functionality
- Not recommended for production

**Effort:** LOW

---

### Option D: Hybrid Approach 🎯 (RECOMMENDED)

**Combine Options A and B:**

1. **Outcome Concepts:** Use existing alternatives (Option B)
   - Update config with alternative UUIDs
   - Validate with clinical team
   - Document the mapping

2. **Provider Role:** 
   - Verify if actually needed in backend
   - If not needed, remove from config
   - If needed, create in database

3. **Concept Sets:**
   - Verify if actually used by code
   - If used, create or find alternatives
   - If not used, remove from config

4. **Imaging Status:** Add enum mapping for consistency

**Effort:** MEDIUM  
**Risk:** LOW  
**Timeline:** 1-2 days

---

## Recommended Action Plan

### Phase 1: Immediate (Day 1)

1. **Update outcome concept configuration**
   - Replace missing UUIDs with existing alternatives
   - Test procedure result form
   - Verify outcome dropdown works

2. **Investigate provider role usage**
   - Check backend code for provider role requirements
   - Test encounter creation without provider role
   - Determine if role is actually needed

### Phase 2: Short-term (Day 2)

3. **Resolve concept set references**
   - Verify if concept sets are used in code
   - Update or remove config as needed
   - Test order basket functionality

4. **Add imaging status enum mapping**
   - Apply same pattern as procedure result form
   - Test imaging result form
   - Verify consistency

### Phase 3: Follow-up

5. **Document all changes**
   - Update configuration documentation
   - Create decision log for UUID choices
   - Share with implementation team

6. **Plan for production**
   - Coordinate concept creation across environments
   - Create migration scripts if needed
   - Update deployment documentation

---

## Validation Checklist

Before deploying to production, verify:

- [ ] All configured UUIDs exist in target database
- [ ] Procedure result form saves correctly with outcomes
- [ ] Imaging result form saves correctly with status
- [ ] Encounter creation works for results
- [ ] Order baskets filter concepts correctly
- [ ] No console errors in browser
- [ ] No backend API errors
- [ ] Documentation updated

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Outcome concept failure | HIGH | HIGH | Use alternative concepts |
| Provider role errors | MEDIUM | HIGH | Verify backend requirements |
| Concept set filtering issues | LOW | MEDIUM | Validate with testing |
| Inconsistent UX | LOW | LOW | Apply enum mapping |

---

## Dependencies

**Dependencies for resolution:**
1. Database access (for Option A)
2. Backend team consultation (provider role usage)
3. Clinical team validation (outcome concepts)
4. Testing environment availability

**Blocking issues:**
- None - can proceed with Option B (configuration update)

---

## Success Criteria

**Gap resolution successful when:**
1. ✅ All procedure result forms can save outcomes
2. ✅ All imaging result forms can save status consistently
3. ✅ No missing UUID errors in console or backend
4. ✅ All configured concepts exist in database
5. ✅ Documentation updated with new mappings

---

## Conclusion

**Current State:** 7 critical gaps identified (39% of configured items)

**Recommended Path:** Hybrid approach (Option D)
- Use existing concepts for outcomes
- Investigate provider role usage
- Add imaging status enum mapping
- Verify/remove unused concept set references

**Estimated Effort:** 1-2 days  
**Risk Level:** LOW (with recommended approach)  
**Deployment Readiness:** Can proceed with configuration updates

---

**Report Generated:** 2026-07-03  
**Database:** epcare  
**Next Review:** After implementation changes
