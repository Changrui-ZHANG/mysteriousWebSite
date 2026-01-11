import React, { createContext, useContext, ReactNode } from 'react';
import { useToast, ToastContainer, Toast } from '../components/ui/Toast';

interface ToastContextType {
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    clearAllToasts: () => void;
    success: (message: string, options?: Partial<Toast>) => string;
    error: (message: string, options?: Partial<Toast>) => string;
    warning: (message: string, options?: Partial<Toast>) => string;
    info: (message: string, options?: Partial<Toast>) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const toast = useToast();

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
        </ToastContext.Provider>
    );
};

export const useToastContext = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToastContext must be used within a ToastProvider');
    }
    return context;
};