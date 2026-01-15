/**
 * Utility functions for handling avatar URLs
 * Ensures consistent avatar display across the application
 */

const DEFAULT_AVATAR = '/avatars/default-avatar.png';

/**
 * Resolves the avatar URL to ensure it's a valid path
 * Handles null/undefined, relative paths, and full URLs
 * 
 * @param url - The raw avatar URL from user data
 * @returns The resolved, usable avatar URL
 */
export const resolveAvatarUrl = (url: string | undefined | null): string => {
    // If no URL provided, return default
    if (!url) {
        return DEFAULT_AVATAR;
    }

    // If it's already a full URL (http/https), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a data URI (base64), return as is
    if (url.startsWith('data:')) {
        return url;
    }

    // If it's already an absolute path starting with /, return as is
    if (url.startsWith('/')) {
        return url;
    }

    // If it's one of our known default avatar filenames (e.g. default-avatar.png)
    if (url.startsWith('default-')) {
        return `/avatars/${url}`;
    }

    // Otherwise, assume it's a filename uploaded to the server
    // These should be served via the AvatarController at /api/avatars/files/
    return `/api/avatars/files/${url}`;
};
