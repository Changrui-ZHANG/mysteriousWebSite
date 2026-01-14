/**
 * Editing State Store using Zustand
 * Manages editing context and unsaved changes tracking for the profile domain
 * 
 * This store is separated from the main UI store to:
 * - Reduce unnecessary re-renders (components only subscribe to editing state)
 * - Improve code organization and maintainability
 * - Follow single responsibility principle
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Editing state interface
 */
export interface EditingState {
    /** Whether user is currently editing */
    isEditing: boolean;
    /** Whether there are unsaved changes */
    hasUnsavedChanges: boolean;
    /** Optional context about what is being edited */
    editingContext?: string;
}

/**
 * Editing actions interface
 */
export interface EditingActions {
    /** Start editing with optional context */
    startEditing: (context?: string) => void;
    /** Stop editing and reset state */
    stopEditing: () => void;
    /** Mark whether there are unsaved changes */
    markUnsavedChanges: (hasChanges: boolean) => void;
    /** Reset all editing state */
    resetEditingState: () => void;
}

/**
 * Combined store interface
 */
export type EditingStore = EditingState & EditingActions;

/**
 * Initial state
 */
const initialState: EditingState = {
    isEditing: false,
    hasUnsavedChanges: false,
    editingContext: undefined,
};

/**
 * Editing Store
 * Manages editing context and unsaved changes tracking for the profile domain
 */
export const useEditingStore = create<EditingStore>()(
    devtools(
        (set) => ({
            ...initialState,

            startEditing: (context) => set(
                { isEditing: true, editingContext: context },
                false,
                `startEditing/${context || 'default'}`
            ),

            stopEditing: () => set(
                { isEditing: false, hasUnsavedChanges: false, editingContext: undefined },
                false,
                'stopEditing'
            ),

            markUnsavedChanges: (hasChanges) => set(
                { hasUnsavedChanges: hasChanges },
                false,
                `markUnsavedChanges/${hasChanges}`
            ),

            resetEditingState: () => set(
                initialState,
                false,
                'resetEditingState'
            ),
        }),
        {
            name: 'profile-editing-store',
            enabled: import.meta.env.DEV,
        }
    )
);

/**
 * Selector hooks
 */

/** Check if currently editing */
export const useIsEditing = () =>
    useEditingStore((state) => state.isEditing);

/** Check if there are unsaved changes */
export const useHasUnsavedChanges = () =>
    useEditingStore((state) => state.hasUnsavedChanges);

/** Get editing context */
export const useEditingContext = () =>
    useEditingStore((state) => state.editingContext);

/** Get all editing actions */
export const useEditingActions = () => {
    const startEditing = useEditingStore((state) => state.startEditing);
    const stopEditing = useEditingStore((state) => state.stopEditing);
    const markUnsavedChanges = useEditingStore((state) => state.markUnsavedChanges);
    const resetEditingState = useEditingStore((state) => state.resetEditingState);

    return {
        startEditing,
        stopEditing,
        markUnsavedChanges,
        resetEditingState,
    };
};
