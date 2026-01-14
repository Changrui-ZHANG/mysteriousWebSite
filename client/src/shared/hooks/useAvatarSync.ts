/**
 * useAvatarSync Hook
 * Synchronizes avatar updates between navbar and profile page
 * Profile Access Improvement Feature
 */

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../../domain/profile/queries/queryKeys';
import { useAuth } from '../contexts/AuthContext';

interface AvatarSyncOptions {
  userId: string;
  initialAvatarUrl?: string;
}

/**
 * Hook to keep avatar in sync across the application
 * Listens to React Query cache updates for avatar changes
 * Also updates AuthContext to persist avatar in localStorage
 */
export const useAvatarSync = ({ userId, initialAvatarUrl }: AvatarSyncOptions) => {
  const queryClient = useQueryClient();
  const { updateUserAvatar } = useAuth();

  // Try to get the most up-to-date value from the cache immediately
  const getCachedAvatar = () => {
    const detailData = queryClient.getQueryData<{ avatarUrl?: string }>(profileKeys.detail(userId));
    if (detailData !== undefined) return detailData.avatarUrl;

    const avatarData = queryClient.getQueryData<{ avatarUrl?: string }>(profileKeys.avatar(userId));
    if (avatarData !== undefined) return avatarData.avatarUrl;

    return initialAvatarUrl;
  };

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(getCachedAvatar);

  // Update internal state when initialAvatarUrl changes (e.g. after login)
  useEffect(() => {
    if (initialAvatarUrl) {
      setAvatarUrl(initialAvatarUrl);
    }
  }, [initialAvatarUrl]);

  useEffect(() => {
    // Subscribe to avatar query updates
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.type === 'updated') {
        const queryKey = event.query.queryKey;

        // Check if this is an avatar update for our user
        const avatarKey = profileKeys.avatar(userId);
        const isAvatarUpdate = JSON.stringify(queryKey) === JSON.stringify(avatarKey);

        if (isAvatarUpdate) {
          const data = event.query.state.data as { avatarUrl?: string } | undefined;
          const newAvatarUrl = data?.avatarUrl;
          setAvatarUrl(newAvatarUrl);
          
          // Update AuthContext to persist in localStorage
          if (newAvatarUrl) {
            updateUserAvatar(newAvatarUrl);
          }
        }

        // Also check profile detail updates which may include avatar
        const profileKey = profileKeys.detail(userId);
        const isProfileUpdate = queryKey[0] === profileKey[0] &&
          queryKey[1] === profileKey[1] &&
          queryKey[2] === userId;

        if (isProfileUpdate) {
          const data = event.query.state.data as { avatarUrl?: string } | undefined;
          const newAvatarUrl = data?.avatarUrl;
          setAvatarUrl(newAvatarUrl);
          
          // Update AuthContext to persist in localStorage
          if (newAvatarUrl) {
            updateUserAvatar(newAvatarUrl);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [queryClient, userId, updateUserAvatar]);

  return avatarUrl;
};
