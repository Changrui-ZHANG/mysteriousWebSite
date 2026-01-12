import type { ActivityStats, Achievement } from '../types';

/**
 * Backend ActivityStats response structure
 */
interface BackendActivityStats {
    userId: string;
    totalMessages: number;
    totalGamesPlayed: number;
    bestScores: string; // JSON string
    currentStreak: number;
    longestStreak: number;
    timeSpent: number;
    lastUpdated: string;
}

/**
 * Backend UserAchievement response structure
 */
interface BackendUserAchievement {
    id: string;
    userId: string;
    achievementId: string;
    unlockedAt: string;
    achievement?: {
        id: string;
        name: string;
        description: string;
        iconUrl?: string;
        category: string;
        thresholdValue?: number;
        createdAt: string;
    };
}

/**
 * Transforms backend ActivityStats to frontend ActivityStats type
 */
export function transformBackendActivityStats(backendStats: BackendActivityStats): ActivityStats {
    // Parse bestScores JSON string
    let bestScores: Record<string, number> = {};
    if (backendStats.bestScores) {
        try {
            bestScores = JSON.parse(backendStats.bestScores);
        } catch {
            bestScores = {};
        }
    }

    return {
        totalMessages: backendStats.totalMessages,
        totalGamesPlayed: backendStats.totalGamesPlayed,
        bestScores,
        currentStreak: backendStats.currentStreak,
        longestStreak: backendStats.longestStreak,
        timeSpent: backendStats.timeSpent
    };
}

/**
 * Transforms backend UserAchievement array to frontend Achievement array
 */
export function transformBackendAchievements(backendAchievements: BackendUserAchievement[]): Achievement[] {
    return backendAchievements.map(userAchievement => {
        const achievement = userAchievement.achievement;
        if (!achievement) {
            // Fallback if achievement details are not populated
            return {
                id: userAchievement.achievementId,
                name: 'Unknown Achievement',
                description: 'Achievement details not available',
                iconUrl: '/icons/achievements/default.png',
                unlockedAt: new Date(userAchievement.unlockedAt),
                category: 'social' as const
            };
        }

        return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            iconUrl: achievement.iconUrl || '/icons/achievements/default.png',
            unlockedAt: new Date(userAchievement.unlockedAt),
            category: achievement.category as 'messaging' | 'gaming' | 'social' | 'time'
        };
    });
}