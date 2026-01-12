import { BaseService } from '../../../shared/services/BaseService';
import { fetchJson, postJson, putJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import type { 
    UserProfile, 
    CreateProfileRequest, 
    UpdateProfileRequest, 
    PrivacySettings,
    ProfileSearchQuery,
    ProfileSearchResult,
    ProfileDirectoryFilters
} from '../types';

/**
 * Repository for profile data access
 * Implements the Repository pattern for clean separation of data access logic
 */
export class ProfileRepository extends BaseService<UserProfile, CreateProfileRequest, UpdateProfileRequest> {
    constructor() {
        super(API_ENDPOINTS.PROFILES.LIST);
    }

    /**
     * Find profile by user ID
     */
    async findByUserId(userId: string): Promise<UserProfile> {
        return fetchJson<UserProfile>(API_ENDPOINTS.PROFILES.GET(userId));
    }

    /**
     * Create a new profile
     */
    async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
        return postJson<UserProfile>(API_ENDPOINTS.PROFILES.CREATE, data);
    }

    /**
     * Update an existing profile
     */
    async updateProfile(userId: string, data: UpdateProfileRequest): Promise<UserProfile> {
        return putJson<UserProfile>(API_ENDPOINTS.PROFILES.UPDATE(userId), data);
    }

    /**
     * Search profiles by display name
     */
    async searchByDisplayName(query: string): Promise<UserProfile[]> {
        const searchParams = new URLSearchParams({ q: query });
        return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.SEARCH}?${searchParams.toString()}`);
    }

    /**
     * Search profiles with advanced query options
     */
    async searchProfiles(query: ProfileSearchQuery): Promise<ProfileSearchResult> {
        const params: Record<string, string> = {};
        
        if (query.query) params.q = query.query;
        if (query.limit) params.limit = query.limit.toString();
        if (query.offset) params.offset = query.offset.toString();
        if (query.includePrivate) params.includePrivate = query.includePrivate.toString();

        const searchParams = new URLSearchParams(params);
        return fetchJson<ProfileSearchResult>(`${API_ENDPOINTS.PROFILES.SEARCH}?${searchParams.toString()}`);
    }

    /**
     * Get public profiles for directory
     */
    async getPublicProfiles(limit?: number): Promise<UserProfile[]> {
        if (limit) {
            const searchParams = new URLSearchParams({ limit: limit.toString() });
            return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${searchParams.toString()}`);
        }
        
        return fetchJson<UserProfile[]>(API_ENDPOINTS.PROFILES.DIRECTORY);
    }

    /**
     * Get profiles with directory filters
     */
    async getProfileDirectory(filters: ProfileDirectoryFilters): Promise<ProfileSearchResult> {
        const params: Record<string, string> = {
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
            limit: filters.limit.toString(),
            offset: filters.offset.toString(),
        };

        if (filters.onlineOnly) {
            params.onlineOnly = filters.onlineOnly.toString();
        }

        const searchParams = new URLSearchParams(params);
        return fetchJson<ProfileSearchResult>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${searchParams.toString()}`);
    }

    /**
     * Update privacy settings for a profile
     */
    async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
        return putJson<void>(API_ENDPOINTS.PROFILES.PRIVACY(userId), settings);
    }

    /**
     * Get profiles that match privacy criteria (privacy-aware query)
     */
    async getVisibleProfiles(limit?: number): Promise<UserProfile[]> {
        if (limit) {
            const searchParams = new URLSearchParams({ limit: limit.toString() });
            return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${searchParams.toString()}`);
        }
        
        return fetchJson<UserProfile[]>(API_ENDPOINTS.PROFILES.DIRECTORY);
    }

    /**
     * Check if a profile is visible to a viewer based on privacy settings
     */
    async isProfileVisible(profileUserId: string): Promise<boolean> {
        try {
            await this.findByUserId(profileUserId);
            return true;
        } catch (error) {
            // If we get a 403 or 404, the profile is not visible
            return false;
        }
    }

    /**
     * Get profile statistics (for analytics)
     */
    async getProfileStats(): Promise<{
        totalProfiles: number;
        activeProfiles: number;
        publicProfiles: number;
        privateProfiles: number;
    }> {
        return fetchJson<{
            totalProfiles: number;
            activeProfiles: number;
            publicProfiles: number;
            privateProfiles: number;
        }>(`${API_ENDPOINTS.PROFILES.LIST}/stats`);
    }

    /**
     * Batch get profiles by user IDs
     */
    async getProfilesByIds(userIds: string[]): Promise<UserProfile[]> {
        const params = new URLSearchParams();
        userIds.forEach(id => params.append('userIds', id));
        
        return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.LIST}?${params.toString()}`);
    }

    /**
     * Get recently active profiles
     */
    async getRecentlyActiveProfiles(limit: number = 10): Promise<UserProfile[]> {
        const params = new URLSearchParams({
            sortBy: 'lastActive',
            sortOrder: 'desc',
            limit: limit.toString()
        });
        
        return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${params.toString()}`);
    }

    /**
     * Get profiles with most messages
     */
    async getMostActiveProfiles(limit: number = 10): Promise<UserProfile[]> {
        const params = new URLSearchParams({
            sortBy: 'totalMessages',
            sortOrder: 'desc',
            limit: limit.toString()
        });
        
        return fetchJson<UserProfile[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${params.toString()}`);
    }
}