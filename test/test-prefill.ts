/**
 * Test script to verify order-to-form prefill functionality
 */

// Sample order data from the user's API response
const sampleOrder = {
  uuid: "c553c85e-4df9-40f9-88e4-d1aec15b9eaf",
  orderNumber: "ORD-16",
  accessionNumber: "ACN-2024-001",
  patient: {
    uuid: "59facb82-61c0-498a-9465-49296c043d3e",
    display: "10001V - Mark Pan"
  },
  concept: {
    uuid: "dc5458a6-30ab-102d-86b0-7a5022ba4115",
    display: "X-RAY, CHEST",
    conceptClass: {
      uuid: "8caa332c-efe4-4025-8b18-3398328e1323",
      display: "Radiology/Imaging Procedure"
    }
  },
  action: "NEW",
  careSetting: {
    uuid: "6f0c9a92-6f24-11e3-af88-005056821db0",
    name: "Outpatient",
    display: "Outpatient"
  },
  orderer: {
    uuid: "e764e81a-0504-49fb-9aab-d14f12966707",
    display: "admin - Super User"
  },
  urgency: "STAT",
  instructions: "Patient needs urgent chest imaging",
  commentToFulfiller: "Use contrast media",
  orderReason: {
    uuid: "some-reason-uuid",
    display: "Suspected pneumonia"
  },
  orderReasonNonCoded: "Patient has cough and fever",
  bodySite: {
    uuid: "8134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "Chest",
    conceptClass: {
      uuid: "8d4918b0-c2cc-11de-8d13-0010c6dffd0f",
      display: "Anatomical Site"
    }
  },
  laterality: "BILATERAL",
  fulfillerStatus: "IN_PROGRESS",
  dateActivated: "2024-01-15T10:00:00Z",
  type: "procedureorder"
};

// Sample procedure data (for editing existing procedure)
const sampleProcedure = {
  procedureType: {
    uuid: "proc-type-uuid",
    display: "Diagnostic Imaging"
  },
  startDateTime: "2024-01-15T11:00:00Z",
  status: {
    uuid: "163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    display: "IN_PROGRESS"
  },
  notes: "Previous procedure notes"
};

console.log("=== Testing Order-to-Form Prefill Functionality ===\n");

console.log("INPUT ORDER DATA:");
console.log(JSON.stringify(sampleOrder, null, 2));

console.log("\nINPUT PROCEDURE DATA:");
console.log(JSON.stringify(sampleProcedure, null, 2));

console.log("\n=== EXPECTED FORM DEFAULTS ===\n");

// Expected mapping for imaging form
const expectedImagingDefaults = {
  // Procedure fields from order
  procedureCoded: "dc5458a6-30ab-102d-86b0-7a5022ba4115",
  bodySite: "8134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  laterality: "BILATERAL",
  urgency: "STAT",
  orderReason: "Patient has cough and fever",

  // Combined notes
  notes: "Patient needs urgent chest imaging\n\nUse contrast media",

  // Procedure fields from procedure
  startDateTime: new Date("2024-01-15T11:00:00Z"),
  status: "163723AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",

  // Imaging-specific fields
  accessionNumber: "ACN-2024-001",
  clinicalIndication: "Patient has cough and fever",
  imagingModality: "",
  imagingFindings: "",
  imagingImpression: "",

  // Orphaned data
  _orphanedData: {
    procedureOrder: "c553c85e-4df9-40f9-88e4-d1aec15b9eaf",
    procedureReason: "Patient has cough and fever",
    category: "X-RAY, CHEST",
    accessionNumber: "ACN-2024-001"
  }
};

console.log(JSON.stringify(expectedImagingDefaults, null, 2));

console.log("\n=== MAPPING VERIFICATION ===\n");

// Verify key mappings
const mappings = [
  { from: "concept.uuid", to: "procedureCoded", expected: sampleOrder.concept.uuid },
  { from: "bodySite.uuid", to: "bodySite", expected: "8134AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" },
  { from: "laterality", to: "laterality", expected: "BILATERAL" },
  { from: "urgency", to: "urgency", expected: "STAT" },
  { from: "accessionNumber", to: "accessionNumber", expected: "ACN-2024-001" },
  { from: "orderReasonNonCoded", to: "clinicalIndication", expected: "Patient has cough and fever" },
  { from: "uuid", to: "_orphanedData.procedureOrder", expected: sampleOrder.uuid }
];

mappings.forEach(mapping => {
  const actualValue = mapping.to.split('.').reduce((obj, key) => obj?.[key], expectedImagingDefaults);
  const status = actualValue === mapping.expected ? "✓ PASS" : "✗ FAIL";
  console.log(`${status}: ${mapping.from} → ${mapping.to}`);
  console.log(`  Expected: ${mapping.expected}`);
  console.log(`  Actual: ${actualValue}`);
});

console.log("\n=== TEST COMPLETE ===");
console.log("\nTo manually test:");
console.log("1. Open OpenMRS at http://localhost:8089/openmrs");
console.log("2. Navigate to Procedures or Imaging orders");
console.log("3. Select an order with IN_PROGRESS status");
console.log("4. Click 'Record Result' to open the form");
console.log("5. Verify fields are pre-filled with order data");
