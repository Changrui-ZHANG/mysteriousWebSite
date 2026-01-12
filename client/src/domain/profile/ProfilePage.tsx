import React, { useState } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useProfile } from './hooks/useProfile';
import { useActivityStats } from './hooks/useActivityStats';
import { ProfileCard } from './components/ProfileCard';
import { ProfileForm } from './components/ProfileForm';
import { AvatarUpload } from './components/AvatarUpload';
import { PrivacySettings } from './components/PrivacySettings';
import { ErrorDisplay } from '../../shared/components';
import type { UpdateProfileRequest } from './types';

type TabType = 'overview' | 'edit' | 'privacy' | 'activity';

/**
 * ProfilePage - Main profile management page
 * Provides tabbed interface for profile management
 */
export const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    
    const {
        profile,
        isLoading,
        error,
        updateProfile,
        updatePrivacySettings,
        refreshProfile,
        hasProfile,
        canRetry,
        retryLoad
    } = useProfile({ 
        userId: user?.userId,
        viewerId: user?.userId 
    });

    const {
        stats,
        achievements,
        isLoading: statsLoading,
        refreshStats,
        canRetry: canRetryStats,
        retryLoad: retryStatsLoad
    } = useActivityStats({ 
        userId: user?.userId || '',
        autoRefresh: true 
    });

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Access Required</h1>
                    <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const handleProfileUpdate = async (data: UpdateProfileRequest) => {
        await updateProfile(data);
        await refreshProfile();
        await refreshStats();
        setActiveTab('overview');
    };

    const handleAvatarUpload = async (avatarUrl: string) => {
        await updateProfile({ avatarUrl });
        await refreshProfile();
    };

    const tabs = [
        { id: 'overview' as TabType, label: 'Overview', icon: '👤' },
        { id: 'edit' as TabType, label: 'Edit Profile', icon: '✏️' },
        { id: 'privacy' as TabType, label: 'Privacy', icon: '🔒' },
        { id: 'activity' as TabType, label: 'Activity', icon: '📊' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">Manage your profile information and privacy settings</p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <span className="mr-2">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-lg shadow-sm">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="p-8">
                            <ErrorDisplay
                                error={error}
                                onRetry={refreshProfile}
                                onRetryWithBackoff={canRetry ? retryLoad : undefined}
                                canRetry={canRetry}
                                showDetails={true}
                            />
                        </div>
                    )}

                    {/* Profile Content */}
                    {!isLoading && !error && (
                        <>
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="p-6">
                                    {hasProfile && profile ? (
                                        <ProfileCard
                                            profile={profile}
                                            isOwnProfile={true}
                                            onEdit={() => setActiveTab('edit')}
                                            className="max-w-2xl mx-auto"
                                        />
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="text-gray-400 mb-4">
                                                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Yet</h3>
                                            <p className="text-gray-600 mb-4">Create your profile to get started</p>
                                            <button
                                                onClick={() => setActiveTab('edit')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Create Profile
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit Tab */}
                            {activeTab === 'edit' && (
                                <div className="p-6">
                                    <div className="max-w-2xl mx-auto space-y-8">
                                        {/* Avatar Upload */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                                            <AvatarUpload
                                                userId={user.userId}
                                                currentAvatarUrl={profile?.avatarUrl}
                                                onUploadComplete={handleAvatarUpload}
                                            />
                                        </div>

                                        {/* Profile Form */}
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                                            <ProfileForm
                                                profile={profile || undefined}
                                                onSubmit={handleProfileUpdate}
                                                onCancel={() => setActiveTab('overview')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy Tab */}
                            {activeTab === 'privacy' && (
                                <div className="p-6">
                                    <div className="max-w-2xl mx-auto">
                                        {profile ? (
                                            <PrivacySettings
                                                settings={profile.privacySettings}
                                                onUpdate={updatePrivacySettings}
                                            />
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-gray-600">Create a profile first to manage privacy settings</p>
                                                <button
                                                    onClick={() => setActiveTab('edit')}
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                >
                                                    Create Profile
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Activity Tab */}
                            {activeTab === 'activity' && (
                                <div className="p-6">
                                    <div className="max-w-4xl mx-auto">
                                        {statsLoading ? (
                                            <div className="text-center py-12">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                                <p className="text-gray-600">Loading activity stats...</p>
                                            </div>
                                        ) : stats ? (
                                            <div className="space-y-8">
                                                {/* Stats Overview */}
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Statistics</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                                                            <div className="text-sm text-blue-800">Messages Sent</div>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-green-600">{stats.totalGamesPlayed}</div>
                                                            <div className="text-sm text-green-800">Games Played</div>
                                                        </div>
                                                        <div className="bg-purple-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
                                                            <div className="text-sm text-purple-800">Current Streak</div>
                                                        </div>
                                                        <div className="bg-orange-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-orange-600">{Math.round(stats.timeSpent / 60)}h</div>
                                                            <div className="text-sm text-orange-800">Time Spent</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Achievements */}
                                                {achievements.length > 0 && (
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                                            Achievements ({achievements.length})
                                                        </h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {achievements.map((achievement) => (
                                                                <div
                                                                    key={achievement.id}
                                                                    className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"
                                                                >
                                                                    <div className="flex items-center space-x-3">
                                                                        {achievement.iconUrl && (
                                                                            <img
                                                                                src={achievement.iconUrl}
                                                                                alt=""
                                                                                className="w-8 h-8"
                                                                            />
                                                                        )}
                                                                        <div>
                                                                            <div className="font-medium text-yellow-800">
                                                                                {achievement.name}
                                                                            </div>
                                                                            <div className="text-sm text-yellow-600">
                                                                                {achievement.description}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <ErrorDisplay
                                                    error="No activity data available"
                                                    onRetry={canRetryStats ? retryStatsLoad : undefined}
                                                    canRetry={canRetryStats}
                                                    className="max-w-md mx-auto"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};