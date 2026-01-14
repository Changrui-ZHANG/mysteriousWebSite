/**
 * Privacy filtering utilities
 * Helper functions for applying privacy settings to profiles
 */

import type { UserProfile, PrivacySettings } from '../types';

/**
 * Default privacy settings
 */
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
    profileVisibility: 'public',
    showBio: true,
    showStats: true,
    showAchievements: true,
    showLastActive: true
};

/**
 * Apply privacy filtering to a profile based on viewer permissions
 * 
 * @param profile - The profile to filter
 * @param viewerId - The ID of the user viewing the profile (optional)
 * @returns Filtered profile based on privacy settings
 */
export function applyPrivacyFiltering(profile: UserProfile, viewerId?: string): UserProfile {
    // If viewing own profile, return full profile
    if (profile.userId === viewerId) {
        return profile;
    }

    // Get privacy settings with defaults
    const privacySettings = profile.privacySettings || DEFAULT_PRIVACY_SETTINGS;

    // If profile is private, return minimal info
    if (privacySettings.profileVisibility === 'private') {
        return createMinimalProfile(profile);
    }

    // Apply granular privacy settings
    return applyGranularPrivacySettings(profile, privacySettings);
}

/**
 * Create a minimal profile for private profiles
 * Only shows basic information, hides sensitive data
 */
function createMinimalProfile(profile: UserProfile): UserProfile {
    return {
        ...profile,
        bio: undefined,
        activityStats: profile.activityStats ? {
            totalMessages: 0,
            totalGamesPlayed: 0,
            gamesPlayed: 0,
            wins: 0,
            rank: 'Private',
            level: 1,
            bestScores: {},
            currentStreak: 0,
            longestStreak: 0,
            timeSpent: 0
        } : undefined,
        achievements: [],
        lastActive: new Date(0) // Epoch time to indicate hidden
    };
}

/**
 * Apply granular privacy settings to a profile
 * Filters specific fields based on privacy preferences
 */
function applyGranularPrivacySettings(
    profile: UserProfile,
    privacySettings: PrivacySettings
): UserProfile {
    return {
        ...profile,
        bio: privacySettings.showBio ? profile.bio : undefined,
        activityStats: privacySettings.showStats ? profile.activityStats : undefined,
        achievements: privacySettings.showAchievements ? (profile.achievements || []) : [],
        lastActive: privacySettings.showLastActive ? profile.lastActive : new Date(0)
    };
}

/**
 * Check if a profile is accessible to a viewer
 * 
 * @param profile - The profile to check
 * @param viewerId - The ID of the user viewing the profile (optional)
 * @returns True if the profile is accessible, false otherwise
 */
export function isProfileAccessible(profile: UserProfile, viewerId?: string): boolean {
    // Own profile is always accessible
    if (profile.userId === viewerId) {
        return true;
    }

    // Check privacy settings
    const privacySettings = profile.privacySettings || DEFAULT_PRIVACY_SETTINGS;
    
    // Private profiles are not accessible to others
    if (privacySettings.profileVisibility === 'private') {
        return false;
    }

    return true;
}
