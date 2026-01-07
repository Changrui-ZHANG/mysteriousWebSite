package com.changrui.mysterious.domain.messagewall.dto;

import com.changrui.mysterious.domain.messagewall.model.Suggestion;
import java.time.LocalDateTime;

/**
 * DTO for suggestion response with comment count.
 */
public record SuggestionResponseDTO(
        String id,
        String userId,
        String username,
        String suggestion,
        LocalDateTime timestamp,
        String status,
        long commentCount
) {
    public static SuggestionResponseDTO from(Suggestion s, long count) {
        return new SuggestionResponseDTO(
                s.getId(),
                s.getUserId(),
                s.getUsername(),
                s.getSuggestion(),
                s.getTimestamp(),
                s.getStatus(),
                count);
    }
}
