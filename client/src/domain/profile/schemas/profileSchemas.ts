import { z } from 'zod';
import { IdSchema } from '../../../shared/schemas/validation';

/**
 * Validation schemas for profile domain
 * Updated: Fixed optional field validation
 */

// Display name validation (2-30 characters)
export const DisplayNameSchema = z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(30, 'Display name must be less than 30 characters')
    .trim()
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Display name can only contain letters, numbers, spaces, underscores, and hyphens');

// Bio validation (≤500 characters)
export const BioSchema = z.optional(
    z.string()
        .max(500, 'Bio must be less than 500 characters')
        .trim()
);

// Avatar URL validation - Updated to accept both absolute and relative URLs
export const AvatarUrlSchema = z.string()
    .refine(
        (url) => {
            // Allow relative URLs starting with / or absolute HTTP/HTTPS URLs
            const relativePattern = /^\/.*\.(jpg|jpeg|png|webp)(\?.*)?$/i;
            const absolutePattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i;
            return relativePattern.test(url) || absolutePattern.test(url);
        },
        'Avatar URL must be a valid image URL (relative or absolute)'
    )
    .optional();

// Privacy settings schema
export const PrivacySettingsSchema = z.object({
    profileVisibility: z.enum(['public', 'friends', 'private']).default('public'),
    showBio: z.boolean().default(true),
    showStats: z.boolean().default(true),
    showAchievements: z.boolean().default(true),
    showLastActive: z.boolean().default(true),
});

export type PrivacySettings = z.infer<typeof PrivacySettingsSchema>;

// Activity stats schema
export const ActivityStatsSchema = z.object({
    totalMessages: z.number().int().nonnegative().default(0),
    totalGamesPlayed: z.number().int().nonnegative().default(0),
    bestScores: z.record(z.string(), z.number().int().nonnegative()).default({}),
    currentStreak: z.number().int().nonnegative().default(0),
    longestStreak: z.number().int().nonnegative().default(0),
    timeSpent: z.number().int().nonnegative().default(0), // in minutes
});

export type ActivityStats = z.infer<typeof ActivityStatsSchema>;

// Achievement schema
export const AchievementSchema = z.object({
    id: IdSchema,
    name: z.string().min(1, 'Achievement name is required').max(100, 'Achievement name must be less than 100 characters'),
    description: z.string().min(1, 'Achievement description is required').max(500, 'Achievement description must be less than 500 characters'),
    iconUrl: z.string().optional(),
    unlockedAt: z.date(),
    category: z.enum(['messaging', 'gaming', 'social', 'time']),
});

export type Achievement = z.infer<typeof AchievementSchema>;

