import { fetchJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import { transformBackendActivityStats } from '../utils/ActivityStatsTransformer';
import { requireUserId } from '../utils/validation';
import type { ActivityStats } from '../types';

/**
 * Service for calculating and retrieving activity statistics
 * Handles stats retrieval, streak calculation, and activity summaries
 */
export class ActivityStatsService {
    /**
     * Get activity statistics for a user
     */
    async getActivityStats(userId: string): Promise<ActivityStats> {
        requireUserId(userId);

        try {
            const backendStats = await fetchJson<any>(API_ENDPOINTS.PROFILES.STATS(userId));
            return transformBackendActivityStats(backendStats);
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
     * Calculate streak information
     */
    async calculateStreak(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
    }> {
        requireUserId(userId);

        try {
            const stats = await this.getActivityStats(userId);
            return {
                currentStreak: stats.currentStreak,
                longestStreak: stats.longestStreak
            };
        } catch (error) {
            // Return default values if stats unavailable
            return {
                currentStreak: 0,
                longestStreak: 0
            };
        }
    }

    /**
     * Get activity summary for a time period
     */
    async getActivitySummary(
        userId: string,
        days: number = 7
    ): Promise<{
        messagesThisPeriod: number;
        gamesThisPeriod: number;
        averageDaily: number;
        mostActiveDay: string;
    }> {
        requireUserId(userId);

        if (days <= 0) {
            throw new AppError(
                'Days must be positive',
                ERROR_CODES.INVALID_INPUT,
                'Le nombre de jours doit être positif'
            );
        }

        try {
            const stats = await this.getActivityStats(userId);
            
            // Calculate average daily activity
            const totalActivities = stats.totalMessages + stats.totalGamesPlayed;
            const averageDaily = Math.round(totalActivities / days);
            
            return {
                messagesThisPeriod: stats.totalMessages,
                gamesThisPeriod: stats.totalGamesPlayed,
                averageDaily,
                mostActiveDay: this.determineMostActiveDay(stats)
            };
        } catch (error) {
            // Return default values if calculation fails
            return {
                messagesThisPeriod: 0,
                gamesThisPeriod: 0,
                averageDaily: 0,
                mostActiveDay: 'None'
            };
        }
    }

    /**
     * Aggregate activity data for analytics
     */
    async aggregateActivityData(
        userId: string,
        _startDate?: Date,
        _endDate?: Date
    ): Promise<{
        totalActivities: number;
        messageCount: number;
        gameCount: number;
        loginCount: number;
        profileViewCount: number;
        timeSpent: number;
    }> {
        requireUserId(userId);

        try {
            const stats = await this.getActivityStats(userId);
            
            // In a real implementation, this would filter by date range
            // For now, return all-time stats
            return {
                totalActivities: stats.totalMessages + stats.totalGamesPlayed,
                messageCount: stats.totalMessages,
                gameCount: stats.totalGamesPlayed,
                loginCount: 0, // Would come from backend
                profileViewCount: 0, // Would come from backend
                timeSpent: stats.timeSpent
            };
        } catch (error) {
            throw new AppError(
                'Failed to aggregate activity data',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de l\'agrégation des données d\'activité',
                error
            );
        }
    }

    // Private helper methods

    /**
     * Determine the most active day based on stats
     */
    private determineMostActiveDay(stats: ActivityStats): string {
        // In a real implementation, this would analyze daily activity patterns
        // For now, return a placeholder based on current streak
        if (stats.currentStreak > 0) {
            return 'Today';
        }
        return 'None';
    }
}
