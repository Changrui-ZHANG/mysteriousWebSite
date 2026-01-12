import React from 'react';
import type { UserProfile } from '../types';

interface ProfileCardProps {
    profile: UserProfile;
    isOwnProfile?: boolean;
    onEdit?: () => void;
    onViewProfile?: () => void;
    className?: string;
}

/**
 * ProfileCard component for displaying user profiles
 * Shows avatar, basic info, stats, and achievements based on privacy settings
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({
    profile,
    isOwnProfile = false,
    onEdit,
    onViewProfile,
    className = ''
}) => {
    const {
        displayName,
        bio,
        avatarUrl,
        joinDate,
        lastActive,
        activityStats,
        achievements = [], // Default to empty array
        privacySettings
    } = profile || {}; // Add null safety for profile object

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(dateObj);
    };

    // Safe access to privacy settings with defaults
    const shouldShowStats = isOwnProfile || (privacySettings?.showStats ?? true);
    const shouldShowBio = isOwnProfile || (privacySettings?.showBio ?? true);
    const shouldShowAchievements = isOwnProfile || (privacySettings?.showAchievements ?? true);
    const shouldShowLastActive = isOwnProfile || (privacySettings?.showLastActive ?? true);

    // Handle missing data gracefully
    if (!profile) {
        return (
            <div className={`profile-card bg-white rounded-lg shadow-md p-6 ${className}`}>
                <div className="text-center text-gray-500">
                    Profile not available
                </div>
            </div>
        );
    }

    return (
        <div className={`profile-card bg-white rounded-lg shadow-md p-6 ${className}`}>
            {/* Header with avatar and basic info */}
            <div className="flex items-start space-x-4 mb-4">
                <div className="shrink-0">
                    <img
                        src={avatarUrl || '/default-avatar.png'}
                        alt={`${displayName}'s avatar`}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                </div>
                
                <div className="grow">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {displayName}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">
                        Joined {formatDate(joinDate)}
                    </p>
                    
                    {shouldShowLastActive && lastActive && (
                        <p className="text-xs text-gray-400">
                            Last active: {formatDate(lastActive)}
                        </p>
                    )}
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-2">
                    {isOwnProfile && onEdit && (
                        <button
                            onClick={onEdit}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Edit
                        </button>
                    )}
                    
                    {!isOwnProfile && onViewProfile && (
                        <button
                            onClick={onViewProfile}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            View
                        </button>
                    )}
                </div>
            </div>

            {/* Bio */}
            {shouldShowBio && bio && (
                <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {bio}
                    </p>
                </div>
            )}

            {/* Activity Stats */}
            {shouldShowStats && activityStats && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Activity</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500">Messages:</span>
                            <span className="ml-1 font-medium">{activityStats.totalMessages || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Games:</span>
                            <span className="ml-1 font-medium">{activityStats.totalGamesPlayed || 0}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Current Streak:</span>
                            <span className="ml-1 font-medium">{activityStats.currentStreak || 0} days</span>
                        </div>
                        <div>
                            <span className="text-gray-500">Time Spent:</span>
                            <span className="ml-1 font-medium">{Math.round((activityStats.timeSpent || 0) / 60)}h</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements */}
            {shouldShowAchievements && achievements && achievements.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Achievements ({achievements.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {achievements.slice(0, 6).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="flex items-center space-x-1 bg-yellow-50 text-yellow-800 px-2 py-1 rounded-full text-xs"
                                title={achievement.description}
                            >
                                {achievement.iconUrl && (
                                    <img
                                        src={achievement.iconUrl}
                                        alt=""
                                        className="w-4 h-4"
                                    />
                                )}
                                <span>{achievement.name}</span>
                            </div>
                        ))}
                        {achievements.length > 6 && (
                            <div className="text-xs text-gray-500 px-2 py-1">
                                +{achievements.length - 6} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Privacy indicator */}
            {!isOwnProfile && privacySettings?.profileVisibility !== 'public' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">🔒</span>
                        Limited profile visibility
                    </p>
                </div>
            )}
        </div>
    );
};