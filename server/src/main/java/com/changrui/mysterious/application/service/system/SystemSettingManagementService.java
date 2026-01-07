package com.changrui.mysterious.application.service.system;

import com.changrui.mysterious.domain.model.system.SystemSetting;
import com.changrui.mysterious.domain.port.in.system.SystemSettingUseCases;
import com.changrui.mysterious.domain.port.out.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class SystemSettingManagementService implements SystemSettingUseCases {

    private final SystemSettingRepository repository;

    private static final Map<String, String> DEFAULTS = Map.of(
            "SITE_MAINTENANCE_MODE", "false",
            "PAGE_CV_ENABLED", "true",
            "PAGE_GAME_ENABLED", "true",
            "PAGE_MESSAGES_ENABLED", "true",
            "PAGE_SUGGESTIONS_ENABLED", "true",
            "PAGE_CALENDAR_ENABLED", "true",
            "SITE_MAINTENANCE_MESSAGE", "The site is currently under maintenance. We will be back shortly.",
            "SITE_MAINTENANCE_BY", "");

    public SystemSettingManagementService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    @PostConstruct
    public void init() {
        initializeDefaults(DEFAULTS);
    }

    @Override
    public void initializeDefaults(Map<String, String> defaults) {
        defaults.forEach((key, value) -> {
            if (!repository.existsByKey(key)) {
                repository.save(SystemSetting.create(key, value, "System Toggle"));
            }
        });
    }

    @Override
    public List<SystemSetting> getAllSettings() {
        return repository.findAll();
    }

    @Override
    public Map<String, String> getPublicSettings() {
        return repository.findAll().stream()
                .collect(Collectors.toMap(SystemSetting::getKey, SystemSetting::getValue));
    }

    @Override
    public SystemSetting updateSetting(String key, String value) {
        return repository.findByKey(key)
                .map(setting -> {
                    setting.updateValue(value);
                    return repository.save(setting);
                })
                .orElseGet(() -> repository.save(SystemSetting.create(key, value, "System Toggle")));
    }
}
