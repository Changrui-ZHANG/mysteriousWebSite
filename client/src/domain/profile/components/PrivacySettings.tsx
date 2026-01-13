import React, { useState, useEffect } from 'react';
import type { PrivacySettings as PrivacySettingsType } from '../types';
import { useTranslation } from 'react-i18next';

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
                <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">{t('profile.privacy.title')}</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                    {t('profile.privacy.subtitle')}
                </p>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--text-primary)] uppercase tracking-wider">
                    {t('profile.privacy.visibility_title')}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(['public', 'friends', 'private'] as const).map((visibility) => (
                        <label
                            key={visibility}
                            className={`
                                relative flex flex-col p-4 cursor-pointer rounded-xl border transition-all duration-300
                                ${localSettings.profileVisibility === visibility
                                    ? 'bg-[var(--accent-primary-alpha)] border-[var(--accent-primary)] shadow-lg scale-[1.02]'
                                    : 'bg-[var(--bg-surface-translucent)] border-[var(--border-subtle)] hover:bg-[var(--glass-bg)] hover:border-[var(--glass-border)]'
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
                                    className="h-4 w-4 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                                />
                            </div>
                            <div className="text-base font-semibold text-[var(--text-primary)] capitalize mb-1">
                                {t(`profile.privacy.visibility.${visibility}`)}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)] leading-tight">
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
                <div className="pt-6 border-t border-[var(--border-subtle)]">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] uppercase tracking-wider mb-4">
                        {t('profile.privacy.granular_title')}
                    </h4>

                    <div className="space-y-3">
                        {/* Show Bio */}
                        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface-translucent)] transition-colors cursor-pointer group">
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">{t('profile.privacy.show_bio')}</div>
                                <div className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                                    {t('profile.privacy.show_bio_desc')}
                                </div>
                            </div>
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showBio}
                                    onChange={(e) => handleSettingChange('showBio', e.target.checked)}
                                    disabled={isLoading || isUpdating}
                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-[var(--accent-primary)] focus:outline-none ring-0 focus:ring-0 peer"
                                    style={{ top: '4px', left: '4px' }}
                                />
                                <div className={`
                                    toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200
                                    ${localSettings.showBio ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}
                                `}></div>
                            </div>
                        </label>

                        {/* Show Stats */}
                        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface-translucent)] transition-colors cursor-pointer group">
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">{t('profile.privacy.show_stats')}</div>
                                <div className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                                    {t('profile.privacy.show_stats_desc')}
                                </div>
                            </div>
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showStats}
                                    onChange={(e) => handleSettingChange('showStats', e.target.checked)}
                                    disabled={isLoading || isUpdating}
                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-[var(--accent-primary)] focus:outline-none ring-0 focus:ring-0"
                                    style={{ top: '4px', left: '4px' }}
                                />
                                <div className={`
                                    toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200
                                    ${localSettings.showStats ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}
                                `}></div>
                            </div>
                        </label>

                        {/* Show Achievements */}
                        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface-translucent)] transition-colors cursor-pointer group">
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">{t('profile.privacy.show_achievements')}</div>
                                <div className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                                    {t('profile.privacy.show_achievements_desc')}
                                </div>
                            </div>
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showAchievements}
                                    onChange={(e) => handleSettingChange('showAchievements', e.target.checked)}
                                    disabled={isLoading || isUpdating}
                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-[var(--accent-primary)] focus:outline-none ring-0 focus:ring-0"
                                    style={{ top: '4px', left: '4px' }}
                                />
                                <div className={`
                                    toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200
                                    ${localSettings.showAchievements ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}
                                `}></div>
                            </div>
                        </label>

                        {/* Show Last Active */}
                        <label className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-surface-translucent)] transition-colors cursor-pointer group">
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)]">{t('profile.privacy.show_last_active')}</div>
                                <div className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                                    {t('profile.privacy.show_last_active_desc')}
                                </div>
                            </div>
                            <div className="relative inline-block w-10 h-6 align-middle select-none transition duration-200 ease-in">
                                <input
                                    type="checkbox"
                                    checked={localSettings.showLastActive}
                                    onChange={(e) => handleSettingChange('showLastActive', e.target.checked)}
                                    disabled={isLoading || isUpdating}
                                    className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-[var(--accent-primary)] focus:outline-none ring-0 focus:ring-0"
                                    style={{ top: '4px', left: '4px' }}
                                />
                                <div className={`
                                    toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200
                                    ${localSettings.showLastActive ? 'bg-[var(--accent-primary)]' : 'bg-gray-300 dark:bg-gray-600'}
                                `}></div>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Privacy Notice with Glass effect */}
            <div className="glass-panel p-4 border-l-4 border-l-[var(--accent-info)]">
                <div className="flex">
                    <div className="text-[var(--accent-info)] mr-3">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                        <p className="font-medium mb-1 text-[var(--text-primary)]">{t('profile.privacy.notice_title')}</p>
                        <p>
                            {t('profile.privacy.notice_text')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-[var(--border-subtle)]">
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isUpdating || isLoading}
                        className={`
                            px-6 py-2.5 text-sm font-medium rounded-xl shadow-lg transition-all
                            ${hasChanges && !isUpdating && !isLoading
                                ? 'bg-[var(--accent-primary)] text-white hover:brightness-110 hover:scale-105'
                                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed'}
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
                        className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] underline disabled:opacity-50"
                    >
                        {t('profile.privacy.reset')}
                    </button>
                )}
            </div>
        </div>
    );
};