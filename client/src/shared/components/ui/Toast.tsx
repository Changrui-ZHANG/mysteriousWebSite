import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastItemProps {
    toast: Toast;
    onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
    const { id, type, title, message, duration = 5000, action } = toast;

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onRemove(id);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [id, duration, onRemove]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'error':
                return <FaExclamationCircle className="text-red-500" />;
            case 'warning':
                return <FaExclamationCircle className="text-yellow-500" />;
            case 'info':
            default:
                return <FaInfoCircle className="text-blue-500" />;
        }
    };

    const getBackgroundClass = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
                relative max-w-sm w-full border rounded-lg shadow-lg p-4 mb-3
                ${getBackgroundClass()}
                backdrop-blur-sm
            `}
        >
            <div className="flex items-start">
                <div className="shrink-0 mr-3 mt-0.5">
                    {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {title}
                        </h4>
                    )}
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        {message}
                    </p>
                    
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                
                <button
                    onClick={() => onRemove(id)}
                    className="shrink-0 ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <FaTimes size={14} />
                </button>
            </div>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div className="fixed top-4 right-4 z-50 pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onRemove={onRemove}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Toast manager hook
export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { ...toast, id }]);
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Convenience methods
    const success = useCallback((message: string, options?: Partial<Toast>) => {
        return addToast({ ...options, type: 'success', message });
    }, [addToast]);

    const error = useCallback((message: string, options?: Partial<Toast>) => {
        return addToast({ ...options, type: 'error', message });
    }, [addToast]);

    const warning = useCallback((message: string, options?: Partial<Toast>) => {
        return addToast({ ...options, type: 'warning', message });
    }, [addToast]);

    const info = useCallback((message: string, options?: Partial<Toast>) => {
        return addToast({ ...options, type: 'info', message });
    }, [addToast]);

    return {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
    };
}