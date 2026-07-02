# Backend Integration: Custom Order Types (Procedure & Medical Supply)

## Overview

The **emr-esm-orders** frontend application expects to save Procedure Orders and Medical Supply Orders to the OpenMRS backend. This document analyzes the integration requirements and provides recommendations for handling these custom order types.

## Current State

### Frontend Order Types

| App | Order Type | Type Field | Order Type UUID |
|-----|------------|------------|-----------------|
| esm-procedure-orders-app | `procedureorder` | `b4a7c280-369e-4d12-9ce8-18e36783fed6` | Procedure Order |
| esm-medical-supply-order-app | `medicalsupplyorder` | `dab3ab30-2feb-48ec-b4af-8332a0831b49` | Medical Supplies Order |
| esm-imaging-orders-app | Imaging/Test Orders | `52a447d3-a64a-11e3-9aeb-50e549534c5e` | Test Order |

### Frontend API Payloads

**Procedure Order (POST to `/ws/rest/v1/order`)**:
```json
{
  "action": "NEW",
  "type": "procedureorder",
  "patient": "patient-uuid",
  "careSetting": "6f0c9a92-6f24-11e3-af88-005056821db0",
  "orderer": "provider-uuid",
  "encounter": "encounter-uuid",
  "concept": "procedure-concept-uuid",
  "frequency": "frequency-uuid",
  "numberOfRepeats": "3",
  "urgency": "ROUTINE",
  "commentToFulfiller": "Comments here",
  "instructions": "Instructions here",
  "orderReason": "reason-concept-uuid",
  "orderReasonNonCoded": "Non-coded reason",
  "bodySite": "body-site-concept-uuid",
  "scheduledDate": "2025-06-25"  // if urgency is ON_SCHEDULED_DATE
}
```

**Medical Supply Order (POST to `/ws/rest/v1/order`)**:
```json
{
  "action": "NEW",
  "type": "medicalsupplyorder",
  "patient": "patient-uuid",
  "careSetting": "6f0c9a92-6f24-11e3-af88-005056821db0",
  "orderer": "provider-uuid",
  "encounter": "encounter-uuid",
  "concept": "supply-concept-uuid",
  "instructions": "Instructions here",
  "urgency": "ROUTINE",
  "quantity": 10,
  "quantityUnits": "units-concept-uuid",
  "brandName": "Brand name"
}
```

## Backend Requirements

### 1. Order Type Registration

The backend must have the order types defined in the `order_type` table:

```sql
-- Verify these exist
SELECT order_type_id, name, uuid, java_class_name 
FROM order_type 
WHERE name IN ('Procedure Order', 'Medical Supplies Order');
```

Expected results:
- `Procedure Order`: UUID `b4a7c280-369e-4d12-9ce8-18e36783fed6`, class `org.openmrs.module.orderexpansion.api.model.ProcedureOrder`
- `Medical Supplies Order`: UUID `dab3ab30-2feb-48ec-b4af-8332a0831b49`, class `org.openmrs.module.orderexpansion.api.model.MedicalSupplyOrder`

### 2. Order Class Implementation

The `java_class_name` in the `order_type` table must point to valid classes that:

1. **Extend `org.openmrs.Order`** (or a subclass like `TestOrder`)
2. **Implement order-specific properties** as fields
3. **Include proper Hibernate mapping**

### 3. REST API Resource Registration

The OpenMRS REST API must be able to handle these order types. The REST module uses the `java_class_name` from `order_type` to instantiate the correct Order subclass.

## Integration Challenges & Solutions

### Challenge 1: Unknown Order Type Handling

**Problem**: If the `java_class_name` points to a class that doesn't exist or isn't loaded, the REST API will throw an error when trying to save the order.

**Solutions**:

#### Option A: Use Generic Order (Recommended for Quick Setup)

If the custom order module (`orderexpansion`) is not available, configure these order types to use `org.openmrs.Order`:

```sql
-- Update to use generic Order class temporarily
UPDATE order_type 
SET java_class_name = 'org.openmrs.Order'
WHERE name IN ('Procedure Order', 'Medical Supplies Order');

-- This allows orders to be saved but without type-specific properties
-- Custom fields (quantity, bodySite, etc.) will be ignored
```

**Pros**:
- Orders can be saved immediately
- No module dependency
- Works with core OpenMRS

**Cons**:
- Type-specific properties (quantity, bodySite, etc.) are lost
- Orders appear as generic orders
- No validation for type-specific fields

#### Option B: Create Lightweight Order Subclasses

Create minimal order subclasses in a custom module:

