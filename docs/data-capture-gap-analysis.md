# Data Capture Gap Analysis: Frontend Forms vs Backend Modules

**Date:** 2026-07-03  
**Scope:** emr-esm-orders frontend apps → Backend modules (orderexpansion, emrapi)

---

## Executive Summary

This document identifies gaps and anomalies between the frontend order forms in emr-esm-orders and the backend processing modules (openmrs-module-orderexpansion and openmrs-module-emrapi). 

**Critical Findings:**
1. **CRITICAL:** UUID inconsistency in order type routing may cause incorrect order type assignment
2. **CRITICAL:** Frontend Medical Supply Orders using wrong UUID - routes to standard Order instead of custom MedicalSupplyOrder class
3. **HIGH:** Field naming inconsistencies between frontend and backend payloads
4. **MEDIUM:** Data type mismatches in number fields
5. **LOW:** Missing optional fields in API payloads

---

## Database Analysis Summary

The database reveals **TWO medical supply order types exist**, causing confusion:

| Order Type | ID | UUID | Java Class | Should Be Used |
|------------|----|---- |------------|----------------|
| **Medical Supply Order** | 5 | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | Custom `MedicalSupplyOrder` | ✓ YES |
| **Medical Supplies Order** | 6 | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | Standard `org.openmrs.Order` | ✗ NO (duplicate) |

**Current Problem:**
- Frontend `esm-medical-supply-order-app` uses `dab3ab30...` (wrong type)
- Backend `OrderResource2_3.java` references `dab3ab30...` for MedicalSupplyOrder (wrong)
- This causes medical supply orders to bypass custom fields and logic

**Correct UUIDs (from database):**
- Procedure Order: `b4a7c280-369e-4d12-9ce8-18e36783fed6` ✓
- Medical Supply Order: `4237a01f-29c5-4167-9d8e-96d6e590aa33` ✓

---

## 1. Critical Issues

### 1.1 Order Type UUID Inconsistency ⚠️ **CRITICAL**

**Location:** openmrs-module-orderexpansion

**Database Order Types (Source of Truth):**

| order_type_id | Name | UUID | Java Class | Notes |
|----------------|------|------|------------|-------|
| 4 | **Procedure Order** | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | `org.openmrs.module.orderexpansion.api.model.ProcedureOrder` | ✓ Custom orderexpansion class |
| 5 | **Medical Supply Order** | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | `org.openmrs.module.orderexpansion.api.model.MedicalSupplyOrder` | ✓ Custom orderexpansion class |
| 6 | **Medical Supplies Order** | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | `org.openmrs.Order` | ⚠️ Standard Order, NOT custom |
| 3 | **Test Order** | `52a447d3-a64a-11e3-9aeb-50e549534c5e` | `org.openmrs.Order` | Standard OpenMRS |
| 2 | **Drug Order** | `131168f4-15f5-102d-96e4-000c29c2a5d7` | `org.openmrs.Order` | Standard OpenMRS |

**Issue:** Conflicting UUIDs in Java code:

| File | ProcedureOrder UUID | MedicalSupplyOrder UUID | Status |
|------|---------------------|------------------------|--------|
| `EnhanceOrderContextForCustomTypesAdvice.java` | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | ✓ Matches database |
| `OrderResource2_3.java` | `4237a01f-29c5-4d12-9ce8-18e36783fed6` ✗ | `dab3ab30-2feb-48ec-b4af-8332a0831b49` ✗ | ✗ WRONG UUIDs |

**Critical Finding:** `OrderResource2_3.java` has:
- ProcedureOrder UUID that **actually belongs to** MedicalSupplyOrder
- MedicalSupplyOrder UUID that **belongs to a different** "Medical Supplies Order" (standard Order, NOT custom)

**Frontend Configuration Status:**

| Frontend App | Configured UUID | Should Be | Status |
|--------------|------------------|-----------|--------|
| Imaging Orders | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | Same | ✓ Correct |
| Procedure Orders | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | Same | ✓ Correct |
| Medical Supply Orders | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | ✗ WRONG |

**Impact:**
1. **Frontend Medical Supply Orders** are being submitted with the wrong order type UUID (`dab3ab30...` instead of `4237a01f...`)
2. This routes to the standard `org.openmrs.Order` class instead of the custom `MedicalSupplyOrder` class
3. Custom fields (`quantity`, `brandName`, `medicalSuppliesInventoryId`) may not be properly persisted
4. The custom `EnhanceOrderContextForCustomTypesAdvice` interceptor may not process these orders correctly

