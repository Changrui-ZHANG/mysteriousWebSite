/**
 * Data sanitization utilities
 * Helper functions for sanitizing and normalizing profile data
 */

import type {
    CreateProfileRequest,
    UpdateProfileRequest,
    ProfileSearchQuery,
    ProfileDirectoryFilters
} from '../types';

/**
 * Sanitize create profile request data
 * Trims strings and applies defaults
 */
export function sanitizeCreateProfileData(data: CreateProfileRequest): CreateProfileRequest {
    return {
        displayName: data.displayName.trim(),
        bio: data.bio?.trim() || undefined,
        privacySettings: {
            profileVisibility: 'public',
            showBio: true,
            showStats: true,
            showAchievements: true,
            showLastActive: true,
            ...data.privacySettings
        }
    };
}

/**
 * Sanitize update profile request data
 * Trims strings
 */
export function sanitizeUpdateProfileData(data: UpdateProfileRequest): UpdateProfileRequest {
    return {
        ...data,
        displayName: data.displayName?.trim(),
        bio: data.bio?.trim()
    };
}

/**
 * Sanitize search query
 * Trims query string and applies limits
 */
export function sanitizeSearchQuery(query: ProfileSearchQuery): ProfileSearchQuery {
    return {
        ...query,
        query: query.query?.trim(),
        limit: Math.min(query.limit || 20, 50), // Max 50 results
        offset: Math.max(query.offset || 0, 0),
        includePrivate: false // Always false for non-admin users
    };
}

/**
 * Sanitize directory filters
 * Applies limits and defaults
 */
export function sanitizeDirectoryFilters(filters: ProfileDirectoryFilters): ProfileDirectoryFilters {
    return {
        ...filters,
        limit: Math.min(filters.limit, 100), // Max 100 results
        offset: Math.max(filters.offset, 0)
    };
}

/**
 * Apply result limit
 * Ensures limit is within acceptable range
 */
export function applyResultLimit(limit: number, max: number = 50): number {
    return Math.min(Math.max(limit, 1), max);
}
