package com.changrui.mysterious.domain.messagewall.dto;

import com.changrui.mysterious.domain.messagewall.model.MessageReaction;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO for sending message data to the client.
 * Decouples the API from the Database Entity.
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String id;
    private String userId;
    private String name;
    private String message;
    private long timestamp;
    @Getter(onMethod_ = @JsonProperty("isAnonymous"))
    @Setter(onMethod_ = @JsonProperty("isAnonymous"))
    private boolean isAnonymous;

    @Getter(onMethod_ = @JsonProperty("isVerified"))
    @Setter(onMethod_ = @JsonProperty("isVerified"))
    private boolean isVerified;
    private String quotedMessageId;
    private String quotedName;
    private String quotedMessage;
    private String channelId;
    private List<MessageReaction> reactions;
    private String imageUrl;

    // Potential future fields for profile integration
    private String avatarUrl;
}