**Recommendation:**
1. Fix `OrderResource2_3.java` to use correct UUIDs from database
2. Update frontend `esm-medical-supply-order-app` config to use `4237a01f-29c5-4167-9d8e-96d6e590aa33`
3. Consider retiring the duplicate "Medical Supplies Order" (UUID: `dab3ab30...`)

---

## 2. Order Type Specific Gap Analysis

### 2.1 Imaging Orders (Radiology)

**Frontend App:** `esm-imaging-orders-app`  
**Backend Model:** `ProcedureOrder` (orderexpansion)  
**API Endpoint:** `POST /ws/rest/v1/order`

#### Field Mapping Analysis

| Frontend Field | Backend Field | Status | Notes |
|----------------|---------------|--------|-------|
| `testType.conceptUuid` | `concept` | ✓ Match | Properly mapped |
| `urgency` | `urgency` | ✓ Match | ROUTINE, URGENT, ON_SCHEDULED_DATE |
| `scheduleDate` | `scheduledDate` | ✓ Match | Conditional on urgency |
| `laterality` | `laterality` | ✓ Match | LEFT, RIGHT, BILATERAL |
| `bodySite` | `bodySite` | ✓ Match | Concept-based |
| `orderReasonNonCoded` | `orderReasonNonCoded` | ✓ Match | Free text |
| `instructions` | `instructions` | ✓ Match | Max 500 chars |
| `commentsToFulfiller` | `commentToFulfiller` | ⚠️ Warning | Capitalization difference (camelCase vs PascalCase) |
| `type: 'procedureorder'` | OrderType UUID | ✓ Match | Uses correct type |

#### Missing Fields

**Backend accepts, Frontend doesn't send:**
- `specimenType` (Concept) - Not in imaging form
- `specimenSource` (Concept) - Not in imaging form
- `frequency` - Not in imaging form
- `location` (Concept) - Not in imaging form
- `numberOfRepeats` - Not in imaging form
- `relatedProcedure` (UUID) - Not in imaging form

#### Imaging Result Form Gap

**Frontend endpoint:** `POST /ws/rest/v1/emrapi/procedure`  
**Frontend fields:** `procedureReport` (findings/notes), `status`, `_orphanedData`

**Backend mapping issues (from PROCEDURE_FIELD_MAPPING.md):**
- `encounters` (array) → `encounter` (single) - Array flattened
- `procedureReport` → `notes` - Field renamed
- Orphaned fields stored in JSON `notes`

---

### 2.2 Procedure Orders

**Frontend App:** `esm-procedure-orders-app`  
**Backend Model:** `ProcedureOrder` (orderexpansion)  
**API Endpoint:** `POST /ws/rest/v1/order`

#### Field Mapping Analysis

| Frontend Field | Backend Field | Status | Notes |
|----------------|---------------|--------|-------|
| `testType.conceptUuid` | `concept` | ✓ Match | |
| `urgency` | `urgency` | ✓ Match | |
| `scheduleDate` | `scheduledDate` | ✓ Match | |
| `orderReasonNonCoded` | `orderReasonNonCoded` | ✓ Match | |
| `bodySite` | `bodySite` | ✓ Match | |
| `numberOfRepeats` | `numberOfRepeats` | ⚠️ Type Mismatch | Frontend: string, Backend: Integer |
| `frequency` | `frequency` | ✓ Match | OrderFrequency UUID |
| `instructions` | `instructions` | ✓ Match | |
| `commentsToFulfiller` | `commentToFulfiller` | ⚠️ Warning | Capitalization |
| `orderReason` | N/A | ⚠️ Gap | Coded reason - not in backend ProcedureOrder |

#### Missing Fields

**Backend accepts, Frontend doesn't send:**
- `specimenType` - Not in procedure form
- `specimenSource` - Not in procedure form
- `location` - Not in procedure form
- `relatedProcedure` - Not in procedure form
- `clinicalHistory` - Not in procedure form (backend TEXT field)

#### Procedure Result Form

**Endpoint:** `POST /ws/rest/v1/emrapi/procedure`

| Frontend Field | Backend Field | Status |
|----------------|---------------|--------|
| `procedureCoded` | `procedureCoded` | ✓ Match |
| `bodySite` | `bodySiteCoded` | ⚠️ Renamed |
| `startDateTime` | `startDateTime` | ✓ Match (camelCase) |
| `endDateTime` | `endDateTime` | ✓ Match (camelCase) |
| `status` (enum) | `status` (Concept UUID) | ⚠️ Type Mismatch |
| `outcomeCoded` (enum) | `outcomeCoded` (Concept UUID) | ⚠️ Type Mismatch |
| `notes` | `notes` | ✓ Match |
| `participants` (array) | Not documented | ⚠️ Gap |
| `complications` (array) | Not documented | ⚠️ Gap |
| `estimatedStartDate` | Not documented | ⚠️ Gap |

