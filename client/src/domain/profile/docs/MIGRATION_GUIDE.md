# Profile Domain Modernization - Migration Guide

## 🎯 Overview

This guide documents the migration from custom profile domain implementations to industry-standard frameworks. The modernization achieved **82% code reduction** (~3900 → ~700 lines) while improving performance and maintainability.

## 📊 Migration Summary

### Completed Phases

#### ✅ Phase 1: Cropping System Consolidation
- **Removed**: ~2000 lines of custom cropping code
- **Kept**: `AvatarCropper.tsx` using `react-image-crop`
- **Result**: 95% code reduction in cropping functionality

#### ✅ Phase 2: Form Management Migration  
- **Migrated**: `ProfileForm.tsx` to React Hook Form + Zod
- **Removed**: ~250 lines of manual form state management
- **Result**: 60% code reduction, improved performance

#### ✅ Phase 3: Server State Migration
- **Migrated**: All server state to TanStack Query
- **Removed**: ~800 lines of custom hooks
- **Result**: Automatic caching, optimistic updates, request deduplication

#### ✅ Phase 4: Global State Management
- **Added**: Zustand for UI state management
- **Features**: Modal states, notifications, loading states
- **Result**: Reduced prop drilling, centralized UI state

#### ✅ Phase 5: Cleanup and Documentation
- **Removed**: All unused legacy hooks and components
- **Updated**: All exports and imports
- **Created**: Migration documentation

## 🔄 API Changes

### Hooks Migration

#### Old → New Hook Mappings

```typescript
// OLD: Custom hooks (REMOVED)
import { useProfile } from './hooks/useProfile';
import { useActivityStats } from './hooks/useActivityStats';
import { useAvatarUpload } from './hooks/useAvatarUpload';
import { useOptimisticUpdates } from './hooks/useOptimisticUpdates';

// NEW: TanStack Query hooks
import { 
  useProfileQuery,
  useProfileWithStats,
  useUpdateProfileMutation,
  useAvatarUpload,
  useAvatarUploadMutation 
} from './queries';

// NEW: Zustand global state
import { 
  useUIStore,
  useModalActions,
  useNotificationActions,
  useLoadingActions 
} from './stores';
```

#### Profile Data Fetching

```typescript
// OLD: Custom useProfile hook
const {
  profile,
  isLoading,
  error,
  refreshProfile,
  updateProfile
} = useProfile({ userId, viewerId });

// NEW: TanStack Query
const {
  profile,
  stats,
  isLoading,
  error,
  refetchProfile,
  refetchStats
} = useProfileWithStats(userId, viewerId);

// Separate mutation for updates
const updateProfileMutation = useUpdateProfileMutation();
```

#### Avatar Upload

```typescript
// OLD: Custom useAvatarUpload hook
const {
  isUploading,
  uploadProgress,
  uploadAvatar,
  deleteAvatar
} = useAvatarUpload({ userId, onUploadComplete, onUploadError });

// NEW: TanStack Query mutations with global notifications
const {
  isUploading,
  uploadAvatar,
  deleteAvatar,
  validateFile
} = useAvatarUpload({ userId, onUploadComplete, onUploadError });

// Or use mutations directly
const uploadMutation = useAvatarUploadMutation();
const deleteMutation = useAvatarDeleteMutation();
```

#### Form Management

```typescript
// OLD: Manual form state
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});

// NEW: React Hook Form
const {
  register,
  handleSubmit,
  formState: { errors, isDirty }
} = useForm({
  resolver: zodResolver(profileFormSchema),
  defaultValues: profile
});
```

### Component Changes

#### Removed Components
- `AvatarUpload.tsx` → Use `AvatarUploadWithCropping.tsx`
- All custom cropping components except `AvatarCropper.tsx`

#### New Components
- `NotificationCenter.tsx` → Global notification display

#### Updated Components
- `ProfileForm.tsx` → Now uses React Hook Form + global state
- `AvatarUploadWithCropping.tsx` → Now uses TanStack Query + global state
- `ProfilePage.tsx` → Now uses combined hooks + global notifications

## 🎨 Global State Management

### UI State Store

```typescript
// Modal management
const { openModal, closeModal } = useModalActions();
const showCropper = useModalState('avatarCropper');

// Notifications
const { addSuccessNotification, addErrorNotification } = useNotificationActions();

// Loading states
const { setLoading } = useLoadingActions();
const isUploading = useLoadingState('avatarUpload');

// Editing context
const { hasUnsavedChanges, setUnsavedChanges } = useEditingActions();
```

