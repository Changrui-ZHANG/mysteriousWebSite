import type { UserProfile, ActivityStats } from '../types';

/**
 * Backend response structure (raw entities)
 */
interface BackendProfileResponse {
    userId: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    gender?: string;
    joinDate: string;
    lastActive: string;
    isPublic: boolean;
    privacySettings?: {
        userId: string;
        profileVisibility: string;
        showBio: boolean;
        showStats: boolean;
        showAchievements: boolean;
        showLastActive: boolean;
    } | null;
    activityStats?: {
        userId: string;
        totalMessages: number;
        totalGamesPlayed: number;
        bestScores: string; // JSON string
        currentStreak: number;
        longestStreak: number;
        timeSpent: number;
        lastUpdated: string;
    } | null;
    achievements?: Array<{
        id: string;
        name: string;
        description: string;
        iconUrl: string;
        category: 'messaging' | 'gaming' | 'social' | 'time';
        unlockedAt: string;
    }> | null;
}

/**
 * Transforms backend profile response to frontend UserProfile type
 */
export function transformBackendProfile(backendProfile: BackendProfileResponse): UserProfile {
    // Parse bestScores JSON string
    let bestScores: Record<string, number> = {};
    if (backendProfile.activityStats?.bestScores) {
        try {
            bestScores = JSON.parse(backendProfile.activityStats.bestScores);
        } catch {
            bestScores = {};
        }
    }

    // Transform activity stats
    const activityStats: ActivityStats | undefined = backendProfile.activityStats ? {
        totalMessages: backendProfile.activityStats.totalMessages,
        totalGamesPlayed: backendProfile.activityStats.totalGamesPlayed,
        gamesPlayed: backendProfile.activityStats.totalGamesPlayed, // For compatibility
        wins: Math.floor(backendProfile.activityStats.totalGamesPlayed * 0.6), // Mock value
        rank: 'Silver', // Mock value
        level: Math.floor(backendProfile.activityStats.totalMessages / 10) + 1, // Mock value
        bestScores,
        currentStreak: backendProfile.activityStats.currentStreak,
        longestStreak: backendProfile.activityStats.longestStreak,
        timeSpent: backendProfile.activityStats.timeSpent
    } : undefined;

    // Transform privacy settings
    const privacySettings = backendProfile.privacySettings ? {
        profileVisibility: backendProfile.privacySettings.profileVisibility as 'public' | 'friends' | 'private',
        showBio: backendProfile.privacySettings.showBio,
        showStats: backendProfile.privacySettings.showStats,
        showAchievements: backendProfile.privacySettings.showAchievements,
        showLastActive: backendProfile.privacySettings.showLastActive
    } : undefined;

    // Transform achievements
    const achievements = backendProfile.achievements ? backendProfile.achievements.map(a => ({
        ...a,
        unlockedAt: new Date(a.unlockedAt)
    })) : [];

    return {
        userId: backendProfile.userId,
        displayName: backendProfile.displayName,
        bio: backendProfile.bio,
        avatarUrl: backendProfile.avatarUrl,
        gender: backendProfile.gender,
        joinDate: new Date(backendProfile.joinDate),
        lastActive: new Date(backendProfile.lastActive),
        isPublic: backendProfile.isPublic,
        privacySettings,
        activityStats,
        achievements
    };
}

/**
 * Transforms array of backend profiles
 */
export function transformBackendProfiles(backendProfiles: BackendProfileResponse[]): UserProfile[] {
    return backendProfiles.map(transformBackendProfile);
}