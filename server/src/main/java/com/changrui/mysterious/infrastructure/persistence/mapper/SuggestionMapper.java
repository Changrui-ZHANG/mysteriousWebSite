package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.suggestion.Suggestion;
import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class SuggestionMapper {

    @Nullable
    public Suggestion toDomain(@Nullable SuggestionEntity entity) {
        if (entity == null)
            return null;
        return Suggestion.reconstitute(
                entity.getId(),
                entity.getUserId(),
                entity.getUsername(),
                entity.getSuggestion(),
                entity.getTimestamp(),
                entity.getStatus());
    }

    @Nullable
    public SuggestionEntity toEntity(@Nullable Suggestion domain) {
        if (domain == null)
            return null;
        SuggestionEntity entity = new SuggestionEntity();

        if (domain.getId() != null)
            entity.setId(domain.getId());
        entity.setUserId(domain.getUserId());
        entity.setUsername(domain.getUsername());
        entity.setSuggestion(domain.getContent());
        entity.setTimestamp(domain.getTimestamp());
        entity.setStatus(domain.getStatus().toLowerCase()); // Store as lowercase "pending", etc.

        return entity;
    }
}
