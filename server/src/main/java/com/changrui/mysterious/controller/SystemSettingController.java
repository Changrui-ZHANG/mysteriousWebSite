package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.UnauthorizedException;
import com.changrui.mysterious.model.SystemSetting;
import com.changrui.mysterious.service.AdminService;
import com.changrui.mysterious.service.SystemSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // Admin endpoint to get full settings
    @GetMapping
    public ResponseEntity<List<SystemSetting>> getAllSettings(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }
        return ResponseEntity.ok(systemSettingService.getAllSettings());
    }

    // Admin endpoint to update a setting
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
