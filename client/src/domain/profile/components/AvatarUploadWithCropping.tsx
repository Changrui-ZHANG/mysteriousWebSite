/**
 * AvatarUploadWithCropping - Enhanced avatar upload with integrated cropping
 * Orchestrates the avatar upload flow using focused sub-components
 * Refactored to use AvatarDropzone, AvatarPreview, and AvatarUploadProgress
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAvatarUpload } from '../queries/avatarMutations';
import { useModalActions, useIsModalOpen } from '../stores/modalStore';
import { useNotificationActions } from '../stores/notificationStore';
import { useLoadingActions, useIsLoading } from '../stores/loadingStore';
import { AvatarCropper } from './cropping/AvatarCropper';
import { AvatarDropzone, AvatarPreview, AvatarUploadProgress } from './avatar';
import { CropResult } from './cropping/types';
import { logError } from '../utils/logger';
import { logAvatarUpload } from '../utils/diagnosticLogger';

// Constants
const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
 * Orchestrates file selection, cropping, and upload using focused sub-components
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
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Global UI state
    const showCropper = useIsModalOpen('avatarCropper');
    const { openModal, closeModal } = useModalActions();
    const { addSuccessNotification, addErrorNotification } = useNotificationActions();
    const { setLoading } = useLoadingActions();
    const isUploading = useIsLoading('avatarUpload');

    // Early return if no userId to prevent hook initialization errors
    if (!userId) {
        return (
            <div className={`avatar-upload ${className}`}>
                <div className="text-center text-(--text-muted) py-8">
                    <p>{t('profile.errors.access_required')}</p>
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
                t('profile.avatar.title'),
                t('profile.form.success')
            );
            onUploadComplete?.(avatarUrl);
        },
        onUploadError: (error) => {
            addErrorNotification(
                t('profile.avatar.error'),
                error
            );
            onUploadError?.(error);
        }
    });

    const displayUrl = currentAvatarUrl || previewUrl;

    /**
     * Handle file selection - either start cropping or upload directly
     */
    const handleFileSelect = async (file: File) => {
        logAvatarUpload('file-select', 'AvatarUploadWithCropping', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            enableCropping
        });

        clearError();

        // Validate file first
        logAvatarUpload('validation', 'AvatarUploadWithCropping', {
            fileName: file.name,
            validating: true
        });

        const validation = await validateFile(file);

        logAvatarUpload('validation', 'AvatarUploadWithCropping', {
            fileName: file.name,
            isValid: validation.isValid,
            errors: validation.errors
        });

        if (!validation.isValid) {
            logAvatarUpload('error', 'AvatarUploadWithCropping', {
                phase: 'validation',
                fileName: file.name,
                errors: validation.errors
            });
            return; // Error is handled by the hook
        }

        if (enableCropping) {
            // Show cropper for user to crop the image
            logAvatarUpload('crop-start', 'AvatarUploadWithCropping', {
                fileName: file.name,
                openingModal: true
            });
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
        logAvatarUpload('crop-complete', 'AvatarUploadWithCropping', {
            blobSize: cropResult.croppedImageBlob.size,
            blobType: cropResult.croppedImageBlob.type,
            hasUrl: !!cropResult.croppedImageUrl
        });

        try {
            closeModal();

            // Validate blob
            if (!cropResult.croppedImageBlob || cropResult.croppedImageBlob.size === 0) {
                const error = new Error('Invalid crop result: empty blob');
                logAvatarUpload('error', 'AvatarUploadWithCropping', {
                    phase: 'crop-complete',
                    error: 'Empty blob received from cropper'
                }, error);
                throw error;
            }

            // Determine extension based on blob type
            const extension = cropResult.croppedImageBlob.type.split('/')[1] || 'jpg';
            const fileName = (selectedFile?.name || 'avatar').replace(/\.[^/.]+$/, "") + "." + extension;

            logAvatarUpload('file-conversion', 'AvatarUploadWithCropping', {
                originalFileName: selectedFile?.name,
                newFileName: fileName,
                blobSize: cropResult.croppedImageBlob.size,
                blobType: cropResult.croppedImageBlob.type
            });

            // Create a new File object from the cropped blob
            const croppedFile = new File(
                [cropResult.croppedImageBlob],
                fileName,
                { type: cropResult.croppedImageBlob.type }
            );

            logAvatarUpload('file-conversion', 'AvatarUploadWithCropping', {
                success: true,
                fileName: croppedFile.name,
                fileSize: croppedFile.size,
                fileType: croppedFile.type
            });

            // Create preview from crop result
            if (previewUrl) {
                clearPreview(previewUrl);
            }
            const preview = createPreview(croppedFile);
            setPreviewUrl(preview);

            // Upload the cropped image
            logAvatarUpload('upload-start', 'AvatarUploadWithCropping', {
                fileName: croppedFile.name,
                fileSize: croppedFile.size,
                fileType: croppedFile.type,
                userId
            });

            setLoading('avatarUpload', true);
            try {
                await uploadAvatar(croppedFile, (progress) => {
                    logAvatarUpload('upload-progress', 'AvatarUploadWithCropping', {
                        progress,
                        fileName: croppedFile.name
                    });
                    setUploadProgress(progress);
                });

                logAvatarUpload('upload-complete', 'AvatarUploadWithCropping', {
                    fileName: croppedFile.name,
                    success: true
                });
            } finally {
                setLoading('avatarUpload', false);
            }

            // Clean up
            setSelectedFile(null);
            if (cropResult.croppedImageUrl) {
                URL.revokeObjectURL(cropResult.croppedImageUrl);
            }
        } catch (error) {
            logError('Failed to upload cropped image', error);
            logAvatarUpload('error', 'AvatarUploadWithCropping', {
                phase: 'upload',
                fileName: selectedFile?.name,
                error: error instanceof Error ? error.message : 'Unknown error'
            }, error instanceof Error ? error : undefined);
            
            addErrorNotification(
                t('profile.avatar.error'),
                t('profile.avatar.error')
            );
        }
    };

    /**
     * Handle crop cancellation
     */
    const handleCropCancel = () => {
        closeModal();
        setSelectedFile(null);
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
                t('profile.avatar.title'),
                t('profile.form.success')
            );
        } catch (error) {
            // Error is handled by the hook and global notifications
        } finally {
            setLoading('avatarUpload', false);
        }
    };

    const handleCancelUpload = () => {
        if (previewUrl) {
            clearPreview(previewUrl);
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setUploadProgress(0);
    };

    return (
        <>
            <div className={`avatar-upload ${className}`}>
                {/* Show preview if we have an avatar */}
                {displayUrl && !isUploading && (
                    <AvatarPreview
                        imageUrl={displayUrl}
                        onRemove={handleDelete}
                        isUploading={false}
                    />
                )}

                {/* Show upload progress during upload */}
                {isUploading && selectedFile && (
                    <AvatarUploadProgress
                        progress={uploadProgress}
                        fileName={selectedFile.name}
                        onCancel={handleCancelUpload}
                    />
                )}

                {/* Show dropzone when not uploading */}
                {!isUploading && (
                    <AvatarDropzone
                        onFileSelect={handleFileSelect}
                        accept={ACCEPTED_FORMATS}
                        maxSize={MAX_FILE_SIZE}
                        disabled={isUploading}
                        enableCropping={enableCropping}
                    />
                )}

                {/* Error Display */}
                {error && (
                    <div
                        className="mt-4 p-3 bg-red-50/50 border border-red-200 rounded-lg backdrop-blur-sm"
                        role="alert"
                        aria-live="polite"
                    >
                        <div className="flex">
                            <div className="text-sm text-red-700 wrap-break-word">
                                {error}
                            </div>
                            <button
                                onClick={clearError}
                                className="ml-auto text-red-400 hover:text-red-600"
                                aria-label={t('common.close')}
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
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