---

### 2.3 Medical Supply Orders ⚠️ **CRITICAL UUID ISSUE**

**Frontend App:** `esm-medical-supply-order-app`  
**Backend Model:** Should be `MedicalSupplyOrder` (orderexpansion)  
**API Endpoint:** `POST /ws/rest/v1/order`

#### ⚠️ CRITICAL: Wrong Order Type UUID in Frontend

| Configuration | Current Value | Should Be |
|---------------|---------------|-----------|
| `medicalSupplyOrderTypeUuid` (frontend) | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | `4237a01f-29c5-4167-9d8e-96d6e590aa33` |

**Current Issue:** The frontend UUID `dab3ab30-2feb-48ec-b4af-8332a0831b49` points to:
- **Name:** "Medical Supplies Order" (note the 's')
- **Class:** `org.openmrs.Order` (base class, NOT custom)
- **Parent:** Drug Order

**This means:**
- Orders are NOT using the custom `MedicalSupplyOrder` class
- Custom fields may not be persisted correctly
- The orderexpansion module's custom logic is bypassed

#### Field Mapping Analysis

| Frontend Field | Backend Field | Status | Notes |
|----------------|---------------|--------|-------|
| `testType.conceptUuid` | `concept` | ✓ Match | |
| `urgency` | `urgency` | ✓ Match | |
| `quantity` | `quantity` | ✓ Match | Both Double/number |
| `quantityUnits` | `quantityUnits` | ✓ Match | Concept UUID |
| `instructions` | `instructions` | ✓ Match | |
| `brandName` | `brandName` | ✓ Match | Optional |
| `type: 'medicalsupplyorder'` | OrderType UUID | ✓ Match | |

#### Missing Fields

**Backend accepts, Frontend doesn't send:**
- `medicalSuppliesInventoryId` (Integer) - Not captured in form

**Frontend sends, Backend unclear:**
- `commentsToFulfiller` - Not explicitly in MedicalSupplyOrder model (may be in parent)

---

### 2.4 Medication/Supply Dispensing

**Frontend App:** `esm-medical-supply-dispensing-app`  
**Backend Model:** `MedicalSupplyDispense` (orderexpansion)  
**API Endpoint:** `POST /ws/rest/v1/medicalsupplydispense`

#### Field Mapping Analysis

| Frontend Field | Backend Field | Status | Notes |
|----------------|---------------|--------|-------|
| `quantity` | `quantity` | ✓ Match | |
| `quantityUnits` | `quantityUnits` | ✓ Match | |
| `dateDispensed` | `dateDispensed` | ✓ Match | |
| `statusReason` | `statusReason` | ✓ Match | Concept |
| `status` | `status` | ✓ Match | Enum values match |
| `location` | `location` | ✓ Match | Auto from session |
| `dispenser` | `dispenser` | ✓ Match | Auto from session |
| `medicalSupplyOrder` | `medicalSupplyOrder` | ✓ Match | Order UUID |

#### Data Structure Match

The frontend `NonDrugMedicationDispense` interface aligns well with backend `MedicalSupplyDispense` model. No critical gaps identified.

---

## 3. EMRAPI Integration Gaps

### 3.1 EncounterTransaction API

**Endpoint:** `POST /rest/emrapi/encounter`

**Used by:** Frontend for submitting orders within encounter context

**Issue:** The current frontend order forms use `/ws/rest/v1/order` (REST Web Services) directly, not the EMRAPI encounter transaction endpoint. This means:

- Orders are submitted **outside of encounter context**
- No automatic visit/encounter creation
- Orders may not be properly associated with clinical visits

**Impact:** Orders may appear disconnected from the patient's clinical encounter timeline.

---

## 4. Data Type Mismatches

### 4.1 Numeric Fields

| Field | Frontend Type | Backend Type | Impact |
|-------|---------------|--------------|--------|
| `numberOfRepeats` | string | Integer | Type conversion required |
| `quantity` | number | Double | Compatible |
| `medicalSuppliesInventoryId` | N/A | Integer | Missing from frontend |

### 4.2 Enum to Concept Mappings

**Procedure Result Status:**
- Frontend: Enum string (COMPLETED, IN_PROGRESS, etc.)
- Backend: Concept UUID
- **Gap:** Requires mapping configuration

