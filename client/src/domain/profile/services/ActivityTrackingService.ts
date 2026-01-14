import { postJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { validateActivityUpdate } from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import { requireUserId } from '../utils/validation';
import type { ActivityUpdate } from '../types';

/**
 * Service for tracking user activities
 * Handles recording of messages, games, logins, and profile views
 */
export class ActivityTrackingService {
    /**
     * Record message activity
     */
    async recordMessageActivity(userId: string, messageCount: number = 1): Promise<void> {
        requireUserId(userId);

        const activity: ActivityUpdate = {
            type: 'message',
            metadata: { messageCount: Math.max(1, messageCount) }
        };

        await this.recordActivity(userId, activity);
    }

    /**
     * Record game activity
     */
    async recordGameActivity(
        userId: string,
        gameType: string,
        score: number,
        metadata?: Record<string, any>
    ): Promise<void> {
        requireUserId(userId);

        if (!gameType) {
            throw new AppError(
                'Game type is required',
                ERROR_CODES.INVALID_INPUT,
                'Type de jeu requis'
            );
        }

        const activity: ActivityUpdate = {
            type: 'game',
            gameType,
            score: Math.max(0, score),
            metadata
        };

        await this.recordActivity(userId, activity);
    }

    /**
     * Record login activity
     */
    async recordLoginActivity(userId: string): Promise<void> {
        requireUserId(userId);

        const activity: ActivityUpdate = {
            type: 'login',
            metadata: {
                sessionId: this.generateSessionId(),
                timestamp: Date.now()
            }
        };

        await this.recordActivity(userId, activity);
    }

    /**
     * Record profile view activity
     */
    async recordProfileView(viewerId: string, profileId: string): Promise<void> {
        requireUserId(viewerId);
        requireUserId(profileId);

        const activity: ActivityUpdate = {
            type: 'profile_view',
            metadata: {
                profileId,
                timestamp: Date.now()
            }
        };

        await this.recordActivity(viewerId, activity);
    }

    /**
     * Generate a unique session ID for tracking
     */
    generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Private helper methods

    /**
     * Record activity with validation and API call
     */
    private async recordActivity(userId: string, activity: ActivityUpdate): Promise<void> {
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

        try {
            // Send to appropriate endpoint based on activity type
            if (activity.type === 'message') {
                const params = new URLSearchParams({ userId });
                await postJson(`${API_ENDPOINTS.ACTIVITY.MESSAGE}?${params.toString()}`, {});
            } else if (activity.type === 'game') {
                const params = new URLSearchParams({
                    userId,
                    gameType: activity.gameType || '',
                    score: (activity.score || 0).toString()
                });
                await postJson(`${API_ENDPOINTS.ACTIVITY.GAME}?${params.toString()}`, {});
            } else if (activity.type === 'login') {
                const params = new URLSearchParams({ userId });
                await postJson(`${API_ENDPOINTS.ACTIVITY.LOGIN}?${params.toString()}`, {});
            } else if (activity.type === 'profile_view') {
                const params = new URLSearchParams({
                    userId,
                    profileId: activity.metadata?.profileId || ''
                });
                await postJson(`${API_ENDPOINTS.ACTIVITY.PROFILE_VIEW}?${params.toString()}`, {});
            }
        } catch (error) {
            throw new AppError(
                'Failed to record activity',
                ERROR_CODES.OPERATION_FAILED,
                'Échec de l\'enregistrement de l\'activité',
                error
            );
        }
    }
}