```java
// org.openmrs.module.customorders/api/src/main/java/...
package org.openmrs.module.customorders.model;

public class ProcedureOrder extends TestOrder {
    // TestOrder already extends Order with concept-based testing
    // Procedure-specific fields can be added as needed
    
    private String bodySite;
    private Integer numberOfRepeats;
    
    // Getters and setters
}

public class MedicalSupplyOrder extends Order {
    private Double quantity;
    private Concept quantityUnits;
    private String brandName;
    
    // Getters and setters
}
```

**Hibernate Mapping** (`CustomOrders.hbm.xml`):
```xml
<?xml version="1.0"?>
<!DOCTYPE hibernate-mapping PUBLIC
    "-//Hibernate/Hibernate Mapping DTD 3.0//EN"
    "http://hibernate.sourceforge.net/hibernate-mapping-3.0.dtd">

<hibernate-mapping package="org.openmrs.module.customorders.model">
    <class name="ProcedureOrder" extends="org.openmrs.TestOrder" table="procedure_order">
        <key column="order_id"/>
        <property name="bodySite" type="string" column="body_site"/>
        <property name="numberOfRepeats" type="integer" column="number_of_repeats"/>
    </class>
    
    <class name="MedicalSupplyOrder" extends="org.openmrs.Order" table="medical_supply_order">
        <key column="order_id"/>
        <property name="quantity" type="double" column="quantity"/>
        <property name="brandName" type="string" column="brand_name"/>
        <many-to-one name="quantityUnits" column="quantity_units" class="org.openmrs.Concept"/>
    </class>
</hibernate-mapping>
```

**Database Tables** (via Liquibase):
```xml
<createTable tableName="procedure_order">
    <column name="order_id" type="int">
        <constraints nullable="false" primaryKey="true" foreignKeyName="procedure_order_order_fk" referencedTableName="orders" referencedColumnNames="order_id"/>
    </column>
    <column name="body_site" type="varchar(255)"/>
    <column name="number_of_repeats" type="int"/>
</createTable>

<createTable tableName="medical_supply_order">
    <column name="order_id" type="int">
        <constraints nullable="false" primaryKey="true" foreignKeyName="medical_supply_order_order_fk" referencedTableName="orders" referencedColumnNames="order_id"/>
    </column>
    <column name="quantity" type="double"/>
    <column name="brand_name" type="varchar(255)"/>
    <column name="quantity_units" type="int" foreignKeyName="medical_supply_order_concept_fk" referencedTableName="concept" referencedColumnNames="concept_id"/>
</createTable>
```

**Pros**:
- Custom properties are preserved
- Type-specific validation possible
- Can be extended with additional functionality

**Cons**:
- Requires custom module development
- Additional database tables
- Migration path needed if switching to another module

#### Option C: Use OrderExtension Module Pattern

Extend the `orderextension` module pattern for Procedure and Supply orders:

```java
public class ExtendedProcedureOrderSet extends OrderSet {
    private boolean cyclical;
    private Integer cycleLengthInDays;
    // Similar to DrugOrderSet but for procedures
}

public class ProcedureRegimen extends OrderGroup {
    private Integer cycleNumber;
    // Groups procedure orders into regimens
}
```

**Pros**:
- Consistent with existing drug order pattern
- Supports cyclical procedures (e.g., dialysis)
- Leverages existing infrastructure

**Cons**:
- Significant development effort
- May be overkill if cyclical procedures aren't needed

### Challenge 2: REST API Handling of Custom Fields

**Problem**: The REST API's OrderResource may not know how to map custom fields from the JSON payload to the Order object.

**Solution**: Create a custom REST resource in your module:

```java
package org.openmrs.module.customorders.rest.resource;

import org.openmrs.module.customorders.model.ProcedureOrder;
import org.openmrs.module.webservices.rest.web.resource.impl.BaseOrderResource;
import org.openmrs.module.webservices.rest.web.RestConstants;
import org.springframework.stereotype.Component;

@Component
@Resource(name = RestConstants.VERSION_1 + "/procedureorder", supportedClass = ProcedureOrder.class, supportedOpenmrsVersions = {"2.0.*", "2.1.*", "2.2.*"})
public class ProcedureOrderResource extends BaseOrderResource<ProcedureOrder> {
    @Override
    public ProcedureOrder newDelegate() {
        return new ProcedureOrder();
    }
    
    @Override
    public Class<? extends Order> getRepresenterClass() {
        return ProcedureOrder.class;
    }
    
    // Custom property handling in delegate...
}
```

Register in your module's `config.xml`:
```xml
<extension>
    <point>org.openmrs.module.webservices.rest.resource</point>
    <class>org.openmrs.module.customorders.rest.resource.ProcedureOrderResource</class>
</extension>
```

