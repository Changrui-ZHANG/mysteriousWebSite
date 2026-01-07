package com.changrui.mysterious.domain.messagewall.model;

import jakarta.persistence.*;

/**
 * Entity for storing chat settings like mute state.
 * Uses a single row with a fixed key for simplicity.
 */
@Entity
@Table(name = "chat_settings")
public class ChatSetting {

    public static final String MUTE_KEY = "CHAT_MUTED";

    @Id
    private String settingKey;

    @Column(nullable = false)
    private String settingValue;

    public ChatSetting() {
    }

    public ChatSetting(String settingKey, String settingValue) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
    }

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }
}
