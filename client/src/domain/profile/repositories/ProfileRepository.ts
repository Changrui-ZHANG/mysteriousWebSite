import { BaseService } from '../../../shared/services/BaseService';
import { fetchJson, postJson, putJson, deleteJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { transformBackendProfile, transformBackendProfiles } from '../utils/ProfileTransformer';
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
    async findByUserId(userId: string, requesterId?: string): Promise<UserProfile> {
        try {
            const url = requesterId 
                ? `${API_ENDPOINTS.PROFILES.GET(userId)}?requesterId=${encodeURIComponent(requesterId)}`
                : API_ENDPOINTS.PROFILES.GET(userId);
            
            const backendProfile = await fetchJson<any>(url);
            return transformBackendProfile(backendProfile);
        } catch (error) {
            console.error('ProfileRepository: Error fetching profile', { userId, requesterId, error });
            
            // Si c'est une erreur 403 et que l'utilisateur essaie de voir son propre profil
            if (error instanceof Error && error.message.includes('403') && userId === requesterId) {
                console.warn('ProfileRepository: 403 error for own profile, this might be an auth configuration issue');
            }
            
            throw error;
        }
    }

    /**
     * Create a new profile
     */
    async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
        const backendProfile = await postJson<any>(API_ENDPOINTS.PROFILES.CREATE, data);
        return transformBackendProfile(backendProfile);
    }

    /**
     * Update an existing profile
     */
    async updateProfile(userId: string, data: UpdateProfileRequest, requesterId: string): Promise<UserProfile> {
        const url = `${API_ENDPOINTS.PROFILES.UPDATE(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
        const backendProfile = await putJson<any>(url, data);
        return transformBackendProfile(backendProfile);
    }

    /**
     * Search profiles by display name
     */
    async searchByDisplayName(query: string, requesterId?: string): Promise<UserProfile[]> {
        const params = new URLSearchParams({ q: query });
        if (requesterId) {
            params.append('requesterId', requesterId);
        }
        const backendProfiles = await fetchJson<any[]>(`${API_ENDPOINTS.PROFILES.SEARCH}?${params.toString()}`);
        return transformBackendProfiles(backendProfiles);
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
    async getPublicProfiles(limit?: number, requesterId?: string): Promise<UserProfile[]> {
        const params = new URLSearchParams();
        if (limit) {
            params.append('limit', limit.toString());
        }
        if (requesterId) {
            params.append('requesterId', requesterId);
        }
        
        const url = params.toString() ? `${API_ENDPOINTS.PROFILES.DIRECTORY}?${params.toString()}` : API_ENDPOINTS.PROFILES.DIRECTORY;
        const backendProfiles = await fetchJson<any[]>(url);
        return transformBackendProfiles(backendProfiles);
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
        const backendProfiles = await fetchJson<any[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${searchParams.toString()}`);
        const profiles = transformBackendProfiles(backendProfiles);
        
        return {
            profiles,
            total: profiles.length,
            hasMore: profiles.length === filters.limit
        };
    }

    /**
     * Update privacy settings for a profile
     */
    async updatePrivacySettings(userId: string, settings: PrivacySettings, requesterId: string): Promise<void> {
        const url = `${API_ENDPOINTS.PROFILES.PRIVACY(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
        return putJson<void>(url, settings);
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
        
        const backendProfiles = await fetchJson<any[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${params.toString()}`);
        return transformBackendProfiles(backendProfiles);
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
        
        const backendProfiles = await fetchJson<any[]>(`${API_ENDPOINTS.PROFILES.DIRECTORY}?${params.toString()}`);
        return transformBackendProfiles(backendProfiles);
    }

    /**
     * Delete a user profile
     */
    async deleteProfile(userId: string, requesterId: string): Promise<void> {
        const url = `${API_ENDPOINTS.PROFILES.DELETE(userId)}?requesterId=${encodeURIComponent(requesterId)}`;
        return deleteJson<void>(url);
    }

    /**
     * Update last active timestamp
     */
    async updateLastActive(userId: string): Promise<void> {
        return postJson<void>(API_ENDPOINTS.PROFILES.UPDATE_LAST_ACTIVE(userId), {});
    }

    /**
     * Get basic profile info (display name and avatar)
     */
    async getBasicProfileInfo(userId: string): Promise<{ displayName: string; avatarUrl: string | null }> {
        return fetchJson<{ displayName: string; avatarUrl: string | null }>(API_ENDPOINTS.PROFILES.BASIC_INFO(userId));
    }
}