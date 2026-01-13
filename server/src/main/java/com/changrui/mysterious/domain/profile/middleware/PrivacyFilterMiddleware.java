package com.changrui.mysterious.domain.profile.middleware;

import com.changrui.mysterious.domain.profile.model.PrivacySettings;
import com.changrui.mysterious.domain.profile.model.UserProfile;
import com.changrui.mysterious.domain.profile.repository.UserProfileRepository;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Middleware for privacy filtering and access control.
 * Automatically enforces privacy rules and filters response data based on
 * requester permissions.
 */
@Component
public class PrivacyFilterMiddleware {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private AdminService adminService;

    /**
     * Privacy levels for profile access
     */
    public enum PrivacyLevel {
        OWNER, // Full access to own profile
        ADMIN, // Admin access to any profile
        PUBLIC, // Public access with privacy filtering
        DENIED // No access allowed
    }

    /**
     * Determine the privacy level for a requester accessing a profile.
     * 
     * @param profileUserId The user ID of the profile being accessed
     * @param requesterId   The ID of the user making the request
     * @param adminCode     Admin code from request headers (if any)
     * @return The privacy level for this access attempt
     */
    public PrivacyLevel determinePrivacyLevel(String profileUserId, String requesterId, String adminCode) {
        // Check if requester is the profile owner
        if (requesterId != null && requesterId.equals(profileUserId)) {
            return PrivacyLevel.OWNER;
        }

        // Check if requester has admin privileges
        if (adminCode != null && !adminCode.trim().isEmpty()) {
            if (adminService.isValidAdminCode(adminCode.trim())) {
                return PrivacyLevel.ADMIN;
            }
        }

        // Check if profile exists and is public
        Optional<UserProfile> profileOpt = profileRepository.findByUserId(profileUserId);
        if (profileOpt.isEmpty()) {
            return PrivacyLevel.DENIED;
        }

        UserProfile profile = profileOpt.get();
        if (profile.isPublic()) {
            return PrivacyLevel.PUBLIC;
        }

        // Profile is private and requester is not owner or admin
        return PrivacyLevel.DENIED;
    }

    /**
     * Check if a requester can access a specific profile field.
     * 
     * @param privacySettings The privacy settings for the profile
     * @param fieldName       The name of the field being accessed
     * @param privacyLevel    The privacy level of the requester
     * @return true if access is allowed, false otherwise
     */
    public boolean canAccessField(PrivacySettings privacySettings, String fieldName, PrivacyLevel privacyLevel) {
        // Owner and admin have full access
        if (privacyLevel == PrivacyLevel.OWNER || privacyLevel == PrivacyLevel.ADMIN) {
            return true;
        }

        // Denied users have no access
        if (privacyLevel == PrivacyLevel.DENIED) {
            return false;
        }

        // For public access, check individual field privacy settings
        if (privacySettings == null) {
            // Default to showing all fields if no privacy settings exist
            return true;
        }

        switch (fieldName.toLowerCase()) {
            case "bio":
                return privacySettings.isShowBio();
            case "stats":
            case "activitystats":
            case "activity_stats":
                return privacySettings.isShowStats();
            case "achievements":
                return privacySettings.isShowAchievements();
            case "lastactive":
            case "last_active":
                return privacySettings.isShowLastActive();
            case "displayname":
            case "display_name":
            case "avatarurl":
            case "avatar_url":
            case "joindate":
            case "join_date":
            case "gender":
            case "userid":
            case "user_id":
                // These fields are always visible for public profiles
                return true;
            default:
                // Unknown fields default to privacy settings
                return false;
        }
    }

