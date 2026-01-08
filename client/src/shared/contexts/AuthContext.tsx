import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants/authStorage';
import i18n from '../../i18n';

interface User {
    userId: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);

                // Load user language preference
                fetch(`/api/users/${parsedUser.userId}/language`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.language && i18n.language !== data.language) {
                            i18n.changeLanguage(data.language);
                            localStorage.setItem('preferredLanguage', data.language);
                        }
                    })
                    .catch(err => console.error('Failed to load language preference:', err));
            }
        } catch (error) {
            console.error('Failed to parse stored user:', error);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const login = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));

        // Load user language preference
        fetch(`/api/users/${newUser.userId}/language`)
            .then(res => res.json())
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

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
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