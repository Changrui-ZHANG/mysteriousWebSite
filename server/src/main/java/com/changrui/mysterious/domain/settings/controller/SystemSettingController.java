package com.changrui.mysterious.domain.settings.controller;

import com.changrui.mysterious.domain.settings.model.SystemSetting;
import com.changrui.mysterious.domain.settings.service.SystemSettingService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for system settings management.
 */
@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private AdminService adminService;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicSettings() {
        return ResponseEntity.ok(systemSettingService.getPublicSettings());
    }

    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }
        return ResponseEntity.ok(systemSettingService.getAllSettings());
    }

    @PostMapping("/{key}")
    public ResponseEntity<ApiResponse<SystemSetting>> updateSetting(
            @PathVariable String key,
            @RequestParam String value,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        SystemSetting updated = systemSettingService.updateSetting(key, value);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }
}
