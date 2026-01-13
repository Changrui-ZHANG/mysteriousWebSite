/**
 * AvatarUploadWithCropping - Enhanced avatar upload with integrated cropping
 * Combines the existing avatar upload functionality with the new cropping system
 */

import React, { useState, useRef } from 'react';
import { useAvatarUpload } from '../queries/avatarMutations';
import { useModalActions, useModalState, useNotificationActions, useLoadingActions, useLoadingState } from '../stores/uiStore';
import { AvatarCropper } from './cropping/AvatarCropper';
import { CropResult } from './cropping/types';

interface AvatarUploadWithCroppingProps {
    userId: string;
    currentAvatarUrl?: string;
    onUploadComplete?: (avatarUrl: string) => void;
    onUploadError?: (error: string) => void;
    className?: string;
    enableCropping?: boolean;
}

/**
 * Enhanced AvatarUpload component with integrated cropping functionality
 * Provides seamless transition from file selection to cropping to upload
 * Adapted for Glassmorphism design
 */
export const AvatarUploadWithCropping: React.FC<AvatarUploadWithCroppingProps> = ({
    userId,
    currentAvatarUrl,
    onUploadComplete,
    onUploadError,
    className = '',
    enableCropping = true
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Global UI state
    const showCropper = useModalState('avatarCropper');
    const { openModal, closeModal } = useModalActions();
    const { addSuccessNotification, addErrorNotification } = useNotificationActions();
    const { setLoading } = useLoadingActions();
    const isUploading = useLoadingState('avatarUpload');

    // Early return if no userId to prevent hook initialization errors
    if (!userId) {
        return (
            <div className={`avatar-upload ${className}`}>
                <div className="text-center text-[var(--text-muted)] py-8">
                    <p>User ID required for avatar upload</p>
                </div>
            </div>
        );
    }

    const {
        error,
        uploadAvatar,
        deleteAvatar,
        validateFile,
        createPreview,
        clearPreview,
        clearError
    } = useAvatarUpload({
        userId,
        onUploadComplete: (avatarUrl) => {
            addSuccessNotification(
                'Avatar Updated',
                'Your profile picture has been successfully updated.'
            );
            onUploadComplete?.(avatarUrl);
        },
        onUploadError: (error) => {
            addErrorNotification(
                'Upload Failed',
                error
            );
            onUploadError?.(error);
        }
    });

    // Track upload progress locally since TanStack Query handles it via callback
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const displayUrl = currentAvatarUrl || previewUrl;

    /**
     * Handle file selection - either start cropping or upload directly
     */
    const handleFileSelect = async (file: File) => {
        clearError();

        // Validate file first
        const validation = await validateFile(file);

        if (!validation.isValid) {
            return; // Error is handled by the hook
        }

        if (enableCropping) {
            // Show cropper for user to crop the image
            setSelectedFile(file);
            openModal('avatarCropper');
        } else {
            // Direct upload without cropping (legacy behavior)
            const preview = createPreview(file);
            setPreviewUrl(preview);

            setLoading('avatarUpload', true);
            try {
                await uploadAvatar(file, (progress) => setUploadProgress(progress));
            } finally {
                setLoading('avatarUpload', false);
            }
        }
    };

    /**
     * Handle crop completion - upload the cropped image
     */
    const handleCropComplete = async (cropResult: CropResult) => {
        try {
            closeModal('avatarCropper');

            // Create a new File object from the cropped blob
            const croppedFile = new File(
                [cropResult.croppedImageBlob],
                selectedFile?.name || 'cropped-avatar.jpg',
                { type: 'image/jpeg' }
            );

            // Create preview from crop result
            if (previewUrl) {
                clearPreview(previewUrl);
            }
            const preview = createPreview(croppedFile);
            setPreviewUrl(preview);

            // Upload the cropped image
            setLoading('avatarUpload', true);
            try {
                await uploadAvatar(croppedFile, (progress) => setUploadProgress(progress));
            } finally {
                setLoading('avatarUpload', false);
            }

            // Clean up
            setSelectedFile(null);
            if (cropResult.croppedImageUrl) {
                URL.revokeObjectURL(cropResult.croppedImageUrl);
            }
        } catch (error) {
            console.error('Failed to upload cropped image:', error);
            addErrorNotification(
                'Upload Failed',
                'Failed to upload cropped image'
            );
        }
    };

    /**
     * Handle crop cancellation
     */
    const handleCropCancel = () => {
        closeModal('avatarCropper');
        setSelectedFile(null);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleDelete = async () => {
        try {
            setLoading('avatarUpload', true);
            await deleteAvatar();
            if (previewUrl) {
                clearPreview(previewUrl);
                setPreviewUrl(null);
            }

            addSuccessNotification(
                'Avatar Removed',
                'Your profile picture has been removed.'
            );
        } catch (error) {
            // Error is handled by the hook and global notifications
        } finally {
            setLoading('avatarUpload', false);
        }
    };

    const handleCancelPreview = () => {
        if (previewUrl) {
            clearPreview(previewUrl);
            setPreviewUrl(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            <div className={`avatar-upload ${className}`}>
                {/* Avatar Display */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="relative group">
                        <img
                            src={displayUrl || '/default-avatar.png'}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-[var(--glass-border)] shadow-md group-hover:scale-105 transition-transform"
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <div className="text-white text-xs font-medium">
                                    {uploadProgress}%
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                            Profile Picture
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                            JPG, PNG or WebP. Max size 5MB.
                            {enableCropping && ' You can crop after selecting.'}
                        </p>

                        {previewUrl && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCancelPreview}
                                    className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
                                    disabled={isUploading}
                                >
                                    Cancel Preview
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Area */}
                <div
                    className={`
                        border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer 
                        ${isDragOver
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-alpha)] scale-[1.02]'
                            : 'border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface-translucent)]'
                        } 
                        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={isUploading}
                    />

                    {isUploading ? (
                        <div className="space-y-2">
                            <div className="text-sm text-[var(--text-secondary)]">Uploading...</div>
                            <div className="w-full bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-[var(--text-muted)]">
                                <svg className="mx-auto h-8 w-8 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div className="text-sm text-[var(--text-muted)]">
                                <span className="font-medium text-[var(--accent-primary)] hover:underline">
                                    Click to upload
                                </span>
                                {' '}or drag and drop
                            </div>
                            {enableCropping && (
                                <div className="text-xs text-[var(--accent-secondary)] flex items-center justify-center mt-1">
                                    <span className="mr-1">✂️</span> Cropping enabled
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                {(currentAvatarUrl || previewUrl) && !isUploading && (
                    <div className="mt-4 flex justify-center">
                        <button
                            onClick={handleDelete}
                            className="text-sm text-red-500 hover:text-red-600 underline transition-colors"
                        >
                            Remove Avatar
                        </button>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50/50 border border-red-200 rounded-lg backdrop-blur-sm">
                        <div className="flex">
                            <div className="text-sm text-red-700 break-words">
                                {error}
                            </div>
                            <button
                                onClick={clearError}
                                className="ml-auto text-red-400 hover:text-red-600"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Cropping toggle */}
                <div className="mt-4 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <label className="flex items-center space-x-2 text-xs text-[var(--text-muted)] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableCropping}
                            onChange={() => {
                                // This would be controlled by parent component
                                // For now, just show the current state
                            }}
                            className="rounded border-[var(--border-subtle)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                            disabled={isUploading}
                        />
                        <span>Enable cropping</span>
                    </label>
                </div>
            </div>

            {/* Cropper Modal */}
            {showCropper && selectedFile && (
                <AvatarCropper
                    imageFile={selectedFile}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    options={{
                        outputSize: 256,
                        minCropSize: 128,
                        outputQuality: 0.9
                    }}
                />
            )}
        </>
    );
};