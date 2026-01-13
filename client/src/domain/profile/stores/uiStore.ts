/**
 * Profile UI State Store using Zustand
 * Manages global UI state for modals, notifications, and loading states
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Notification interface
 */
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    autoClose?: boolean;
    duration?: number; // milliseconds
}

/**
 * Modal states interface
 */
export interface ModalStates {
    avatarCropper: boolean;
    profileEdit: boolean;
    privacySettings: boolean;
    avatarGallery: boolean;
    confirmDelete: boolean;
}

/**
 * Loading states interface
 */
export interface LoadingStates {
    profileUpdate: boolean;
    avatarUpload: boolean;
    privacyUpdate: boolean;
    profileDelete: boolean;
}

/**
 * UI State interface
 */
export interface UIState {
    // Modal states
    modals: ModalStates;

    // Notification states
    notifications: Notification[];

    // Loading states
    loading: LoadingStates;

    // Current editing context
    editingProfile: boolean;
    hasUnsavedChanges: boolean;
}

/**
 * UI Actions interface
 */
export interface UIActions {
    // Modal actions
    openModal: (modal: keyof ModalStates) => void;
    closeModal: (modal: keyof ModalStates) => void;
    closeAllModals: () => void;
    toggleModal: (modal: keyof ModalStates) => void;

    // Notification actions
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    addSuccessNotification: (title: string, message: string) => void;
    addErrorNotification: (title: string, message: string) => void;
    addWarningNotification: (title: string, message: string) => void;
    addInfoNotification: (title: string, message: string) => void;

    // Loading actions
    setLoading: (key: keyof LoadingStates, loading: boolean) => void;
    setMultipleLoading: (states: Partial<LoadingStates>) => void;
    clearAllLoading: () => void;

    // Editing context actions
    setEditingProfile: (editing: boolean) => void;
    setUnsavedChanges: (hasChanges: boolean) => void;
    resetEditingState: () => void;
}

/**
 * Combined store interface
 */
export type UIStore = UIState & UIActions;

/**
 * Initial state
 */
const initialState: UIState = {
    modals: {
        avatarCropper: false,
        profileEdit: false,
        privacySettings: false,
        avatarGallery: false,
        confirmDelete: false,
    },
    notifications: [],
    loading: {
        profileUpdate: false,
        avatarUpload: false,
        privacyUpdate: false,
        profileDelete: false,
    },
    editingProfile: false,
    hasUnsavedChanges: false,
};

/**
 * Profile UI Store
 * Manages global UI state for the profile domain
 */
export const useUIStore = create<UIStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // Modal actions
            openModal: (modal) => set(
                (state) => ({
                    modals: { ...state.modals, [modal]: true }
                }),
                false,
                `openModal/${modal}`
            ),

            closeModal: (modal) => set(
                (state) => ({
                    modals: { ...state.modals, [modal]: false }
                }),
                false,
                `closeModal/${modal}`
            ),

            closeAllModals: () => set(
                (state) => ({
                    modals: Object.keys(state.modals).reduce(
                        (acc, key) => ({ ...acc, [key]: false }),
                        {} as ModalStates
                    )
                }),
                false,
                'closeAllModals'
            ),

            toggleModal: (modal) => set(
                (state) => ({
                    modals: { ...state.modals, [modal]: !state.modals[modal] }
                }),
                false,
                `toggleModal/${modal}`
            ),

            // Notification actions
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
                if (newNotification.autoClose) {
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
                { notifications: [] },
                false,
                'clearNotifications'
            ),

            // Convenience notification methods
            addSuccessNotification: (title, message) => {
                get().addNotification({ type: 'success', title, message });
            },

            addErrorNotification: (title, message) => {
                get().addNotification({
                    type: 'error',
                    title,
                    message,
                    autoClose: true,
                    duration: 10000 // Errors auto-close after 10 seconds
                });
            },

            addWarningNotification: (title, message) => {
                get().addNotification({ type: 'warning', title, message });
            },

            addInfoNotification: (title, message) => {
                get().addNotification({ type: 'info', title, message });
            },

            // Loading actions
            setLoading: (key, loading) => set(
                (state) => ({
                    loading: { ...state.loading, [key]: loading }
                }),
                false,
                `setLoading/${key}/${loading}`
            ),

            setMultipleLoading: (states) => set(
                (state) => ({
                    loading: { ...state.loading, ...states }
                }),
                false,
                'setMultipleLoading'
            ),

            clearAllLoading: () => set(
                (state) => ({
                    loading: Object.keys(state.loading).reduce(
                        (acc, key) => ({ ...acc, [key]: false }),
                        {} as LoadingStates
                    )
                }),
                false,
                'clearAllLoading'
            ),

            // Editing context actions
            setEditingProfile: (editing) => set(
                { editingProfile: editing },
                false,
                `setEditingProfile/${editing}`
            ),

            setUnsavedChanges: (hasChanges) => set(
                { hasUnsavedChanges: hasChanges },
                false,
                `setUnsavedChanges/${hasChanges}`
            ),

            resetEditingState: () => set(
                { editingProfile: false, hasUnsavedChanges: false },
                false,
                'resetEditingState'
            ),
        }),
        {
            name: 'profile-ui-store',
            enabled: import.meta.env.DEV,
        }
    )
);

