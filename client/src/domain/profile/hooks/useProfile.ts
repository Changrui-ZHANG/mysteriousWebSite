import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/ProfileService';
import { useSilentErrorHandler } from '../../../shared/hooks/useSilentErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import { useConnectionState } from '../../../shared/hooks/useConnectionState';
import { useRealTimeProfile } from './useRealTimeProfile';
import type { 
    UserProfile, 
    CreateProfileRequest, 
    UpdateProfileRequest, 
    PrivacySettings 
} from '../types';

interface UseProfileProps {
    userId?: string;
    viewerId?: string;
}

interface UseProfileReturn {
    // State
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    isCreating: boolean;
    isUpdating: boolean;
    
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
    createProfile: (data: CreateProfileRequest) => Promise<void>;
    updateProfile: (data: UpdateProfileRequest) => Promise<void>;
    updatePrivacySettings: (settings: PrivacySettings) => Promise<void>;
    refreshProfile: () => Promise<void>;
    clearError: () => void;
    
    // Helpers
    hasProfile: boolean;
    isOwnProfile: boolean;
    canRetry: boolean;
    retryLoad: () => Promise<void>;
}

/**
 * Hook for profile management with manual retry to avoid error loops
 * Uses useConnectionState to prevent automatic retries
 */
export function useProfile({ userId, viewerId }: UseProfileProps = {}): UseProfileReturn {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastLoadedUserId, setLastLoadedUserId] = useState<string | undefined>();
    
    const { handleError } = useSilentErrorHandler();
    const { success: showToast } = useToastContext();
    const profileService = new ProfileService();

    /**
     * Load profile data avec gestion d'erreur sans boucle
     */
    const loadProfile = useCallback(async (targetUserId: string) => {
        if (isLoading || isCreating || isUpdating) return;
        
        try {
            setIsLoading(true);
            
            const profileData = await profileService.getProfile(targetUserId, viewerId);
            setProfile(profileData);
            setLastLoadedUserId(targetUserId);
            
            return profileData; // Retourner les données pour useConnectionState
        } catch (error) {
            setProfile(null);
            throw error; // Re-throw pour que useConnectionState puisse gérer l'erreur
        } finally {
            setIsLoading(false);
        }
    }, [profileService, viewerId, isLoading, isCreating, isUpdating]);

    // Gestion de l'état de connexion pour éviter les boucles d'erreur
    const connectionState = useConnectionState(
        async () => {
            // Fonction de retry pour le profil
            if (userId) {
                await loadProfile(userId);
            }
        },
        3 // Maximum 3 tentatives
    );

    // Computed values
    const hasProfile = profile !== null;
    const isOwnProfile = userId && viewerId ? userId === viewerId : false;

    // Real-time profile updates
    const realTimeProfile = useRealTimeProfile({
        userId,
        onProfileUpdate: (updatedData) => {
            if (profile) {
                setProfile(prev => prev ? { ...prev, ...updatedData } : null);
            }
        },
        onPrivacyUpdate: (privacySettings) => {
            if (profile) {
                setProfile(prev => prev ? { ...prev, privacySettings } : null);
            }
        },
        enableNotifications: isOwnProfile
    });

    /**
     * Create a new profile
     */
    const createProfile = useCallback(async (data: CreateProfileRequest) => {
        if (isCreating || isLoading || isUpdating) return;
        
        try {
            setIsCreating(true);
            
            const newProfile = await profileService.createProfile(data);
            setProfile(newProfile);
            
            showToast('Profile created successfully');
        } catch (err) {
            handleError(err);
            throw err; // Re-throw for form handling
        } finally {
            setIsCreating(false);
        }
    }, [profileService, handleError, showToast, isCreating, isLoading, isUpdating]);

    /**
     * Update existing profile
     */
    const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
        if (!userId || !viewerId || isUpdating || isLoading || isCreating) return;
        
        try {
            setIsUpdating(true);
            
            const updatedProfile = await profileService.updateProfile(userId, data, viewerId);
            setProfile(updatedProfile);
            
            // Broadcast real-time update
            realTimeProfile.broadcastProfileUpdate(userId, updatedProfile);
            
            showToast('Profile updated successfully');
        } catch (err) {
            handleError(err);
            throw err; // Re-throw for form handling
        } finally {
            setIsUpdating(false);
        }
    }, [userId, viewerId, profileService, handleError, showToast, isUpdating, isLoading, isCreating, realTimeProfile]);

    /**
     * Update privacy settings
     */
    const updatePrivacySettings = useCallback(async (settings: PrivacySettings) => {
        if (!userId || !viewerId || isUpdating || isLoading || isCreating) return;
        
        try {
            setIsUpdating(true);
            
            await profileService.updatePrivacySettings(userId, settings, viewerId);
            
            // Update local profile state
            if (profile) {
                setProfile({
                    ...profile,
                    privacySettings: settings
                });
            }
            
            // Broadcast real-time update
            realTimeProfile.broadcastProfileUpdate(userId, { privacySettings: settings });
            
            showToast('Privacy settings updated');
        } catch (err) {
            handleError(err);
            throw err;
        } finally {
            setIsUpdating(false);
        }
    }, [userId, viewerId, profile, profileService, handleError, showToast, isUpdating, isLoading, isCreating, realTimeProfile]);

    /**
     * Refresh profile data
     */
    const refreshProfile = useCallback(async () => {
        if (userId) {
            await loadProfile(userId);
        }
    }, [userId, loadProfile]);

    /**
     * Retry loading profile
     */
    const retryLoad = useCallback(async () => {
        if (userId && connectionState.canRetry) {
            await connectionState.manualRetry();
        }
    }, [userId, connectionState]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        connectionState.clearError();
    }, [connectionState]);

    // Load profile when userId changes - UNE SEULE FOIS
    useEffect(() => {
        if (userId && userId !== lastLoadedUserId) {
            loadProfile(userId);
        } else if (!userId) {
            setProfile(null);
            setLastLoadedUserId(undefined);
            connectionState.clearError();
        }
    }, [userId, lastLoadedUserId]); // Pas de loadProfile dans les dépendances pour éviter les boucles

    return {
        // State
        profile,
        isLoading,
        error: connectionState.lastError?.message || null,
        isCreating,
        isUpdating,
        
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
        createProfile,
        updateProfile,
        updatePrivacySettings,
        refreshProfile,
        clearError,
        
        // Helpers
        hasProfile,
        isOwnProfile,
        canRetry: connectionState.canRetry,
        retryLoad
    };
}