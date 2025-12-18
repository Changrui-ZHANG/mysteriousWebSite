import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    zIndex?: number;
    closeOnBackdrop?: boolean;
    className?: string;
}

/**
 * Reusable modal component with backdrop blur and animations.
 * Used for dialogs, alerts, and overlays throughout the app.
 */
export function Modal({
    isOpen,
    onClose,
    children,
    zIndex = 50,
    closeOnBackdrop = true,
    className = '',
}: ModalProps) {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${className}`}
                    style={{ zIndex }}
                    onClick={handleBackdropClick}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
