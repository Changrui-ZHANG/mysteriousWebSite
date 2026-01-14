import React, { useState, useEffect } from 'react';
import type { PrivacySettings as PrivacySettingsType } from '../types';
import { useTranslation } from 'react-i18next';
import { ToggleSwitch } from './ui/ToggleSwitch';

interface PrivacySettingsProps {
    settings: PrivacySettingsType;
    onUpdate: (settings: PrivacySettingsType) => Promise<void>;
    isLoading?: boolean;
    className?: string;
}

/**
 * PrivacySettings component for granular privacy control
 * Provides immediate feedback and explanations for each setting
 * Adapted for Glassmorphism design
 */
export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
    settings,
    onUpdate,
    isLoading = false,
    className = ''
}) => {
    const { t } = useTranslation();
    const [localSettings, setLocalSettings] = useState<PrivacySettingsType>(settings);
    const [hasChanges, setHasChanges] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Track changes
    useEffect(() => {
        const hasChanged = JSON.stringify(localSettings) !== JSON.stringify(settings);
        setHasChanges(hasChanged);
    }, [localSettings, settings]);

    // Reset local settings when props change
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleSettingChange = (key: keyof PrivacySettingsType, value: any) => {
        setLocalSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        if (isUpdating || isLoading) return;

        try {
            setIsUpdating(true);
            await onUpdate(localSettings);
        } catch (error) {
            // Error handling is done in parent component
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReset = () => {
        setLocalSettings(settings);
    };

    const getVisibilityDescription = (visibility: string) => {
        return t(`profile.privacy.visibility.${visibility}_desc`);
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public':
                return '🌍';
            case 'friends':
                return '👥';
            case 'private':
                return '🔒';
            default:
                return '•';
        }
    };

    return (
        <div className={`privacy-settings space-y-8 ${className}`}>
            <div>
                <h3 className="text-xl font-medium text-(--text-primary) mb-2">{t('profile.privacy.title')}</h3>
                <p className="text-sm text-(--text-secondary)">
                    {t('profile.privacy.subtitle')}
                </p>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-(--text-primary) uppercase tracking-wider">
                    {t('profile.privacy.visibility_title')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['public', 'friends', 'private'] as const).map((visibility) => (
                        <label
                            key={visibility}
                            className={`
                                relative flex flex-col p-4 cursor-pointer rounded-xl border transition-all duration-300
                                ${localSettings.profileVisibility === visibility
                                    ? 'bg-(--accent-primary-alpha) border-(--accent-primary) shadow-lg scale-[1.02]'
                                    : 'bg-(--bg-surface-translucent) border-(--border-subtle) hover:bg-(--glass-bg) hover:border-(--glass-border)'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl">{getVisibilityIcon(visibility)}</span>
                                <input
                                    type="radio"
                                    name="profileVisibility"
                                    value={visibility}
                                    checked={localSettings.profileVisibility === visibility}
                                    onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                    disabled={isLoading || isUpdating}
                                    className="h-4 w-4 text-(--accent-primary) focus:ring-(--accent-primary)"
                                />
                            </div>
                            <div className="text-base font-semibold text-(--text-primary) capitalize mb-1">
                                {t(`profile.privacy.visibility.${visibility}`)}
                            </div>
                            <div className="text-xs text-(--text-secondary) leading-tight">
                                {getVisibilityDescription(visibility)}
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Granular Settings */}
            <div className={`
                transition-all duration-500 ease-in-out overflow-hidden
                ${localSettings.profileVisibility === 'private' ? 'max-h-0 opacity-50' : 'max-h-[500px] opacity-100'}
            `}>
                <div className="pt-6 border-t border-(--border-subtle)">
                    <h4 className="text-sm font-medium text-(--text-primary) uppercase tracking-wider mb-4">
                        {t('profile.privacy.granular_title')}
                    </h4>

                    <div className="space-y-3">
                        {/* Show Bio */}
                        <ToggleSwitch
                            label={t('profile.privacy.show_bio')}
                            description={t('profile.privacy.show_bio_desc')}
                            checked={localSettings.showBio}
                            onChange={(checked) => handleSettingChange('showBio', checked)}
                            disabled={isLoading || isUpdating}
                            className="p-3 rounded-lg hover:bg-(--bg-surface-translucent) transition-colors"
                        />

                        {/* Show Stats */}
                        <ToggleSwitch
                            label={t('profile.privacy.show_stats')}
                            description={t('profile.privacy.show_stats_desc')}
                            checked={localSettings.showStats}
                            onChange={(checked) => handleSettingChange('showStats', checked)}
                            disabled={isLoading || isUpdating}
                            className="p-3 rounded-lg hover:bg-(--bg-surface-translucent) transition-colors"
                        />

                        {/* Show Achievements */}
                        <ToggleSwitch
                            label={t('profile.privacy.show_achievements')}
                            description={t('profile.privacy.show_achievements_desc')}
                            checked={localSettings.showAchievements}
                            onChange={(checked) => handleSettingChange('showAchievements', checked)}
                            disabled={isLoading || isUpdating}
                            className="p-3 rounded-lg hover:bg-(--bg-surface-translucent) transition-colors"
                        />

                        {/* Show Last Active */}
                        <ToggleSwitch
                            label={t('profile.privacy.show_last_active')}
                            description={t('profile.privacy.show_last_active_desc')}
                            checked={localSettings.showLastActive}
                            onChange={(checked) => handleSettingChange('showLastActive', checked)}
                            disabled={isLoading || isUpdating}
                            className="p-3 rounded-lg hover:bg-(--bg-surface-translucent) transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Privacy Notice with Glass effect */}
            <div className="glass-panel p-4 border-l-4 border-l-[var(--accent-info)]">
                <div className="flex">
                    <div className="text-(--accent-info) mr-3">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-sm text-(--text-secondary)">
                        <p className="font-medium mb-1 text-(--text-primary)">{t('profile.privacy.notice_title')}</p>
                        <p>
                            {t('profile.privacy.notice_text')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-(--border-subtle)">
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isUpdating || isLoading}
                        className={`
                            px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all
                            ${hasChanges && !isUpdating && !isLoading
                                ? 'bg-(--accent-primary) text-white hover:brightness-110 hover:scale-105'
                                : 'bg-(--bg-surface) text-(--text-muted) border border-(--border-subtle) cursor-not-allowed'}
                        `}
                    >
                        {isUpdating ? t('profile.privacy.saving') : t('profile.privacy.save')}
                    </button>

                    {hasChanges && (
                        <div className="text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-3 py-2 rounded-md flex items-center">
                            {t('profile.form.unsaved')}
                        </div>
                    )}
                </div>

                {hasChanges && (
                    <button
                        onClick={handleReset}
                        disabled={isUpdating || isLoading}
                        className="text-sm text-(--text-muted) hover:text-(--text-primary) underline disabled:opacity-50"
                    >
                        {t('profile.privacy.reset')}
                    </button>
                )}
            </div>
        </div>
    );
};