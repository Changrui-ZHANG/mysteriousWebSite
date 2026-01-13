import React, { useState } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useProfileWithStats, useUpdateProfileMutation, useUpdatePrivacyMutation } from './queries/profileQueries';
import { ProfileCard } from './components/ProfileCard';
import { ProfileForm } from './components/ProfileForm';
import { AvatarUploadWithCropping } from './components/AvatarUploadWithCropping';
import { PrivacySettings } from './components/PrivacySettings';
import { NotificationCenter } from './components/NotificationCenter';
import { ErrorDisplay } from '../../shared/components';
import { GlassCard, LiquidBackground } from '../../shared/components/GlassCard';
import { useHasUnsavedChanges } from './stores/uiStore';
import type { UpdateProfileRequest } from './types';

type TabType = 'overview' | 'edit' | 'privacy' | 'activity';

/**
 * ProfilePage - Main profile management page
 * Provides tabbed interface for profile management
 */
export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // TanStack Query hooks for profile and stats
    const {
        profile,
        stats,
        isLoading,
        error,
        refetchProfile,
        refetchStats,
        hasProfile
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">Profile Access Required</h1>
                    <p className="text-[var(--text-secondary)] mb-6">Please log in to view your profile.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-lg hover:brightness-110 transition-colors"
                    >
                        Return to Home
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
                    message="Failed to load profile data"
                    onRetry={() => { refetchProfile(); refetchStats(); }}
                />
            </div>
        );
    }

    const handleUpdateProfile = async (data: UpdateProfileRequest) => {
        try {
            await updateProfileMutation.mutateAsync(data);
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    const handleUpdatePrivacy = async (key: string, value: boolean) => {
        try {
            await updatePrivacyMutation.mutateAsync({ [key]: value });
        } catch (err) {
            console.error('Failed to update privacy settings:', err);
        }
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: '👤' },
        { id: 'edit' as TabType, label: 'Edit', icon: '✏️' },
        { id: 'privacy' as TabType, label: 'Privacy', icon: '🔒' },
        { id: 'activity' as TabType, label: 'Activity', icon: '📊' },
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
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[var(--text-primary)] drop-shadow-sm">
                            My Profile
                        </h1>
                        {hasUnsavedChanges && (
                            <span className="text-[10px] sm:text-xs text-amber-600 bg-amber-50/80 backdrop-blur-sm border border-amber-200 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                                Unsaved
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
                                                ? 'bg-[var(--accent-primary)] text-white shadow-lg'
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-translucent)] hover:text-[var(--text-primary)]'
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
                            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
                            <p className="text-sm sm:text-base text-[var(--text-secondary)]">Loading profile...</p>
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
                                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 sm:mb-4">Quick Stats</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-[var(--bg-surface-translucent)]">
                                            <div className="text-lg sm:text-xl font-bold text-[var(--accent-primary)]">{stats?.gamesPlayed || 0}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Games</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-[var(--bg-surface-translucent)]">
                                            <div className="text-lg sm:text-xl font-bold text-[var(--accent-success)]">{stats?.wins || 0}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Wins</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-[var(--bg-surface-translucent)]">
                                            <div className="text-lg sm:text-xl font-bold text-[var(--accent-warning)]">{stats?.rank || 'Bronze'}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Rank</div>
                                        </div>
                                        <div className="text-center p-2 sm:p-3 rounded-xl bg-[var(--bg-surface-translucent)]">
                                            <div className="text-lg sm:text-xl font-bold text-[var(--accent-info)]">{stats?.level || 1}</div>
                                            <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Level</div>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-3 sm:mb-4">About Me</h3>
                                    <p className="text-[var(--text-secondary)] leading-relaxed text-xs sm:text-sm">
                                        {profile.bio || "No bio yet. Click 'Edit' to add one!"}
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
                                        <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] mb-4">Avatar</h3>
                                        <AvatarUploadWithCropping
                                            userId={profile.userId}
                                            currentAvatarUrl={profile.avatarUrl}
                                            onUploadComplete={() => refetchProfile()}
                                        />
                                        <p className="text-[10px] text-[var(--text-secondary)] mt-4">
                                            Click to upload. Crop supported.
                                        </p>
                                    </GlassCard>
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <ProfileForm
                                    profile={profile}
                                    onSubmit={handleUpdateProfile}
                                    isLoading={updateProfileMutation.isPending}
                                />
                            </div>
                        </div>
                    )}

                    {!isLoading && activeTab === 'privacy' && (
                        <div className="max-w-4xl mx-auto animate-fade-in-up">
                            <PrivacySettings
                                settings={profile?.preferences?.privacy || {}}
                                onUpdate={handleUpdatePrivacy}
                            />
                        </div>
                    )}

                    {!isLoading && activeTab === 'activity' && (
                        <GlassCard className="max-w-4xl mx-auto p-8 sm:p-12 text-center animate-fade-in-up">
                            <div className="text-4xl sm:text-5xl mb-4">🚧</div>
                            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] mb-2">Coming Soon</h2>
                            <p className="text-xs sm:text-base text-[var(--text-secondary)]">
                                Detailed activity history will be available here soon.
                            </p>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};
