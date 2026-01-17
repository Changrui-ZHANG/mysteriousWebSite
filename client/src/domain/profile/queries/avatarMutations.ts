import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AvatarService } from '../services/AvatarService';
import { profileKeys } from './queryKeys';
import type { UserProfile } from '../types';
import { logAvatarUpload } from '../utils/diagnosticLogger';
import { useAuth } from '../../../shared/contexts/AuthContext';

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
    const { updateUserAvatar } = useAuth();

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
            logAvatarUpload('upload-start', 'useAvatarUploadMutation', {
                userId,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type
            });

            const result = await avatarService.uploadAvatar(userId, file, requesterId, onProgress);

            logAvatarUpload('upload-complete', 'useAvatarUploadMutation', {
                userId,
                avatarUrl: result
            });

            return result;
        },

        // Optimistic updates
        onMutate: async ({ userId, file }) => {
            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onMutate', {
                userId,
                fileName: file.name,
                action: 'cancelling queries'
            });

            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: profileKeys.detail(userId)
            });

            // Snapshot the previous value
            const previousProfile = queryClient.getQueryData<UserProfile>(
                profileKeys.detail(userId)
            );

            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onMutate', {
                userId,
                hasProfile: !!previousProfile,
                currentAvatar: previousProfile?.avatarUrl
            });

            // Create preview URL for optimistic update
            const previewUrl = avatarService.createPreviewUrl(file);

            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onMutate', {
                userId,
                previewUrl,
                action: 'setting optimistic update'
            });

            // Optimistically update the cache with preview
            if (previousProfile) {
                queryClient.setQueriesData<UserProfile>(
                    { queryKey: profileKeys.detail(userId) },
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
            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onSuccess', {
                userId,
                avatarUrl,
                hadPreview: !!context?.previewUrl
            });

            // Update AuthContext immediately
            updateUserAvatar(avatarUrl);

            // Clean up preview URL
            if (context?.previewUrl) {
                avatarService.revokePreviewUrl(context.previewUrl);
                logAvatarUpload('cache-update', 'useAvatarUploadMutation.onSuccess', {
                    action: 'preview URL revoked'
                });
            }

            // Update cache with actual avatar URL
            queryClient.setQueriesData<UserProfile>(
                { queryKey: profileKeys.detail(userId) },
                (old) => {
                    if (!old) {
                        return old;
                    }
                    logAvatarUpload('cache-update', 'useAvatarUploadMutation.onSuccess', {
                        userId,
                        oldAvatar: old.avatarUrl,
                        newAvatar: avatarUrl,
                        action: 'updating cache with actual URL'
                    });
                    return {
                        ...old,
                        avatarUrl
                    };
                }
            );

            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onSuccess', {
                userId,
                action: 'invalidating queries'
            });
        },

        // Rollback on error
        onError: (_err, { userId }, context) => {
            logAvatarUpload('error', 'useAvatarUploadMutation.onError', {
                userId,
                error: _err instanceof Error ? _err.message : 'Unknown error',
                hadPreview: !!context?.previewUrl
            }, _err instanceof Error ? _err : undefined);

            // Clean up preview URL
            if (context?.previewUrl) {
                avatarService.revokePreviewUrl(context.previewUrl);
                logAvatarUpload('cache-update', 'useAvatarUploadMutation.onError', {
                    action: 'preview URL revoked'
                });
            }

            // Rollback to previous profile
            if (context?.previousProfile) {
                logAvatarUpload('cache-update', 'useAvatarUploadMutation.onError', {
                    userId,
                    action: 'rolling back to previous profile'
                });
                queryClient.setQueriesData(
                    { queryKey: profileKeys.detail(userId) },
                    context.previousProfile
                );
            }
        },

        // Always refetch to ensure consistency
        onSettled: (_data, _error, { userId }) => {
            logAvatarUpload('cache-update', 'useAvatarUploadMutation.onSettled', {
                userId,
                hadError: !!_error,
                action: 'invalidating queries for final refetch'
            });

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
    const { updateUserAvatar } = useAuth();

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
                queryClient.setQueriesData<UserProfile>(
                    { queryKey: profileKeys.detail(userId) },
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
                queryClient.setQueriesData(
                    { queryKey: profileKeys.detail(userId) },
                    context.previousProfile
                );
            }
        },

        // Refetch on success or error
        onSettled: (_data, _error, { userId }) => {
            if (!_error) {
                // If deletion was successful, update AuthContext
                updateUserAvatar('');
            }
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
        logAvatarUpload('upload-start', 'useAvatarUpload', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            userId
        });

        try {
            const avatarUrl = await uploadMutation.mutateAsync({
                userId,
                file,
                requesterId: userId,
                onProgress: (progress) => {
                    logAvatarUpload('upload-progress', 'useAvatarUpload', {
                        progress,
                        fileName: file.name
                    });
                    onProgress?.(progress);
                }
            });

            logAvatarUpload('upload-complete', 'useAvatarUpload', {
                avatarUrl,
                fileName: file.name
            });

            onUploadComplete?.(avatarUrl);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            logAvatarUpload('error', 'useAvatarUpload', {
                phase: 'upload',
                fileName: file.name,
                error: errorMessage
            }, error instanceof Error ? error : undefined);

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