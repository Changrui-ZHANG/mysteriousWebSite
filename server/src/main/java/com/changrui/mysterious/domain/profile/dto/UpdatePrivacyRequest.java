package com.changrui.mysterious.domain.profile.dto;

import jakarta.validation.constraints.Pattern;

/**
 * DTO for privacy settings update requests.
 */
public record UpdatePrivacyRequest(
    @Pattern(regexp = "public|friends|private", message = "Profile visibility must be public, friends, or private")
    String profileVisibility,
    
    Boolean showBio,
    Boolean showStats,
    Boolean showAchievements,
    Boolean showLastActive
) {}