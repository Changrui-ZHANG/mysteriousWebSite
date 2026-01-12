import { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityService } from '../services/ActivityService';
import { useSilentErrorHandler } from '../../../shared/hooks/useSilentErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import { useConnectionState } from '../../../shared/hooks/useConnectionState';
import { useRealTimeProfile } from './useRealTimeProfile';
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
    
    // Connection state - NOUVEAU pour éviter les boucles d'erreur
    connectionState: any;
    connectionError: any;
    isRetrying: boolean;
    canRetryConnection: boolean;
    retryConnection: () => Promise<void>;
    clearConnectionError: () => void;
    
    // Real-time updates
    isRealTimeConnected: boolean;
    realTimeConnectionState: string;
    
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
 * Hook for activity statistics with manual retry to avoid error loops
 * Uses useConnectionState to prevent automatic retries
 */
export function useActivityStats({ 
    userId, 
    autoRefresh = false, 
    refreshInterval = 30000 // 30 seconds
}: UseActivityStatsProps): UseActivityStatsReturn {
    const [stats, setStats] = useState<ActivityStats | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [activityQueue, setActivityQueue] = useState<ActivityUpdate[]>([]);
    const [isProcessingQueue, setIsProcessingQueue] = useState(false);
    
    const { handleError } = useSilentErrorHandler();
    const { success: showToast } = useToastContext();
    const activityService = new ActivityService();
    const refreshIntervalRef = useRef<number | null>(null);
    const queueProcessorRef = useRef<number | null>(null);

    /**
     * Load activity statistics avec gestion d'erreur sans boucle
     */
    const loadStats = useCallback(async () => {
        if (isLoading || isProcessingQueue) return;
        
        try {
            setIsLoading(true);
            
            const statsData = await activityService.getActivityStats(userId);
            setStats(statsData);
            setLastUpdated(new Date());
            
            return statsData; // Retourner les données pour useConnectionState
        } catch (error) {
            throw error; // Re-throw pour que useConnectionState puisse gérer l'erreur
        } finally {
            setIsLoading(false);
        }
    }, [userId, activityService, isLoading, isProcessingQueue]);

    // Gestion de l'état de connexion pour éviter les boucles d'erreur
    const connectionState = useConnectionState(
        async () => {
            // Fonction de retry pour les stats d'activité
            await loadStats();
        },
        3 // Maximum 3 tentatives
    );

    // Real-time activity updates
    const realTimeProfile = useRealTimeProfile({
        userId,
        onActivityUpdate: (updatedStats) => {
            setStats(updatedStats);
            setLastUpdated(new Date());
        },
        onAchievementUnlocked: (achievement) => {
            setAchievements(prev => [...prev, achievement]);
        },
        enableNotifications: true
    });

    // Computed values
    const hasStats = stats !== null;
    const hasAchievements = achievements.length > 0;

    /**
     * Load achievements avec gestion d'erreur sans boucle
     */
    const loadAchievements = useCallback(async () => {
        try {
            const achievementsData = await activityService.getAchievements(userId);
            setAchievements(achievementsData);
        } catch (error) {
            console.warn('Failed to load achievements:', error);
            // Ne pas déclencher d'erreur de connexion pour les achievements
        }
    }, [userId, activityService]);

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
            
            // Broadcast real-time activity update
            if (stats) {
                realTimeProfile.broadcastActivityUpdate(userId, stats);
            }
            
        } catch (err) {
            console.error('Activity queue processing failed:', err);
        } finally {
            setIsProcessingQueue(false);
        }
    }, [userId, activityService, activityQueue, isProcessingQueue, showToast, loadStats, stats, realTimeProfile]);

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
        await loadStats();
    }, [loadStats]);

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
        if (connectionState.canRetry) {
            await connectionState.manualRetry();
        }
    }, [connectionState]);

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
        connectionState.clearError();
    }, [connectionState]);

    /**
     * Setup auto-refresh with intelligent backoff
     */
    const setupAutoRefresh = useCallback(() => {
        if (autoRefresh && refreshInterval > 0 && connectionState.isConnected) {
            refreshIntervalRef.current = setInterval(() => {
                // Only refresh if not currently loading and connected
                if (!isLoading && connectionState.isConnected) {
                    loadStats();
                }
            }, refreshInterval);
        }
    }, [autoRefresh, refreshInterval, loadStats, isLoading, connectionState]);

    /**
     * Clear auto-refresh
     */
    const clearAutoRefresh = useCallback(() => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    }, []);

    // Load initial data - UNE SEULE FOIS au démarrage
    useEffect(() => {
        if (userId) {
            loadStats();
            loadAchievements();
        }
    }, [userId]); // Pas de loadStats dans les dépendances pour éviter les boucles

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
        error: connectionState.lastError?.message || null,
        lastUpdated,
        
        // Connection state - NOUVEAU pour éviter les boucles d'erreur
        connectionState: connectionState.connectionState,
        connectionError: connectionState.lastError,
        isRetrying: connectionState.isRetrying,
        canRetryConnection: connectionState.canRetry,
        retryConnection: connectionState.manualRetry,
        clearConnectionError: connectionState.clearError,
        
        // Real-time updates
        isRealTimeConnected: realTimeProfile.isConnected,
        realTimeConnectionState: realTimeProfile.connectionState,
        
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
        canRetry: connectionState.canRetry,
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