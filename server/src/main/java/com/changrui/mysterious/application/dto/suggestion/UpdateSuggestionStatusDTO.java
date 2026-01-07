package com.changrui.mysterious.application.dto.suggestion;

import jakarta.validation.constraints.Pattern;

public record UpdateSuggestionStatusDTO(
        @Pattern(regexp = "pending|reviewed|implemented", flags = Pattern.Flag.CASE_INSENSITIVE) String status) {
}
