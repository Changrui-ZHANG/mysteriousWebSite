import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AvatarDropzoneProps {
    onFileSelect: (file: File) => void;
    accept: string[];
    maxSize: number;
    disabled?: boolean;
    enableCropping?: boolean;
}

/**
 * AvatarDropzone - File selection and drag-drop component
 * Handles file validation and provides visual feedback
 */
export const AvatarDropzone: React.FC<AvatarDropzoneProps> = ({
    onFileSelect,
    accept,
    maxSize,
    disabled = false,
    enableCropping = true
}) => {
    const { t } = useTranslation();
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): boolean => {
        setError(null);

        // Check file type
        const fileType = file.type;
        if (!accept.includes(fileType)) {
            setError(t('profile.avatar.invalid_format'));
            return false;
        }

        // Check file size
        if (file.size > maxSize) {
            const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
            setError(t('profile.avatar.file_too_large', { size: maxSizeMB }));
            return false;
        }

        return true;
    };

    const handleFileSelect = (file: File) => {
        if (validateFile(file)) {
            onFileSelect(file);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
        // Reset input to allow selecting the same file again
        e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    return (
        <div>
            <div
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer 
                    ${isDragOver
                        ? 'border-(--accent-primary) bg-(--accent-primary-alpha) scale-[1.02]'
                        : 'border-(--border-subtle) hover:border-(--accent-primary) hover:bg-(--bg-surface-translucent)'
                    } 
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
                role="button"
                tabIndex={disabled ? -1 : 0}
                aria-label={t('profile.avatar.upload')}
                aria-disabled={disabled}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        handleClick();
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept.join(',')}
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={disabled}
                    aria-hidden="true"
                />

                <div className="space-y-2">
                    <div className="text-(--text-muted)">
                        <svg 
                            className="mx-auto h-8 w-8 opacity-70" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                            />
                        </svg>
                    </div>
                    <div className="text-sm text-(--text-muted)">
                        <span className="font-medium text-(--accent-primary) hover:underline">
                            {t('profile.avatar.upload')}
                        </span>
                    </div>
                    {enableCropping && (
                        <div className="text-xs text-(--accent-secondary) flex items-center justify-center mt-1">
                            <span className="mr-1" aria-hidden="true">✂️</span> 
                            {t('profile.avatar.cropping')}
                        </div>
                    )}
                </div>
            </div>

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
                            onClick={() => setError(null)}
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
    );
};
