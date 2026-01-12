import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/ProfileService';
import { useSilentErrorHandler } from '../../../shared/hooks/useSilentErrorHandler';
import { useToastContext } from '../../../shared/contexts/ToastContext';
import { useRetryableRequest } from '../../../shared/hooks/useRetryableRequest';
import { ERROR_CODES } from '../../../shared/utils/errorHandling';
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
 * Hook for profile management with intelligent retry and circuit breaker protection
 * Prevents infinite request loops while providing robust error handling
 */
export function useProfile({ userId, viewerId }: UseProfileProps = {}): UseProfileReturn {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastLoadedUserId, setLastLoadedUserId] = useState<string | undefined>();
    
    const { handleError } = useSilentErrorHandler();
    const { success: showToast } = useToastContext();
    const profileService = new ProfileService();

    // Retryable request hook for profile loading
    const {
        data: profileData,
        isLoading,
        error,
        canRetry,
        executeRequest: executeProfileRequest,
        retry: retryProfileRequest,
        reset: resetProfileRequest
    } = useRetryableRequest<UserProfile>(`profile-${userId}`, {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 5000
    });

    // Computed values
    const hasProfile = profile !== null;
    const isOwnProfile = userId && viewerId ? userId === viewerId : false;

    /**
     * Load profile data with retry protection
     */
    const loadProfile = useCallback(async (targetUserId: string) => {
        if (isLoading || isCreating || isUpdating) return;
        
        try {
            await executeProfileRequest(
                async () => {
                    const profileData = await profileService.getProfile(targetUserId, viewerId);
                    return profileData;
                },
                {
                    onSuccess: (data) => {
                        setProfile(data);
                        setLastLoadedUserId(targetUserId);
                    },
                    onFailure: (error) => {
                        // Only show toast for non-network errors to avoid spam
                        if (error.code !== ERROR_CODES.NETWORK_ERROR) {
                            // Don't show toast automatically - let UI handle it with retry button
                            console.warn('Profile load failed:', error.message);
                        }
                        setProfile(null);
                    },
                    onRetry: (attempt, error) => {
                        console.log(`Retrying profile load (attempt ${attempt}):`, error.message);
                    }
                }
            );
        } catch (err) {
            // Error is already handled by the retryable request hook
            console.error('Profile load failed after all retries:', err);
        }
    }, [profileService, viewerId, executeProfileRequest, isLoading, isCreating, isUpdating]);

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
            // Don't show error toast automatically - let UI handle it
            throw err; // Re-throw for form handling
        } finally {
            setIsCreating(false);
        }
    }, [profileService, handleError, showToast, isCreating, isLoading, isUpdating]);

    /**
     * Update existing profile
     */
    const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
        if (!userId || isUpdating || isLoading || isCreating) return;
        
        try {
            setIsUpdating(true);
            
            const updatedProfile = await profileService.updateProfile(userId, data);
            setProfile(updatedProfile);
            
            showToast('Profile updated successfully');
        } catch (err) {
            handleError(err);
            // Don't show error toast automatically - let UI handle it
            throw err; // Re-throw for form handling
        } finally {
            setIsUpdating(false);
        }
    }, [userId, profileService, handleError, showToast, isUpdating, isLoading, isCreating]);

    /**
     * Update privacy settings
     */
    const updatePrivacySettings = useCallback(async (settings: PrivacySettings) => {
        if (!userId || isUpdating || isLoading || isCreating) return;
        
        try {
            setIsUpdating(true);
            
            await profileService.updatePrivacySettings(userId, settings);
            
            // Update local profile state
            if (profile) {
                setProfile({
                    ...profile,
                    privacySettings: settings
                });
            }
            
            showToast('Privacy settings updated');
        } catch (err) {
            handleError(err);
            // Don't show error toast automatically - let UI handle it
            throw err;
        } finally {
            setIsUpdating(false);
        }
    }, [userId, profile, profileService, handleError, showToast, isUpdating, isLoading, isCreating]);

    /**
     * Refresh profile data
     */
    const refreshProfile = useCallback(async () => {
        if (userId) {
            resetProfileRequest();
            await loadProfile(userId);
        }
    }, [userId, loadProfile, resetProfileRequest]);

    /**
     * Retry loading profile
     */
    const retryLoad = useCallback(async () => {
        if (userId && canRetry) {
            try {
                await retryProfileRequest(
                    async () => {
                        return await profileService.getProfile(userId, viewerId);
                    },
                    {
                        onSuccess: (data) => {
                            setProfile(data as UserProfile);
                            setLastLoadedUserId(userId);
                        },
                        onFailure: (error) => {
                            if (error.code !== ERROR_CODES.NETWORK_ERROR) {
                                // Don't show toast automatically - let UI handle it
                                console.warn('Profile retry failed:', error.message);
                            }
                            setProfile(null);
                        }
                    }
                );
            } catch (err) {
                console.error('Profile retry failed:', err);
            }
        }
    }, [userId, canRetry, retryProfileRequest, profileService, viewerId]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        resetProfileRequest();
    }, [resetProfileRequest]);

    // Load profile when userId changes
    useEffect(() => {
        if (userId && userId !== lastLoadedUserId) {
            loadProfile(userId);
        } else if (!userId) {
            setProfile(null);
            setLastLoadedUserId(undefined);
            resetProfileRequest();
        }
    }, [userId, lastLoadedUserId, loadProfile, resetProfileRequest]);

    // Update profile state when profileData changes
    useEffect(() => {
        if (profileData && typeof profileData === 'object') {
            setProfile(profileData as UserProfile);
        }
    }, [profileData]);

    return {
        // State
        profile,
        isLoading,
        error,
        isCreating,
        isUpdating,
        
        // Actions
        createProfile,
        updateProfile,
        updatePrivacySettings,
        refreshProfile,
        clearError,
        
        // Helpers
        hasProfile,
        isOwnProfile,
        canRetry,
        retryLoad
    };
}