export interface UserProfile {
    userId: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    gender?: string | null;
    joinDate: Date | string; // Backend sends string, frontend converts to Date
    lastActive: Date | string; // Backend sends string, frontend converts to Date
    isPublic: boolean;
    privacySettings?: PrivacySettings | null; // Can be null from backend
    activityStats?: ActivityStats | null; // Can be null from backend
    achievements?: Achievement[]; // Optional, may not be provided by backend yet
}

export interface PrivacySettings {
    profileVisibility: 'public' | 'friends' | 'private';
    showBio: boolean;
    showStats: boolean;
    showAchievements: boolean;
    showLastActive: boolean;
}

export interface ActivityStats {
    totalMessages: number;
    totalGamesPlayed: number;
    gamesPlayed: number; // For compatibility
    wins: number;
    rank: string;
    level: number;
    bestScores: Record<string, number> | string; // Can be JSON string from backend
    currentStreak: number;
    longestStreak: number;
    timeSpent: number; // in minutes
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    unlockedAt: Date;
    category: 'messaging' | 'gaming' | 'social' | 'time';
}

// Data transfer objects for API operations
export interface CreateProfileRequest {
    displayName: string;
    bio?: string;
    gender?: string | null;
    privacySettings?: Partial<PrivacySettings>;
}

export interface UpdateProfileRequest {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    gender?: string | null;
    privacySettings?: Partial<PrivacySettings>;
}

// Activity tracking types
export interface ActivityUpdate {
    type: 'message' | 'game' | 'login' | 'profile_view';
    gameType?: string;
    score?: number;
    metadata?: Record<string, any>;
}

// File upload types
export interface AvatarUploadProgress {
    progress: number;
    isUploading: boolean;
    error?: string;
}

// Profile search and directory types
export interface ProfileSearchQuery {
    query?: string;
    limit?: number;
    offset?: number;
    includePrivate?: boolean;
}

// Profile directory filters type
export interface ProfileDirectoryFilters {
    sortBy: 'displayName' | 'joinDate' | 'lastActive' | 'totalMessages';
    sortOrder: 'asc' | 'desc';
    limit: number;
    offset: number;
    onlineOnly: boolean;
}

export interface ProfileSearchResult {
    profiles: UserProfile[];
    total: number;
    hasMore: boolean;
}

// Re-export cropping types for convenience
// Re-export cropping types explicitly
export type { AvatarCropperProps, CropResult, CropperOptions } from './components/cropping/types';
// Removed redundant/invalid re-exports to fix build errors