## Recommended Approach

Given the need for Procedure and Medical Supply orders, here's the recommended approach:

### Phase 1: Quick Fix (Immediate)

1. **Update order types to use `org.openmrs.Order`**:
   ```sql
   UPDATE order_type 
   SET java_class_name = 'org.openmrs.Order'
   WHERE uuid IN ('b4a7c280-369e-4d12-9ce8-18e36783fed6', 'dab3ab30-2feb-48ec-b4af-8332a0831b49');
   ```

2. **This allows orders to be saved**, but custom fields are ignored

3. **Document limitation**: Custom properties not stored

### Phase 2: Proper Implementation (Short-term)

1. **Create a `custom-orders` module** with:
   - `ProcedureOrder` extending `TestOrder`
   - `MedicalSupplyOrder` extending `Order`
   - Hibernate mappings for custom fields
   - Database tables for type-specific data

2. **Register with REST API** via custom resources

3. **Update order types**:
   ```sql
   UPDATE order_type 
   SET java_class_name = 'org.openmrs.module.customorders.model.ProcedureOrder'
   WHERE uuid = 'b4a7c280-369e-4d12-9ce8-18e36783fed6';
   
   UPDATE order_type 
   SET java_class_name = 'org.openmrs.module.customorders.model.MedicalSupplyOrder'
   WHERE uuid = 'dab3ab30-2feb-48ec-b4af-8332a0831b49';
   ```

### Phase 3: Full Integration (Long-term)

1. **Evaluate `orderexpansion` module**:
   - If available and maintained, use it
   - If not, consider merging its functionality into `custom-orders`

2. **Add support for**:
   - Order sets for procedures/supplies
   - Order groups (regimens) for cyclical procedures
   - Custom validation rules
   - Printing/Reporting

## Verification Steps

### 1. Verify Order Types

```sql
SELECT order_type_id, name, uuid, java_class_name 
FROM order_type 
WHERE uuid IN ('b4a7c280-369e-4d12-9ce8-18e36783fed6', 'dab3ab30-2feb-48ec-b4af-8332a0831b49');
```

### 2. Test Order Creation

```bash
# Test Procedure Order
curl -X POST http://localhost:8080/openmrs/ws/rest/v1/order \
  -H "Content-Type: application/json" \
  -u admin:Admin123 \
  -d '{
    "action": "NEW",
    "type": "procedureorder",
    "patient": "patient-uuid",
    "careSetting": "6f0c9a92-6f24-11e3-af88-005056821db0",
    "orderer": "provider-uuid",
    "encounter": "encounter-uuid",
    "concept": "procedure-concept-uuid",
    "urgency": "ROUTINE"
  }'

# Test Medical Supply Order
curl -X POST http://localhost:8080/openmrs/ws/rest/v1/order \
  -H "Content-Type: application/json" \
  -u admin:Admin123 \
  -d '{
    "action": "NEW",
    "type": "medicalsupplyorder",
    "patient": "patient-uuid",
    "careSetting": "6f0c9a92-6f24-11e3-af88-005056821db0",
    "orderer": "provider-uuid",
    "encounter": "encounter-uuid",
    "concept": "supply-concept-uuid",
    "urgency": "ROUTINE",
    "quantity": 10
  }'
```

### 3. Check Logs

Look for errors in:
- OpenMRS application log (`openmrs.log`)
- REST module log (`webservices.rest.log`)

Common errors:
- `ClassNotFoundException`: The `java_class_name` class doesn't exist
- `IllegalArgumentException`: Order type unknown
- `NullPointerException`: Custom field mapping failed

## Frontend Configuration

Ensure the ESM apps are configured with correct UUIDs:

**Procedure Orders (`esm-procedure-orders-app`)**:
```json
{
  "procedureOrderTypeUuid": "b4a7c280-369e-4d12-9ce8-18e36783fed6"
}
```

**Medical Supply Orders (`esm-medical-supply-order-app`)**:
```json
{
  "orders": {
    "medicalSupplyOrderTypeUuid": "dab3ab30-2feb-48ec-b4af-8332a0831b49"
  }
}
```

## Summary

| Approach | Effort | Custom Fields | Risk | Recommendation |
|----------|--------|---------------|------|----------------|
| Generic Order (Phase 1) | Low | ❌ Lost | Low | **Immediate fix only** |
| Custom Module (Phase 2) | Medium | ✅ Preserved | Medium | **Recommended** |
| Full Integration (Phase 3) | High | ✅ + Advanced | High | **Long-term goal** |

**For immediate functionality**: Use Phase 1 to allow orders to be saved while developing Phase 2.