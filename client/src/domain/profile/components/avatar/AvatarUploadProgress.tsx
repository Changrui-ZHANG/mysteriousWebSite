import React from 'react';
import { useTranslation } from 'react-i18next';

interface AvatarUploadProgressProps {
    progress: number;
    fileName: string;
    onCancel: () => void;
}

/**
 * AvatarUploadProgress - Display upload progress with cancel option
 * Shows progress bar and file name
 */
export const AvatarUploadProgress: React.FC<AvatarUploadProgressProps> = ({
    progress,
    fileName,
    onCancel
}) => {
    const { t } = useTranslation();

    return (
        <div 
            className="space-y-3"
            role="status"
            aria-live="polite"
            aria-label={`${t('profile.form.saving')} ${progress}%`}
        >
            {/* File name */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-(--text-secondary) truncate flex-1 mr-4">
                    {fileName}
                </div>
                <button
                    onClick={onCancel}
                    className="text-xs text-(--text-muted) hover:text-red-500 transition-colors"
                    aria-label={t('profile.avatar.cancel')}
                >
                    {t('profile.avatar.cancel')}
                </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="text-sm text-(--text-secondary)">
                    {t('profile.form.saving')}
                </div>
                <div className="w-full bg-(--bg-surface) rounded-full h-2 overflow-hidden">
                    <div
                        className="bg-(--accent-primary) h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                        role="progressbar"
                        aria-valuenow={progress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    />
                </div>
                <div className="text-xs text-(--text-muted) text-right">
                    {progress}%
                </div>
            </div>
        </div>
    );
};
