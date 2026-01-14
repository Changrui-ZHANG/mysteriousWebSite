/**
 * Notification State Store using Zustand
 * Manages notification display and lifecycle for the profile domain
 * 
 * This store is separated from the main UI store to:
 * - Reduce unnecessary re-renders (components only subscribe to notifications)
 * - Improve code organization and maintainability
 * - Follow single responsibility principle
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Notification interface
 */
export interface Notification {
    /** Unique identifier for the notification */
    id: string;
    /** Type of notification (affects styling and icon) */
    type: 'success' | 'error' | 'warning' | 'info';
    /** Notification title */
    title: string;
    /** Notification message/description */
    message: string;
    /** Timestamp when notification was created */
    timestamp: number;
    /** Whether notification should auto-close */
    autoClose?: boolean;
    /** Duration in milliseconds before auto-close (default: 5000) */
    duration?: number;
}

/**
 * Notification state interface
 */
export interface NotificationState {
    /** Array of active notifications */
    notifications: Notification[];
}

/**
 * Notification actions interface
 */
export interface NotificationActions {
    /** Add a new notification */
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    /** Remove a notification by ID */
    removeNotification: (id: string) => void;
    /** Clear all notifications */
    clearNotifications: () => void;
    /** Add a success notification (convenience method) */
    addSuccessNotification: (title: string, message: string) => void;
    /** Add an error notification (convenience method) */
    addErrorNotification: (title: string, message: string) => void;
    /** Add a warning notification (convenience method) */
    addWarningNotification: (title: string, message: string) => void;
    /** Add an info notification (convenience method) */
    addInfoNotification: (title: string, message: string) => void;
}

/**
 * Combined store interface
 */
export type NotificationStore = NotificationState & NotificationActions;

/**
 * Initial state
 */
const initialState: NotificationState = {
    notifications: [],
};

/**
 * Notification Store
 * Manages notification display and lifecycle for the profile domain
 */
export const useNotificationStore = create<NotificationStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            addNotification: (notification) => {
                const id = crypto.randomUUID();
                const timestamp = Date.now();
                const newNotification: Notification = {
                    ...notification,
                    id,
                    timestamp,
                    autoClose: notification.autoClose ?? true,
                    duration: notification.duration ?? 5000,
                };

                set(
                    (state) => ({
                        notifications: [...state.notifications, newNotification]
                    }),
                    false,
                    `addNotification/${notification.type}`
                );

                // Auto-remove notification if autoClose is enabled
                if (newNotification.autoClose && newNotification.duration) {
                    setTimeout(() => {
                        get().removeNotification(id);
                    }, newNotification.duration);
                }
            },

            removeNotification: (id) => set(
                (state) => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                }),
                false,
                `removeNotification/${id}`
            ),

            clearNotifications: () => set(
                initialState,
                false,
                'clearNotifications'
            ),

            // Convenience methods for common notification types
            addSuccessNotification: (title, message) => {
                get().addNotification({
                    type: 'success',
                    title,
                    message,
                    autoClose: true,
                    duration: 5000,
                });
            },

            addErrorNotification: (title, message) => {
                get().addNotification({
                    type: 'error',
                    title,
                    message,
                    autoClose: true,
                    duration: 10000, // Errors stay longer
                });
            },

            addWarningNotification: (title, message) => {
                get().addNotification({
                    type: 'warning',
                    title,
                    message,
                    autoClose: true,
                    duration: 7000,
                });
            },

            addInfoNotification: (title, message) => {
                get().addNotification({
                    type: 'info',
                    title,
                    message,
                    autoClose: true,
                    duration: 5000,
                });
            },
        }),
        {
            name: 'profile-notification-store',
            enabled: import.meta.env.DEV,
        }
    )
);

/**
 * Selector hooks
 */

/** Get all notifications */
export const useNotifications = () =>
    useNotificationStore((state) => state.notifications);

/** Get notification count (optionally filtered by type) */
export const useNotificationCount = (type?: Notification['type']) =>
    useNotificationStore((state) =>
        type
            ? state.notifications.filter(n => n.type === type).length
            : state.notifications.length
    );

/** Get all notification actions */
export const useNotificationActions = () => {
    const addNotification = useNotificationStore((state) => state.addNotification);
    const removeNotification = useNotificationStore((state) => state.removeNotification);
    const clearNotifications = useNotificationStore((state) => state.clearNotifications);
    const addSuccessNotification = useNotificationStore((state) => state.addSuccessNotification);
    const addErrorNotification = useNotificationStore((state) => state.addErrorNotification);
    const addWarningNotification = useNotificationStore((state) => state.addWarningNotification);
    const addInfoNotification = useNotificationStore((state) => state.addInfoNotification);

    return {
        addNotification,
        removeNotification,
        clearNotifications,
        addSuccessNotification,
        addErrorNotification,
        addWarningNotification,
        addInfoNotification,
    };
};
