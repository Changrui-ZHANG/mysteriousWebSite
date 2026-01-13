import { ProfileRepository } from '../repositories/ProfileRepository';
import { 
    validateCreateProfile, 
    validateUpdateProfile, 
    validatePrivacySettings,
    validateProfileSearchQuery,
    validateProfileDirectoryFilters
} from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
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
 * Service for profile business logic
 * Handles validation, orchestration, and business rules
 * Uses ProfileRepository for data access
 */
export class ProfileService {
    private repository: ProfileRepository;

    constructor() {
        this.repository = new ProfileRepository();
    }

    /**
     * Create a new profile with validation and business logic
     */
    async createProfile(data: CreateProfileRequest): Promise<UserProfile> {
        // Validate input data
        const validation = validateCreateProfile(data);
        if (!validation.success) {
            throw new AppError(
                'Invalid profile data',
                ERROR_CODES.VALIDATION_ERROR,
                'Les données du profil sont invalides',
                validation.error
            );
        }

        // Business logic: Sanitize and set defaults
        const sanitizedData: CreateProfileRequest = {
            displayName: data.displayName.trim(),
            bio: data.bio?.trim() || undefined,
            privacySettings: {
                profileVisibility: 'public',
                showBio: true,
                showStats: true,
                showAchievements: true,
                showLastActive: true,
                ...data.privacySettings
            }
        };

        // Check for duplicate display names (business rule)
        await this.validateUniqueDisplayName(sanitizedData.displayName);

        return this.repository.createProfile(sanitizedData);
    }

    /**
     * Update an existing profile with validation
     */
    async updateProfile(userId: string, data: UpdateProfileRequest, requesterId: string): Promise<UserProfile> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        if (!requesterId) {
            throw new AppError(
                'Requester ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID du demandeur requis'
            );
        }

        // Validate input data
        const validation = validateUpdateProfile(data);
        if (!validation.success) {
            throw new AppError(
                'Invalid profile update data',
                ERROR_CODES.VALIDATION_ERROR,
                'Données de mise à jour du profil invalides',
                validation.error
            );
        }

        // Business logic: Sanitize data
        const sanitizedData: UpdateProfileRequest = {
            ...data,
            displayName: data.displayName?.trim(),
            bio: data.bio?.trim()
        };

        // Check for duplicate display names if changing display name
        if (sanitizedData.displayName) {
            await this.validateUniqueDisplayName(sanitizedData.displayName, userId);
        }

