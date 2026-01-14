/**
 * NotificationCenter - Global notification display component
 * Shows notifications from the global UI store
 * Adapted for Glassmorphism and Dark Mode support
 */

import React, { useEffect, useState } from 'react';
import { useNotifications, useNotificationActions, type Notification } from '../stores/notificationStore';

interface NotificationItemProps {
    notification: Notification;
    onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRemove }) => {
    const [progress, setProgress] = useState(100);
    const duration = notification.duration || 5000;
    const autoClose = notification.autoClose ?? true;

    useEffect(() => {
        if (!autoClose) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [duration, autoClose]);

    const getStyles = () => {
        switch (notification.type) {
            case 'success':
                return {
                    container: 'bg-green-50/90 dark:bg-green-900/80 border-green-200 dark:border-green-800',
                    icon: 'text-green-500 dark:text-green-300',
                    title: 'text-green-800 dark:text-green-100',
                    message: 'text-green-700 dark:text-green-200',
                    progress: 'bg-green-500 dark:bg-green-400'
                };
            case 'error':
                return {
                    container: 'bg-red-50/90 dark:bg-red-900/80 border-red-200 dark:border-red-800',
                    icon: 'text-red-500 dark:text-red-300',
                    title: 'text-red-800 dark:text-red-100',
                    message: 'text-red-700 dark:text-red-200',
                    progress: 'bg-red-500 dark:bg-red-400'
                };
            case 'warning':
                return {
                    container: 'bg-amber-50/90 dark:bg-amber-900/80 border-amber-200 dark:border-amber-800',
                    icon: 'text-amber-500 dark:text-amber-300',
                    title: 'text-amber-800 dark:text-amber-100',
                    message: 'text-amber-700 dark:text-amber-200',
                    progress: 'bg-amber-500 dark:bg-amber-400'
                };
            case 'info':
            default:
                return {
                    container: 'bg-blue-50/90 dark:bg-blue-900/80 border-blue-200 dark:border-blue-800',
                    icon: 'text-blue-500 dark:text-blue-300',
                    title: 'text-blue-800 dark:text-blue-100',
                    message: 'text-blue-700 dark:text-blue-200',
                    progress: 'bg-blue-500 dark:bg-blue-400'
                };
        }
    };

    const styles = getStyles();

    const getIconSvg = () => {
        switch (notification.type) {
            case 'success':
                return (
                    <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            case 'info':
            default:
                return (
                    <svg className={`w-5 h-5 ${styles.icon}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className={`w-full min-w-[350px] max-w-[500px] ${styles.container} backdrop-blur-md border rounded-xl shadow-lg pointer-events-auto ring-1 ring-black/5 overflow-hidden transition-all duration-300 animate-slide-in transform hover:scale-[1.02]`}>
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                        {getIconSvg()}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${styles.title}`}>
                            {notification.title}
                        </p>
                        <p className={`mt-1 text-sm leading-relaxed break-words whitespace-pre-wrap ${styles.message}`}>
                            {notification.message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className={`rounded-md inline-flex p-1 ${styles.icon} hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                            onClick={() => onRemove(notification.id)}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Progress bar for auto-close */}
            {autoClose && (
                <div className="h-1 bg-black/10 dark:bg-white/10">
                    <div
                        className={`h-full ${styles.progress} transition-all duration-100 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

interface NotificationCenterProps {
    className?: string;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * NotificationCenter component
 * Displays global notifications in a fixed position overlay
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    className = '',
    position = 'top-right'
}) => {
    const notifications = useNotifications();
    const { removeNotification } = useNotificationActions();

    if (notifications.length === 0) {
        return null;
    }

    const getPositionClasses = () => {
        switch (position) {
            case 'top-right':
                return 'top-20 right-4 items-end';
            case 'top-left':
                return 'top-20 left-4 items-start';
            case 'bottom-right':
                return 'bottom-4 right-4 items-end';
            case 'bottom-left':
                return 'bottom-4 left-4 items-start';
            default:
                return 'top-20 right-4 items-end';
        }
    };

    return (
        <div
            className={`fixed ${getPositionClasses()} z-[100] flex flex-col space-y-3 pointer-events-none ${className}`}
            aria-live="assertive"
        >
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRemove={removeNotification}
                />
            ))}
        </div>
    );
};

export default NotificationCenter;