**Procedure Outcome:**
- Frontend: Enum (SUCCESSFUL, PARTIALLY_SUCCESSFUL, NOT_SUCCESSFUL)
- Backend: Concept UUID (`outcomeCoded`)
- **Gap:** Requires mapping configuration

---

## 5. Field Naming Inconsistencies

### 5.1 CamelCase vs PascalCase

| Frontend | Backend | Location |
|----------|---------|----------|
| `commentsToFulfiller` | `commentToFulfiller` | Imaging, Procedure, Medical Supply orders |
| `orderReasonNonCoded` | `orderReasonNonCoded` | ✓ Consistent |
| `scheduleDate` | `scheduledDate` | Frontend shorter |

### 5.2 Field Renaming (Procedure Results)

| Frontend | Backend | Notes |
|----------|---------|-------|
| `concept` | `procedureCoded` | Renamed |
| `bodySite` | `bodySiteCoded` | Suffix added |
| `procedureReport` | `notes` | Different field name |

---

## 6. Validation Gaps

### 6.1 Frontend Validation

**Present:**
- Zod schemas for required fields
- Max length validation (500 chars for text fields)
- Numeric min/max validation

**Missing:**
- No validation that `conceptUuid` exists in backend
- No validation that `orderReason` concept is valid
- No validation of `frequency` UUID

### 6.2 Backend Validation

**OpenMRS Core Order Service:**
- Validates required fields (patient, orderer, concept)
- Validates order type exists
- **No field-level annotations** in domain models

**OrderExpansion Module:**
- DAO methods have `@NotNull` on ID/UUID parameters
- No field-level validation annotations

**Gap:** Backend validation is minimal and relies on core service. No explicit validation for:
- `laterality` enum values
- `status` enum values
- Range validation for numeric fields

---

## 7. Summary of Gaps by Severity

### Critical (2)
- [ ] **UUID inconsistency in `OrderResource2_3.java`** - Has swapped/wrong UUIDs for ProcedureOrder and MedicalSupplyOrder
- [ ] **Frontend Medical Supply Orders using wrong UUID** - `esm-medical-supply-order-app` config uses `dab3ab30...` (standard Order) instead of `4237a01f...` (custom MedicalSupplyOrder)

### High (3)
- [ ] `commentsToFulfiller` vs `commentToFulfiller` capitalization
- [ ] Procedure result status/outcome enum → Concept UUID mapping missing
- [ ] Orders submitted outside encounter context (no EMRAPI integration)

### Medium (5)
- [ ] `numberOfRepeats` type mismatch (string vs Integer)
- [ ] `specimenType`, `specimenSource` not captured for applicable orders
- [ ] `clinicalHistory` not captured for procedures
- [ ] `medicalSuppliesInventoryId` not captured
- [ ] `participants`, `complications` arrays in procedure results - backend mapping unclear

### Low (6)
- [ ] `location` not captured in order forms (auto from session only)
- [ ] `frequency` not in imaging orders
- [ ] `relatedProcedure` relationship not captured
- [ ] `brandName` is optional and may not be consistently captured
- [ ] Order reason concept validation missing
- [ ] `estimatedStartDate` backend mapping unclear

---

## 8. Recommendations

### Immediate Actions

1. **Fix UUID inconsistency in `OrderResource2_3.java`:**
   ```java
   // Change from:
   ProcedureOrder: "4237a01f-29c5-4d12-9ce8-18e36783fed6"  // WRONG
   MedicalSupplyOrder: "dab3ab30-2feb-48ec-b4af-8332a0831b49"  // WRONG
   
   // To (matching database):
   ProcedureOrder: "b4a7c280-369e-4d12-9ce8-18e36783fed6"  // CORRECT
   MedicalSupplyOrder: "4237a01f-29c5-4167-9d8e-96d6e590aa33"  // CORRECT
   ```

2. **Fix frontend Medical Supply Orders config:**
   - Update `packages/esm-medical-supply-order-app/src/config-schema.ts`
   - Change `medicalSupplyOrderTypeUuid` from `dab3ab30-2feb-48ec-b4af-8332a0831b49` to `4237a01f-29c5-4167-9d8e-96d6e590aa33`

3. **Consider retiring duplicate "Medical Supplies Order":**
   - UUID `dab3ab30-2feb-48ec-b4af-8332a0831b49` appears to be a duplicate/confusing entry
   - It uses base `org.openmrs.Order` class instead of custom `MedicalSupplyOrder`
   - May be legacy - investigate if it's still needed