        return this.repository.updateProfile(userId, sanitizedData, requesterId);
    }

    /**
     * Get a profile by user ID with privacy enforcement
     */
    async getProfile(userId: string, viewerId?: string): Promise<UserProfile> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        // Use userId as viewerId if not provided (user viewing their own profile)
        const effectiveViewerId = viewerId || userId;

        const profile = await this.repository.findByUserId(userId, effectiveViewerId);
        
        // Business logic: Apply privacy filtering
        return this.applyPrivacyFiltering(profile, effectiveViewerId);
    }

    /**
     * Search profiles with business logic and privacy filtering
     */
    async searchProfiles(query: ProfileSearchQuery, viewerId?: string): Promise<ProfileSearchResult> {
        // Validate search query
        const validation = validateProfileSearchQuery(query);
        if (!validation.success) {
            throw new AppError(
                'Invalid search query',
                ERROR_CODES.VALIDATION_ERROR,
                'Requête de recherche invalide',
                validation.error
            );
        }

        // Business logic: Sanitize and apply limits
        const sanitizedQuery: ProfileSearchQuery = {
            ...query,
            query: query.query?.trim(),
            limit: Math.min(query.limit || 20, 50), // Max 50 results
            offset: Math.max(query.offset || 0, 0),
            includePrivate: false // Always false for non-admin users
        };

        const result = await this.repository.searchProfiles(sanitizedQuery);

        // Apply privacy filtering to results
        const filteredProfiles = result.profiles.map(profile => 
            this.applyPrivacyFiltering(profile, viewerId)
        );

        return {
            ...result,
            profiles: filteredProfiles
        };
    }

    /**
     * Get profile directory with filters and privacy enforcement
     */
    async getProfileDirectory(filters: ProfileDirectoryFilters, viewerId?: string): Promise<ProfileSearchResult> {
        // Validate filters
        const validation = validateProfileDirectoryFilters(filters);
        if (!validation.success) {
            throw new AppError(
                'Invalid directory filters',
                ERROR_CODES.VALIDATION_ERROR,
                'Filtres de répertoire invalides',
                validation.error
            );
        }

        // Business logic: Apply limits and defaults
        const sanitizedFilters: ProfileDirectoryFilters = {
            ...filters,
            limit: Math.min(filters.limit, 100), // Max 100 results
            offset: Math.max(filters.offset, 0)
        };

        const result = await this.repository.getProfileDirectory(sanitizedFilters);

        // Apply privacy filtering
        const filteredProfiles = result.profiles.map(profile => 
            this.applyPrivacyFiltering(profile, viewerId)
        );

        return {
            ...result,
            profiles: filteredProfiles
        };
    }

    /**
     * Update privacy settings with validation
     */
    async updatePrivacySettings(userId: string, settings: PrivacySettings, requesterId: string): Promise<void> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        if (!requesterId) {
            throw new AppError(
                'Requester ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID du demandeur requis'
            );
        }

        // Validate privacy settings
        const validation = validatePrivacySettings(settings);
        if (!validation.success) {
            throw new AppError(
                'Invalid privacy settings',
                ERROR_CODES.VALIDATION_ERROR,
                'Paramètres de confidentialité invalides',
                validation.error
            );
        }

        return this.repository.updatePrivacySettings(userId, settings, requesterId);
    }

    /**
     * Delete a profile (soft delete with privacy considerations)
     */
    async deleteProfile(userId: string): Promise<void> {
        if (!userId) {
            throw new AppError(
                'User ID is required',
                ERROR_CODES.INVALID_INPUT,
                'ID utilisateur requis'
            );
        }

        // Business logic: Could implement soft delete here
        // For now, delegate to repository
        return this.repository.delete(userId);
    }

    /**
     * Get recently active profiles
     */
    async getRecentlyActiveProfiles(limit: number = 10, viewerId?: string): Promise<UserProfile[]> {
        const profiles = await this.repository.getRecentlyActiveProfiles(Math.min(limit, 50));
        
        // Apply privacy filtering
        return profiles.map(profile => this.applyPrivacyFiltering(profile, viewerId));
    }

    /**
     * Get most active profiles (by message count)
     */
    async getMostActiveProfiles(limit: number = 10, viewerId?: string): Promise<UserProfile[]> {
        const profiles = await this.repository.getMostActiveProfiles(Math.min(limit, 50));
        
        // Apply privacy filtering
        return profiles.map(profile => this.applyPrivacyFiltering(profile, viewerId));
    }

    /**
     * Check if a profile exists and is accessible
     */
    async isProfileAccessible(userId: string, viewerId?: string): Promise<boolean> {
        try {
            const profile = await this.repository.findByUserId(userId);
            
            // Business logic: Check privacy settings
            const privacySettings = profile.privacySettings;
            if (privacySettings?.profileVisibility === 'private' && userId !== viewerId) {
                return false;
            }
            
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get profile statistics (admin only)
     */
    async getProfileStats(): Promise<{
        totalProfiles: number;
        activeProfiles: number;
        publicProfiles: number;
        privateProfiles: number;
    }> {
        return this.repository.getProfileStats();
    }

    // Private helper methods

    /**
     * Validate that display name is unique
     */
    private async validateUniqueDisplayName(displayName: string, excludeUserId?: string): Promise<void> {
        try {
            const existingProfiles = await this.repository.searchByDisplayName(displayName);
            const duplicates = excludeUserId 
                ? existingProfiles.filter(p => p.userId !== excludeUserId)
                : existingProfiles;
                
            if (duplicates.length > 0) {
                throw new AppError(
                    'Display name already exists',
                    ERROR_CODES.RESOURCE_CONFLICT,
                    'Ce nom d\'affichage existe déjà'
                );
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            // If search fails, allow the operation to continue
            // The backend will handle uniqueness constraints
        }
    }

    /**
     * Apply privacy filtering to a profile based on viewer permissions
     */
    private applyPrivacyFiltering(profile: UserProfile, viewerId?: string): UserProfile {
        // If viewing own profile, return full profile
        if (profile.userId === viewerId) {
            return profile;
        }

        // Get privacy settings with defaults
        const privacySettings = profile.privacySettings || {
            profileVisibility: 'public' as const,
            showBio: true,
            showStats: true,
            showAchievements: true,
            showLastActive: true
        };
        
        // If profile is private, return minimal info
        if (privacySettings.profileVisibility === 'private') {
            return {
                ...profile,
                bio: undefined,
                activityStats: profile.activityStats ? {
                    totalMessages: 0,
                    totalGamesPlayed: 0,
                    bestScores: {},
                    currentStreak: 0,
                    longestStreak: 0,
                    timeSpent: 0
                } : undefined,
                achievements: [],
                lastActive: new Date(0) // Epoch time to indicate hidden
            };
        }

        // Apply granular privacy settings
        const filteredProfile: UserProfile = {
            ...profile,
            bio: privacySettings.showBio ? profile.bio : undefined,
            activityStats: privacySettings.showStats ? profile.activityStats : undefined,
            achievements: privacySettings.showAchievements ? (profile.achievements || []) : [],
            lastActive: privacySettings.showLastActive ? profile.lastActive : new Date(0)
        };

        return filteredProfile;
    }
}