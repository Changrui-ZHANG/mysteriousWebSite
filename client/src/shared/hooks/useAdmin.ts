import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/authStorage';
import { postJson } from '../api/httpClient';

interface AdminState {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    adminCode: string;
}

interface UseAdminReturn extends AdminState {
    login: (code: string) => Promise<boolean>;
    logout: () => void;
}

export function useAdmin(): UseAdminReturn {
    const [state, setState] = useState<AdminState>({
        isAdmin: false,
        isSuperAdmin: false,
        adminCode: '',
    });

    // Load admin state from localStorage on mount
    useEffect(() => {
        const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
        const storedSuperAdmin = localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        const storedCode = localStorage.getItem(STORAGE_KEYS.ADMIN_CODE);

        setState({
            isAdmin: storedAdmin === 'true' || storedSuperAdmin === 'true',
            isSuperAdmin: storedSuperAdmin === 'true',
            adminCode: storedCode || '',
        });
    }, []);

    const login = useCallback(async (code: string): Promise<boolean> => {
        try {
            const response = await postJson<{ role: string; message: string }>(
                '/api/auth/verify-admin',
                { code }
            );

            if (response.role === 'super_admin') {
                setState({ isAdmin: true, isSuperAdmin: true, adminCode: code });
                localStorage.setItem(STORAGE_KEYS.IS_SUPER_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            } else if (response.role === 'admin') {
                setState({ isAdmin: true, isSuperAdmin: false, adminCode: code });
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Admin login failed', error);
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        setState({ isAdmin: false, isSuperAdmin: false, adminCode: '' });
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_CODE);
    }, []);

    return {
        ...state,
        login,
        logout,
    };
}
