// Authentication and Authorization Constants

export const ADMIN_CODES = {
    ADMIN: 'Changrui',
    SUPER_ADMIN: 'ChangruiZ'
} as const;

export const STORAGE_KEYS = {
    USER: 'messageWall_user',
    IS_ADMIN: 'messageWall_isAdmin',
    IS_SUPER_ADMIN: 'messageWall_isSuperAdmin',
    CALENDAR_ZONES: 'calendar_selectedZones'
} as const;

export type AdminLevel = 'none' | 'admin' | 'super_admin';

/**
 * Get current admin code based on localStorage status
 */
export function getAdminCode(): string | null {
    const isSuperAdmin = localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN) === 'true';
    const isAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN) === 'true';

    if (isSuperAdmin) return ADMIN_CODES.SUPER_ADMIN;
    if (isAdmin) return ADMIN_CODES.ADMIN;
    return null;
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
