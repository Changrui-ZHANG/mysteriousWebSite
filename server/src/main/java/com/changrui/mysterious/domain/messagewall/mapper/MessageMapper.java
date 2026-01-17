package com.changrui.mysterious.domain.messagewall.mapper;

import com.changrui.mysterious.domain.messagewall.dto.MessageResponse;
import com.changrui.mysterious.domain.messagewall.model.Message;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting Message entities to DTOs.
 */
@Component
public class MessageMapper {

    public MessageResponse toDto(Message message) {
        if (message == null) {
            return null;
        }

        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setUserId(message.getUserId());
        response.setName(message.getName());
        response.setMessage(message.getMessage());
        response.setTimestamp(message.getTimestamp());
        response.setAnonymous(message.isAnonymous());
        response.setVerified(message.isVerified());
        response.setQuotedMessageId(message.getQuotedMessageId());
        response.setQuotedName(message.getQuotedName());
        response.setQuotedMessage(message.getQuotedMessage());
        response.setChannelId(message.getChannelId());

        // Copy reactions - this was the source of the previous bug!
        // By handling it explicitly here, we ensure it's never forgotten.
        response.setReactions(message.getReactions());

        return response;
    }

    public List<MessageResponse> toDtoList(List<Message> messages) {
        if (messages == null) {
            return List.of();
        }
        return messages.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