    /**
     * Filter a profile object based on privacy settings and requester permissions.
     * 
     * @param profile         The profile to filter
     * @param privacySettings The privacy settings for the profile
     * @param privacyLevel    The privacy level of the requester
     * @return A filtered profile object
     */
    public UserProfile filterProfile(UserProfile profile, PrivacySettings privacySettings, PrivacyLevel privacyLevel) {
        if (profile == null) {
            return null;
        }

        // Owner and admin get unfiltered profile
        if (privacyLevel == PrivacyLevel.OWNER || privacyLevel == PrivacyLevel.ADMIN) {
            return profile;
        }

        // Denied users get nothing
        if (privacyLevel == PrivacyLevel.DENIED) {
            return null;
        }

        // Create filtered copy for public access
        UserProfile filteredProfile = new UserProfile();
        filteredProfile.setUserId(profile.getUserId());
        filteredProfile.setDisplayName(profile.getDisplayName());
        filteredProfile.setAvatarUrl(profile.getAvatarUrl());
        filteredProfile.setGender(profile.getGender());
        filteredProfile.setJoinDate(profile.getJoinDate());
        filteredProfile.setPublic(profile.isPublic());
        filteredProfile.setCreatedAt(profile.getCreatedAt());

        // Apply field-level privacy filtering
        if (canAccessField(privacySettings, "bio", privacyLevel)) {
            filteredProfile.setBio(profile.getBio());
        }

        if (canAccessField(privacySettings, "last_active", privacyLevel)) {
            filteredProfile.setLastActive(profile.getLastActive());
            filteredProfile.setUpdatedAt(profile.getUpdatedAt());
        }

        return filteredProfile;
    }

    /**
     * Check if a requester can perform a specific operation on a profile.
     * 
     * @param profileUserId The user ID of the profile
     * @param requesterId   The ID of the user making the request
     * @param operation     The operation being attempted
     * @param adminCode     Admin code from request headers (if any)
     * @throws UnauthorizedException if the operation is not allowed
     */
    public void validateOperation(String profileUserId, String requesterId, String operation, String adminCode) {
        PrivacyLevel privacyLevel = determinePrivacyLevel(profileUserId, requesterId, adminCode);

        switch (operation.toLowerCase()) {
            case "read":
            case "view":
                if (privacyLevel == PrivacyLevel.DENIED) {
                    throw new UnauthorizedException("You do not have permission to view this profile");
                }
                break;

            case "update":
            case "edit":
            case "modify":
            case "upload":
            case "create":
                if (privacyLevel != PrivacyLevel.OWNER && privacyLevel != PrivacyLevel.ADMIN) {
                    throw new UnauthorizedException("You can only modify your own profile");
                }
                break;

            case "delete":
                if (privacyLevel != PrivacyLevel.OWNER && privacyLevel != PrivacyLevel.ADMIN) {
                    throw new UnauthorizedException("You can only delete your own profile");
                }
                break;

            case "admin_view":
            case "admin_modify":
                if (privacyLevel != PrivacyLevel.ADMIN) {
                    throw new UnauthorizedException("Admin privileges required for this operation");
                }
                break;

            default:
                throw new UnauthorizedException("Unknown operation: " + operation);
        }
    }

    /**
     * Create a privacy audit log entry.
     * 
     * @param operation      The operation performed
     * @param profileUserId  The profile being accessed
     * @param requesterId    The user making the request
     * @param privacyLevel   The privacy level granted
     * @param fieldsAccessed The fields that were accessed
     * @param success        Whether the operation was successful
     */
    public void logPrivacyAccess(String operation, String profileUserId, String requesterId,
            PrivacyLevel privacyLevel, String fieldsAccessed, boolean success) {

        String logMessage = String.format(
                "Privacy Access: %s | Profile: %s | Requester: %s | Level: %s | Fields: %s | Success: %s",
                operation, profileUserId, requesterId, privacyLevel, fieldsAccessed, success);

        // In production, this would go to a privacy audit log
        System.out.println("[PRIVACY AUDIT] " + logMessage);
    }

