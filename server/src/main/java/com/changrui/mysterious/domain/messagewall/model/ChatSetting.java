package com.changrui.mysterious.domain.messagewall.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity for storing chat settings like mute state.
 * Uses a single row with a fixed key for simplicity.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_settings")
public class ChatSetting {

    public static final String MUTE_KEY = "CHAT_MUTED";

    @Id
    private String settingKey;

    @Column(nullable = false)
    private String settingValue;
}
