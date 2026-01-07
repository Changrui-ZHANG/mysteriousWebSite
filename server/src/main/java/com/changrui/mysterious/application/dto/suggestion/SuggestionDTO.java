package com.changrui.mysterious.application.dto.suggestion;

import java.time.LocalDateTime;

public record SuggestionDTO(
        String id,
        String userId,
        String username,
        String suggestion, // Keeping field name 'suggestion' for frontend compatibility
        LocalDateTime timestamp,
        String status,
        long commentCount) {
}
