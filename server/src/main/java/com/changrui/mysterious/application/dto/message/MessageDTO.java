package com.changrui.mysterious.application.dto.message;

public record MessageDTO(
                String id,
                String userId,
                String name,
                String message,
                long timestamp,
                boolean isAnonymous,
                boolean isVerified,
                String quotedMessageId,
                String quotedName,
                String quotedMessage) {
}