    /**
     * Check if a profile is visible in search results based on privacy settings.
     * 
     * @param profile         The profile to check
     * @param privacySettings The privacy settings for the profile
     * @param requesterId     The ID of the user performing the search
     * @param adminCode       Admin code from request headers (if any)
     * @return true if the profile should be included in search results
     */
    public boolean isVisibleInSearch(UserProfile profile, PrivacySettings privacySettings,
            String requesterId, String adminCode) {

        PrivacyLevel privacyLevel = determinePrivacyLevel(profile.getUserId(), requesterId, adminCode);

        // Denied profiles are not visible in search
        if (privacyLevel == PrivacyLevel.DENIED) {
            return false;
        }

        // Check profile visibility setting
        if (privacySettings != null) {
            String visibility = privacySettings.getProfileVisibility();

            switch (visibility.toLowerCase()) {
                case "private":
                    return privacyLevel == PrivacyLevel.OWNER || privacyLevel == PrivacyLevel.ADMIN;
                case "friends":
                    // TODO: Implement friends system
                    return privacyLevel == PrivacyLevel.OWNER || privacyLevel == PrivacyLevel.ADMIN;
                case "public":
                default:
                    return true;
            }
        }

        // Default to public visibility
        return profile.isPublic();
    }

    /**
     * Filter a list of profiles for search results based on privacy settings.
     * 
     * @param profiles    The list of profiles to filter
     * @param requesterId The ID of the user performing the search
     * @param adminCode   Admin code from request headers (if any)
     * @return A filtered list of profiles
     */
    public java.util.List<UserProfile> filterSearchResults(java.util.List<UserProfile> profiles,
            String requesterId, String adminCode) {

        return profiles.stream()
                .filter(profile -> {
                    // For search results, we need to check privacy settings
                    // This is a simplified version - in practice, you'd batch load privacy settings
                    PrivacyLevel privacyLevel = determinePrivacyLevel(profile.getUserId(), requesterId, adminCode);
                    return privacyLevel != PrivacyLevel.DENIED;
                })
                .map(profile -> {
                    // Apply basic filtering for search results
                    PrivacyLevel privacyLevel = determinePrivacyLevel(profile.getUserId(), requesterId, adminCode);
                    if (privacyLevel == PrivacyLevel.OWNER || privacyLevel == PrivacyLevel.ADMIN) {
                        return profile;
                    } else {
                        // Return minimal profile info for search results
                        UserProfile searchResult = new UserProfile();
                        searchResult.setUserId(profile.getUserId());
                        searchResult.setDisplayName(profile.getDisplayName());
                        searchResult.setAvatarUrl(profile.getAvatarUrl());
                        searchResult.setGender(profile.getGender());
                        searchResult.setJoinDate(profile.getJoinDate());
                        searchResult.setPublic(profile.isPublic());
                        return searchResult;
                    }
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Validate that a requester can access profile statistics.
     * 
     * @param profileUserId   The profile user ID
     * @param requesterId     The requester ID
     * @param privacySettings The privacy settings
     * @param adminCode       Admin code from request headers
     * @return true if statistics access is allowed
     */
    public boolean canAccessStatistics(String profileUserId, String requesterId,
            PrivacySettings privacySettings, String adminCode) {

        PrivacyLevel privacyLevel = determinePrivacyLevel(profileUserId, requesterId, adminCode);
        return canAccessField(privacySettings, "stats", privacyLevel);
    }

    /**
     * Validate that a requester can access profile achievements.
     * 
     * @param profileUserId   The profile user ID
     * @param requesterId     The requester ID
     * @param privacySettings The privacy settings
     * @param adminCode       Admin code from request headers
     * @return true if achievements access is allowed
     */
    public boolean canAccessAchievements(String profileUserId, String requesterId,
            PrivacySettings privacySettings, String adminCode) {

        PrivacyLevel privacyLevel = determinePrivacyLevel(profileUserId, requesterId, adminCode);
        return canAccessField(privacySettings, "achievements", privacyLevel);
    }
}