import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfileQuery } from '../../domain/profile/queries/profileQueries';
import { resolveAvatarUrl } from '../utils/avatarUtils';

interface UseAvatarResult {
    avatarUrl: string;
    isLoading: boolean;
    isError: boolean;
}

/**
 * useAvatar - Unified hook for getting a user's avatar URL
 * Consolidates acquisition logic from Query cache and AuthContext
 */
export function useAvatar(userId?: string): UseAvatarResult {
    const { user: authUser } = useAuth();

    // Stabilize the userId to prevent unnecessary re-renders
    const stableUserId = useMemo(() => {
        if (!userId && !authUser?.userId) return undefined;
        return userId || authUser?.userId;
    }, [userId, authUser?.userId]);

    // Determine if we're looking for the current logged-in user
    const isCurrentUser = !!authUser && (stableUserId === authUser.userId);

    // Only enable the query when we have a valid, stable ID
    const { data: profile, isLoading, isError } = useProfileQuery(stableUserId);

    const avatarUrl = useMemo(() => {
        // 1. Try profile data from query cache (most up-to-date)
        if (profile?.avatarUrl) {
            const resolved = resolveAvatarUrl(profile.avatarUrl);
            if (resolved) return resolved;
        }

        // 2. Fallback to auth context for current user (fast data)
        if (isCurrentUser && authUser?.avatarUrl) {
            const resolved = resolveAvatarUrl(authUser.avatarUrl);
            if (resolved) return resolved;
        }

        // 3. Last resort: return empty string if no URL is available
        return '';
    }, [profile?.avatarUrl, authUser?.avatarUrl, isCurrentUser]);

    return {
        avatarUrl,
        isLoading: stableUserId ? (isLoading && !profile) : false,
        isError: stableUserId ? isError : false
    };
}
