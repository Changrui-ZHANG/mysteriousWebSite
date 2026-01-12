import { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityService } from '../services/ActivityService';
import { useSilentErrorHandler } from '../../../shared/hooks/useSilentErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import { useRetryableRequest } from '../../../shared/hooks/useRetryableRequest';
import { ERROR_CODES } from '../../../shared/utils/errorHandling';
import type { ActivityStats, Achievement, ActivityUpdate } from '../types';

interface UseActivityStatsProps {
    userId: string;
    autoRefresh?: boolean;
    refreshInterval?: number; // in milliseconds
}

interface UseActivityStatsReturn {
    // State
    stats: ActivityStats | null;
    achievements: Achievement[];
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    lastUpdated: Date | null;
    
    // Actions
    refreshStats: () => Promise<void>;
    refreshAchievements: () => Promise<void>;
    recordActivity: (activity: ActivityUpdate) => Promise<void>;
    recordMessage: (messageCount?: number) => Promise<void>;
    recordGame: (gameType: string, score: number, metadata?: Record<string, any>) => Promise<void>;
    recordLogin: () => Promise<void>;
    recordProfileView: (profileId: string) => Promise<void>;
    clearError: () => void;
    
    // Helpers
    hasStats: boolean;
    hasAchievements: boolean;
    canRetry: boolean;
    retryLoad: () => Promise<void>;
    getStreakInfo: () => { current: number; longest: number };
    getTotalActivity: () => number;
    getActivitySummary: (days?: number) => Promise<{
        messagesThisPeriod: number;
        gamesThisPeriod: number;
        averageDaily: number;
        mostActiveDay: string;
    }>;
}

/**
 * Hook for activity statistics and achievement management with retry protection
 * Prevents infinite request loops while providing robust error handling
 */
