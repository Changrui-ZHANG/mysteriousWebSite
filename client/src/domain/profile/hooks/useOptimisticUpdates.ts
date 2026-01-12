import { useState, useCallback, useRef } from 'react';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import type { UserProfile, ActivityStats, UpdateProfileRequest, PrivacySettings } from '../types';

export interface OptimisticUpdate<T> {
    id: string;
    type: 'profile' | 'activity' | 'privacy';
    originalData: T;
    optimisticData: T;
    timestamp: number;
    rollbackTimeout?: number;
}

export interface UseOptimisticUpdatesProps {
    onRollback?: (type: string, error: any) => void;
    rollbackDelay?: number; // milliseconds to wait before auto-rollback
}

export interface UseOptimisticUpdatesReturn {
    // State
    pendingUpdates: OptimisticUpdate<any>[];
    hasPendingUpdates: boolean;
    
    // Profile optimistic updates
    applyOptimisticProfileUpdate: (
        original: UserProfile, 
        update: UpdateProfileRequest,
        onConfirm: () => Promise<UserProfile>,
        onError?: (error: any) => void
    ) => Promise<UserProfile>;
    
    // Activity optimistic updates
    applyOptimisticActivityUpdate: (
        original: ActivityStats,
        update: Partial<ActivityStats>,
        onConfirm: () => Promise<ActivityStats>,
        onError?: (error: any) => void
    ) => Promise<ActivityStats>;
    
    // Privacy optimistic updates
    applyOptimisticPrivacyUpdate: (
        original: UserProfile,
        privacySettings: PrivacySettings,
        onConfirm: () => Promise<void>,
        onError?: (error: any) => void
    ) => Promise<UserProfile>;
    
    // Manual control
    confirmUpdate: (updateId: string) => void;
    rollbackUpdate: (updateId: string) => void;
    rollbackAllUpdates: () => void;
    clearPendingUpdates: () => void;
    
    // Helpers
    isPending: (type: string) => boolean;
    getPendingUpdate: (type: string) => OptimisticUpdate<any> | null;
}

/**
 * Hook for optimistic updates with automatic rollback on failure
 * Provides immediate UI feedback while API calls are in progress
 */
