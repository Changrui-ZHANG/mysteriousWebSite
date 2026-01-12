import React from 'react';
import { ProfileCard } from './ProfileCard';
import type { UserProfile } from '../types';

/**
 * Test component to verify ProfileCard works with real backend data
 */
export const ProfileCardTest: React.FC = () => {
    // Mock profile data that matches the backend structure
    const mockProfile: UserProfile = {
        userId: 'f0bf523e-fbe3-4c54-82d7-5871b6552e1c',
        displayName: 'Changrui',
        bio: 'Test user profile',
        avatarUrl: undefined,
        joinDate: new Date('2026-01-12T03:28:54.848403'),
        lastActive: new Date('2026-01-12T03:28:54.848403'),
        isPublic: true,
        privacySettings: {
            profileVisibility: 'public',
            showBio: true,
            showStats: true,
            showAchievements: true,
            showLastActive: true
        },
        activityStats: {
            totalMessages: 14,
            totalGamesPlayed: 6,
            bestScores: {},
            currentStreak: 0,
            longestStreak: 0,
            timeSpent: 0
        },
        achievements: []
    };

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold">Profile Card Test</h2>
            
            <div className="grid gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Own Profile View</h3>
                    <ProfileCard 
                        profile={mockProfile}
                        isOwnProfile={true}
                        onEdit={() => console.log('Edit clicked')}
                        className="max-w-md"
                    />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Public Profile View</h3>
                    <ProfileCard 
                        profile={mockProfile}
                        isOwnProfile={false}
                        onViewProfile={() => console.log('View clicked')}
                        className="max-w-md"
                    />
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Profile with Null Data</h3>
                    <ProfileCard 
                        profile={{
                            ...mockProfile,
                            bio: undefined,
                            privacySettings: undefined,
                            activityStats: undefined,
                            achievements: undefined
                        }}
                        isOwnProfile={false}
                        className="max-w-md"
                    />
                </div>
            </div>
        </div>
    );
};