// Components
export * from './components';

// Pages
export { ProfilePage } from './ProfilePage';

// Services
export * from './services';

// Repositories
export * from './repositories';

// Hooks (legacy - being phased out)
export * from './hooks';

// TanStack Query hooks (new)
export * from './queries';

// Zustand stores (global state)
export * from './stores';

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

// Real-time hooks (remaining legacy)
export { useRealTimeProfile } from './hooks/useRealTimeProfile';