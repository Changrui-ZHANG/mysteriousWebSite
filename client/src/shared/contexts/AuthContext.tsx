import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants/authStorage';
import { fetchJson, postJson } from '../api/httpClient';
import i18n from '../../i18n';

interface User {
    userId: string;
    username: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    adminCode: string;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    login: (user: User) => void;
    logout: () => void;
    changeLanguage: (lng: string) => Promise<void>;
    adminLogin: (code: string) => Promise<boolean>;
    adminLogout: () => void;
    openAuthModal: () => void;
    closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Admin state
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [adminCode, setAdminCode] = useState('');

    // Load all auth state from localStorage on mount
    useEffect(() => {
        try {
            // User state
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Load user language preference
                fetchJson<{ language: string }>(`/api/users/${parsedUser.userId}/language`)
                    .then(data => {
                        if (data.language && i18n.language !== data.language) {
                            i18n.changeLanguage(data.language);
                            localStorage.setItem('preferredLanguage', data.language);
                        }
                    })
                    .catch(err => console.error('Failed to load language preference:', err));
            }

            // Admin state
            const storedAdmin = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
            const storedSuperAdmin = localStorage.getItem(STORAGE_KEYS.IS_SUPER_ADMIN);
            const storedCode = localStorage.getItem(STORAGE_KEYS.ADMIN_CODE);

            setIsAdmin(storedAdmin === 'true' || storedSuperAdmin === 'true');
            setIsSuperAdmin(storedSuperAdmin === 'true');
            setAdminCode(storedCode || '');

        } catch (error) {
            console.error('Failed to parse stored auth state:', error);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

        // Load user language preference
        fetchJson<{ language: string }>(`/api/users/${newUser.userId}/language`)
            .then(data => {
                if (data.language) {
                    i18n.changeLanguage(data.language);
                    localStorage.setItem('preferredLanguage', data.language);
                }
            })
            .catch(err => console.error('Failed to load language preference:', err));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    };

    const changeLanguage = async (lng: string) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('preferredLanguage', lng);
        if (user?.userId) {
            try {
                await fetchJson(`/api/users/${user.userId}/language`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: lng }),
                });
            } catch (error) {
                console.error('Failed to save language preference:', error);
            }
        }
    };

    const adminLogin = async (code: string): Promise<boolean> => {
        try {
            const response = await postJson<{ role: string; message: string }>(
                '/api/auth/verify-admin',
                { code }
            );

            if (response.role === 'super_admin') {
                setIsAdmin(true);
                setIsSuperAdmin(true);
                setAdminCode(code);
                localStorage.setItem(STORAGE_KEYS.IS_SUPER_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            } else if (response.role === 'admin') {
                setIsAdmin(true);
                setIsSuperAdmin(false);
                setAdminCode(code);
                localStorage.setItem(STORAGE_KEYS.IS_ADMIN, 'true');
                localStorage.setItem(STORAGE_KEYS.ADMIN_CODE, code);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Admin login failed', error);
            return false;
        }
    };

    const adminLogout = () => {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setAdminCode('');
        localStorage.removeItem(STORAGE_KEYS.IS_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.IS_SUPER_ADMIN);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_CODE);
    };

    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isAdmin,
        isSuperAdmin,
        adminCode,
        isLoading,
        isAuthModalOpen,
        login,
        logout,
        adminLogin,
        adminLogout,
        changeLanguage,
        openAuthModal,
        closeAuthModal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};