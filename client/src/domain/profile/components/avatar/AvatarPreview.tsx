import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '../../../../shared/components/UserAvatar';

interface AvatarPreviewProps {
    imageUrl: string;
    onEdit?: () => void;
    onRemove: () => void;
    isUploading?: boolean;
    uploadProgress?: number;
}

/**
 * AvatarPreview - Display avatar with edit/remove actions
 * Shows loading overlay during upload
 */
export const AvatarPreview: React.FC<AvatarPreviewProps> = ({
    imageUrl,
    onEdit,
    onRemove,
    isUploading = false,
    uploadProgress = 0
}) => {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {/* Avatar Display */}
            <div className="flex items-center space-x-4">
                <div className="relative group">
                    <UserAvatar
                        src={imageUrl}
                        alt={t('profile.avatar.title')}
                        size="xl"
                        className="border-2 border-(--glass-border) shadow-md group-hover:scale-105 transition-transform"
                    />
                    {isUploading && (
                        <div
                            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm"
                            role="status"
                            aria-live="polite"
                            aria-label={t('profile.form.saving')}
                        >
                            <div className="text-white text-xs font-medium">
                                {uploadProgress}%
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-medium text-(--text-primary) mb-1">
                        {t('profile.avatar.title')}
                    </h4>
                    <p className="text-xs text-(--text-muted) mb-2">
                        {t('profile.avatar.upload')}
                    </p>
                </div>
            </div>

            {/* Actions */}
            {!isUploading && (
                <div className="flex justify-center space-x-4">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-sm text-(--accent-primary) hover:text-(--accent-primary-hover) underline transition-colors"
                            aria-label={t('common.edit')}
                        >
                            {t('common.edit')}
                        </button>
                    )}
                    <button
                        onClick={onRemove}
                        className="text-sm text-red-500 hover:text-red-600 underline transition-colors"
                        aria-label={t('common.delete')}
                    >
                        {t('common.delete')}
                    </button>
                </div>
            )}
        </div>
    );
};
