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

    // 3. If it's already a full URL (http/https), a data URI, or an absolute path (/), return as is
    // The backend is responsible for providing the full correct path.
    if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('/')) {
        return url;
    }

    // 4. Otherwise, it's an unrecognized format.
    // Frontend does not try to reconstruct paths.
    return '';
};
