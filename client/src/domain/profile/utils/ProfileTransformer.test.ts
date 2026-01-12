import { transformBackendProfile } from './ProfileTransformer';

// Test the transformer with real backend data
const testBackendResponse = {
    userId: "f0bf523e-fbe3-4c54-82d7-5871b6552e1c",
    displayName: "Changrui",
    bio: null,
    avatarUrl: null,
    joinDate: "2026-01-12T03:28:54.848403",
    lastActive: "2026-01-12T03:28:54.848403",
    isPublic: true,
    privacySettings: null,
    activityStats: {
        userId: "f0bf523e-fbe3-4c54-82d7-5871b6552e1c",
        totalMessages: 14,
        totalGamesPlayed: 6,
        bestScores: "{}",
        currentStreak: 0,
        longestStreak: 0,
        timeSpent: 0,
        lastUpdated: "2026-01-12T03:28:54.856506"
    }
};

// Transform and log the result
console.log('Backend Response:', testBackendResponse);
console.log('Transformed Profile:', transformBackendProfile(testBackendResponse));

// Test with null activity stats
const testWithNullStats = {
    ...testBackendResponse,
    activityStats: null
};

console.log('Transformed Profile (null stats):', transformBackendProfile(testWithNullStats));