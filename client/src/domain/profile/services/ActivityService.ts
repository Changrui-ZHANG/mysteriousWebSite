import { requireUserId } from '../utils/validation';
import type { ActivityStats, ActivityUpdate, Achievement } from '../types';
import { ActivityTrackingService } from './ActivityTrackingService';
import { ActivityStatsService } from './ActivityStatsService';
import { AchievementService } from './AchievementService';
import { validateActivityUpdate } from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';

/**
 * @deprecated Use ActivityTrackingService, ActivityStatsService, and AchievementService instead
 * 
 * Legacy service for activity tracking and achievement management
 * This class is maintained for backward compatibility but delegates to the new focused services
 * 
 * Migration guide:
 * - For recording activities: Use ActivityTrackingService
 * - For stats and calculations: Use ActivityStatsService
 * - For achievements: Use AchievementService
 */
export class ActivityService {
    private trackingService: ActivityTrackingService;
    private statsService: ActivityStatsService;
    private achievementService: AchievementService;

    constructor() {
        this.trackingService = new ActivityTrackingService();
        this.statsService = new ActivityStatsService();
        this.achievementService = new AchievementService(this.statsService);
    }

    /**
     * @deprecated Use ActivityTrackingService.recordMessageActivity() or other specific methods
     */
    async updateActivityStats(userId: string, activity: ActivityUpdate): Promise<void> {
        requireUserId(userId);

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

        // Delegate to appropriate tracking service method
        switch (activity.type) {
            case 'message':
                await this.trackingService.recordMessageActivity(
                    userId,
                    activity.metadata?.messageCount || 1
                );
                break;
            case 'game':
                await this.trackingService.recordGameActivity(
                    userId,
                    activity.gameType || '',
                    activity.score || 0,
                    activity.metadata
                );
                break;
            case 'login':
                await this.trackingService.recordLoginActivity(userId);
                break;
            case 'profile_view':
                await this.trackingService.recordProfileView(
                    userId,
                    activity.metadata?.profileId || ''
                );
                break;
        }

        // Check for new achievements after activity update
        await this.achievementService.checkAndUnlockAchievements(userId);
    }

    /**
     * @deprecated Use ActivityStatsService.getActivityStats()
     */
    async getActivityStats(userId: string): Promise<ActivityStats> {
        return this.statsService.getActivityStats(userId);
    }

    /**
     * @deprecated Use AchievementService.checkAchievements()
     */
    async checkAchievements(userId: string): Promise<Achievement[]> {
        return this.achievementService.checkAchievements(userId);
    }

    /**
     * @deprecated Use AchievementService.getAchievements()
     */
    async getAchievements(userId: string): Promise<Achievement[]> {
        return this.achievementService.getAchievements(userId);
    }

    /**
     * @deprecated Use ActivityTrackingService.recordMessageActivity()
     */
    async recordMessageActivity(userId: string, messageCount: number = 1): Promise<void> {
        await this.trackingService.recordMessageActivity(userId, messageCount);
        await this.achievementService.checkAndUnlockAchievements(userId);
    }

    /**
     * @deprecated Use ActivityTrackingService.recordGameActivity()
     */
    async recordGameActivity(userId: string, gameType: string, score: number, metadata?: Record<string, any>): Promise<void> {
        await this.trackingService.recordGameActivity(userId, gameType, score, metadata);
        await this.achievementService.checkAndUnlockAchievements(userId);
    }

    /**
     * @deprecated Use ActivityTrackingService.recordLoginActivity()
     */
    async recordLoginActivity(userId: string): Promise<void> {
        await this.trackingService.recordLoginActivity(userId);
    }

    /**
     * @deprecated Use ActivityTrackingService.recordProfileView()
     */
    async recordProfileViewActivity(viewerId: string, profileId: string): Promise<void> {
        await this.trackingService.recordProfileView(viewerId, profileId);
    }

    /**
     * @deprecated Use ActivityStatsService.calculateStreak()
     */
    async calculateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
        return this.statsService.calculateStreak(userId);
    }

    /**
     * @deprecated Use ActivityStatsService.getActivitySummary()
     */
    async getActivitySummary(userId: string, days: number = 7): Promise<{
        messagesThisPeriod: number;
        gamesThisPeriod: number;
        averageDaily: number;
        mostActiveDay: string;
    }> {
        return this.statsService.getActivitySummary(userId, days);
    }

    /**
     * @deprecated Use AchievementService.initializeDefaultAchievements()
     */
    async initializeDefaultAchievements(): Promise<void> {
        return this.achievementService.initializeDefaultAchievements();
    }
}