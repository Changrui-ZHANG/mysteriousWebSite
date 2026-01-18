package com.changrui.mysterious.domain.settings.service;

import com.changrui.mysterious.domain.settings.model.SystemSetting;
import com.changrui.mysterious.domain.settings.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for managing system settings.
 */
@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    private static final Map<String, String> DEFAULTS;
    
    static {
        Map<String, String> defaults = new java.util.HashMap<>();
        defaults.put("SITE_MAINTENANCE_MODE", "false");
        defaults.put("PAGE_CV_ENABLED", "true");
        defaults.put("PAGE_GAME_ENABLED", "true");
        defaults.put("PAGE_MESSAGES_ENABLED", "true");
        defaults.put("PAGE_SUGGESTIONS_ENABLED", "true");
        defaults.put("PAGE_CALENDAR_ENABLED", "true");
        defaults.put("PAGE_LEARNING_ENABLED", "true");
        defaults.put("PAGE_NOTES_ENABLED", "true");
        defaults.put("SITE_MAINTENANCE_MESSAGE", "The site is currently under maintenance. We will be back shortly.");
        defaults.put("SITE_MAINTENANCE_BY", "");
        DEFAULTS = java.util.Collections.unmodifiableMap(defaults);
    }

    @PostConstruct
    public void init() {
        DEFAULTS.forEach((key, value) -> {
            if (!systemSettingRepository.existsById(key)) {
                systemSettingRepository.save(new SystemSetting(key, value, "System Toggle"));
            }
        });
    }

    public List<SystemSetting> getAllSettings() {
        return systemSettingRepository.findAll();
    }

    public SystemSetting updateSetting(String key, String value) {
        Optional<SystemSetting> existing = systemSettingRepository.findById(key);
        if (existing.isPresent()) {
            SystemSetting setting = existing.get();
            setting.setValue(value);
            return systemSettingRepository.save(setting);
        }
        return systemSettingRepository.save(new SystemSetting(key, value, "System Toggle"));
    }

    public Map<String, String> getPublicSettings() {
        List<SystemSetting> settings = systemSettingRepository.findAll();
        Map<String, String> publicSettings = new HashMap<>();
        for (SystemSetting setting : settings) {
            publicSettings.put(setting.getKey(), setting.getValue());
        }
        return publicSettings;
    }
}
