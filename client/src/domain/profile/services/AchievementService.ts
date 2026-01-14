import { fetchJson, postJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import { transformBackendAchievements } from '../utils/ActivityStatsTransformer';
import { requireUserId } from '../utils/validation';
import { logWarn } from '../utils/logger';
import type { Achievement, ActivityStats } from '../types';
import type { ActivityStatsService } from './ActivityStatsService';

/**
 * Service for managing user achievements
 * Handles achievement evaluation, unlocking, and progress tracking
 */
export class AchievementService {
    constructor(private statsService: ActivityStatsService) {}

    /**
     * Get all achievements for a user
     */
    async getAchievements(userId: string): Promise<Achievement[]> {
        requireUserId(userId);

        try {
            const backendAchievements = await fetchJson<any[]>(
                API_ENDPOINTS.PROFILES.ACHIEVEMENTS(userId)
            );
            return transformBackendAchievements(backendAchievements);
        } catch (error) {
            throw new AppError(
                'Failed to get achievements',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de la récupération des succès',
                error
            );
        }
    }

    /**
     * Check for and return new achievements based on current stats
     */
    async checkAchievements(userId: string): Promise<Achievement[]> {
        requireUserId(userId);

        try {
            const stats = await this.statsService.getActivityStats(userId);
            return await this.evaluateAchievements(userId, stats);
        } catch (error) {
            throw new AppError(
                'Failed to check achievements',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de la vérification des succès',
                error
            );
        }
    }

    /**
     * Unlock a specific achievement for a user
     */
    async unlockAchievement(userId: string, achievementId: string): Promise<void> {
        requireUserId(userId);

        if (!achievementId) {
            throw new AppError(
                'Achievement ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID de succès requis'
            );
        }

        try {
            await postJson(API_ENDPOINTS.ACTIVITY.UNLOCK_ACHIEVEMENT, {
                userId,
                achievementId
            });
        } catch (error) {
            throw new AppError(
                'Failed to unlock achievement',
                ERROR_CODES.OPERATION_FAILED,
                'Échec du déverrouillage du succès',
                error
            );
        }
    }

    /**
     * Check achievement progress for a specific type
     */
    async checkAchievementProgress(
        userId: string,
        achievementType: string
    ): Promise<number> {
        requireUserId(userId);

        try {
            const stats = await this.statsService.getActivityStats(userId);
            return this.calculateProgress(achievementType, stats);
        } catch (error) {
            logWarn('Failed to check achievement progress', { userId, achievementType, error });
            return 0;
        }
    }

    /**
     * Initialize default achievements (admin function)
     */
    async initializeDefaultAchievements(): Promise<void> {
        try {
            await postJson<void>(API_ENDPOINTS.ACTIVITY.INIT_ACHIEVEMENTS, {});
        } catch (error) {
            throw new AppError(
                'Failed to initialize achievements',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de l\'initialisation des succès',
                error
            );
        }
    }

    /**
     * Check and unlock achievements based on activity update
     */
    async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
        try {
            const stats = await this.statsService.getActivityStats(userId);
            return await this.evaluateAchievements(userId, stats);
        } catch (error) {
            logWarn('Achievement checking failed', { userId, error });
            return [];
        }
    }

    // Private helper methods

    /**
     * Evaluate achievements based on current statistics
     */
    async evaluateAchievements(
        userId: string,
        stats: ActivityStats
    ): Promise<Achievement[]> {
        const newAchievements: Achievement[] = [];
        const currentAchievements = await this.getAchievements(userId).catch(() => []);
        const achievementIds = new Set(currentAchievements.map(a => a.id));

        // Define achievement thresholds
        const achievementChecks = this.getAchievementDefinitions();

        // Check each achievement
        for (const check of achievementChecks) {
            if (check.condition(stats) && !achievementIds.has(check.id)) {
                const achievement: Achievement = {
                    id: check.id,
                    name: check.name,
                    description: check.description,
                    iconUrl: `/icons/achievements/${check.id}.png`,
                    unlockedAt: new Date(),
                    category: check.category
                };
                newAchievements.push(achievement);
            }
        }

        return newAchievements;
    }

    /**
     * Get achievement definitions with conditions
     */
    private getAchievementDefinitions() {
        return [
            // Messaging achievements
            {
                id: 'first_message',
                name: 'First Message',
                description: 'Send your first message',
                category: 'messaging' as const,
                condition: (stats: ActivityStats) => stats.totalMessages >= 1
            },
            {
                id: 'chatty',
                name: 'Chatty',
                description: 'Send 100 messages',
                category: 'messaging' as const,
                condition: (stats: ActivityStats) => stats.totalMessages >= 100
            },
            {
                id: 'conversation_master',
                name: 'Conversation Master',
                description: 'Send 1000 messages',
                category: 'messaging' as const,
                condition: (stats: ActivityStats) => stats.totalMessages >= 1000
            },

            // Gaming achievements
            {
                id: 'first_game',
                name: 'First Game',
                description: 'Play your first game',
                category: 'gaming' as const,
                condition: (stats: ActivityStats) => stats.totalGamesPlayed >= 1
            },
            {
                id: 'gamer',
                name: 'Gamer',
                description: 'Play 50 games',
                category: 'gaming' as const,
                condition: (stats: ActivityStats) => stats.totalGamesPlayed >= 50
            },
            {
                id: 'gaming_legend',
                name: 'Gaming Legend',
                description: 'Play 500 games',
                category: 'gaming' as const,
                condition: (stats: ActivityStats) => stats.totalGamesPlayed >= 500
            },

            // Time-based achievements
            {
                id: 'dedicated',
                name: 'Dedicated',
                description: 'Spend 10 hours in the app',
                category: 'time' as const,
                condition: (stats: ActivityStats) => stats.timeSpent >= 600
            },
            {
                id: 'streak_week',
                name: 'Week Streak',
                description: 'Maintain a 7-day activity streak',
                category: 'time' as const,
                condition: (stats: ActivityStats) => stats.currentStreak >= 7
            },
            {
                id: 'streak_month',
                name: 'Month Streak',
                description: 'Maintain a 30-day activity streak',
                category: 'time' as const,
                condition: (stats: ActivityStats) => stats.currentStreak >= 30
            },

            // Social achievements
            {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Be active in both messaging and gaming',
                category: 'social' as const,
                condition: (stats: ActivityStats) =>
                    stats.totalMessages >= 10 && stats.totalGamesPlayed >= 10
            }
        ];
    }

    /**
     * Calculate progress percentage for an achievement type
     */
    private calculateProgress(achievementType: string, stats: ActivityStats): number {
        const progressMap: Record<string, () => number> = {
            messaging: () => Math.min(100, (stats.totalMessages / 1000) * 100),
            gaming: () => Math.min(100, (stats.totalGamesPlayed / 500) * 100),
            time: () => Math.min(100, (stats.timeSpent / 600) * 100),
            streak: () => Math.min(100, (stats.currentStreak / 30) * 100)
        };

        const calculator = progressMap[achievementType];
        return calculator ? Math.round(calculator()) : 0;
    }
}
