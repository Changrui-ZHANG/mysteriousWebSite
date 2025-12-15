package com.changrui.mysterious.service;

import com.changrui.mysterious.model.SystemSetting;
import com.changrui.mysterious.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    // Default settings to initialize
    private static final Map<String, String> DEFAULTS = Map.of(
            "SITE_MAINTENANCE_MODE", "false",
            "PAGE_CV_ENABLED", "true",
            "PAGE_GAME_ENABLED", "true",
            "PAGE_MESSAGES_ENABLED", "true",
            "PAGE_SUGGESTIONS_ENABLED", "true",
            "PAGE_CALENDAR_ENABLED", "true",
            "SITE_MAINTENANCE_MESSAGE", "The site is currently under maintenance. We will be back shortly.",
            "SITE_MAINTENANCE_BY", "");

    @PostConstruct
    public void init() {
        // Initialize default settings if not present
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