4. **Standardize field naming:**
   - Decide on `commentsToFulfiller` vs `commentToFulfiller` (recommend camelCase)
   - Update frontend or backend accordingly

3. **Fix type conversions:**
   - Convert `numberOfRepeats` to Integer before sending to backend
   - Add type coercion in API transformers

### Short-term Improvements

4. **Add missing fields to forms:**
   - Add `specimenType` and `specimenSource` to applicable forms
   - Add `clinicalHistory` to procedure orders

5. **Implement Concept mapping for enums:**
   - Create configuration for status/outcome Concept UUIDs
   - Update procedure result transformers

6. **Integrate with EMRAPI encounter endpoint:**
   - Consider migrating order submission to use `/rest/emrapi/encounter`
   - This would automatically associate orders with visits/encounters

### Long-term Improvements

7. **Add backend validation annotations:**
   - Add `@NotNull`, `@Min`, `@Max` annotations to domain models
   - Implement custom validators for enum values

8. **Create comprehensive field mapping documentation:**
   - Document all frontend → backend field transformations
   - Include type conversions and enum mappings

9. **Add integration tests:**
   - Test end-to-end order submission from each form type
   - Verify data persistence matches form input

---

## Appendix: File References

### Backend Modules

| Component | File Path |
|-----------|-----------|
| ProcedureOrder Model | `/api/src/main/java/org/openmrs/module/orderexpansion/api/model/ProcedureOrder.java` |
| MedicalSupplyOrder Model | `/api/src/main/java/org/openmrs/module/orderexpansion/api/model/MedicalSupplyOrder.java` |
| MedicalSupplyDispense Model | `/api/src/main/java/org/openmrs/module/orderexpansion/api/model/MedicalSupplyDispense.java` |
| ProcedureOrder REST Handler | `/omod/src/main/java/org/openmrs/module/orderexpansion/web/resources/ProcedureOrderSubclassHandler.java` |
| MedicalSupplyOrder REST Handler | `/omod/src/main/java/org/openmrs/module/orderexpansion/web/resources/MedicalSupplyOrderSubclassHandler.java` |
| Dispense REST Handler | `/omod/src/main/java/org/openmrs/module/orderexpansion/web/resources/MedicalSupplyDispenseResource.java` |
| EncounterTransaction | `/api/src/main/java/org/openmrs/module/emrapi/encounter/domain/EncounterTransaction.java` |
| EmrEncounterController | `/omod/src/main/java/org/openmrs/module/emrapi/web/controller/EmrEncounterController.java` |

### Frontend Apps

| Component | File Path |
|-----------|-----------|
| Imaging Order Form | `/packages/esm-imaging-orders-app/src/form/imaging-orders/add-imaging-orders/imaging-order-form.component.tsx` |
| Imaging Order API | `/packages/esm-imaging-orders-app/src/form/imaging-orders/api.ts` |
| Imaging Config | `/packages/esm-imaging-orders-app/src/config-schema.ts` |
| Procedure Order Form | `/packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx` |
| Procedure Order API | `/packages/esm-procedure-orders-app/src/form/procedures-orders/api.ts` |
| Procedure Config | `/packages/esm-procedure-orders-app/src/config-schema.ts` |
| Medical Supply Form | `/packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/medical-supply-order/medical-supply-form.component.tsx` |
| Medical Supply API | `/packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/api.ts` |
| Dispense Form | `/packages/esm-medical-supply-dispensing-app/src/forms/dispense-form.component.tsx` |

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-03

---

## Quick Reference: Files to Change

### Backend Changes (orderexpansion module)

**File:** `/omod/src/main/java/org/openmrs/module/orderexpansion/web/resources/OrderResource2_3.java`

```java
// FIND THESE LINES AND CHANGE:
private static final String PROCEDURE_ORDER_UUID = "4237a01f-29c5-4d12-9ce8-18e36783fed6"; // WRONG
private static final String MEDICAL_SUPPLY_ORDER_UUID = "dab3ab30-2feb-48ec-b4af-8332a0831b49"; // WRONG

// TO:
private static final String PROCEDURE_ORDER_UUID = "b4a7c280-369e-4d12-9ce8-18e36783fed6"; // CORRECT
private static final String MEDICAL_SUPPLY_ORDER_UUID = "4237a01f-29c5-4167-9d8e-96d6e590aa33"; // CORRECT
```

### Frontend Changes (emr-esm-orders)

**File:** `/packages/esm-medical-supply-order-app/src/config-schema.ts`

