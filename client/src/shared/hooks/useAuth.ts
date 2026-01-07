import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/authStorage';

interface User {
    userId: string;
    username: string;
}

interface UseAuthReturn {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

/**
 * Centralized authentication hook
 * Handles user state, localStorage persistence, and auth operations
 */
export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = useCallback((newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }, []);

    return {
        user,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
    };
}

export default useAuth;
