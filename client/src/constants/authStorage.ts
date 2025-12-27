// Authentication and Authorization Constants

// ADMIN_CODES removed for security - validation is now server-side

export const STORAGE_KEYS = {
    USER: 'messageWall_user',
    IS_ADMIN: 'messageWall_isAdmin',
    IS_SUPER_ADMIN: 'messageWall_isSuperAdmin',
    CALENDAR_ZONES: 'calendar_selectedZones',
    ADMIN_CODE: 'admin_session_code'
} as const;

export type AdminLevel = 'none' | 'admin' | 'super_admin';

/**
 * Get current admin code - DEPRECATED/SECURED
 * Now just returns a placeholder if admin session exists
 */
export function getAdminCode(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_CODE);
}

/**
 * Get current admin level
 */
export function getAdminLevel(): AdminLevel {
    if (localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN) === 'true') {
        return 'super_admin';
    }
    if (localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true') {
        return 'admin';
    }
    return 'none';
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(): boolean {
    return getAdminLevel() !== 'none';
}
