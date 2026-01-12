package com.changrui.mysterious.domain.profile.dto;

import jakarta.validation.constraints.Size;

/**
 * DTO for profile update requests.
 */
public record UpdateProfileRequest(
    @Size(min = 2, max = 30, message = "Display name must be between 2 and 30 characters")
    String displayName,
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    String bio,
    
    String avatarUrl
) {}