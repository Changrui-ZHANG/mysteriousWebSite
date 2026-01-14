# UI Store Refactoring Migration Guide

## Overview

The Profile domain's UI store has been refactored from a single monolithic store (`uiStore.ts`) into four focused, domain-specific stores. This improves performance by reducing unnecessary re-renders and enhances code organization.

## What Changed

### Before (Single Store)
```typescript
import { useUIStore, useModalState, useNotificationActions } from '../stores/uiStore';
```

### After (Domain-Specific Stores)
```typescript
import { useIsModalOpen, useModalActions } from '../stores/modalStore';
import { useNotifications, useNotificationActions } from '../stores/notificationStore';
import { useIsLoading, useLoadingActions } from '../stores/loadingStore';
import { useHasUnsavedChanges, useEditingActions } from '../stores/editingStore';
```

## New Store Structure

### 1. Modal Store (`modalStore.ts`)
Manages modal visibility state.

**Exports:**
- `useModalStore` - Main store hook
- `useIsModalOpen(type)` - Check if a specific modal is open
- `useActiveModal()` - Get currently active modal
- `useModalData()` - Get modal data
- `useModalActions()` - Get modal actions
- `useAnyModalOpen()` - Check if any modal is open

**Migration:**
```typescript
// Before
const showCropper = useModalState('avatarCropper');
const { openModal, closeModal } = useModalActions();

// After
const showCropper = useIsModalOpen('avatarCropper');
const { openModal, closeModal } = useModalActions();

// Note: closeModal() no longer takes arguments
closeModal(); // instead of closeModal('avatarCropper')
```

### 2. Notification Store (`notificationStore.ts`)
Manages notification display and lifecycle.

**Exports:**
- `useNotificationStore` - Main store hook
- `useNotifications()` - Get all notifications
- `useNotificationCount(type?)` - Get notification count
- `useNotificationActions()` - Get notification actions

**Migration:**
```typescript
// Before
import { useNotifications, useNotificationActions } from '../stores/uiStore';

// After
import { useNotifications, useNotificationActions } from '../stores/notificationStore';

// Usage remains the same
const notifications = useNotifications();
const { addSuccessNotification, addErrorNotification } = useNotificationActions();
```

### 3. Loading Store (`loadingStore.ts`)
Manages loading states for async operations.

**Exports:**
- `useLoadingStore` - Main store hook
- `useIsLoading(key)` - Check if a specific key is loading
- `useAnyLoading()` - Check if any loading state is active
- `useLoadingActions()` - Get loading actions

**Migration:**
```typescript
// Before
const isUploading = useLoadingState('avatarUpload');
const { setLoading } = useLoadingActions();

// After
const isUploading = useIsLoading('avatarUpload');
const { setLoading } = useLoadingActions();

// Usage remains the same
setLoading('avatarUpload', true);
```

### 4. Editing Store (`editingStore.ts`)
Manages editing context and unsaved changes tracking.

**Exports:**
- `useEditingStore` - Main store hook
- `useIsEditing()` - Check if currently editing
- `useHasUnsavedChanges()` - Check if there are unsaved changes
- `useEditingContext()` - Get editing context
- `useEditingActions()` - Get editing actions

**Migration:**
```typescript
// Before
const hasUnsavedChanges = useHasUnsavedChanges();
const { setEditingProfile, setUnsavedChanges, resetEditingState } = useEditingActions();

// After
const hasUnsavedChanges = useHasUnsavedChanges();
const { startEditing, markUnsavedChanges, resetEditingState } = useEditingActions();

// Function name changes:
setEditingProfile(true) → startEditing('profile')
setUnsavedChanges(true) → markUnsavedChanges(true)
```

## Breaking Changes

### 1. Modal Actions
- `closeModal()` no longer accepts a modal type parameter
- `openModal(type, data?)` signature remains the same

### 2. Editing Actions
- `setEditingProfile(boolean)` → `startEditing(context?: string)`
- `setUnsavedChanges(boolean)` → `markUnsavedChanges(boolean)`

## Migration Steps

### Step 1: Update Imports
Replace all imports from `uiStore` with the appropriate domain-specific store:

```typescript
// Find and replace
'../stores/uiStore' → '../stores/modalStore'
'../stores/uiStore' → '../stores/notificationStore'
'../stores/uiStore' → '../stores/loadingStore'
'../stores/uiStore' → '../stores/editingStore'
```

### Step 2: Update Hook Names
```typescript
// Modal hooks
useModalState('type') → useIsModalOpen('type')
useLoadingState('key') → useIsLoading('key')

// Editing hooks (function names changed)
setEditingProfile → startEditing
setUnsavedChanges → markUnsavedChanges
```

### Step 3: Update Function Calls
```typescript
// Modal close
closeModal('avatarCropper') → closeModal()

// Editing
setEditingProfile(true) → startEditing('profile')
setUnsavedChanges(true) → markUnsavedChanges(true)
```

## Benefits

### Performance Improvements
- **Reduced Re-renders**: Components only subscribe to the specific store they need
- **Better Memoization**: Smaller stores are easier to optimize
- **Faster Updates**: Changes to one domain don't trigger updates in unrelated components

### Code Organization
- **Single Responsibility**: Each store manages one domain concern
- **Easier Testing**: Smaller, focused stores are easier to test
- **Better Scalability**: New features can add stores without affecting existing ones

### Developer Experience
- **Clearer Intent**: Store names indicate their purpose
- **Better TypeScript Support**: More specific types for each store
- **Easier Debugging**: DevTools show separate stores for each domain

## Example: Complete Component Migration

### Before
```typescript
import { useModalState, useModalActions, useNotificationActions, useLoadingState } from '../stores/uiStore';

export const MyComponent = () => {
    const showModal = useModalState('myModal');
    const { openModal, closeModal } = useModalActions();
    const { addSuccessNotification } = useNotificationActions();
    const isLoading = useLoadingState('myOperation');

    const handleAction = () => {
        closeModal('myModal');
        addSuccessNotification('Success', 'Operation completed');
    };

    return <div>...</div>;
};
```

### After
```typescript
import { useIsModalOpen, useModalActions } from '../stores/modalStore';
import { useNotificationActions } from '../stores/notificationStore';
import { useIsLoading } from '../stores/loadingStore';

export const MyComponent = () => {
    const showModal = useIsModalOpen('myModal');
    const { openModal, closeModal } = useModalActions();
    const { addSuccessNotification } = useNotificationActions();
    const isLoading = useIsLoading('myOperation');

    const handleAction = () => {
        closeModal(); // No argument needed
        addSuccessNotification('Success', 'Operation completed');
    };

    return <div>...</div>;
};
```

## Rollback Plan

If issues arise, the old `uiStore.ts` can be restored from git history:

```bash
git checkout HEAD~1 -- client/src/domain/profile/stores/uiStore.ts
```

Then revert all component imports back to the old store.

## Support

For questions or issues with the migration, please refer to:
- Design document: `.kiro/specs/profile-quality-improvements/design.md`
- Task list: `.kiro/specs/profile-quality-improvements/tasks.md`
