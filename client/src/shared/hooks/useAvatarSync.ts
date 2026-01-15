import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

interface UseAvatarSyncProps {
    userId: string;
    initialAvatarUrl?: string;
}

export function useAvatarSync({ userId, initialAvatarUrl }: UseAvatarSyncProps) {
    const { updateUserAvatar } = useAuth();
    const queryClient = useQueryClient();
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

    useEffect(() => {
        if (!userId) return;

        // Subscribe to query cache updates
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            // Check for profile updates
            if (event.type === 'updated' && Array.isArray(event.query.queryKey)) {
                const key = event.query.queryKey;
                // Match ['profiles', 'detail', userId] or similar keys
                if ((key[0] === 'profiles' || key[0] === 'profile' || key[0] === 'user') && key.includes(userId)) {
                    const data = event.query.state.data as { avatarUrl?: string } | undefined;
                    const newAvatarUrl = data?.avatarUrl;

                    if (newAvatarUrl) {
                        setAvatarUrl(newAvatarUrl);
                        updateUserAvatar(newAvatarUrl);
                    }
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, [userId, queryClient, updateUserAvatar]);

    // Keep local state in sync with initial prop if it changes and we haven't detected an update yet
    useEffect(() => {
        if (initialAvatarUrl) {
            // We only update if strict equality fails, but we want the source of truth to be the sync
            // However, if initial changes (e.g. from parent re-render), we should respect it UNLESS we have a newer one?
            // Actually, let's just default to initial if state is empty.
            setAvatarUrl(prev => prev || initialAvatarUrl);
        }
    }, [initialAvatarUrl]);

    return avatarUrl || initialAvatarUrl;
}