// User profile schema
export const UserProfileSchema = z.object({
    userId: IdSchema,
    displayName: DisplayNameSchema,
    bio: BioSchema,
    avatarUrl: AvatarUrlSchema,
    joinDate: z.date(),
    lastActive: z.date(),
    isPublic: z.boolean().default(true),
    privacySettings: PrivacySettingsSchema,
    activityStats: ActivityStatsSchema,
    achievements: z.array(AchievementSchema).default([]),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// Create profile request schema
export const CreateProfileSchema = z.object({
    displayName: DisplayNameSchema,
    bio: BioSchema,
    privacySettings: PrivacySettingsSchema.partial().optional(),
});

export type CreateProfileRequest = z.infer<typeof CreateProfileSchema>;

// Update profile request schema
export const UpdateProfileSchema = z.object({
    displayName: DisplayNameSchema.optional(),
    bio: BioSchema.optional(),
    avatarUrl: AvatarUrlSchema.optional(),
    privacySettings: PrivacySettingsSchema.partial().optional(),
});

export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;

// Activity update schema
export const ActivityUpdateSchema = z.object({
    type: z.enum(['message', 'game', 'login', 'profile_view']),
    gameType: z.string().optional(),
    score: z.number().int().nonnegative().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type ActivityUpdate = z.infer<typeof ActivityUpdateSchema>;

// File upload validation schemas
export const FileUploadSchema = z.object({
    file: z.instanceof(File)
        .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
        .refine(
            (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
            'File must be JPEG, PNG, or WebP format'
        ),
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// Avatar upload progress schema
export const AvatarUploadProgressSchema = z.object({
    progress: z.number().min(0).max(100),
    isUploading: z.boolean(),
    error: z.string().optional(),
});

export type AvatarUploadProgress = z.infer<typeof AvatarUploadProgressSchema>;

// Profile search query schema
export const ProfileSearchQuerySchema = z.object({
    query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters').optional(),
    limit: z.number().int().positive().max(50).default(20),
    offset: z.number().int().nonnegative().default(0),
    includePrivate: z.boolean().default(false),
});

export type ProfileSearchQuery = z.infer<typeof ProfileSearchQuerySchema>;

// Profile search result schema
export const ProfileSearchResultSchema = z.object({
    profiles: z.array(UserProfileSchema),
    total: z.number().int().nonnegative(),
    hasMore: z.boolean(),
});

export type ProfileSearchResult = z.infer<typeof ProfileSearchResultSchema>;

// Profile directory filters schema
export const ProfileDirectoryFiltersSchema = z.object({
    sortBy: z.enum(['displayName', 'joinDate', 'lastActive', 'totalMessages']).default('displayName'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    limit: z.number().int().positive().max(100).default(20),
    offset: z.number().int().nonnegative().default(0),
    onlineOnly: z.boolean().default(false),
});

export type ProfileDirectoryFilters = z.infer<typeof ProfileDirectoryFiltersSchema>;

// Profile view tracking schema
export const ProfileViewSchema = z.object({
    viewerId: IdSchema,
    profileId: IdSchema,
    timestamp: z.date().default(() => new Date()),
    source: z.enum(['direct', 'search', 'directory', 'message', 'game']).default('direct'),
});

export type ProfileView = z.infer<typeof ProfileViewSchema>;

// Achievement definition schema (for admin/system use)
export const AchievementDefinitionSchema = z.object({
    id: IdSchema,
    name: z.string().min(1).max(100),
    description: z.string().min(1).max(500),
    iconUrl: z.string().optional(),
    category: z.enum(['messaging', 'gaming', 'social', 'time']),
    thresholdValue: z.number().int().positive().optional(),
    conditions: z.record(z.string(), z.unknown()).optional(),
    isActive: z.boolean().default(true),
});

export type AchievementDefinition = z.infer<typeof AchievementDefinitionSchema>;

// Profile statistics schema
export const ProfileStatsSchema = z.object({
    totalProfiles: z.number().int().nonnegative(),
    activeProfiles: z.number().int().nonnegative(), // profiles active in last 30 days
    publicProfiles: z.number().int().nonnegative(),
    privateProfiles: z.number().int().nonnegative(),
    averageMessagesPerUser: z.number().nonnegative(),
    averageGamesPerUser: z.number().nonnegative(),
    mostActiveUsers: z.array(z.object({
        userId: IdSchema,
        displayName: DisplayNameSchema,
        totalMessages: z.number().int().nonnegative(),
        totalGames: z.number().int().nonnegative(),
    })).max(10),
});

export type ProfileStats = z.infer<typeof ProfileStatsSchema>;

// Validation helpers
export const validateProfile = (data: unknown) => {
    return UserProfileSchema.safeParse(data);
};

export const validateCreateProfile = (data: unknown) => {
    return CreateProfileSchema.safeParse(data);
};

export const validateUpdateProfile = (data: unknown) => {
    return UpdateProfileSchema.safeParse(data);
};

export const validatePrivacySettings = (data: unknown) => {
    return PrivacySettingsSchema.safeParse(data);
};

export const validateActivityUpdate = (data: unknown) => {
    return ActivityUpdateSchema.safeParse(data);
};

export const validateFileUpload = (data: unknown) => {
    return FileUploadSchema.safeParse(data);
};

export const validateProfileSearchQuery = (data: unknown) => {
    return ProfileSearchQuerySchema.safeParse(data);
};

export const validateProfileDirectoryFilters = (data: unknown) => {
    return ProfileDirectoryFiltersSchema.safeParse(data);
};

// Form validation helpers specific to profile forms
export const validateDisplayNameField = (displayName: string) => {
    return DisplayNameSchema.safeParse(displayName);
};

export const validateBioField = (bio: string) => {
    return BioSchema.safeParse(bio);
};

export const validateAvatarUrl = (url: string) => {
    return AvatarUrlSchema.safeParse(url);
};

// Real-time validation for forms
export const getDisplayNameErrors = (displayName: string): string[] => {
    const result = DisplayNameSchema.safeParse(displayName);
    if (result.success) return [];
    return result.error.issues.map(issue => issue.message);
};

export const getBioErrors = (bio: string): string[] => {
    const result = BioSchema.safeParse(bio);
    if (result.success) return [];
    return result.error.issues.map(issue => issue.message);
};

export const getFileUploadErrors = (file: File): string[] => {
    const result = FileUploadSchema.safeParse({ file });
    if (result.success) return [];
    return result.error.issues.map(issue => issue.message);
};