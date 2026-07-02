---
name: workspace-v2-migration
description: Workspace v2 migration pattern for OpenMRS
metadata:
  type: reference
  project: esm-orders
---

# Workspace v2 Migration Pattern

## Changes Made

### 1. ImagingReportForm Component Migration

**File**: `packages/esm-imaging-orders-app/src/form/imaging-report-form/imaging-report-form.component.tsx`

**Key Changes**:
- Replaced `DefaultWorkspaceProps` with `Workspace2DefinitionProps<ImagingReportFormWorkspaceProps>`
- Added `useWorkspace2Context()` hook to access workspace functions and props
- Moved `patientUuid` and `order` from direct props to `workspaceProps`
- Replaced `closeWorkspaceWithSavedChanges()` with `closeWorkspace({ discardUnsavedChanges: true })`
- Removed `promptBeforeClosing` (handled automatically by Workspace v2)
- Added defensive loading check for when `workspaceProps` is undefined

### 2. ImagingReviewForm Component Migration

**File**: `packages/esm-imaging-orders-app/src/form/review-form/review-imaging-form.workspace.tsx`

**Key Changes**:
- Updated imports to include `useWorkspace2Context` and `Workspace2DefinitionProps`
- Replaced direct props with `useWorkspace2Context()` hook
- Changed `closeWorkspace()` to `closeWorkspace({ discardUnsavedChanges: true })` on successful submit
- Updated cancel button to call `closeWorkspace()` as a function
- Added defensive loading check

## API Differences

### Old (Workspace v1)
```typescript
type Props = DefaultWorkspaceProps & {
  patientUuid: string;
  order: Result;
};

// Passed as props
closeWorkspace() // void function
closeWorkspaceWithSavedChanges() // void function
promptBeforeClosing(testFcn) // void function
```

### New (Workspace v2)
```typescript
type Props = Workspace2DefinitionProps<{ patientUuid: string; order: Result }>;

// Access via useWorkspace2Context()
const { workspaceProps, closeWorkspace } = useWorkspace2Context();
const { patientUuid, order } = workspaceProps;

closeWorkspace({ discardUnsavedChanges: true }) // returns Promise<boolean>
// promptBeforeClosing is automatic based on form dirty state
```

## Launching Workspaces

The `launchWorkspace2` function takes 4 parameters:
```typescript
launchWorkspace2(
  workspaceName: string,
  workspaceProps: WorkspaceProps | null,  // Specific to this workspace
  windowProps: WindowProps | null,        // Shared by all workspaces in the window
  groupProps: GroupProps | null,          // Shared by all windows in the group
)
```

### Key Insight: Using `null` for Props

**IMPORTANT**: When you pass `null` for `windowProps` or `groupProps`, you're telling the system "I don't care about window/group context compatibility." This means:

- Your workspace won't force-close other workspaces in the same window due to prop mismatches
- The `arePropsCompatible` function treats `null` as compatible with everything:
```typescript
function arePropsCompatible(a, b) {
  if (a == null || b == null) {
    return true;  // null is compatible with everything!
  }
  return shallowEqual(a, b);
}
```

### When to Use `null` vs. Passing Props

**Use `null` for windowProps when:**
- Your workspace doesn't need to share context with the order basket/visit notes
- You want to avoid prop compatibility conflicts with existing workspaces
- Your workspace is independent (like imaging report/review forms)

**Pass windowProps when:**
- Your workspace is part of a group that needs shared context
- Multiple workspaces need to share the same patient/visit data

### Correct Usage Patterns

**Independent workspaces (use `null`):**
```typescript
// For independent workspaces like imaging report/review
launchWorkspace2(
  'imaging-report-form',
  { order },    // workspaceProps - specific data
  null,          // windowProps - "don't care" about window context
);
```

**Shared context workspaces (pass props):**
```typescript
// For workspaces that share patient/visit context
launchWorkspace2(
  'add-imaging-order',
  { order },              // workspaceProps - specific data
  { patientUuid: uuid },  // windowProps - shared with other workspaces
);
```

## Common Issues Resolved

1. **"Cannot read properties of undefined (reading 'concept')"** - Fixed by adding defensive checks and using optional chaining
2. **"Cannot read properties of null (reading 'patientUuid')"** - Fixed by accessing props through `workspaceProps` from context
3. **External component errors** - These were caused by props not being passed correctly through the new workspace system

## Related Files
- `packages/esm-imaging-orders-app/src/routes.json` - Workspace registrations under `workspaces2`
- `packages/esm-imaging-orders-app/src/shared/ui/common/action-button/action-button.component.tsx` - Workspace launching code
