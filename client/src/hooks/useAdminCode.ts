import { getAdminCode } from '../constants/authStorage';

/**
 * Hook to get the current admin code
 * Returns the appropriate code based on localStorage admin status
 */
export function useAdminCode(): string | null {
    return getAdminCode();
}
