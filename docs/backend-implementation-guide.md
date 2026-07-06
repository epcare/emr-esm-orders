# Backend Implementation Guide

**Module:** openmrs-module-orderexpansion  
**Target Version:** Based on analysis as of 2026-07-03  
**Complexity:** Medium  
**Estimated Time:** 2-3 days

---

## Overview

This guide provides step-by-step instructions to fix critical and high-priority issues in the orderexpansion backend module.

### Issues to Fix

| Priority | Issue | File | Impact |
|----------|-------|------|--------|
| CRITICAL | Wrong UUIDs in OrderResource2_3.java | OrderResource2_3.java | Orders routed to wrong classes |
| HIGH | Field naming: commentToFulfiller | Multiple | Potential data loss |
| MEDIUM | Missing validation annotations | Model classes | Invalid data may persist |

---

## Prerequisites

- Java 8+
- Maven 3.x
- Access to OpenMRS source code
- Database access for testing
- Git for version control

---

## Phase 1: Critical UUID Fix

### 1.1 Understanding the Problem

The database contains these order types:

| order_type_id | Name | UUID | Java Class |
|---------------|------|------|------------|
| 4 | Procedure Order | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | ProcedureOrder |
| 5 | Medical Supply Order | `4237a01f-29c5-4167-9d8e-96d6e590aa33` | MedicalSupplyOrder |
| 6 | Medical Supplies Order | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | Order (duplicate) |

The `OrderResource2_3.java` file currently has **incorrect** UUIDs.

### 1.2 Locate the File

```
openmrs-module-orderexpansion/
└── omod/
    └── src/
        └── main/
            └── java/
                └── org/
                    └── openmrs/
                        └── module/
                            └── orderexpansion/
                                └── web/
                                    └── resources/
                                        └── OrderResource2_3.java
```

### 1.3 Make the Changes

**Step 1:** Open `OrderResource2_3.java`

**Step 2:** Find the UUID constants (likely near the top of the class):

```java
// CURRENT (WRONG):
private static final String PROCEDURE_ORDER_UUID = "4237a01f-29c5-4d12-9ce8-18e36783fed6";
private static final String MEDICAL_SUPPLY_ORDER_UUID = "dab3ab30-2feb-48ec-b4af-8332a0831b49";
```

**Step 3:** Replace with correct values:

```java
/**
 * UUID for Procedure Order type from database order_type_id=4
 * Matches database: b4a7c280-369e-4d12-9ce8-18e36783fed6
 */
private static final String PROCEDURE_ORDER_UUID = "b4a7c280-369e-4d12-9ce8-18e36783fed6";

/**
 * UUID for Medical Supply Order type from database order_type_id=5
 * Matches database: 4237a01f-29c5-4167-9d8e-96d6e590aa33
 */
private static final String MEDICAL_SUPPLY_ORDER_UUID = "4237a01f-29c5-4167-9d8e-96d6e590aa33";
```

**Step 4:** Search for any other references to these UUIDs in the file and update if found.

**Step 5:** Save the file.

### 1.4 Verify Consistency

Check that `EnhanceOrderContextForCustomTypesAdvice.java` has the same UUIDs:

```bash
grep -n "b4a7c280-369e-4d12-9ce8-18e36783fed6" api/src/main/java/org/openmrs/module/orderexpansion/advice/EnhanceOrderContextForCustomTypesAdvice.java
grep -n "4237a01f-29c5-4167-9d8e-96d6e590aa33" api/src/main/java/org/openmrs/module/orderexpansion/advice/EnhanceOrderContextForCustomTypesAdvice.java
```

Both files should now have matching UUIDs.

---

## Phase 2: Field Naming Standardization

### 2.1 Standardize to `commentToFulfiller`

The backend uses `commentToFulfiller` (single word). Ensure consistency across all handlers.

**Files to check:**
- `ProcedureOrderSubclassHandler.java`
- `MedicalSupplyOrderSubclassHandler.java`
- Any other resource handlers

