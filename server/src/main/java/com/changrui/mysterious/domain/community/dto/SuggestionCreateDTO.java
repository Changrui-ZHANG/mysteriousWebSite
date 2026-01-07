package com.changrui.mysterious.domain.community.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new suggestion.
 */
public record SuggestionCreateDTO(
        @NotBlank(message = "User ID is required")
        String userId,

        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Suggestion is required")
        @Size(max = 1000, message = "Suggestion must be at most 1000 characters")
        String suggestion
) {}
