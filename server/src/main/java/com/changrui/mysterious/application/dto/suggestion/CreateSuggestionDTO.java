package com.changrui.mysterious.application.dto.suggestion;

import jakarta.validation.constraints.NotBlank;

public record CreateSuggestionDTO(
        @NotBlank String userId,
        @NotBlank String username,
        @NotBlank String suggestion) {
}