```typescript
// FIND:
medicalSupplyOrderTypeUuid: z.string().default('dab3ab30-2feb-48ec-b4af-8332a0831b49'),

// CHANGE TO:
medicalSupplyOrderTypeUuid: z.string().default('4237a01f-29c5-4167-9d8e-96d6e590aa33'),
```

**File:** `/packages/esm-medical-supply-order-app/src/config-schema.ts`

Check if there's a default export or configuration object that also uses the old UUID and update it.

### Database (Optional - after verifying no dependencies)

```sql
-- Before running, verify order_type_id 6 is not used by any active orders
-- Retire the duplicate "Medical Supplies Order" entry
UPDATE order_type SET retired = 1, retire_reason = 'Duplicate of custom MedicalSupplyOrder (order_type_id=5)', retired_by = 1, date_retired = NOW() WHERE order_type_id = 6;
```

⚠️ **WARNING:** Only retire order_type_id 6 after confirming it's not referenced by any active orders or other system components.

---

## 9. Resolution Plan

This section provides a detailed, step-by-step plan to resolve all identified issues, organized by priority and phase.

### Phase 1: Critical Fixes (UUID Issues) - Week 1

#### 1.1 Backend UUID Fix

**File:** `openmrs-module-orderexpansion/omod/src/main/java/org/openmrs/module/orderexpansion/web/resources/OrderResource2_3.java`

**Steps:**
1. Create a feature branch: `fix/order-uuid-correction`
2. Open `OrderResource2_3.java`
3. Locate the UUID constants:
   ```java
   private static final String PROCEDURE_ORDER_UUID = "4237a01f-29c5-4d12-9ce8-18e36783fed6";
   private static final String MEDICAL_SUPPLY_ORDER_UUID = "dab3ab30-2feb-48ec-b4af-8332a0831b49";
   ```
4. Update to match database values:
   ```java
   private static final String PROCEDURE_ORDER_UUID = "b4a7c280-369e-4d12-9ce8-18e36783fed6";
   private static final String MEDICAL_SUPPLY_ORDER_UUID = "4237a01f-29c5-4167-9d8e-96d6e590aa33";
   ```
5. Add Javadoc comments explaining the UUID source:
   ```java
   /**
    * UUID for Procedure Order type from database order_type_id=4
    * Source: Database order_type table
    */
   private static final String PROCEDURE_ORDER_UUID = "b4a7c280-369e-4d12-9ce8-18e36783fed6";
   ```
6. Build and test the module
7. Create pull request with reference to this gap analysis

#### 1.2 Frontend UUID Fix

**File:** `emr-esm-orders/packages/esm-medical-supply-order-app/src/config-schema.ts`

**Steps:**
1. Create a feature branch: `fix/medical-supply-order-uuid`
2. Search for all occurrences of `dab3ab30-2feb-48ec-b4af-8332a0831b49`
3. Replace with `4237a01f-29c5-4167-9d8e-96d6e590aa33`
4. Update the default in the schema:
   ```typescript
   medicalSupplyOrderTypeUuid: z.string().default('4237a01f-29c5-4167-9d8e-96d6e590aa33'),
   ```
5. Build and test the frontend
6. Create pull request

#### 1.3 Database Investigation

**Query to check usage of duplicate order type:**
```sql
-- Check if order_type_id 6 has any orders
SELECT COUNT(*) FROM orders WHERE order_type_id = 6 AND voided = 0;

-- Check when it was last used
SELECT MAX(date_created) FROM orders WHERE order_type_id = 6;

-- Find any dependencies
SELECT * FROM order_type WHERE uuid = 'dab3ab30-2feb-48ec-b4af-8332a0831b49';
```

**Decision:**
- If no active orders exist: Proceed to retirement
- If orders exist: Evaluate migration strategy before retirement

#### 1.4 Rollback Procedure for Phase 1

**If issues arise:**
1. Backend: Revert `OrderResource2_3.java` changes
2. Frontend: Revert `config-schema.ts` changes
3. Database: If retired, un-retire order_type_id 6:
   ```sql
   UPDATE order_type SET retired = 0, retire_reason = NULL, retired_by = NULL, date_retired = NULL WHERE order_type_id = 6;
   ```

---

### Phase 2: High Priority Fixes - Week 2

#### 2.1 Field Naming Standardization

**Decision Point:** Choose between `commentsToFulfiller` (frontend) or `commentToFulfiller` (backend)

**Recommendation:** Use `commentToFulfiller` (backend standard - single word)

**Frontend Changes:**

**Files to update:**
- `packages/esm-imaging-orders-app/src/form/imaging-orders/add-imaging-orders/imaging-order-form.component.tsx`
- `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`
- `packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/medical-supply-order/medical-supply-form.component.tsx`
- Corresponding `api.ts` files

