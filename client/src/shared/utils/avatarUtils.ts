/**
 * Checks if a given URL is a default avatar
 */
export const isDefaultAvatar = (url: string | undefined | null): boolean => {
    if (!url) return true;
    return url.includes('default-');
};

/**
 * Resolves the avatar URL to ensure it's a valid path
 * Handles null/undefined, relative paths, and full URLs
 * 
 * @param url - The raw avatar URL from user data
 * @returns The resolved, usable avatar URL
 */
export const resolveAvatarUrl = (url: string | undefined | null): string => {
    // 1. If no URL provided, return empty
    if (!url) {
        return '';
    }

    // 2. Security/Reliability check: If the string looks like a message rather than a filename 
    // (e.g., contains spaces, is unusually long, or contains success keywords), return empty.
    try {
        const decodedUrl = decodeURIComponent(url);
        if (decodedUrl.includes(' ') || url.length > 255 || decodedUrl.toLowerCase().includes('success')) {
            return '';
        }
    } catch (e) {
        return '';
    }

    // 3. If it's already a full URL (http/https) or a data URI, return as is
    if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
    }

    // 4. If it's an absolute path starting with /, ensure it's properly formatted for the proxy
    // The Vite proxy will handle /api and /avatars paths correctly
    if (url.startsWith('/')) {
        return url;
    }

    // 5. Otherwise, it's an unrecognized format.
    // Frontend does not try to reconstruct paths.
    return '';
};