**Step 1:** Open each handler file

**Step 2:** Verify the creatable properties include:

```java
@Override
public Set<String> getCreatableProperties() {
    return new HashSet<>(Arrays.asList(
        "concept",
        "urgency",
        "commentToFulfiller",  // Verify this spelling
        "instructions",
        // ... other properties
    ));
}
```

**Step 3:** If any use `commentsToFulfiller`, update to `commentToFulfiller`.

---

## Phase 3: Add Validation Annotations

### 3.1 ProcedureOrder Model

**File:** `api/src/main/java/org/openmrs/module/orderexpansion/api/model/ProcedureOrder.java`

Add validation annotations:

```java
import javax.validation.constraints.Min;
import javax.validation.constraints.Size;
import org.hibernate.validator.constraints.NotEmpty;
import org.openmrs.customdatatype.ValidationError;

public class ProcedureOrder extends ServiceOrder {
    
    @Size(max = 2000, message = "Clinical history exceeds maximum length of 2000 characters")
    private String clinicalHistory;
    
    @Min(value = 1, message = "Number of repeats must be at least 1")
    private Integer numberOfRepeats;
    
    // Ensure UUID references are valid
    // This is handled by OpenMRS core for Concept references
    
    // ... existing fields
}
```

### 3.2 MedicalSupplyOrder Model

**File:** `api/src/main/java/org/openmrs/module/orderexpansion/api/model/MedicalSupplyOrder.java`

```java
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;

public class MedicalSupplyOrder extends ServiceOrder {
    
    @NotNull(message = "Quantity is required for medical supply orders")
    @DecimalMin(value = "0.1", message = "Quantity must be greater than 0")
    private Double quantity;
    
    @Size(max = 100, message = "Brand name exceeds maximum length of 100 characters")
    private String brandName;
    
    // ... existing fields
}
```

### 3.3 MedicalSupplyDispense Model

**File:** `api/src/main/java/org/openmrs/module/orderexpansion/api/model/MedicalSupplyDispense.java`

```java
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.NotNull;
import org.openmrs.customdatatype.ValidationError;
import java.util.Date;

public class MedicalSupplyDispense extends BaseFormRecordableOpenmrsData {
    
    @NotNull(message = "Patient is required")
    private Patient patient;
    
    @NotNull(message = "Quantity is required for dispensing")
    @DecimalMin(value = "0.1", message = "Quantity must be greater than 0")
    private Double quantity;
    
    @NotNull(message = "Date dispensed is required")
    private Date dateDispensed;
    
    // ... existing fields
}
```

---

## Phase 4: Testing

### 4.1 Unit Tests

Create or update test class: `OrderResource2_3Test.java`

```java
package org.openmrs.module.orderexpansion.web.resources;

import org.junit.Test;
import static org.junit.Assert.*;

public class OrderResource2_3Test {
    
    @Test
    public void testProcedureOrderUuidCorrectness() {
        // Verify the UUID matches database order_type_id=4
        assertEquals("b4a7c280-369e-4d12-9ce8-18e36783fed6", 
                     OrderResource2_3.PROCEDURE_ORDER_UUID);
    }
    
    @Test
    public void testMedicalSupplyOrderUuidCorrectness() {
        // Verify the UUID matches database order_type_id=5
        assertEquals("4237a01f-29c5-4167-9d8e-96d6e590aa33", 
                     OrderResource2_3.MEDICAL_SUPPLY_ORDER_UUID);
    }
    
    @Test
    public void testProcedureOrderUuidNotWrong() {
        // Verify we're NOT using the wrong UUIDs
        assertNotEquals("4237a01f-29c5-4d12-9ce8-18e36783fed6", 
                        OrderResource2_3.PROCEDURE_ORDER_UUID);
        assertNotEquals("dab3ab30-2feb-48ec-b4af-8332a0831b49", 
                        OrderResource2_3.MEDICAL_SUPPLY_ORDER_UUID);
    }
}
```

