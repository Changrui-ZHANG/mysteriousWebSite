package com.changrui.mysterious.domain.profile.dto;

import com.changrui.mysterious.domain.profile.model.*;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO for profile responses.
 * Provides different views based on privacy settings and viewer permissions.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ProfileResponse(
        String userId,
        String displayName,
        String bio,
        String avatarUrl,
        String gender,
        LocalDateTime joinDate,
        LocalDateTime lastActive,
        boolean isPublic,
        PrivacySettingsDto privacySettings,
        ActivityStatsDto activityStats,
        List<AchievementDto> achievements) {

    /**
     * Create response for profile owner (full access)
     */
    public static ProfileResponse ownerFrom(UserProfile profile, PrivacySettings privacy, ActivityStats stats,
            List<AchievementDto> achievements) {
        return new ProfileResponse(
                profile.getUserId(),
                profile.getDisplayName(),
                profile.getBio(),
                profile.getResolvedAvatarUrl(),
                profile.getGender(),
                profile.getJoinDate(),
                profile.getLastActive(),
                profile.isPublic(),
                privacy != null ? PrivacySettingsDto.from(privacy) : null,
                stats != null ? ActivityStatsDto.from(stats) : null,
                achievements != null ? achievements : new ArrayList<>());
    }

    /**
     * Create response for public view (filtered by privacy settings)
     */
    public static ProfileResponse publicFrom(UserProfile profile, PrivacySettings privacy, ActivityStats stats,
            List<AchievementDto> achievements) {
        // Default privacy settings if none exist
        boolean showBio = privacy == null || privacy.isShowBio();
        boolean showStats = privacy == null || privacy.isShowStats();
        boolean showAchievements = privacy == null || privacy.isShowAchievements();
        boolean showLastActive = privacy == null || privacy.isShowLastActive();

        return new ProfileResponse(
                profile.getUserId(),
                profile.getDisplayName(),
                showBio ? profile.getBio() : null,
                profile.getResolvedAvatarUrl(),
                profile.getGender(),
                profile.getJoinDate(),
                showLastActive ? profile.getLastActive() : null,
                profile.isPublic(),
                privacy != null ? PrivacySettingsDto.from(privacy) : null,
                showStats && stats != null ? ActivityStatsDto.from(stats) : null,
                showAchievements && achievements != null ? achievements
                        : (showAchievements ? new ArrayList<>() : null));
    }

    /**
     * DTO for privacy settings
     */
    public record PrivacySettingsDto(
            String profileVisibility,
            boolean showBio,
            boolean showStats,
            boolean showAchievements,
            boolean showLastActive) {
        public static PrivacySettingsDto from(PrivacySettings privacy) {
            return new PrivacySettingsDto(
                    privacy.getProfileVisibility(),
                    privacy.isShowBio(),
                    privacy.isShowStats(),
                    privacy.isShowAchievements(),
                    privacy.isShowLastActive());
        }
    }

    /**
     * DTO for activity statistics
     */
    public record ActivityStatsDto(
            int totalMessages,
            int totalGamesPlayed,
            String bestScores, // JSON string
            int currentStreak,
            int longestStreak,
            int timeSpent) {
        public static ActivityStatsDto from(ActivityStats stats) {
            return new ActivityStatsDto(
                    stats.getTotalMessages(),
                    stats.getTotalGamesPlayed(),
                    stats.getBestScores(),
                    stats.getCurrentStreak(),
                    stats.getLongestStreak(),
                    stats.getTimeSpent());
        }
    }

    /**
     * DTO for achievements
     */
    public record AchievementDto(
            String id,
            String name,
            String description,
            String iconUrl,
            String category,
            LocalDateTime unlockedAt) {
        public static AchievementDto from(Achievement achievement, LocalDateTime unlockedAt) {
            return new AchievementDto(
                    achievement.getId(),
                    achievement.getName(),
                    achievement.getDescription(),
                    achievement.getIconUrl(),
                    achievement.getCategory(),
                    unlockedAt);
        }
    }
}