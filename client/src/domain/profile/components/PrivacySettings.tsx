import React, { useState, useEffect } from 'react';
import type { PrivacySettings as PrivacySettingsType } from '../types';

interface PrivacySettingsProps {
    settings: PrivacySettingsType;
    onUpdate: (settings: PrivacySettingsType) => Promise<void>;
    isLoading?: boolean;
    className?: string;
}

/**
 * PrivacySettings component for granular privacy control
 * Provides immediate feedback and explanations for each setting
 */
export const PrivacySettings: React.FC<PrivacySettingsProps> = ({
    settings,
    onUpdate,
    isLoading = false,
    className = ''
}) => {
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
        switch (visibility) {
            case 'public':
                return 'Anyone can view your profile';
            case 'friends':
                return 'Only friends can view your profile';
            case 'private':
                return 'Only you can view your profile';
            default:
                return '';
        }
    };

    return (
        <div className={`privacy-settings space-y-6 ${className}`}>
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Control who can see your profile information and activity.
                </p>
            </div>

            {/* Profile Visibility */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Profile Visibility
                </label>
                <div className="space-y-2">
                    {(['public', 'friends', 'private'] as const).map((visibility) => (
                        <label key={visibility} className="flex items-start space-x-3">
                            <input
                                type="radio"
                                name="profileVisibility"
                                value={visibility}
                                checked={localSettings.profileVisibility === visibility}
                                onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                                disabled={isLoading || isUpdating}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900 capitalize">
                                    {visibility}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {getVisibilityDescription(visibility)}
                                </div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Granular Settings */}
            {localSettings.profileVisibility !== 'private' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900">
                        What others can see
                    </h4>

                    {/* Show Bio */}
                    <label className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-900">Bio</div>
                            <div className="text-xs text-gray-500">
                                Your personal description
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.showBio}
                            onChange={(e) => handleSettingChange('showBio', e.target.checked)}
                            disabled={isLoading || isUpdating}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </label>

                    {/* Show Stats */}
                    <label className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-900">Activity Statistics</div>
                            <div className="text-xs text-gray-500">
                                Message count, games played, streaks
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.showStats}
                            onChange={(e) => handleSettingChange('showStats', e.target.checked)}
                            disabled={isLoading || isUpdating}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </label>

                    {/* Show Achievements */}
                    <label className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-900">Achievements</div>
                            <div className="text-xs text-gray-500">
                                Badges and accomplishments
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.showAchievements}
                            onChange={(e) => handleSettingChange('showAchievements', e.target.checked)}
                            disabled={isLoading || isUpdating}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </label>

                    {/* Show Last Active */}
                    <label className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-900">Last Active</div>
                            <div className="text-xs text-gray-500">
                                When you were last online
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={localSettings.showLastActive}
                            onChange={(e) => handleSettingChange('showLastActive', e.target.checked)}
                            disabled={isLoading || isUpdating}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                    </label>
                </div>
            )}

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                    <div className="text-blue-400 mr-3">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Privacy Information</p>
                        <p>
                            Your avatar and display name are always visible to maintain a social experience. 
                            Other information can be controlled with these settings.
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-3">
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isUpdating || isLoading}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            hasChanges && !isUpdating && !isLoading
                                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {hasChanges && (
                    <button
                        onClick={handleReset}
                        disabled={isUpdating || isLoading}
                        className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reset Changes
                    </button>
                )}
            </div>

            {/* Change indicator */}
            {hasChanges && (
                <div className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                    You have unsaved privacy changes
                </div>
            )}
        </div>
    );
};