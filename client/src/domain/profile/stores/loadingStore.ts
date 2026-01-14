/**
 * Loading State Store using Zustand
 * Manages loading states for async operations in the profile domain
 * 
 * This store is separated from the main UI store to:
 * - Reduce unnecessary re-renders (components only subscribe to specific loading states)
 * - Improve code organization and maintainability
 * - Follow single responsibility principle
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Known loading state keys for the profile domain
 */
export type LoadingKey = 
    | 'profileUpdate'
    | 'avatarUpload'
    | 'privacyUpdate'
    | 'profileDelete'
    | string; // Allow custom keys for flexibility

/**
 * Loading state interface
 */
export interface LoadingState {
    /** Map of loading states by key */
    loadingStates: Record<string, boolean>;
}

/**
 * Loading actions interface
 */
export interface LoadingActions {
    /** Set loading state for a specific key */
    setLoading: (key: LoadingKey, isLoading: boolean) => void;
    /** Check if a specific key is loading */
    isLoading: (key: LoadingKey) => boolean;
    /** Set multiple loading states at once */
    setMultipleLoading: (states: Record<string, boolean>) => void;
    /** Clear all loading states */
    clearLoading: () => void;
    /** Check if any loading state is active */
    isAnyLoading: () => boolean;
}

/**
 * Combined store interface
 */
export type LoadingStore = LoadingState & LoadingActions;

/**
 * Initial state
 */
const initialState: LoadingState = {
    loadingStates: {},
};

/**
 * Loading Store
 * Manages loading states for async operations in the profile domain
 */
export const useLoadingStore = create<LoadingStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            setLoading: (key, isLoading) => set(
                (state) => ({
                    loadingStates: { ...state.loadingStates, [key]: isLoading }
                }),
                false,
                `setLoading/${key}/${isLoading}`
            ),

            isLoading: (key) => get().loadingStates[key] ?? false,

            setMultipleLoading: (states) => set(
                (state) => ({
                    loadingStates: { ...state.loadingStates, ...states }
                }),
                false,
                'setMultipleLoading'
            ),

            clearLoading: () => set(
                initialState,
                false,
                'clearLoading'
            ),

            isAnyLoading: () => Object.values(get().loadingStates).some(Boolean),
        }),
        {
            name: 'profile-loading-store',
            enabled: import.meta.env.DEV,
        }
    )
);

/**
 * Selector hooks
 */

/** Check if a specific key is loading */
export const useIsLoading = (key: LoadingKey) =>
    useLoadingStore((state) => state.loadingStates[key] ?? false);

/** Check if any loading state is active */
export const useAnyLoading = () =>
    useLoadingStore((state) => Object.values(state.loadingStates).some(Boolean));

/** Get all loading actions */
export const useLoadingActions = () => {
    const setLoading = useLoadingStore((state) => state.setLoading);
    const setMultipleLoading = useLoadingStore((state) => state.setMultipleLoading);
    const clearLoading = useLoadingStore((state) => state.clearLoading);

    return {
        setLoading,
        setMultipleLoading,
        clearLoading,
    };
};
