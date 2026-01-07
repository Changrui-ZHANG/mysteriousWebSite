package com.changrui.mysterious.application.service.calendar;

import com.changrui.mysterious.application.service.auth.AdminAuthenticationService;
import com.changrui.mysterious.domain.model.calendar.CalendarConfig;
import com.changrui.mysterious.domain.port.in.calendar.CalendarUseCases;
import com.changrui.mysterious.domain.port.out.CalendarConfigRepository;
import com.changrui.mysterious.domain.exception.UnauthorizedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CalendarManagementService implements CalendarUseCases {

    private final CalendarConfigRepository repository;
    private final AdminAuthenticationService adminService;

    public CalendarManagementService(CalendarConfigRepository repository, AdminAuthenticationService adminService) {
        this.repository = repository;
        this.adminService = adminService;
    }

    @Override
    public CalendarConfig getConfig() {
        return repository.findGlobal()
                .orElseGet(() -> repository.save(CalendarConfig.createDefault()));
    }

    @Override
    public CalendarConfig updateZones(List<String> zones, String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        CalendarConfig config = getConfig();
        config.updateZones(zones);
        return repository.save(config);
    }
}
