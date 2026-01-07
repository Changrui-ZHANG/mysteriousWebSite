package com.changrui.mysterious.domain.port.in.system;

import com.changrui.mysterious.domain.model.system.SystemSetting;
import java.util.List;
import java.util.Map;

public interface SystemSettingUseCases {
    List<SystemSetting> getAllSettings();

    Map<String, String> getPublicSettings();

    SystemSetting updateSetting(String key, String value);

    void initializeDefaults(Map<String, String> defaults);
}
