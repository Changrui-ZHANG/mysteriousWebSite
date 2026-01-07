package com.changrui.mysterious.domain.messagewall.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating suggestion status.
 */
public record SuggestionUpdateDTO(
        @NotBlank(message = "Status is required")
        @Pattern(regexp = "^(pending|reviewed|implemented)$", message = "Status must be: pending, reviewed, or implemented")
        String status
) {}
