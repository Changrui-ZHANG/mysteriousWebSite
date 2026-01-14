/**
 * Modal State Store using Zustand
 * Manages modal visibility state for the profile domain
 * 
 * This store is separated from the main UI store to:
 * - Reduce unnecessary re-renders (components only subscribe to modal state)
 * - Improve code organization and maintainability
 * - Follow single responsibility principle
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Available modal types in the profile domain
 */
export type ModalType = 
    | 'avatarCropper'
    | 'profileEdit'
    | 'privacySettings'
    | 'avatarGallery'
    | 'confirmDelete';

/**
 * Modal state interface
 */
export interface ModalState {
    /** Currently active modal (null if no modal is open) */
    activeModal: ModalType | null;
    /** Optional data to pass to the modal */
    modalData?: any;
}

/**
 * Modal actions interface
 */
export interface ModalActions {
    /** Open a specific modal with optional data */
    openModal: (type: ModalType, data?: any) => void;
    /** Close the currently active modal */
    closeModal: () => void;
    /** Check if a specific modal is currently open */
    isModalOpen: (type: ModalType) => boolean;
    /** Toggle a specific modal */
    toggleModal: (type: ModalType, data?: any) => void;
    /** Close all modals (resets to initial state) */
    closeAllModals: () => void;
}

/**
 * Combined store interface
 */
export type ModalStore = ModalState & ModalActions;

/**
 * Initial state
 */
const initialState: ModalState = {
    activeModal: null,
    modalData: undefined,
};

/**
 * Modal Store
 * Manages modal visibility and data for the profile domain
 */
export const useModalStore = create<ModalStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            openModal: (type, data) => set(
                { activeModal: type, modalData: data },
                false,
                `openModal/${type}`
            ),

            closeModal: () => set(
                { activeModal: null, modalData: undefined },
                false,
                'closeModal'
            ),

            isModalOpen: (type) => get().activeModal === type,

            toggleModal: (type, data) => {
                const isOpen = get().isModalOpen(type);
                if (isOpen) {
                    get().closeModal();
                } else {
                    get().openModal(type, data);
                }
            },

            closeAllModals: () => set(
                initialState,
                false,
                'closeAllModals'
            ),
        }),
        {
            name: 'profile-modal-store',
            enabled: import.meta.env.DEV,
        }
    )
);

/**
 * Selector hooks for specific modals
 */

/** Check if a specific modal is open */
export const useIsModalOpen = (type: ModalType) =>
    useModalStore((state) => state.activeModal === type);

/** Get the currently active modal */
export const useActiveModal = () =>
    useModalStore((state) => state.activeModal);

/** Get modal data */
export const useModalData = () =>
    useModalStore((state) => state.modalData);

/** Get all modal actions */
export const useModalActions = () => {
    const openModal = useModalStore((state) => state.openModal);
    const closeModal = useModalStore((state) => state.closeModal);
    const toggleModal = useModalStore((state) => state.toggleModal);
    const closeAllModals = useModalStore((state) => state.closeAllModals);

    return {
        openModal,
        closeModal,
        toggleModal,
        closeAllModals,
    };
};

/** Check if any modal is currently open */
export const useAnyModalOpen = () =>
    useModalStore((state) => state.activeModal !== null);
