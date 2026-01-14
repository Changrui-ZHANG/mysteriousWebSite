import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useProfileWithStats, useUpdateProfileMutation, useUpdatePrivacyMutation } from './queries/profileQueries';
import { ProfileCard } from './components/ProfileCard';
import { ProfileForm } from './components/ProfileForm';
import { AvatarUploadWithCropping } from './components/AvatarUploadWithCropping';
import { PrivacySettings } from './components/PrivacySettings';
import { NotificationCenter } from './components/NotificationCenter';
import { ErrorDisplay } from '../../shared/components';
import { GlassCard, LiquidBackground } from '../../shared/components/GlassCard';
import { useHasUnsavedChanges } from './stores/editingStore';
import { logError } from './utils/logger';
import type { UpdateProfileRequest } from './types';

type TabType = 'overview' | 'edit' | 'privacy' | 'activity';

/**
 * ProfilePage - Main profile management page
 * Provides tabbed interface for profile management
 */
export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Sync state with URL query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab') as TabType;
        if (tab && ['overview', 'edit', 'privacy', 'activity'].includes(tab)) {
            setActiveTab(tab);
        } else if (!tab) {
            setActiveTab('overview');
        }
    }, [location.search]);

    // TanStack Query hooks for profile and stats
    const {
        profile,
        stats,
        isLoading,
        error,
        refetchProfile,
        refetchStats
    } = useProfileWithStats(user?.userId, user?.userId);

    // Mutations for profile updates
    const updateProfileMutation = useUpdateProfileMutation();
    const updatePrivacyMutation = useUpdatePrivacyMutation();

    // Global UI state
    const hasUnsavedChanges = useHasUnsavedChanges();

    if (!user) {
        return (
            <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
                <LiquidBackground />
                <GlassCard className="max-w-md w-full p-8 text-center mx-4">
                    <h1 className="text-2xl font-bold text-(--text-primary) mb-4">{t('profile.errors.access_required')}</h1>
                    <p className="text-(--text-secondary) mb-6">{t('profile.errors.login_required')}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-(--accent-primary) text-white px-6 py-2 rounded-lg hover:brightness-110 transition-colors"
                    >
                        {t('profile.errors.return_home')}
                    </button>
                </GlassCard>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen relative pt-24 md:pt-32 pb-8 px-4">
                <LiquidBackground />
                <ErrorDisplay
                    error={t('profile.errors.failed_load')}
                    onRetry={() => { refetchProfile(); refetchStats(); }}
                />
            </div>
        );
    }

    const handleUpdateProfile = async (data: UpdateProfileRequest) => {
        if (!user?.userId) return;
        try {
            await updateProfileMutation.mutateAsync({
                userId: user.userId,
                data,
                requesterId: user.userId
            });
            setActiveTab('overview');
        } catch (err) {
            logError('Failed to update profile', err);
        }
    };

    const handleUpdatePrivacy = async (settings: import('./types').PrivacySettings) => {
        if (!user?.userId) return;
        try {
            await updatePrivacyMutation.mutateAsync({
                userId: user.userId,
                settings,
                requesterId: user.userId
            });
        } catch (err) {
            logError('Failed to update privacy settings', err);
        }
    };

    const tabs = [
        { id: 'overview' as TabType, label: t('profile.tabs.overview'), icon: '👤' },
        { id: 'edit' as TabType, label: t('profile.tabs.edit'), icon: '✏️' },
        { id: 'privacy' as TabType, label: t('profile.tabs.privacy'), icon: '🔒' },
        { id: 'activity' as TabType, label: t('profile.tabs.activity'), icon: '📊' },
    ];

    return (
        <div className="min-h-screen relative pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 overflow-x-hidden">
            <LiquidBackground />

            {/* Global Notifications */}
            <NotificationCenter />

            <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

                {/* Compact Header & Tabs Layout */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                    {/* Header Title */}
                    <div className="text-center md:text-left flex items-center justify-center md:justify-start gap-4">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-(--text-primary) drop-shadow-sm">
                            {t('profile.title')}
                        </h1>
                        {hasUnsavedChanges && (
                            <span className="text-[10px] sm:text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                                {t('profile.form.unsaved')}
                            </span>
                        )}
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex justify-center">
                        <GlassCard className="p-1 sm:p-1.5 inline-flex overflow-x-auto max-w-full no-scrollbar">
                            <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-300 flex items-center whitespace-nowrap
                                            ${activeTab === tab.id
                                                ? 'bg-(--accent-primary) text-white shadow-lg'
                                                : 'text-(--text-secondary) hover:bg-(--bg-surface-translucent) hover:text-(--text-primary)'
                                            }
                                        `}
                                    >
                                        <span className="mr-1.5 sm:mr-2 text-sm sm:text-base">{tab.icon}</span>
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </GlassCard>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="transition-all duration-500 ease-in-out">
                    {/* Loading State */}
                    {isLoading && (
                        <GlassCard className="p-8 sm:p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-(--accent-primary) mx-auto mb-4"></div>
                            <p className="text-sm sm:text-base text-(--text-secondary)">{t('common.loading')}</p>
                        </GlassCard>
                    )}

                    {!isLoading && activeTab === 'overview' && profile && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
                            {/* Left Column - Profile Card */}
                            <div className="lg:col-span-1">
                                <ProfileCard
                                    profile={profile}
                                    stats={stats}
                                    onEditClick={() => setActiveTab('edit')}
                                    isOwnProfile={true}
                                />
                            </div>

                            {/* Right Column - Brief Stats/Activity or Badges */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                <GlassCard className="p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-bold text-(--text-primary) mb-3 sm:mb-4">{t('profile.card.stats')}</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-(--bg-surface-translucent)">
                                            <div className="text-lg sm:text-xl font-bold text-(--accent-primary)">{stats?.gamesPlayed || 0}</div>
                                            <div className="text-[10px] text-(--text-secondary) uppercase tracking-wider mt-1">{t('profile.card.games')}</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-(--bg-surface-translucent)">
                                            <div className="text-lg sm:text-xl font-bold text-(--accent-success)">{stats?.wins || 0}</div>
                                            <div className="text-[10px] text-(--text-secondary) uppercase tracking-wider mt-1">{t('game.you_win')}</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-(--bg-surface-translucent)">
                                            <div className="text-lg sm:text-xl font-bold text-(--accent-warning)">{stats?.rank || 'Bronze'}</div>
                                            <div className="text-[10px] text-(--text-secondary) uppercase tracking-wider mt-1">{t('admin.action')}</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-(--bg-surface-translucent)">
                                            <div className="text-lg sm:text-xl font-bold text-(--accent-info)">{stats?.level || 1}</div>
                                            <div className="text-[10px] text-(--text-secondary) uppercase tracking-wider mt-1">Level</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-bold text-(--text-primary) mb-3 sm:mb-4">{t('profile.card.bio')}</h3>
                                    <p className="text-(--text-secondary) leading-relaxed text-xs sm:text-sm">
                                        {profile.bio || t('profile.form.bio_placeholder')}
                                    </p>
                                </GlassCard>
                            </div>
                        </div>
                    )}

                    {!isLoading && activeTab === 'edit' && profile && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in-up">
                            <div className="lg:col-span-1">
                                <div className="space-y-4 sm:space-y-6">
                                    <GlassCard className="p-4 sm:p-6 text-center">
                                        <h3 className="text-sm sm:text-base font-bold text-(--text-primary) mb-4">{t('profile.avatar.title')}</h3>
                                        <AvatarUploadWithCropping
                                            userId={profile.userId}
                                            currentAvatarUrl={profile.avatarUrl}
                                            onUploadComplete={() => refetchProfile()}
                                        />
                                        <p className="text-[10px] text-(--text-secondary) mt-4">
                                            {t('profile.avatar.upload')}
                                        </p>
                                    </GlassCard>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <ProfileForm
                                    profile={profile}
                                    onSubmit={handleUpdateProfile}
                                    onCancel={() => setActiveTab('overview')}
                                    isLoading={updateProfileMutation.isPending}
                                />
                            </div>
                        </div>
                    )}

                    {!isLoading && activeTab === 'privacy' && profile && (
                        <div className="max-w-4xl mx-auto animate-fade-in-up">
                            <PrivacySettings
                                settings={profile.privacySettings || {
                                    profileVisibility: 'public',
                                    showBio: true,
                                    showStats: true,
                                    showAchievements: true,
                                    showLastActive: true
                                }}
                                onUpdate={handleUpdatePrivacy}
                            />
                        </div>
                    )}

                    {!isLoading && activeTab === 'activity' && (
                        <GlassCard className="max-w-4xl mx-auto p-8 sm:p-12 text-center animate-fade-in-up">
                            <div className="text-4xl sm:text-5xl mb-4">🚧</div>
                            <h2 className="text-lg sm:text-xl font-bold text-(--text-primary) mb-2">{t('profile.errors.coming_soon')}</h2>
                            <p className="text-xs sm:text-base text-(--text-secondary)">
                                {t('profile.errors.activity_soon')}
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};
