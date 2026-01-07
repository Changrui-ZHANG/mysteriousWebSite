package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.suggestion.SuggestionComment;
import com.changrui.mysterious.infrastructure.persistence.entity.SuggestionCommentEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class SuggestionCommentMapper {

    @Nullable
    public SuggestionComment toDomain(@Nullable SuggestionCommentEntity entity) {
        if (entity == null)
            return null;
        return SuggestionComment.reconstitute(
                entity.getId(),
                entity.getSuggestionId(),
                entity.getUserId(),
                entity.getUsername(),
                entity.getContent(),
                entity.getTimestamp(),
                entity.getQuotedCommentId(),
                entity.getQuotedUsername(),
                entity.getQuotedContent());
    }

    @Nullable
    public SuggestionCommentEntity toEntity(@Nullable SuggestionComment domain) {
        if (domain == null)
            return null;
        SuggestionCommentEntity entity = new SuggestionCommentEntity();

        if (domain.getId() != null)
            entity.setId(domain.getId());
        entity.setSuggestionId(domain.getSuggestionId());
        entity.setUserId(domain.getUserId());
        entity.setUsername(domain.getUsername());
        entity.setContent(domain.getContent());
        entity.setTimestamp(domain.getTimestamp());
        entity.setQuotedCommentId(domain.getQuotedCommentId());
        entity.setQuotedUsername(domain.getQuotedUsername());
        entity.setQuotedContent(domain.getQuotedContent());

        return entity;
    }
}
