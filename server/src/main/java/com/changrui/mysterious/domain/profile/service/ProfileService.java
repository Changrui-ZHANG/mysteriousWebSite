package com.changrui.mysterious.domain.profile.service;

import com.changrui.mysterious.domain.profile.dto.*;
import com.changrui.mysterious.domain.profile.model.*;
import com.changrui.mysterious.domain.profile.repository.*;
import com.changrui.mysterious.shared.exception.NotFoundException;
import com.changrui.mysterious.shared.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing user profiles.
 */
@Service
public class ProfileService {

    @Autowired
    private UserProfileRepository profileRepository;

    @Autowired
    private PrivacySettingsRepository privacyRepository;

    @Autowired
    private ActivityStatsRepository activityRepository;

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserAchievementRepository userAchievementRepository;

    @Autowired
    private ActivityService activityService;

    /**
     * Create a new user profile
     */
    @Transactional
    public ProfileResponse createProfile(CreateProfileRequest request) {
        // Check if profile already exists
        if (profileRepository.existsByUserId(request.userId())) {
            throw new BadRequestException("Profile already exists for user: " + request.userId());
        }

        // Create profile
        UserProfile profile = new UserProfile(request.userId(), request.displayName());
        if (request.bio() != null && !request.bio().trim().isEmpty()) {
            profile.setBio(request.bio().trim());
        }

        // Set gender
        if (request.gender() != null && !request.gender().trim().isEmpty()) {
            profile.setGender(request.gender().trim().toUpperCase());

            // Set default avatar based on gender if none provided
            if (profile.getAvatarUrl() == null || profile.getAvatarUrl().isEmpty()) {
                if ("H".equalsIgnoreCase(request.gender()) || "M".equalsIgnoreCase(request.gender())
                        || "B".equalsIgnoreCase(request.gender())) {
                    profile.setAvatarUrl("/avatars/default-B.jpeg");
                } else if ("F".equalsIgnoreCase(request.gender()) || "G".equalsIgnoreCase(request.gender())) {
                    profile.setAvatarUrl("/avatars/default-G.jpeg");
                }
            }
        }

        // Final neutral fallback if still null
        if (profile.getAvatarUrl() == null || profile.getAvatarUrl().isEmpty()) {
            profile.setAvatarUrl("/avatars/default-avatar.png");
        }

        // Set public/private status
        if (request.isPublic() != null) {
            profile.setPublic(request.isPublic());
        }

        profile = profileRepository.save(profile);

        // Create default privacy settings
        PrivacySettings privacy = new PrivacySettings(request.userId());
        privacy = privacyRepository.save(privacy);

        // Create default activity stats
        ActivityStats stats = new ActivityStats(request.userId());
        stats = activityRepository.save(stats);

        return ProfileResponse.ownerFrom(profile, privacy, stats, new ArrayList<>());
    }

    /**
     * Get user profile by ID
     */
    public ProfileResponse getProfile(String userId, String requesterId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        PrivacySettings privacy = privacyRepository.findByUserId(userId).orElse(null);
        ActivityStats stats = activityRepository.findByUserId(userId).orElse(null);

        boolean isOwner = userId.equals(requesterId);

        // Check if profile is accessible
        // Note: Admin access is handled by middleware, so if we reach here, access is
        // already granted
        if (!isOwner && !profile.isPublic()) {
            throw new NotFoundException("Profile not found for user: " + userId);
        }

        List<ProfileResponse.AchievementDto> achievements = getAchievementsForUser(userId);

        return isOwner ? ProfileResponse.ownerFrom(profile, privacy, stats, achievements)
                : ProfileResponse.publicFrom(profile, privacy, stats, achievements);
    }

    /**
     * Get user profile by ID with admin access consideration
     */
    public ProfileResponse getProfile(String userId, String requesterId, boolean isAdminAccess) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        PrivacySettings privacy = privacyRepository.findByUserId(userId).orElse(null);
        ActivityStats stats = activityRepository.findByUserId(userId).orElse(null);

        boolean isOwner = userId.equals(requesterId);

        // Check if profile is accessible
        if (!isOwner && !profile.isPublic() && !isAdminAccess) {
            throw new NotFoundException("Profile not found for user: " + userId);
        }

        List<ProfileResponse.AchievementDto> achievements = getAchievementsForUser(userId);

