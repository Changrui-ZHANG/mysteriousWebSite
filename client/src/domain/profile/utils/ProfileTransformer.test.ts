import { describe, it, expect } from 'vitest';
import { transformBackendProfile } from './ProfileTransformer';

describe('ProfileTransformer', () => {
    const testBackendResponse = {
        userId: "f0bf523e-fbe3-4c54-82d7-5871b6552e1c",
        displayName: "Changrui",
        bio: undefined as string | undefined,
        avatarUrl: undefined as string | undefined,
        joinDate: "2026-01-12T03:28:54.848403",
        lastActive: "2026-01-12T03:28:54.848403",
        isPublic: true,
        privacySettings: undefined,
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

    it('should transform backend profile response correctly', () => {
        const result = transformBackendProfile(testBackendResponse);
        
        expect(result.userId).toBe(testBackendResponse.userId);
        expect(result.displayName).toBe(testBackendResponse.displayName);
        expect(result.bio).toBe(testBackendResponse.bio);
        expect(result.avatarUrl).toBe(testBackendResponse.avatarUrl);
        expect(result.isPublic).toBe(testBackendResponse.isPublic);
        
        // Check date transformation
        expect(result.joinDate).toBeInstanceOf(Date);
        expect(result.lastActive).toBeInstanceOf(Date);
        
        // Check activity stats transformation
        expect(result.activityStats).toBeDefined();
        expect(result.activityStats?.totalMessages).toBe(14);
        expect(result.activityStats?.totalGamesPlayed).toBe(6);
        expect(result.activityStats?.bestScores).toEqual({});
        
        // Check achievements array is initialized
        expect(result.achievements).toEqual([]);
    });

    it('should handle null activity stats', () => {
        const testWithNullStats = {
            ...testBackendResponse,
            activityStats: undefined
        };

        const result = transformBackendProfile(testWithNullStats);
        
        expect(result.activityStats).toBeUndefined();
        expect(result.achievements).toEqual([]);
    });

    it('should parse bestScores JSON correctly', () => {
        const testWithScores = {
            ...testBackendResponse,
            activityStats: {
                ...testBackendResponse.activityStats,
                bestScores: '{"game1": 100, "game2": 200}'
            }
        };

        const result = transformBackendProfile(testWithScores);
        
        expect(result.activityStats?.bestScores).toEqual({
            game1: 100,
            game2: 200
        });
    });
});