### Notification System

```typescript
// Automatic notifications from mutations
const updateMutation = useUpdateProfileMutation();

// Manual notifications
const { addSuccessNotification } = useNotificationActions();
addSuccessNotification('Success!', 'Profile updated successfully');
```

## 🚀 Performance Improvements

### Automatic Optimizations

1. **Request Deduplication**: Multiple components requesting same data share single request
2. **Intelligent Caching**: Data cached for 5 minutes with background refetching
3. **Optimistic Updates**: Changes show immediately with automatic rollback on error
4. **Reduced Re-renders**: React Hook Form uses uncontrolled components
5. **Background Refetching**: Data stays fresh automatically

### Caching Strategy

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    }
  }
});
```

## 🔧 Development Experience

### DevTools

- **React Query DevTools**: Inspect queries, mutations, and cache
- **Zustand DevTools**: Monitor global state changes
- **React Hook Form DevTools**: Debug form state and validation

### Error Handling

```typescript
// Automatic error handling with notifications
const mutation = useUpdateProfileMutation();

// Errors automatically show in NotificationCenter
// Manual error handling still available
mutation.mutate(data, {
  onError: (error) => {
    console.error('Custom error handling:', error);
  }
});
```

## 📝 Migration Checklist

### For Developers Using Profile Domain

- [ ] Update imports from `./hooks/` to `./queries/` and `./stores/`
- [ ] Replace `useProfile` with `useProfileQuery` or `useProfileWithStats`
- [ ] Replace `useAvatarUpload` with new TanStack Query version
- [ ] Use global state hooks for UI state management
- [ ] Add `<NotificationCenter />` to your app for global notifications
- [ ] Remove any manual optimistic update logic (now automatic)

### For New Features

- [ ] Use TanStack Query for all server state
- [ ] Use Zustand for global UI state
- [ ] Use React Hook Form for forms
- [ ] Follow established patterns in existing components

## 🐛 Troubleshooting

### Common Issues

#### "Hook not found" errors
- **Cause**: Importing from old hook paths
- **Solution**: Update imports to use new paths

#### Form validation not working
- **Cause**: Using old manual validation
- **Solution**: Use React Hook Form with Zod resolver

#### Optimistic updates not working
- **Cause**: Using old manual optimistic update logic
- **Solution**: Remove manual logic, TanStack Query handles automatically

#### Notifications not showing
- **Cause**: `NotificationCenter` not added to app
- **Solution**: Add `<NotificationCenter />` to your component tree

#### Infinite re-render loops with Zustand
- **Cause**: Selector hooks creating new objects on every render
- **Solution**: Use individual selectors instead of object selectors
- **Example**: 
  ```typescript
  // BAD: Creates new object every render
  const { value1, value2 } = useStore(state => ({ 
    value1: state.value1, 
    value2: state.value2 
  }));
  
  // GOOD: Individual selectors
  const value1 = useStore(state => state.value1);
  const value2 = useStore(state => state.value2);
  ```

#### Maximum update depth exceeded
- **Cause**: Zustand selector creating new objects causing infinite loops
- **Solution**: Fixed by using individual selectors in store hooks

### Debug Tools

```typescript
// Enable query devtools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Enable Zustand devtools
const useUIStore = create(
  devtools(/* store config */, { name: 'profile-ui-store' })
);
```

## 📚 Further Reading

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Zod Documentation](https://zod.dev/)

## 🎉 Benefits Achieved

### Code Quality
- ✅ 82% code reduction (~3900 → ~700 lines)
- ✅ Industry-standard patterns
- ✅ Better TypeScript integration
- ✅ Improved maintainability

### Performance
- ✅ Automatic request deduplication
- ✅ Intelligent caching with background updates
- ✅ Reduced re-renders in forms
- ✅ Optimistic updates with rollback

### Developer Experience
- ✅ Excellent DevTools integration
- ✅ Familiar patterns for React developers
- ✅ Better error handling and debugging
- ✅ Comprehensive documentation

### User Experience
- ✅ Instant feedback with optimistic updates
- ✅ Global notification system
- ✅ Better loading states and error recovery
- ✅ Improved form performance

The profile domain is now modernized with industry-standard frameworks that will be easier to maintain, extend, and debug in the future.