/**
 * Avatar utility functions
 * Handles avatar URL resolution and fallbacks
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Resolves avatar URL to absolute URL
 * Handles relative paths, absolute paths, and null/undefined
 * 
 * @param avatarUrl - Avatar URL from backend (can be relative or absolute)
 * @returns Absolute avatar URL or default avatar path
 */
export function resolveAvatarUrl(avatarUrl?: string | null): string {
    // If no avatar URL, return default
    if (!avatarUrl || avatarUrl.trim() === '') {
        return '/avatars/default-avatar.png';
    }

    // If already an absolute URL (http:// or https://), return as-is
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
        return avatarUrl;
    }

    // If it's a relative path starting with /, prepend API base URL
    if (avatarUrl.startsWith('/')) {
        return `${API_BASE_URL}${avatarUrl}`;
    }

    // Otherwise, assume it's a relative path and prepend API base URL with /
    return `${API_BASE_URL}/${avatarUrl}`;
}

/**
 * Gets the default avatar URL
 */
export function getDefaultAvatarUrl(): string {
    return '/avatars/default-avatar.png';
}

/**
 * Checks if an avatar URL is a default avatar
 */
export function isDefaultAvatar(avatarUrl?: string | null): boolean {
    if (!avatarUrl) return true;
    return avatarUrl.includes('default-avatar') || 
           avatarUrl.includes('default-B') || 
           avatarUrl.includes('default-G');
}
