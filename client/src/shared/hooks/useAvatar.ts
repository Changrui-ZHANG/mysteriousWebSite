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

    // Determine if we're looking for the current logged-in user
    const isCurrentUser = !!authUser && (userId === authUser.id || userId === authUser.userId || !userId);

    // Query profile for the most up-to-date data
    // We only enable the query if we have a userId or if we are the current user
    const actualId = userId || authUser?.id || authUser?.userId;
    const { data: profile, isLoading, isError } = useProfileQuery(actualId);

    const avatarUrl = useMemo(() => {
        // 1. Try profile data from query cache (most up-to-date)
        if (profile?.avatarUrl) {
            return resolveAvatarUrl(profile.avatarUrl);
        }

        // 2. Fallback to auth context for current user (fast data)
        if (isCurrentUser && authUser?.avatarUrl) {
            return resolveAvatarUrl(authUser.avatarUrl);
        }

        // 3. Last resort: return empty string if no URL is available
        return '';
    }, [profile?.avatarUrl, authUser?.avatarUrl, isCurrentUser]);

    return {
        avatarUrl,
        isLoading: isLoading && !profile, // Only truly loading if we have no data at all
        isError
    };
}
