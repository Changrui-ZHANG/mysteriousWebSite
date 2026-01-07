package com.changrui.mysterious.domain.settings.model;

import jakarta.persistence.*;

/**
 * Entity representing a system setting.
 * Maps to the 'system_settings' table in the database.
 */
@Entity
@Table(name = "system_settings")
public class SystemSetting {

    @Id
    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(name = "setting_value")
    private String value;

    @Column(name = "description")
    private String description;

    public SystemSetting() {
    }

    public SystemSetting(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean asBoolean() {
        return "true".equalsIgnoreCase(this.value);
    }
}
