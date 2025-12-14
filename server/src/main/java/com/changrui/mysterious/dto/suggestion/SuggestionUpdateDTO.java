package com.changrui.mysterious.dto.suggestion;

import jakarta.validation.constraints.*;

/**
 * DTO for updating suggestion status
 */
public record SuggestionUpdateDTO(
        @NotBlank(message = "Status is required") @Pattern(regexp = "pending|reviewed|implemented", message = "Status must be: pending, reviewed, or implemented") String status) {
}
