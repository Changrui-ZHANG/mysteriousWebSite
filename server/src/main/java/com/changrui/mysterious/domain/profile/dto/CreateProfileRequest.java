package com.changrui.mysterious.domain.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for profile creation requests.
 */
public record CreateProfileRequest(
    @NotBlank(message = "User ID is required")
    String userId,
    
    @NotBlank(message = "Display name is required")
    @Size(min = 2, max = 30, message = "Display name must be between 2 and 30 characters")
    String displayName,
    
    @Size(max = 500, message = "Bio must not exceed 500 characters")
    String bio,
    
    Boolean isPublic
) {}