package com.changrui.mysterious.dto.suggestion;

import com.changrui.mysterious.model.Suggestion;
import java.time.LocalDateTime;

public record SuggestionResponseDTO(
        String id,
        String userId,
        String username,
        String suggestion,
        LocalDateTime timestamp,
        String status,
        long commentCount) {
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
