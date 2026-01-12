import React, { useState, useRef } from 'react';
import { useAvatarUpload } from '../hooks/useAvatarUpload';

interface AvatarUploadProps {
    userId: string;
    currentAvatarUrl?: string;
    onUploadComplete?: (avatarUrl: string) => void;
    onUploadError?: (error: string) => void;
    className?: string;
}

/**
 * AvatarUpload component with drag-and-drop functionality
 * Handles file upload, preview, and progress tracking
 */
export const AvatarUpload: React.FC<AvatarUploadProps> = ({
    userId,
    currentAvatarUrl,
    onUploadComplete,
    onUploadError,
    className = ''
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        isUploading,
        uploadProgress,
        error,
        previewUrl,
        uploadAvatar,
        deleteAvatar,
        validateFile,
        createPreview,
        clearPreview,
        clearError
    } = useAvatarUpload({
        userId,
        onUploadComplete,
        onUploadError
    });

    const displayUrl = previewUrl || currentAvatarUrl;

    const handleFileSelect = async (file: File) => {
        clearError();
        
        // Validate file first
        const validation = await validateFile(file);
        if (!validation.isValid) {
            return; // Error is handled by the hook
        }

        // Create preview
        createPreview(file);

        // Upload file
        await uploadAvatar(file);
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
            await deleteAvatar();
            clearPreview();
        } catch (error) {
            // Error is handled by the hook
        }
    };

    const handleCancelPreview = () => {
        clearPreview();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`avatar-upload ${className}`}>
            {/* Avatar Display */}
            <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                    <img
                        src={displayUrl || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    {isUploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <div className="text-white text-xs font-medium">
                                {uploadProgress}%
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                        Profile Picture
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                        JPG, PNG or WebP. Max size 5MB. Will be resized to 256x256.
                    </p>
                    
                    {previewUrl && (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleCancelPreview}
                                className="text-xs text-gray-600 hover:text-gray-800 underline"
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
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragOver
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                        <div className="text-sm text-gray-600">Uploading...</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-gray-400">
                            <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">
                                Click to upload
                            </span>
                            {' '}or drag and drop
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            {(currentAvatarUrl || previewUrl) && !isUploading && (
                <div className="mt-4 flex justify-center">
                    <button
                        onClick={handleDelete}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        Remove Avatar
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                        <div className="text-sm text-red-700">
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
        </div>
    );
};