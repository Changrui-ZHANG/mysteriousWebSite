import React from 'react';
import { RealTimeStatusCompact } from './RealTimeStatus';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '../../../shared/components/UserAvatar';
import type { UserProfile } from '../types';

interface ProfileCardProps {
    profile: UserProfile;
    stats?: import('../types').ActivityStats | null;
    isOwnProfile?: boolean;
    onEdit?: () => void;
    onEditClick?: () => void;
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
    const { t, i18n } = useTranslation();
    const {
        displayName,
        bio,
        joinDate,
        lastActive,
        activityStats,
        achievements = [], // Default to empty array
        privacySettings
    } = profile || {}; // Add null safety for profile object

    const formatDate = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(i18n.language, {
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
                <div className="text-center text-(--text-muted)">
                    {t('common.unknown_error')}
                </div>
            </div>
        );
    }

    return (
        <div className={`profile-card rounded-lg ${className}`}>
            {/* Header with avatar and basic info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 mb-4 sm:mb-6">
                <div className="shrink-0 relative">
                    <UserAvatar
                        userId={profile.userId}
                        alt={`${displayName}'s avatar`}
                        size={96}
                        className="border-4 border-(--bg-surface) shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full ring-2 ring-(--accent-primary) ring-offset-2 ring-offset-transparent opacity-50 pointer-events-none"></div>
                </div>

                <div className="grow text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center sm:items-baseline space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
                        <h3 className="text-xl sm:text-2xl font-bold text-(--text-primary)">
                            {displayName}
                        </h3>
                        <div className="scale-90 sm:scale-100 origin-center sm:origin-left">
                            <RealTimeStatusCompact userId={profile.userId} />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-3 gap-y-1 mb-1.5 sm:mb-2 text-xs sm:text-sm text-(--text-secondary)">
                        <p>
                            {t('profile.card.joined')} {formatDate(joinDate)}
                        </p>
                        {profile.gender && (
                            <p className="flex items-center">
                                <span className="w-1 h-1 rounded-full bg-(--text-muted) mx-2 hidden sm:inline-block"></span>
                                {profile.gender === 'H' ? '♂️ ' + t('profile.gender.male') : '♀️ ' + t('profile.gender.female')}
                            </p>
                        )}
                    </div>

                    {shouldShowLastActive && lastActive && (
                        <p className="text-[10px] sm:text-xs text-(--text-muted) mb-2 sm:mb-3">
                            {t('profile.privacy.show_last_active')}: {formatDate(lastActive)}
                        </p>
                    )}

                    {/* Bio */}
                    {shouldShowBio && bio && (
                        <div className="max-w-md mx-auto sm:mx-0">
                            <p className="text-(--text-secondary) text-xs sm:text-sm leading-relaxed italic">
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
                            className="glass-panel px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-(--text-primary) hover:bg-(--bg-surface-translucent) transition-colors w-full sm:w-auto"
                        >
                            <span className="mr-2">✏️</span> {t('profile.tabs.edit')}
                        </button>
                    )}

                    {!isOwnProfile && onViewProfile && (
                        <button
                            onClick={onViewProfile}
                            className="glass-panel px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-(--text-primary) hover:bg-(--bg-surface-translucent) transition-colors w-full sm:w-auto"
                        >
                            {t('nav.more')}
                        </button>
                    )}
                </div>
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-(--border-subtle) to-transparent my-4 sm:my-6"></div>

            {/* Activity Stats */}
            {shouldShowStats && activityStats && (
                <div className="mb-4 sm:mb-6">
                    <h4 className="text-xs sm:text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-3 sm:mb-4">{t('profile.card.stats')}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm">
                        <div className="p-2 sm:p-3 rounded-lg bg-(--bg-surface-translucent) border border-(--border-subtle)">
                            <span className="block text-(--text-muted) text-[10px] sm:text-xs mb-1">{t('profile.card.messages')}</span>
                            <span className="block text-base sm:text-lg font-bold text-(--accent-primary)">{activityStats.totalMessages || 0}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-(--bg-surface-translucent) border border-(--border-subtle)">
                            <span className="block text-(--text-muted) text-[10px] sm:text-xs mb-1">{t('profile.card.games')}</span>
                            <span className="block text-base sm:text-lg font-bold text-(--accent-success)">{activityStats.totalGamesPlayed || 0}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-(--bg-surface-translucent) border border-(--border-subtle)">
                            <span className="block text-(--text-muted) text-[10px] sm:text-xs mb-1">{t('profile.card.streak')}</span>
                            <span className="block text-base sm:text-lg font-bold text-(--accent-warning)">{activityStats.currentStreak || 0} {t('profile.card.days')}</span>
                        </div>
                        <div className="p-2 sm:p-3 rounded-lg bg-(--bg-surface-translucent) border border-(--border-subtle)">
                            <span className="block text-(--text-muted) text-[10px] sm:text-xs mb-1">{t('game.time')}</span>
                            <span className="block text-base sm:text-lg font-bold text-(--accent-secondary)">{Math.round((activityStats.timeSpent || 0) / 60)}h</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Achievements */}
            {shouldShowAchievements && achievements && achievements.length > 0 && (
                <div>
                    <h4 className="text-xs sm:text-sm font-medium text-(--text-muted) uppercase tracking-wider mb-3 sm:mb-4">
                        {t('profile.card.achievements')}
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
                <div className="mt-4 sm:mt-6 pt-4 border-t border-(--border-subtle)">
                    <p className="text-[10px] sm:text-xs text-(--text-muted) flex items-center justify-center">
                        <span className="mr-2">🔒</span>
                        {t('profile.privacy.subtitle')}
                    </p>
                </div>
            )}
        </div>
    );
};