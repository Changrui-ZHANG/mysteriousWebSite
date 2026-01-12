import React, { useState, useEffect } from 'react';
import { ProfileCard } from './ProfileCard';
import { ProfileRepository } from '../repositories/ProfileRepository';
import type { UserProfile } from '../types';

/**
 * Test component to verify API integration works
 */
export const ProfileApiTest: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadProfiles = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const repository = new ProfileRepository();
                const profileList = await repository.getPublicProfiles(3); // Get first 3 profiles
                
                setProfiles(profileList);
            } catch (err) {
                console.error('Failed to load profiles:', err);
                setError(err instanceof Error ? err.message : 'Failed to load profiles');
            } finally {
                setLoading(false);
            }
        };

        loadProfiles();
    }, []);

    if (loading) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Profile API Test</h2>
                <div className="text-center">Loading profiles...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Profile API Test</h2>
                <div className="text-red-600 bg-red-50 p-4 rounded">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Profile API Test</h2>
            <p className="text-gray-600 mb-4">
                Loaded {profiles.length} profiles from the backend API
            </p>
            
            <div className="grid gap-4">
                {profiles.map((profile) => (
                    <div key={profile.userId}>
                        <h3 className="text-lg font-semibold mb-2">
                            Profile: {profile.displayName}
                        </h3>
                        <ProfileCard 
                            profile={profile}
                            isOwnProfile={false}
                            className="max-w-md"
                        />
                    </div>
                ))}
            </div>
            
            {profiles.length === 0 && (
                <div className="text-gray-500 text-center py-8">
                    No profiles found
                </div>
            )}
        </div>
    );
};