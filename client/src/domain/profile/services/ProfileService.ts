import { ProfileRepository } from '../repositories/ProfileRepository';
import {
    validateCreateProfile,
    validateUpdateProfile,
    validatePrivacySettings,
    validateProfileSearchQuery,
    validateProfileDirectoryFilters
} from '../schemas/profileSchemas';
import { AppError, ERROR_CODES } from '../../../shared/utils/errorHandling';
import { requireUserId } from '../utils/validation';
import {
    applyPrivacyFiltering,
    isProfileAccessible as checkProfileAccessibility
} from '../utils/privacyFiltering';
import {
    sanitizeCreateProfileData,
    sanitizeUpdateProfileData,
    sanitizeSearchQuery,
    sanitizeDirectoryFilters,
    applyResultLimit
} from '../utils/dataSanitization';
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
        const sanitizedData = sanitizeCreateProfileData(data);

        // Check for duplicate display names (business rule)
        await this.validateUniqueDisplayName(sanitizedData.displayName);

        return this.repository.createProfile(sanitizedData);
    }

    /**
     * Update an existing profile with validation
     */
    async updateProfile(userId: string, data: UpdateProfileRequest, requesterId: string): Promise<UserProfile> {
        // Use centralized validation
        requireUserId(userId);
        requireUserId(requesterId);

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
        const sanitizedData = sanitizeUpdateProfileData(data);

        return this.repository.updateProfile(userId, sanitizedData, requesterId);
    }

    /**
     * Get a profile by user ID with privacy enforcement
     */
    async getProfile(userId: string, viewerId?: string): Promise<UserProfile> {
        // Use centralized validation
        requireUserId(userId);

        // Use userId as viewerId if not provided (user viewing their own profile)
        const effectiveViewerId = viewerId || userId;

        const profile = await this.repository.findByUserId(userId, effectiveViewerId);

        // Business logic: Apply privacy filtering
        return applyPrivacyFiltering(profile, effectiveViewerId);
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
        const sanitizedQuery = sanitizeSearchQuery(query);

        const result = await this.repository.searchProfiles(sanitizedQuery);

        // Apply privacy filtering to results
        const filteredProfiles = result.profiles.map(profile =>
            applyPrivacyFiltering(profile, viewerId)
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
        const sanitizedFilters = sanitizeDirectoryFilters(filters);

        const result = await this.repository.getProfileDirectory(sanitizedFilters);

        // Apply privacy filtering
        const filteredProfiles = result.profiles.map(profile =>
            applyPrivacyFiltering(profile, viewerId)
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
        // Use centralized validation
        requireUserId(userId);
        requireUserId(requesterId);

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
        // Use centralized validation
        requireUserId(userId);

        // Business logic: Could implement soft delete here
        // For now, delegate to repository
        return this.repository.delete(userId);
    }

    /**
     * Get recently active profiles
     */
    async getRecentlyActiveProfiles(limit: number = 10, viewerId?: string): Promise<UserProfile[]> {
        const sanitizedLimit = applyResultLimit(limit, 50);
        const profiles = await this.repository.getRecentlyActiveProfiles(sanitizedLimit);

        // Apply privacy filtering
        return profiles.map(profile => applyPrivacyFiltering(profile, viewerId));
    }

    /**
     * Get most active profiles (by message count)
     */
    async getMostActiveProfiles(limit: number = 10, viewerId?: string): Promise<UserProfile[]> {
        const sanitizedLimit = applyResultLimit(limit, 50);
        const profiles = await this.repository.getMostActiveProfiles(sanitizedLimit);

        // Apply privacy filtering
        return profiles.map(profile => applyPrivacyFiltering(profile, viewerId));
    }

    /**
     * Check if a profile exists and is accessible
     */
    async isProfileAccessible(userId: string, viewerId?: string): Promise<boolean> {
        try {
            const profile = await this.repository.findByUserId(userId);
            return checkProfileAccessibility(profile, viewerId);
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
}