### 4.2 Integration Tests

**Test Procedure Order Creation:**

```bash
# Create a procedure order via REST API
curl -X POST http://localhost:8080/openmrs/ws/rest/v1/order \
  -H "Content-Type: application/json" \
  -d '{
    "type": "procedureorder",
    "patient": "patient-uuid",
    "concept": "concept-uuid",
    "urgency": "ROUTINE",
    "commentToFulfiller": "Test comment"
  }'

# Verify response includes correct order type
# Check database for correct order_type_id
```

**Test Medical Supply Order Creation:**

```bash
# Create a medical supply order
curl -X POST http://localhost:8080/openmrs/ws/rest/v1/order \
  -H "Content-Type: application/json" \
  -d '{
    "type": "medicalsupplyorder",
    "patient": "patient-uuid",
    "concept": "concept-uuid",
    "quantity": 10.0,
    "quantityUnits": "units-uuid"
  }'

# Verify custom fields are persisted
```

### 4.3 Database Verification

After deployment, verify with database queries:

```sql
-- Check procedure orders use correct type
SELECT o.order_id, o.order_type_id, ot.uuid, ot.java_class_name
FROM orders o
JOIN order_type ot ON o.order_type_id = ot.order_type_id
WHERE ot.uuid = 'b4a7c280-369e-4d12-9ce8-18e36783fed6'
LIMIT 10;

-- Check medical supply orders use correct type
SELECT o.order_id, o.order_type_id, ot.uuid, ot.java_class_name
FROM orders o
JOIN order_type ot ON o.order_type_id = ot.order_type_id
WHERE ot.uuid = '4237a01f-29c5-4167-9d8e-96d6e590aa33'
LIMIT 10;

-- Verify custom fields are persisted
SELECT quantity, quantity_units, brand_name
FROM medical_supplies_order
WHERE voided = 0
LIMIT 10;
```

---

## Phase 5: Build and Deploy

### 5.1 Build the Module

```bash
cd openmrs-module-orderexpansion
mvn clean install
```

### 5.2 Deploy to Test Environment

```bash
# Copy the omod file to OpenMRS modules directory
cp target/orderexpansion-*.omod /path/to/openmrs/modules/

# Restart OpenMRS
```

### 5.3 Verify Module Loading

```bash
# Check OpenMRS logs for successful module loading
tail -f /path/to/openmrs/logs/openmrs.log | grep -i orderexpansion
```

---

## Rollback Procedure

If issues arise after deployment:

### Option 1: Revert Code Changes

```bash
# Revert the commit
git revert <commit-hash>
mvn clean install
```

### Option 2: Hotfix in Production

If immediate rollback needed:

1. Restore the previous UUIDs in `OrderResource2_3.java`
2. Rebuild and redeploy
3. Verify orders are being processed correctly

### Option 3: Database Verification

If data migration was needed:

```sql
-- Check for any orders created with wrong types
SELECT order_id, order_type_id, date_created
FROM orders
WHERE date_created >= 'deployment-date'
ORDER BY date_created DESC;

-- If issues found, data migration script may be needed
```

---

## Verification Checklist

After implementation, verify:

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing of procedure orders successful
- [ ] Manual testing of medical supply orders successful
- [ ] Database shows correct order_type_id for new orders
- [ ] Custom fields persisted correctly
- [ ] No errors in OpenMRS logs
- [ ] Module loads successfully
- [ ] Documentation updated

---

## Next Steps

After backend fixes are complete:

1. Coordinate with frontend team to sync changes
2. Update API documentation
3. Create release notes
4. Schedule production deployment

---

## Contact

For questions or issues during implementation:
- Tech Lead: [Contact info]
- Code Reviewer: [Contact info]
- Database Administrator: [Contact info]

---

**Document Version:** 1.0  
**Last Updated:** 2026-07-03
