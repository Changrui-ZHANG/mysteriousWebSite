import { useState, useEffect, useCallback } from 'react';

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
                return '✓';
            case 'error':
                return '✗';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    const getBackgroundClass = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 border-green-300 text-green-800';
            case 'error':
                return 'bg-red-100 border-red-300 text-red-800';
            case 'warning':
                return 'bg-yellow-100 border-yellow-300 text-yellow-800';
            case 'info':
            default:
                return 'bg-blue-100 border-blue-300 text-blue-800';
        }
    };

    return (
        <div
            className={`
                relative max-w-sm w-full border rounded-lg shadow-lg p-4 mb-3
                ${getBackgroundClass()}
            `}
        >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <div style={{ marginRight: '12px', marginTop: '2px' }}>
                    <span style={{ fontSize: '16px' }}>{getIcon()}</span>
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                    {title && (
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                            {title}
                        </h4>
                    )}
                    <p style={{ fontSize: '14px' }}>
                        {message}
                    </p>
                    
                    {action && (
                        <button
                            onClick={action.onClick}
                            style={{ 
                                marginTop: '8px', 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                background: 'none',
                                border: 'none',
                                color: 'blue',
                                cursor: 'pointer'
                            }}
                        >
                            {action.label}
                        </button>
                    )}
                </div>
                
                <button
                    onClick={() => onRemove(id)}
                    style={{
                        marginLeft: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    onRemove: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
    return (
        <div style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            zIndex: 50,
            pointerEvents: 'none'
        }}>
            <div style={{ pointerEvents: 'auto' }}>
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onRemove={onRemove}
                    />
                ))}
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