/**
 * Profile queries using TanStack Query
 * Replaces custom useProfile hook with optimized caching and background refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfileService } from '../services/ProfileService';
import { profileKeys } from './queryKeys';
import type { 
    UserProfile, 
    CreateProfileRequest, 
    UpdateProfileRequest, 
    PrivacySettings 
} from '../types';

/**
 * Profile service instance
 */
const profileService = new ProfileService();

/**
 * Query hook for fetching a user profile
 * Replaces the custom useProfile hook
 */
export function useProfileQuery(userId?: string, viewerId?: string) {
    return useQuery({
        queryKey: profileKeys.detail(userId!, viewerId),
        queryFn: () => profileService.getProfile(userId!, viewerId),
        enabled: !!userId, // Only enable when userId is available
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: (failureCount, error: any) => {
            // Don't retry on 403 (Forbidden) or 401 (Unauthorized) errors
            if (error?.status === 403 || error?.status === 401) {
                return false;
            }
            // Retry up to 3 times for other errors
            return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

/**
 * Mutation hook for creating a new profile
 */
export function useCreateProfileMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateProfileRequest) => profileService.createProfile(data),
        onSuccess: (newProfile) => {
            // Update the cache with the new profile
            queryClient.setQueryData(
                profileKeys.detail(newProfile.userId),
                newProfile
            );
            
            // Invalidate profile lists to include the new profile
            queryClient.invalidateQueries({
                queryKey: profileKeys.lists()
            });
        },
    });
}

/**
 * Mutation hook for updating an existing profile
 */
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ userId, data, requesterId }: {
            userId: string;
            data: UpdateProfileRequest;
            requesterId: string;
        }) => profileService.updateProfile(userId, data, requesterId),
        
        // Optimistic updates
        onMutate: async ({ userId, data }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
            
            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(
                profileKeys.detail(userId)
            );
            
            // Optimistically update the cache
            if (previousProfile) {
                let updatedPrivacySettings = previousProfile.privacySettings;
                
                // If privacy settings are being updated, merge them properly
                if (data.privacySettings && previousProfile.privacySettings) {
                    updatedPrivacySettings = {
                        ...previousProfile.privacySettings,
                        ...data.privacySettings
                    } as PrivacySettings; // Safe cast since we're merging with existing complete settings
                }
                
                const updatedProfile: UserProfile = {
                    ...previousProfile,
                    ...data,
                    privacySettings: updatedPrivacySettings
                };
                
                queryClient.setQueryData<UserProfile>(
                    profileKeys.detail(userId),
                    updatedProfile
                );
            }
            
            return { previousProfile };
        },
        
        // Rollback on error
        onError: (_err, { userId }, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    profileKeys.detail(userId),
                    context.previousProfile
                );
            }
        },
        
        // Refetch on success or error
        onSettled: (_data, _error, { userId }) => {
            queryClient.invalidateQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
        },
    });
}

/**
 * Mutation hook for updating privacy settings
 */
export function useUpdatePrivacyMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ userId, settings, requesterId }: {
            userId: string;
            settings: PrivacySettings;
            requesterId: string;
        }) => profileService.updatePrivacySettings(userId, settings, requesterId),
        
        // Optimistic updates
        onMutate: async ({ userId, settings }) => {
            await queryClient.cancelQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
            
            const previousProfile = queryClient.getQueryData<UserProfile>(
                profileKeys.detail(userId)
            );
            
            // Optimistically update the cache
            if (previousProfile) {
                const updatedProfile: UserProfile = {
                    ...previousProfile,
                    privacySettings: settings
                };
                
                queryClient.setQueryData<UserProfile>(
                    profileKeys.detail(userId),
                    updatedProfile
                );
            }
            
            return { previousProfile };
        },
        
        onError: (_err, { userId }, context) => {
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    profileKeys.detail(userId),
                    context.previousProfile
                );
            }
        },
        
        onSettled: (_data, _error, { userId }) => {
            queryClient.invalidateQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
        },
    });
}

/**
 * Query hook for fetching activity statistics
 * Note: Activity stats are part of the profile data, so this extracts them
 */
export function useActivityStatsQuery(userId?: string) {
    const profileQuery = useProfileQuery(userId);
    
    return {
        ...profileQuery,
        data: profileQuery.data?.activityStats || null,
        // Keep the same interface as the old hook
        stats: profileQuery.data?.activityStats || null,
    };
}

/**
 * Utility hook that combines profile and stats queries
 * Provides a similar API to the old useProfile hook
 */
export function useProfileWithStats(userId?: string, viewerId?: string) {
    const profileQuery = useProfileQuery(userId, viewerId);
    const statsQuery = useActivityStatsQuery(userId);
    
    return {
        // Profile data
        profile: profileQuery.data,
        isLoadingProfile: profileQuery.isLoading,
        profileError: profileQuery.error,
        
        // Stats data
        stats: statsQuery.data,
        isLoadingStats: statsQuery.isLoading,
        statsError: statsQuery.error,
        
        // Combined states
        isLoading: profileQuery.isLoading || statsQuery.isLoading,
        error: profileQuery.error || statsQuery.error,
        
        // Actions
        refetchProfile: profileQuery.refetch,
        refetchStats: statsQuery.refetch,
        refetchAll: () => {
            profileQuery.refetch();
            statsQuery.refetch();
        },
        
        // Computed values
        hasProfile: !!profileQuery.data,
        isOwnProfile: userId && viewerId ? userId === viewerId : false,
    };
}

/**
 * Hook for prefetching a profile
 * Useful for preloading profiles before navigation
 */
export function usePrefetchProfile() {
    const queryClient = useQueryClient();
    
    return (userId: string, viewerId?: string) => {
        queryClient.prefetchQuery({
            queryKey: profileKeys.detail(userId, viewerId),
            queryFn: () => profileService.getProfile(userId, viewerId),
            staleTime: 5 * 60 * 1000,
        });
    };
}