export function useActivityStats({ 
    userId, 
    autoRefresh = false, 
    refreshInterval = 30000 // 30 seconds
}: UseActivityStatsProps): UseActivityStatsReturn {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [activityQueue, setActivityQueue] = useState<ActivityUpdate[]>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    
    const { handleError } = useSilentErrorHandler();
    const { success: showToast } = useToastContext();
    const activityService = new ActivityService();
    const refreshIntervalRef = useRef<number | null>(null);
    const queueProcessorRef = useRef<number | null>(null);

    // Retryable request hook for stats loading
    const {
        data: stats,
        isLoading,
        error,
        canRetry,
        executeRequest: executeStatsRequest,
        retry: retryStatsRequest,
        reset: resetStatsRequest
    } = useRetryableRequest<ActivityStats>(`activity-stats-${userId}`, {
        maxAttempts: 3,
        baseDelay: 2000,
        maxDelay: 10000
    });

    // Retryable request hook for achievements loading
    const {
        executeRequest: executeAchievementsRequest
    } = useRetryableRequest<Achievement[]>(`achievements-${userId}`, {
        maxAttempts: 2,
        baseDelay: 1000,
        maxDelay: 5000
    });

    // Computed values
    const hasStats = stats !== null;
    const hasAchievements = achievements.length > 0;

    /**
     * Load activity statistics with retry protection
     */
    const loadStats = useCallback(async () => {
        if (isLoading || isProcessingQueue) return;
        
        try {
            await executeStatsRequest(
                async () => {
                    return await activityService.getActivityStats(userId);
                },
                {
                    onSuccess: () => {
                        setLastUpdated(new Date());
                    },
                    onFailure: (error) => {
                        // Only log network errors, don't show toast to avoid spam
                        if (error.code === ERROR_CODES.NETWORK_ERROR) {
                            console.warn('Network error loading activity stats:', error.message);
                        } else {
                            console.warn('Failed to load activity stats:', error.message);
                        }
                    },
                    onRetry: (attempt, error) => {
                        console.log(`Retrying stats load (attempt ${attempt}):`, error.message);
                    }
                }
            );
        } catch (err) {
            console.error('Stats load failed after all retries:', err);
        }
    }, [userId, activityService, executeStatsRequest, isLoading, isProcessingQueue]);

    /**
     * Load achievements with retry protection
     */
    const loadAchievements = useCallback(async () => {
        try {
            await executeAchievementsRequest(
                async () => {
                    return await activityService.getAchievements(userId);
                },
                {
                    onSuccess: (data) => {
                        setAchievements(data);
                    },
                    onFailure: (error) => {
                        if (error.code !== ERROR_CODES.NETWORK_ERROR) {
                            console.warn('Failed to load achievements:', error.message);
                        }
                    }
                }
            );
        } catch (err) {
            console.error('Achievements load failed:', err);
        }
    }, [userId, activityService, executeAchievementsRequest]);

    /**
     * Process activity queue to batch requests and prevent spam
     */
    const processActivityQueue = useCallback(async () => {
        if (isProcessingQueue || activityQueue.length === 0) return;
        
        setIsProcessingQueue(true);
        const currentQueue = [...activityQueue];
        setActivityQueue([]);
        
        try {
            // Batch similar activities
            const batched = batchActivities(currentQueue);
            
            for (const activity of batched) {
                try {
                    await activityService.updateActivityStats(userId, activity);
                    
                    // Check for new achievements (but don't spam)
                    if (activity.type === 'game' || activity.type === 'message') {
                        const newAchievements = await activityService.checkAchievements(userId);
                        if (newAchievements.length > 0) {
                            setAchievements(prev => [...prev, ...newAchievements]);
                            
                            // Show achievement notifications (limited)
                            newAchievements.slice(0, 2).forEach(achievement => {
                                showToast(`Achievement unlocked: ${achievement.name}`);
                            });
                        }
                    }
                } catch (err) {
                    console.warn('Failed to record activity:', err);
                    // Don't throw - continue processing other activities
                }
            }
            
            // Refresh stats after processing activities
            await loadStats();
            
        } catch (err) {
            console.error('Activity queue processing failed:', err);
        } finally {
            setIsProcessingQueue(false);
        }
    }, [userId, activityService, activityQueue, isProcessingQueue, showToast, loadStats]);

    /**
     * Queue activity for batch processing
     */
    const recordActivity = useCallback(async (activity: ActivityUpdate) => {
        if (isProcessingQueue) return;
        
        // Add to queue instead of immediate processing
        setActivityQueue(prev => [...prev, activity]);
        
        // Debounce queue processing
        if (queueProcessorRef.current) {
            clearTimeout(queueProcessorRef.current);
        }
        
        queueProcessorRef.current = setTimeout(() => {
            processActivityQueue();
        }, 1000); // Process queue after 1 second of inactivity
    }, [processActivityQueue, isProcessingQueue]);

    /**
     * Refresh statistics
     */
    const refreshStats = useCallback(async () => {
        resetStatsRequest();
        await loadStats();
    }, [loadStats, resetStatsRequest]);

    /**
     * Refresh achievements
     */
    const refreshAchievements = useCallback(async () => {
        await loadAchievements();
    }, [loadAchievements]);

    /**
     * Retry loading stats
     */
    const retryLoad = useCallback(async () => {
        if (canRetry) {
            try {
                await retryStatsRequest(
                    async () => {
                        return await activityService.getActivityStats(userId);
                    },
                    {
                        onSuccess: () => {
                            setLastUpdated(new Date());
                        }
                    }
                );
            } catch (err) {
                console.error('Stats retry failed:', err);
            }
        }
    }, [canRetry, retryStatsRequest, userId, activityService]);

    /**
     * Record message activity
     */
    const recordMessage = useCallback(async (messageCount: number = 1) => {
        const activity: ActivityUpdate = {
            type: 'message',
            metadata: { messageCount }
        };
        await recordActivity(activity);
    }, [recordActivity]);

    /**
     * Record game activity
     */
    const recordGame = useCallback(async (gameType: string, score: number, metadata?: Record<string, any>) => {
        const activity: ActivityUpdate = {
            type: 'game',
            gameType,
            score,
            metadata
        };
        await recordActivity(activity);
    }, [recordActivity]);

    /**
     * Record login activity
     */
    const recordLogin = useCallback(async () => {
        const activity: ActivityUpdate = {
            type: 'login',
            metadata: { timestamp: Date.now() }
        };
        await recordActivity(activity);
    }, [recordActivity]);

    /**
     * Record profile view activity
     */
    const recordProfileView = useCallback(async (profileId: string) => {
        const activity: ActivityUpdate = {
            type: 'profile_view',
            metadata: { profileId, timestamp: Date.now() }
        };
        await recordActivity(activity);
    }, [recordActivity]);

    /**
     * Get streak information
     */
    const getStreakInfo = useCallback(() => {
        if (!stats) return { current: 0, longest: 0 };
        return {
            current: stats.currentStreak,
            longest: stats.longestStreak
        };
    }, [stats]);

    /**
     * Get total activity count
     */
    const getTotalActivity = useCallback(() => {
        if (!stats) return 0;
        return stats.totalMessages + stats.totalGamesPlayed;
    }, [stats]);

    /**
     * Get activity summary for a period
     */
    const getActivitySummary = useCallback(async (days: number = 7) => {
        try {
            return await activityService.getActivitySummary(userId, days);
        } catch (err) {
            handleError(err);
            return {
                messagesThisPeriod: 0,
                gamesThisPeriod: 0,
                averageDaily: 0,
                mostActiveDay: 'None'
            };
        }
    }, [userId, activityService, handleError]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        resetStatsRequest();
    }, [resetStatsRequest]);

    /**
     * Setup auto-refresh with intelligent backoff
     */
    const setupAutoRefresh = useCallback(() => {
        if (autoRefresh && refreshInterval > 0 && !error) {
            refreshIntervalRef.current = setInterval(() => {
                // Only refresh if not currently loading and no errors
                if (!isLoading && !error) {
                    loadStats();
                }
            }, refreshInterval);
        }
    }, [autoRefresh, refreshInterval, loadStats, isLoading, error]);

    /**
     * Clear auto-refresh
     */
    const clearAutoRefresh = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    }, []);

    // Load initial data
    useEffect(() => {
        if (userId) {
            loadStats();
            loadAchievements();
        }
    }, [userId, loadStats, loadAchievements]);

    // Setup auto-refresh
    useEffect(() => {
        clearAutoRefresh();
        setupAutoRefresh();
        return clearAutoRefresh;
    }, [setupAutoRefresh, clearAutoRefresh]);

    // Process activity queue on mount
    useEffect(() => {
        return () => {
            if (queueProcessorRef.current) {
                clearTimeout(queueProcessorRef.current);
            }
            clearAutoRefresh();
        };
    }, [clearAutoRefresh]);

    return {
        // State
        stats,
        achievements,
        isLoading,
        isUpdating: isProcessingQueue,
        error,
        lastUpdated,
        
        // Actions
        refreshStats,
        refreshAchievements,
        recordActivity,
        recordMessage,
        recordGame,
        recordLogin,
        recordProfileView,
        clearError,
        
        // Helpers
        hasStats,
        hasAchievements,
        canRetry,
        retryLoad,
        getStreakInfo,
        getTotalActivity,
        getActivitySummary
    };
}

/**
 * Batch similar activities to reduce API calls
 */
function batchActivities(activities: ActivityUpdate[]): ActivityUpdate[] {
    const batched: ActivityUpdate[] = [];
    const messageActivities = activities.filter(a => a.type === 'message');
    const otherActivities = activities.filter(a => a.type !== 'message');
    
    // Batch message activities
    if (messageActivities.length > 0) {
        const totalMessages = messageActivities.reduce((sum, activity) => {
            return sum + (activity.metadata?.messageCount || 1);
        }, 0);
        
        batched.push({
            type: 'message',
            metadata: { messageCount: totalMessages }
        });
    }
    
    // Keep other activities as-is (games, logins, etc.)
    batched.push(...otherActivities);
    
    return batched;
}