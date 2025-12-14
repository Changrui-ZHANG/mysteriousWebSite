package com.changrui.mysterious.service;

import com.changrui.mysterious.model.CalendarConfig;
import com.changrui.mysterious.repository.CalendarConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalendarConfigService {

    @Autowired
    private CalendarConfigRepository repository;

    @Autowired
    private AdminService adminService;

    /**
     * Get the global calendar configuration (creates default if doesn't exist)
     */
    public CalendarConfig getConfig() {
        return repository.findById("global")
                .orElseGet(() -> {
                    CalendarConfig config = new CalendarConfig();
                    return repository.save(config);
                });
    }

    /**
     * Update active zones (admin only)
     */
    public CalendarConfig updateZones(List<String> zones, String adminCode) throws SecurityException {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new SecurityException("Invalid admin code");
        }

        CalendarConfig config = getConfig();
        config.setActiveZones(zones);
        return repository.save(config);
    }
}
