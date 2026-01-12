import { fetchJson, postJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { validateActivityUpdate } from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import type { ActivityStats, ActivityUpdate, Achievement } from '../types';

/**
 * Service for activity tracking and achievement management
 * Handles activity recording, statistics calculation, and achievement unlocking
 */
export class ActivityService {
    /**
     * Update activity statistics for a user
     */
    async updateActivityStats(userId: string, activity: ActivityUpdate): Promise<void> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        // Validate activity data
        const validation = validateActivityUpdate(activity);
        if (!validation.success) {
            throw new AppError(
                'Invalid activity data',
                ERROR_CODES.VALIDATION_ERROR,
                'Données d\'activité invalides',
                validation.error
            );
        }

        // Business logic: Process different activity types
        const processedActivity = this.processActivityUpdate(activity);

        try {
            // Send to appropriate endpoint based on activity type
            const endpoint = activity.type === 'message' 
                ? API_ENDPOINTS.ACTIVITY.MESSAGE 
                : API_ENDPOINTS.ACTIVITY.GAME;

            await postJson(endpoint, {
                userId,
                ...processedActivity
            });

            // Check for new achievements after activity update
            await this.checkAndUnlockAchievements(userId);
        } catch (error) {
            throw new AppError(
                'Failed to update activity stats',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de la mise à jour des statistiques d\'activité',
                error
            );
        }
    }

    /**
     * Get activity statistics for a user
     */
    async getActivityStats(userId: string): Promise<ActivityStats> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        try {
            return await fetchJson<ActivityStats>(API_ENDPOINTS.PROFILES.STATS(userId));
        } catch (error) {
            throw new AppError(
                'Failed to get activity stats',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de la récupération des statistiques d\'activité',
                error
            );
        }
    }

    /**
     * Check for and unlock new achievements
     */
    async checkAchievements(userId: string): Promise<Achievement[]> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        try {
            // Get current stats
            const stats = await this.getActivityStats(userId);
            
            // Check for new achievements based on stats
            const newAchievements = await this.evaluateAchievements(userId, stats);
            
            return newAchievements;
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
     * Get all achievements for a user
     */
    async getAchievements(userId: string): Promise<Achievement[]> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        try {
            return await fetchJson<Achievement[]>(API_ENDPOINTS.PROFILES.ACHIEVEMENTS(userId));
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
     * Record message activity
     */
    async recordMessageActivity(userId: string, messageCount: number = 1): Promise<void> {
        const activity: ActivityUpdate = {
            type: 'message',
            metadata: { messageCount }
        };

        await this.updateActivityStats(userId, activity);
    }

    /**
     * Record game activity
     */
    async recordGameActivity(userId: string, gameType: string, score: number, metadata?: Record<string, any>): Promise<void> {
        const activity: ActivityUpdate = {
            type: 'game',
            gameType,
            score,
            metadata
        };

        await this.updateActivityStats(userId, activity);
    }

    /**
     * Record login activity
     */
    async recordLoginActivity(userId: string): Promise<void> {
        const activity: ActivityUpdate = {
            type: 'login',
            metadata: { timestamp: Date.now() }
        };

        await this.updateActivityStats(userId, activity);
    }

    /**
     * Record profile view activity
     */
    async recordProfileViewActivity(viewerId: string, profileId: string): Promise<void> {
        const activity: ActivityUpdate = {
            type: 'profile_view',
            metadata: { profileId, timestamp: Date.now() }
        };

        await this.updateActivityStats(viewerId, activity);
    }

    /**
     * Calculate streak information
     */
    async calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
        try {
            const stats = await this.getActivityStats(userId);
            return {
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak
            };
        } catch (error) {
            return { currentStreak: 0, longestStreak: 0 };
        }
    }

    /**
     * Get activity summary for a time period
     */
    async getActivitySummary(userId: string, days: number = 7): Promise<{
        messagesThisPeriod: number;
        gamesThisPeriod: number;
        averageDaily: number;
        mostActiveDay: string;
    }> {
        // This would typically fetch from a dedicated analytics endpoint
        // For now, return basic stats
        try {
            const stats = await this.getActivityStats(userId);
            
            // Simple calculation - in a real app, this would be more sophisticated
            const averageDaily = Math.round((stats.totalMessages + stats.totalGamesPlayed) / days);
            
            return {
                messagesThisPeriod: Math.min(stats.totalMessages, stats.totalMessages), // Placeholder
                gamesThisPeriod: Math.min(stats.totalGamesPlayed, stats.totalGamesPlayed), // Placeholder
                averageDaily,
                mostActiveDay: 'Today' // Placeholder
            };
        } catch (error) {
            return {
                messagesThisPeriod: 0,
                gamesThisPeriod: 0,
                averageDaily: 0,
                mostActiveDay: 'None'
            };
        }
    }

    // Private helper methods

    /**
     * Process activity update with business logic
     */
    private processActivityUpdate(activity: ActivityUpdate): ActivityUpdate {
        const processed = { ...activity };

        // Business logic based on activity type
        switch (activity.type) {
            case 'message':
                // Ensure message count is positive
                if (processed.metadata?.messageCount) {
                    processed.metadata.messageCount = Math.max(1, processed.metadata.messageCount);
                }
                break;

            case 'game':
                // Ensure score is non-negative
                if (processed.score !== undefined) {
                    processed.score = Math.max(0, processed.score);
                }
                break;

            case 'login':
                // Add session tracking
                processed.metadata = {
                    ...processed.metadata,
                    sessionId: this.generateSessionId(),
                    timestamp: Date.now()
                };
                break;

            case 'profile_view':
                // Add view tracking
                processed.metadata = {
                    ...processed.metadata,
                    timestamp: Date.now()
                };
                break;
        }

        return processed;
    }

    /**
     * Check and unlock achievements based on current stats
     */
    private async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
        try {
            const stats = await this.getActivityStats(userId);
            return await this.evaluateAchievements(userId, stats);
        } catch (error) {
            // Don't fail the main operation if achievement checking fails
            console.warn('Achievement checking failed:', error);
            return [];
        }
    }

    /**
     * Evaluate achievements based on current statistics
     */
    private async evaluateAchievements(userId: string, stats: ActivityStats): Promise<Achievement[]> {
        const newAchievements: Achievement[] = [];
        const currentAchievements = await this.getAchievements(userId).catch(() => []);
        const achievementIds = new Set(currentAchievements.map(a => a.id));

        // Define achievement thresholds and check them
        const achievementChecks = [
            // Messaging achievements
            {
                id: 'first_message',
                name: 'First Message',
                description: 'Send your first message',
                category: 'messaging' as const,
                condition: stats.totalMessages >= 1
            },
            {
                id: 'chatty',
                name: 'Chatty',
                description: 'Send 100 messages',
                category: 'messaging' as const,
                condition: stats.totalMessages >= 100
            },
            {
                id: 'conversation_master',
                name: 'Conversation Master',
                description: 'Send 1000 messages',
                category: 'messaging' as const,
                condition: stats.totalMessages >= 1000
            },

            // Gaming achievements
            {
                id: 'first_game',
                name: 'First Game',
                description: 'Play your first game',
                category: 'gaming' as const,
                condition: stats.totalGamesPlayed >= 1
            },
            {
                id: 'gamer',
                name: 'Gamer',
                description: 'Play 50 games',
                category: 'gaming' as const,
                condition: stats.totalGamesPlayed >= 50
            },
            {
                id: 'gaming_legend',
                name: 'Gaming Legend',
                description: 'Play 500 games',
                category: 'gaming' as const,
                condition: stats.totalGamesPlayed >= 500
            },

            // Time-based achievements
            {
                id: 'dedicated',
                name: 'Dedicated',
                description: 'Spend 10 hours in the app',
                category: 'time' as const,
                condition: stats.timeSpent >= 600 // 10 hours in minutes
            },
            {
                id: 'streak_week',
                name: 'Week Streak',
                description: 'Maintain a 7-day activity streak',
                category: 'time' as const,
                condition: stats.currentStreak >= 7
            },
            {
                id: 'streak_month',
                name: 'Month Streak',
                description: 'Maintain a 30-day activity streak',
                category: 'time' as const,
                condition: stats.currentStreak >= 30
            },

            // Social achievements
            {
                id: 'social_butterfly',
                name: 'Social Butterfly',
                description: 'Be active in both messaging and gaming',
                category: 'social' as const,
                condition: stats.totalMessages >= 10 && stats.totalGamesPlayed >= 10
            }
        ];

        // Check each achievement
        for (const check of achievementChecks) {
            if (check.condition && !achievementIds.has(check.id)) {
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
     * Generate a session ID for tracking
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}