import React from 'react';
import { RealTimeStatusCompact } from './RealTimeStatus';
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
            <div className={`profile-card rounded-lg p-6 ${className}`}>
                <div className="text-center text-[var(--text-muted)]">
                    Profile not available
                </div>
            </div>
        );
    }

    return (
        <div className={`profile-card rounded-lg ${className}`}>
            {/* Header with avatar and basic info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <div className="shrink-0 relative">
                    <img
                        src={avatarUrl || '/default-avatar.png'}
                        alt={`${displayName}'s avatar`}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-[var(--bg-surface)] shadow-lg transition-all"
                    />
                    <div className="absolute inset-0 rounded-full ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-transparent opacity-50"></div>
                </div>

                <div className="grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-baseline space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                            {displayName}
                        </h3>
                        <div className="scale-90 sm:scale-100 origin-center sm:origin-left">
                            <RealTimeStatusCompact userId={profile.userId} />
                        </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-1.5 sm:mb-2">
                        Member since {formatDate(joinDate)}
                    </p>

                    {shouldShowLastActive && lastActive && (
                        <p className="text-[10px] sm:text-xs text-[var(--text-muted)] mb-2 sm:mb-3">
                            Last active: {formatDate(lastActive)}
                        </p>
                    )}

                    {/* Bio */}
                    {shouldShowBio && bio && (
                        <div className="max-w-md mx-auto sm:mx-0">
                            <p className="text-[var(--text-secondary)] text-xs sm:text-sm leading-relaxed italic">
                                "{bio}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2 pt-2 sm:pt-2 w-full sm:w-auto justify-center sm:justify-start">
                    {isOwnProfile && onEdit && (
                        <button
                            onClick={onEdit}
                            className="glass-panel px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-translucent)] transition-colors w-full sm:w-auto"
                        >
                            <span className="mr-2">✏️</span> Edit
                        </button>
                    )}

                    {!isOwnProfile && onViewProfile && (
                        <button
                            onClick={onViewProfile}
                            className="glass-panel px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-translucent)] transition-colors w-full sm:w-auto"
                        >
                            View
                        </button>
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-[var(--border-subtle)] to-transparent my-4 sm:my-6"></div>

            {/* Activity Stats */}
            {shouldShowStats && activityStats && (
                <div className="mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 sm:mb-4">Top Stats</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                        <div className="p-2 sm:p-3 rounded-lg bg-[var(--bg-surface-translucent)] border border-[var(--border-subtle)]">
                            <span className="block text-[var(--text-muted)] text-[10px] sm:text-xs mb-1">Messages</span>
                            <span className="block text-base sm:text-lg font-bold text-[var(--accent-primary)]">{activityStats.totalMessages || 0}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-[var(--bg-surface-translucent)] border border-[var(--border-subtle)]">
                            <span className="block text-[var(--text-muted)] text-[10px] sm:text-xs mb-1">Games</span>
                            <span className="block text-base sm:text-lg font-bold text-[var(--accent-success)]">{activityStats.totalGamesPlayed || 0}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-[var(--bg-surface-translucent)] border border-[var(--border-subtle)]">
                            <span className="block text-[var(--text-muted)] text-[10px] sm:text-xs mb-1">Streak</span>
                            <span className="block text-base sm:text-lg font-bold text-[var(--accent-warning)]">{activityStats.currentStreak || 0} days</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-[var(--bg-surface-translucent)] border border-[var(--border-subtle)]">
                            <span className="block text-[var(--text-muted)] text-[10px] sm:text-xs mb-1">Hours</span>
                            <span className="block text-base sm:text-lg font-bold text-[var(--accent-secondary)]">{Math.round((activityStats.timeSpent || 0) / 60)}h</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements */}
            {shouldShowAchievements && achievements && achievements.length > 0 && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3 sm:mb-4">
                        Recent Badges
                    </h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                        {achievements.slice(0, 6).map((achievement) => (
                            <div
                                key={achievement.id}
                                className="
                                    flex items-center space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border
                                    bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800
                                "
                                title={achievement.description}
                            >
                                {achievement.iconUrl && (
                                    <img
                                        src={achievement.iconUrl}
                                        alt=""
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    />
                                )}
                                <span>{achievement.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy indicator */}
            {!isOwnProfile && privacySettings?.profileVisibility !== 'public' && (
                <div className="mt-4 sm:mt-6 pt-4 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] flex items-center justify-center">
                        <span className="mr-2">🔒</span>
                        Limited profile visibility
                    </p>
                </div>
            )}
        </div>
    );
};