**Steps:**
1. Search for `commentsToFulfiller` across all packages
2. Replace with `commentToFulfiller`
3. Update form schemas
4. Update API payload transformers
5. Update any related TypeScript interfaces
6. Test all order forms

#### 2.2 Procedure Result Enum → Concept UUID Mapping

**Create configuration file:** `packages/esm-procedure-orders-app/src/concept-mappings.ts`

```typescript
export const PROCEDURE_STATUS_CONCEPTS = {
  PREPARATION: 'uuid-here',
  IN_PROGRESS: 'uuid-here',
  COMPLETED: 'uuid-here',
  STOPPED: 'uuid-here',
  // ... add all statuses
} as const;

export const PROCEDURE_OUTCOME_CONCEPTS = {
  SUCCESSFUL: 'uuid-here',
  PARTIALLY_SUCCESSFUL: 'uuid-here',
  NOT_SUCCESSFUL: 'uuid-here',
} as const;
```

**Update procedure result transformer:**
```typescript
// In procedure result form component
const statusUuid = PROCEDURE_STATUS_CONCEPTS[formData.status as keyof typeof PROCEDURE_STATUS_CONCEPTS];
const outcomeUuid = PROCEDURE_OUTCOME_CONCEPTS[formData.outcome as keyof typeof PROCEDURE_OUTCOME_CONCEPTS];

payload.status = statusUuid;
payload.outcomeCoded = outcomeUuid;
```

**Steps:**
1. Get actual UUIDs from database concept dictionary
2. Create mapping configuration
3. Add to config-schema for easy customization
4. Update transformers
5. Test procedure result submission

#### 2.3 Rollback Procedure for Phase 2

1. Revert field name changes
2. Remove concept mapping configuration
3. Use direct enum submission (temporarily)

---

### Phase 3: Medium Priority Fixes - Week 3

#### 3.1 Type Conversion: numberOfRepeats

**Frontend Fix:**

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/api.ts`

```typescript
export function prepProceduresOrderPostData(formData: ProceduresOrderFormData, sessionInfo: SessionInfo) {
  return {
    // ... other fields
    numberOfRepeats: formData.numberOfRepeats ? parseInt(formData.numberOfRepeats, 10) : undefined,
    // ... rest of payload
  };
}
```

**Steps:**
1. Add type conversion in `prepProceduresOrderPostData`
2. Add validation to ensure positive integer
3. Test with various inputs

#### 3.2 Add Missing Fields

**A. Clinical History to Procedure Orders**

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

```typescript
// Add to form schema
clinicalHistory: z.string().optional(),

// Add to form UI
<TextArea
  label={t('clinicalHistory', 'Clinical History')}
  value={formData.clinicalHistory}
  onChange={(event) => handleChange('clinicalHistory', event.target.value)}
  maxLength={1000}
/>
```

**B. Specimen Type and Source**

**File:** `packages/esm-procedure-orders-app/src/form/procedures-orders/add-procedures-order/procedures-order-form.component.tsx`

```typescript
// Add to form schema
specimenType: z.string().optional(),
specimenSource: z.string().optional(),

// Add to form UI (conditional on procedure type requiring specimens)
<ConceptSearch
  label={t('specimenType', 'Specimen Type')}
  conceptClassUuid="specimen-concept-class-uuid"
  onChange={(concept) => handleChange('specimenType', concept?.uuid)}
/>
```

**C. Medical Supplies Inventory ID**

**File:** `packages/esm-medical-supply-order-app/src/form/add-medical-supply-order/medical-supply-order/medical-supply-form.component.tsx`

```typescript
// This may require inventory lookup functionality
medicalSuppliesInventoryId: z.string().optional(),

// Add inventory reference if available from concept
```

#### 3.3 Rollback Procedure for Phase 3

1. Remove new form fields
2. Remove type conversions
3. Restore previous form schemas

---

### Phase 4: Low Priority Improvements - Week 4

#### 4.1 Capture Location in Order Forms

**Add location selector (optional, defaults to session location):**

```typescript
// Form can include optional location override
location: z.string().optional(),
```

#### 4.2 Add Frequency to Imaging Orders

**File:** `packages/esm-imaging-orders-app/src/form/imaging-orders/add-imaging-orders/imaging-order-form.component.tsx`

```typescript
frequency: z.string().optional(),
```

#### 4.3 Related Procedure Reference

**Add optional related procedure UUID field:**

```typescript
relatedProcedure: z.string().optional(),
```

#### 4.4 Backend Validation Annotations

**File:** `openmrs-module-orderexpansion/api/src/main/java/org/openmrs/module/orderexpansion/api/model/ProcedureOrder.java`

```java
@Min(value = 1, message = "Number of repeats must be positive")
private Integer numberOfRepeats;

