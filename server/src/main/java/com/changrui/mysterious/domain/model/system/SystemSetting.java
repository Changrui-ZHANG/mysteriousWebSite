package com.changrui.mysterious.domain.model.system;

public class SystemSetting {

    private final String key;
    private String value;
    private final String description;

    private SystemSetting(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
    }

    public static SystemSetting create(String key, String value, String description) {
        return new SystemSetting(key, value, description);
    }

    public static SystemSetting reconstitute(String key, String value, String description) {
        return new SystemSetting(key, value, description);
    }

    public void updateValue(String newValue) {
        this.value = newValue;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public String getDescription() {
        return description;
    }

    public boolean asBoolean() {
        return "true".equalsIgnoreCase(this.value);
    }
}
