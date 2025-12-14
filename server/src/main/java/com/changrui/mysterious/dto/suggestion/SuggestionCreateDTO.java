package com.changrui.mysterious.dto.suggestion;

import jakarta.validation.constraints.*;

/**
 * DTO for creating a new suggestion
 */
public record SuggestionCreateDTO(
        @NotBlank(message = "User ID is required") String userId,

        @NotBlank(message = "Username is required") String username,

        @NotBlank(message = "Suggestion content is required") @Size(max = 1000, message = "Suggestion must not exceed 1000 characters") String suggestion) {
}