export function useOptimisticUpdates({
    onRollback,
    rollbackDelay = 10000 // 10 seconds default
}: UseOptimisticUpdatesProps = {}): UseOptimisticUpdatesReturn {
    
    const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<any>[]>([]);
    const { error: showError } = useToastContext();
    const timeoutRefs = useRef<Map<string, number>>(new Map());

    // Generate unique update ID
    const generateUpdateId = useCallback(() => {
        return `update_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }, []);

    // Remove optimistic update
    const removeOptimisticUpdate = useCallback((updateId: string) => {
        setPendingUpdates(prev => prev.filter(update => update.id !== updateId));
        
        // Clear timeout
        const timeout = timeoutRefs.current.get(updateId);
        if (timeout) {
            clearTimeout(timeout);
            timeoutRefs.current.delete(updateId);
        }
    }, []);

    // Confirm update (remove from pending)
    const confirmUpdate = useCallback((updateId: string) => {
        removeOptimisticUpdate(updateId);
    }, [removeOptimisticUpdate]);

    // Rollback update
    const rollbackUpdate = useCallback((updateId: string) => {
        const update = pendingUpdates.find(u => u.id === updateId);
        if (update && onRollback) {
            onRollback(update.type, new Error('Update rolled back'));
        }
        
        removeOptimisticUpdate(updateId);
    }, [pendingUpdates, onRollback, removeOptimisticUpdate]);

    // Add optimistic update
    const addOptimisticUpdate = useCallback(<T>(
        type: 'profile' | 'activity' | 'privacy',
        originalData: T,
        optimisticData: T
    ): string => {
        const updateId = generateUpdateId();
        
        const update: OptimisticUpdate<T> = {
            id: updateId,
            type,
            originalData,
            optimisticData,
            timestamp: Date.now()
        };

        setPendingUpdates(prev => [...prev, update]);

        // Set auto-rollback timeout
        if (rollbackDelay > 0) {
            const timeout = setTimeout(() => {
                rollbackUpdate(updateId);
            }, rollbackDelay);
            
            timeoutRefs.current.set(updateId, timeout);
        }

        return updateId;
    }, [generateUpdateId, rollbackDelay, rollbackUpdate]);

    // Apply optimistic profile update
    const applyOptimisticProfileUpdate = useCallback(async (
        original: UserProfile,
        update: UpdateProfileRequest,
        onConfirm: () => Promise<UserProfile>,
        onError?: (error: any) => void
    ): Promise<UserProfile> => {
        // Create optimistic data with proper type handling
        const optimisticProfile: UserProfile = {
            ...original,
            displayName: update.displayName || original.displayName,
            bio: update.bio !== undefined ? update.bio : original.bio,
            avatarUrl: update.avatarUrl !== undefined ? update.avatarUrl : original.avatarUrl,
            privacySettings: update.privacySettings ? {
                profileVisibility: update.privacySettings.profileVisibility || original.privacySettings?.profileVisibility || 'public',
                showBio: update.privacySettings.showBio !== undefined ? update.privacySettings.showBio : (original.privacySettings?.showBio || true),
                showStats: update.privacySettings.showStats !== undefined ? update.privacySettings.showStats : (original.privacySettings?.showStats || true),
                showAchievements: update.privacySettings.showAchievements !== undefined ? update.privacySettings.showAchievements : (original.privacySettings?.showAchievements || true),
                showLastActive: update.privacySettings.showLastActive !== undefined ? update.privacySettings.showLastActive : (original.privacySettings?.showLastActive || true)
            } : original.privacySettings
        };

        const updateId = addOptimisticUpdate('profile', original, optimisticProfile);

        try {
            // Perform actual update
            const confirmedProfile = await onConfirm();
            
            // Confirm update (remove from pending)
            confirmUpdate(updateId);
            
            return confirmedProfile;
        } catch (error) {
            // Rollback on error
            rollbackUpdate(updateId);
            
            if (onError) {
                onError(error);
            } else {
                showError('Failed to update profile');
            }
            
            throw error;
        }
    }, [addOptimisticUpdate, confirmUpdate, rollbackUpdate, showError]);

    // Apply optimistic activity update
    const applyOptimisticActivityUpdate = useCallback(async (
        original: ActivityStats,
        update: Partial<ActivityStats>,
        onConfirm: () => Promise<ActivityStats>,
        onError?: (error: any) => void
    ): Promise<ActivityStats> => {
        // Create optimistic data
        const optimisticStats: ActivityStats = {
            ...original,
            ...update
        };

        const updateId = addOptimisticUpdate('activity', original, optimisticStats);

        try {
            // Perform actual update
            const confirmedStats = await onConfirm();
            
            // Confirm update
            confirmUpdate(updateId);
            
            return confirmedStats;
        } catch (error) {
            // Rollback on error
            rollbackUpdate(updateId);
            
            if (onError) {
                onError(error);
            } else {
                showError('Failed to update activity stats');
            }
            
            throw error;
        }
    }, [addOptimisticUpdate, confirmUpdate, rollbackUpdate, showError]);

    // Apply optimistic privacy update
    const applyOptimisticPrivacyUpdate = useCallback(async (
        original: UserProfile,
        privacySettings: PrivacySettings,
        onConfirm: () => Promise<void>,
        onError?: (error: any) => void
    ): Promise<UserProfile> => {
        // Create optimistic data
        const optimisticProfile: UserProfile = {
            ...original,
            privacySettings
        };

        const updateId = addOptimisticUpdate('privacy', original, optimisticProfile);

        try {
            // Perform actual update
            await onConfirm();
            
            // Confirm update
            confirmUpdate(updateId);
            
            return optimisticProfile;
        } catch (error) {
            // Rollback on error
            rollbackUpdate(updateId);
            
            if (onError) {
                onError(error);
            } else {
                showError('Failed to update privacy settings');
            }
            
            throw error;
        }
    }, [addOptimisticUpdate, confirmUpdate, rollbackUpdate, showError]);

    // Rollback all updates
    const rollbackAllUpdates = useCallback(() => {
        pendingUpdates.forEach(update => {
            if (onRollback) {
                onRollback(update.type, new Error('All updates rolled back'));
            }
        });
        
        setPendingUpdates([]);
        
        // Clear all timeouts
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current.clear();
    }, [pendingUpdates, onRollback]);

    // Clear pending updates without rollback
    const clearPendingUpdates = useCallback(() => {
        setPendingUpdates([]);
        
        // Clear all timeouts
        timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
        timeoutRefs.current.clear();
    }, []);

    // Check if update is pending
    const isPending = useCallback((type: string) => {
        return pendingUpdates.some(update => update.type === type);
    }, [pendingUpdates]);

    // Get pending update by type
    const getPendingUpdate = useCallback((type: string) => {
        return pendingUpdates.find(update => update.type === type) || null;
    }, [pendingUpdates]);

    // Computed values
    const hasPendingUpdates = pendingUpdates.length > 0;

    return {
        // State
        pendingUpdates,
        hasPendingUpdates,
        
        // Optimistic updates
        applyOptimisticProfileUpdate,
        applyOptimisticActivityUpdate,
        applyOptimisticPrivacyUpdate,
        
        // Manual control
        confirmUpdate,
        rollbackUpdate,
        rollbackAllUpdates,
        clearPendingUpdates,
        
        // Helpers
        isPending,
        getPendingUpdate
    };
}