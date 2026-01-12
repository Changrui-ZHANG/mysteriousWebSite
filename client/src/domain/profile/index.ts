// Components
export * from './components';

// Pages
export { ProfilePage } from './ProfilePage';

// Services
export * from './services';

// Repositories
export * from './repositories';

// Hooks
export * from './hooks';

// Schemas
export * from './schemas';

// Types
export type {
    UserProfile,
    PrivacySettings,
    ActivityStats,
    Achievement,
    CreateProfileRequest,
    UpdateProfileRequest,
    ActivityUpdate,
    AvatarUploadProgress,
    ProfileSearchQuery,
    ProfileSearchResult,
    ProfileDirectoryFilters
} from './types';

// Real-time and optimistic updates
export { useRealTimeProfile } from './hooks/useRealTimeProfile';
export { useOptimisticUpdates } from './hooks/useOptimisticUpdates';
export { RealTimeStatus, RealTimeStatusCompact, RealTimeStatusPanel } from './components/RealTimeStatus';