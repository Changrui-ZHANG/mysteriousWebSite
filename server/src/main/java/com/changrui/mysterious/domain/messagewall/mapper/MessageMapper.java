package com.changrui.mysterious.domain.messagewall.mapper;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.model.Message;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

/**
 * Mapper for converting Message entities to DTOs.
 * Abstract class allows mixing automatic MapStruct generation with custom
 * manual logic.
 */
@Mapper(componentModel = "spring")
public abstract class MessageMapper {

    /**
     * Standard automatic mapping.
     * We ignore avatarUrl here because it's not in the Message entity.
     */
    @Mapping(target = "avatarUrl", ignore = true)
    public abstract MessageResponse toDto(Message message);

    /**
     * Automatic list mapping.
     * MapStruct will use the toDto method above for each element.
     */
    public abstract List<MessageResponse> toDtoList(List<Message> messages);

    /**
     * Custom mapping method that enriches the DTO with an avatar URL.
     * This demonstrates how to handle fields that don't exist in the source entity.
     */
    public MessageResponse toDtoWithAvatar(Message message, String avatarUrl) {
        // 1. Let MapStruct handle the boring part (id, name, message, etc.)
        MessageResponse dto = toDto(message);

        // 2. Add your custom manual logic
        if (dto != null) {
            dto.setAvatarUrl(avatarUrl);
        }

        return dto;
    }
}
