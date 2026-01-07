package com.changrui.mysterious.infrastructure.persistence.mapper;

import com.changrui.mysterious.domain.model.message.Message;
import com.changrui.mysterious.domain.model.user.UserId;
import com.changrui.mysterious.infrastructure.persistence.entity.MessageEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    @Nullable
    public Message toDomain(@Nullable MessageEntity entity) {
        if (entity == null)
            return null;

        UserId authorId = entity.getAuthorId() != null ? UserId.of(entity.getAuthorId()) : null;

        return Message.reconstitute(
                entity.getId(),
                entity.getContent(),
                entity.getAuthorName(),
                authorId,
                entity.getCreatedAt(),
                Boolean.TRUE.equals(entity.getIsVisible()),
                entity.getQuotedMessageId(),
                entity.getQuotedAuthorName(),
                entity.getQuotedContent());
    }

    @Nullable
    public MessageEntity toEntity(@Nullable Message domain) {
        if (domain == null)
            return null;

        MessageEntity entity = new MessageEntity();
        if (domain.getId() != null) {
            entity.setId(domain.getId());
        }

        entity.setContent(domain.getContent());
        entity.setAuthorName(domain.getAuthorName());
        entity.setAuthorId(domain.getAuthorId() != null ? domain.getAuthorId().value() : null);
        entity.setCreatedAt(domain.getCreatedAt());
        entity.setIsVisible(domain.isVisible());
        entity.setQuotedMessageId(domain.getQuotedMessageId());
        entity.setQuotedAuthorName(domain.getQuotedAuthorName());
        entity.setQuotedContent(domain.getQuotedContent());

        return entity;
    }
}