/**
 * Selector hooks for specific parts of the store
 */

// Modal selectors
export const useModalState = (modal: keyof ModalStates) =>
    useUIStore((state) => state.modals[modal]);

export const useModalActions = () => {
    const openModal = useUIStore((state) => state.openModal);
    const closeModal = useUIStore((state) => state.closeModal);
    const closeAllModals = useUIStore((state) => state.closeAllModals);
    const toggleModal = useUIStore((state) => state.toggleModal);

    return {
        openModal,
        closeModal,
        closeAllModals,
        toggleModal,
    };
};

// Notification selectors
export const useNotifications = () =>
    useUIStore((state) => state.notifications);

export const useNotificationActions = () => {
    const addNotification = useUIStore((state) => state.addNotification);
    const removeNotification = useUIStore((state) => state.removeNotification);
    const clearNotifications = useUIStore((state) => state.clearNotifications);
    const addSuccessNotification = useUIStore((state) => state.addSuccessNotification);
    const addErrorNotification = useUIStore((state) => state.addErrorNotification);
    const addWarningNotification = useUIStore((state) => state.addWarningNotification);
    const addInfoNotification = useUIStore((state) => state.addInfoNotification);

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

// Loading selectors
export const useLoadingState = (key: keyof LoadingStates) =>
    useUIStore((state) => state.loading[key]);

export const useLoadingActions = () => {
    const setLoading = useUIStore((state) => state.setLoading);
    const setMultipleLoading = useUIStore((state) => state.setMultipleLoading);
    const clearAllLoading = useUIStore((state) => state.clearAllLoading);

    return {
        setLoading,
        setMultipleLoading,
        clearAllLoading,
    };
};

// Editing context selectors
export const useEditingProfile = () =>
    useUIStore((state) => state.editingProfile);

export const useHasUnsavedChanges = () =>
    useUIStore((state) => state.hasUnsavedChanges);

export const useEditingActions = () => {
    const setEditingProfile = useUIStore((state) => state.setEditingProfile);
    const setUnsavedChanges = useUIStore((state) => state.setUnsavedChanges);
    const resetEditingState = useUIStore((state) => state.resetEditingState);

    return {
        setEditingProfile,
        setUnsavedChanges,
        resetEditingState,
    };
};

/**
 * Utility hooks
 */

// Check if any modal is open
export const useAnyModalOpen = () =>
    useUIStore((state) => Object.values(state.modals).some(Boolean));

// Check if any loading state is active
export const useAnyLoading = () =>
    useUIStore((state) => Object.values(state.loading).some(Boolean));

// Get notification count by type
export const useNotificationCount = (type?: Notification['type']) =>
    useUIStore((state) =>
        type
            ? state.notifications.filter(n => n.type === type).length
            : state.notifications.length
    );