        // Admin and owner get full access, others get public view
        return (isOwner || isAdminAccess) ? ProfileResponse.ownerFrom(profile, privacy, stats, achievements)
                : ProfileResponse.publicFrom(profile, privacy, stats, achievements);
    }

    /**
     * Update user profile
     */
    @Transactional
    public ProfileResponse updateProfile(String userId, UpdateProfileRequest request, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot update another user's profile");
        }

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));

        // Update fields - display names don't need to be unique
        if (request.displayName() != null && !request.displayName().trim().isEmpty()) {
            profile.setDisplayName(request.displayName().trim());
        }

        if (request.bio() != null) {
            profile.setBio(request.bio().trim().isEmpty() ? null : request.bio().trim());
        }

        if (request.avatarUrl() != null) {
            profile.setAvatarUrl(request.avatarUrl().trim().isEmpty() ? null : request.avatarUrl().trim());
        }

        if (request.gender() != null) {
            profile.setGender(request.gender().trim().isEmpty() ? null : request.gender().trim().toUpperCase());
        }

        profile = profileRepository.save(profile);

        PrivacySettings privacy = privacyRepository.findByUserId(userId).orElse(null);
        ActivityStats stats = activityRepository.findByUserId(userId).orElse(null);
        List<ProfileResponse.AchievementDto> achievements = getAchievementsForUser(userId);

        return ProfileResponse.ownerFrom(profile, privacy, stats, achievements);
    }

    /**
     * Update privacy settings
     */
    @Transactional
    public void updatePrivacySettings(String userId, UpdatePrivacyRequest request, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot update another user's privacy settings");
        }

        PrivacySettings privacy = privacyRepository.findByUserId(userId)
                .orElse(new PrivacySettings(userId));

        // Update fields
        if (request.profileVisibility() != null) {
            privacy.setProfileVisibility(request.profileVisibility());

            // Update profile public flag
            UserProfile profile = profileRepository.findByUserId(userId)
                    .orElseThrow(() -> new NotFoundException("Profile not found for user: " + userId));
            profile.setPublic("public".equals(request.profileVisibility()));
            profileRepository.save(profile);
        }

        if (request.showBio() != null) {
            privacy.setShowBio(request.showBio());
        }

        if (request.showStats() != null) {
            privacy.setShowStats(request.showStats());
        }

        if (request.showAchievements() != null) {
            privacy.setShowAchievements(request.showAchievements());
        }

        if (request.showLastActive() != null) {
            privacy.setShowLastActive(request.showLastActive());
        }

        privacyRepository.save(privacy);
    }

    /**
     * Search profiles
     */
    public List<ProfileResponse> searchProfiles(String query, String requesterId) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        List<UserProfile> profiles = profileRepository.searchByDisplayNameOrBio(query.trim());

        return profiles.stream()
                .map(profile -> {
                    PrivacySettings privacy = privacyRepository.findByUserId(profile.getUserId()).orElse(null);
                    ActivityStats stats = activityRepository.findByUserId(profile.getUserId()).orElse(null);
                    List<ProfileResponse.AchievementDto> achievements = getAchievementsForUser(profile.getUserId());
                    boolean isOwner = profile.getUserId().equals(requesterId);

                    return isOwner ? ProfileResponse.ownerFrom(profile, privacy, stats, achievements)
                            : ProfileResponse.publicFrom(profile, privacy, stats, achievements);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get public profiles directory
     */
    public List<ProfileResponse> getPublicProfiles(String requesterId) {
        List<UserProfile> profiles = profileRepository.findPublicProfiles();

        return profiles.stream()
                .map(profile -> {
                    PrivacySettings privacy = privacyRepository.findByUserId(profile.getUserId()).orElse(null);
                    ActivityStats stats = activityRepository.findByUserId(profile.getUserId()).orElse(null);
                    List<ProfileResponse.AchievementDto> achievements = getAchievementsForUser(profile.getUserId());
                    boolean isOwner = profile.getUserId().equals(requesterId);

                    return isOwner ? ProfileResponse.ownerFrom(profile, privacy, stats, achievements)
                            : ProfileResponse.publicFrom(profile, privacy, stats, achievements);
                })
                .collect(Collectors.toList());
    }

    /**
     * Delete user profile
     */
    @Transactional
    public void deleteProfile(String userId, String requesterId) {
        // Check ownership
        if (!userId.equals(requesterId)) {
            throw new BadRequestException("Cannot delete another user's profile");
        }

        if (!profileRepository.existsByUserId(userId)) {
            throw new NotFoundException("Profile not found for user: " + userId);
        }

        // Delete related data
        privacyRepository.findByUserId(userId).ifPresent(privacyRepository::delete);
        activityRepository.findByUserId(userId).ifPresent(activityRepository::delete);

        // Delete profile
        profileRepository.deleteById(userId);
    }

    /**
     * Update last active timestamp
     */
    @Transactional
    public void updateLastActive(String userId) {
        profileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setLastActive(LocalDateTime.now());
            profileRepository.save(profile);
        });
    }

    /**
     * Helper to load and transform achievements for a user
     */
    private List<ProfileResponse.AchievementDto> getAchievementsForUser(String userId) {
        List<UserAchievement> userAchievements = userAchievementRepository.findByUserId(userId);
        return userAchievements.stream()
                .map(ua -> {
                    Achievement achievement = achievementRepository.findById(ua.getAchievementId()).orElse(null);
                    return achievement != null ? ProfileResponse.AchievementDto.from(achievement, ua.getUnlockedAt())
                            : null;
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }
}