@Size(max = 2000, message = "Clinical history too long")
private String clinicalHistory;
```

---

### Phase 5: Testing and Verification - Ongoing

#### 5.1 Unit Tests

**Backend:**
```java
@Test
public void testProcedureOrderUuidCorrectness() {
    assertEquals("b4a7c280-369e-4d12-9ce8-18e36783fed6", OrderResource2_3.PROCEDURE_ORDER_UUID);
}

@Test
public void testMedicalSupplyOrderUuidCorrectness() {
    assertEquals("4237a01f-29c5-4167-9d8e-96d6e590aa33", OrderResource2_3.MEDICAL_SUPPLY_ORDER_UUID);
}
```

**Frontend:**
```typescript
describe('Medical Supply Order Config', () => {
  it('should use correct order type UUID', () => {
    const config = configSchema.parse({
      medicalSupplyOrderTypeUuid: '4237a01f-29c5-4167-9d8e-96d6e590aa33'
    });
    expect(config.medicalSupplyOrderTypeUuid).toBe('4237a01f-29c5-4167-9d8e-96d6e590aa33');
  });
});
```

#### 5.2 Integration Tests

**Test Scenarios:**
1. Submit imaging order → Verify database record has correct order_type_id
2. Submit procedure order → Verify `numberOfRepeats` stored as Integer
3. Submit medical supply order → Verify custom fields persisted
4. Submit procedure result → Verify status/outcome stored as Concept UUIDs
5. Dispense medical supply → Verify all fields captured

#### 5.3 Manual Testing Checklist

- [ ] Imaging order submission
- [ ] Procedure order submission
- [ ] Medical supply order submission
- [ ] Procedure result submission
- [ ] Medical supply dispensing
- [ ] Order basket functionality
- [ ] Order display in patient dashboard
- [ ] Order modification/discontinuation

#### 5.4 Data Migration (if needed)

**If migrating from wrong order type:**

```sql
-- Migrate medical supply orders from wrong type to correct type
UPDATE orders 
SET order_type_id = 5,  -- Correct Medical Supply Order
    changed_by = 1,
    date_changed = NOW()
WHERE order_type_id = 6  -- Wrong "Medical Supplies Order"
  AND voided = 0;

-- Verify migration
SELECT order_type_id, COUNT(*) 
FROM orders 
WHERE order_type_id IN (5, 6)
GROUP BY order_type_id;
```

---

### Phase 6: Documentation - Week 5

#### 6.1 Update Technical Documentation

1. Create field mapping reference document
2. Document all enum → Concept UUID mappings
3. Add API documentation examples
4. Update troubleshooting guide

#### 6.2 Create Migration Guide

If upgrading from previous version:
1. Document UUID changes
2. Provide data migration scripts
3. List configuration changes needed

---

## 10. Implementation Timeline

| Phase | Duration | Dependencies | Deliverables |
|-------|----------|--------------|--------------|
| **Phase 1: Critical Fixes** | Week 1 | None | Backend/fixed UUIDs, Frontend UUID fix |
| **Phase 2: High Priority** | Week 2 | Phase 1 complete | Field naming, Concept mappings |
| **Phase 3: Medium Priority** | Week 3 | Phase 2 complete | Type conversions, Missing fields |
| **Phase 4: Low Priority** | Week 4 | Phase 3 complete | Optional fields, Validation |
| **Phase 5: Testing** | Ongoing | Each phase | Test coverage, Verification |
| **Phase 6: Documentation** | Week 5 | All phases complete | Updated docs, Migration guide |

---

## 11. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing orders | Medium | High | Comprehensive testing, Rollback procedures |
| Database migration issues | Low | High | Pre-migration backup, Test on staging |
| Frontend-backend mismatch | Medium | Medium | Integration tests, API contract tests |
| Configuration conflicts | Low | Medium | Document all config changes |
| Enum mapping errors | Low | Medium | Verify UUIDs before deployment |

---

## 12. Success Criteria

- [ ] All critical UUID issues resolved
- [ ] All order forms using correct order types
- [ ] Field naming consistent across frontend/backend
- [ ] Type conversions implemented
- [ ] Missing fields added to forms
- [ ] All tests passing (unit, integration, manual)
- [ ] Documentation updated
- [ ] No data loss from migrations
