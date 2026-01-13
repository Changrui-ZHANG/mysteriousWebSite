/**
 * Avatar mutation hooks using TanStack Query
 * Replaces custom useAvatarUpload hook with optimized mutations and progress tracking
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AvatarService } from '../services/AvatarService';
import { profileKeys } from './queryKeys';
import type { UserProfile } from '../types';

/**
 * Avatar service instance
 */
const avatarService = new AvatarService();

/**
 * Mutation hook for uploading avatar with progress tracking
 * Replaces the custom useAvatarUpload hook
 */
export function useAvatarUploadMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async ({ 
            userId, 
            file, 
            requesterId, 
            onProgress 
        }: {
            userId: string;
            file: File;
            requesterId: string;
            onProgress?: (progress: number) => void;
        }) => {
            return avatarService.uploadAvatar(userId, file, requesterId, onProgress);
        },
        
        // Optimistic updates
        onMutate: async ({ userId, file }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
            
            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(
                profileKeys.detail(userId)
            );
            
            // Create preview URL for optimistic update
            const previewUrl = avatarService.createPreviewUrl(file);
            
            // Optimistically update the cache with preview
            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(
                    profileKeys.detail(userId),
                    (old) => {
                        if (!old) return old;
                        return {
                            ...old,
                            avatarUrl: previewUrl
                        };
                    }
                );
            }
            
            return { previousProfile, previewUrl };
        },
        
        // Update cache with actual avatar URL on success
        onSuccess: (avatarUrl, { userId }, context) => {
            // Clean up preview URL
            if (context?.previewUrl) {
                avatarService.revokePreviewUrl(context.previewUrl);
            }
            
            // Update cache with actual avatar URL
            queryClient.setQueryData<UserProfile>(
                profileKeys.detail(userId),
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        avatarUrl
                    };
                }
            );
        },
        
        // Rollback on error
        onError: (_err, { userId }, context) => {
            // Clean up preview URL
            if (context?.previewUrl) {
                avatarService.revokePreviewUrl(context.previewUrl);
            }
            
            // Rollback to previous profile
            if (context?.previousProfile) {
                queryClient.setQueryData(
                    profileKeys.detail(userId),
                    context.previousProfile
                );
            }
        },
        
        // Always refetch to ensure consistency
        onSettled: (_data, _error, { userId }) => {
            queryClient.invalidateQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
        },
    });
}

/**
 * Mutation hook for deleting avatar
 */
export function useAvatarDeleteMutation() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ userId, requesterId }: {
            userId: string;
            requesterId: string;
        }) => avatarService.deleteAvatar(userId, requesterId),
        
        // Optimistic updates
        onMutate: async ({ userId }) => {
            await queryClient.cancelQueries({ 
                queryKey: profileKeys.detail(userId) 
            });
            
            const previousProfile = queryClient.getQueryData<UserProfile>(
                profileKeys.detail(userId)
            );
            
            // Optimistically remove avatar
            if (previousProfile) {
                queryClient.setQueryData<UserProfile>(
                    profileKeys.detail(userId),
                    (old) => {
                        if (!old) return old;
                        return {
                            ...old,
                            avatarUrl: undefined
                        };
                    }
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
 * Query hook for fetching default avatars
 */
export function useDefaultAvatarsQuery() {
    return useQuery({
        queryKey: profileKeys.defaultAvatars(),
        queryFn: () => avatarService.getDefaultAvatars(),
        staleTime: 10 * 60 * 1000, // 10 minutes - default avatars don't change often
        retry: 2,
    });
}

/**
 * Hook for avatar file validation
 */
export function useAvatarValidation() {
    return {
        validateFile: (file: File) => avatarService.validateImageFile(file),
        getImageDimensions: (file: File) => avatarService.getImageDimensions(file),
        createPreviewUrl: (file: File) => avatarService.createPreviewUrl(file),
        revokePreviewUrl: (url: string) => avatarService.revokePreviewUrl(url),
    };
}

/**
 * Combined hook that provides avatar upload functionality
 * Similar API to the old useAvatarUpload hook for easier migration
 */
export function useAvatarUpload({ 
    userId, 
    onUploadComplete, 
    onUploadError 
}: {
    userId: string;
    onUploadComplete?: (avatarUrl: string) => void;
    onUploadError?: (error: string) => void;
}) {
    const uploadMutation = useAvatarUploadMutation();
    const deleteMutation = useAvatarDeleteMutation();
    const defaultAvatarsQuery = useDefaultAvatarsQuery();
    const validation = useAvatarValidation();
    
    const uploadAvatar = async (file: File, onProgress?: (progress: number) => void) => {
        try {
            const avatarUrl = await uploadMutation.mutateAsync({
                userId,
                file,
                requesterId: userId,
                onProgress
            });
            onUploadComplete?.(avatarUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            onUploadError?.(errorMessage);
            throw error;
        }
    };
    
    const deleteAvatar = async () => {
        try {
            await deleteMutation.mutateAsync({
                userId,
                requesterId: userId
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Delete failed';
            onUploadError?.(errorMessage);
            throw error;
        }
    };
    
    return {
        // State
        isUploading: uploadMutation.isPending,
        isDeleting: deleteMutation.isPending,
        uploadProgress: 0, // Progress is handled via onProgress callback
        error: uploadMutation.error?.message || deleteMutation.error?.message || null,
        defaultAvatars: defaultAvatarsQuery.data || [],
        isLoadingDefaults: defaultAvatarsQuery.isLoading,
        
        // Actions
        uploadAvatar,
        deleteAvatar,
        validateFile: validation.validateFile,
        createPreview: validation.createPreviewUrl,
        clearPreview: validation.revokePreviewUrl,
        loadDefaultAvatars: defaultAvatarsQuery.refetch,
        clearError: () => {
            uploadMutation.reset();
            deleteMutation.reset();
        },
        
        // Helpers
        canUpload: !uploadMutation.isPending && !deleteMutation.isPending && Boolean(userId),
        hasError: Boolean(uploadMutation.error || deleteMutation.error),
    };
}