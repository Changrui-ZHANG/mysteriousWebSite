package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.system.SystemSettingDTO;
import com.changrui.mysterious.application.dto.system.UpdateSettingDTO;
import com.changrui.mysterious.application.service.auth.AdminAuthenticationService;
import com.changrui.mysterious.domain.model.system.SystemSetting;
import com.changrui.mysterious.domain.port.in.system.SystemSettingUseCases;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    private final SystemSettingUseCases systemSettingUseCases;
    private final AdminAuthenticationService adminService;

    public SystemSettingController(SystemSettingUseCases systemSettingUseCases,
            AdminAuthenticationService adminService) {
        this.systemSettingUseCases = systemSettingUseCases;
        this.adminService = adminService;
    }

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Map<String, String>>> getPublicSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingUseCases.getPublicSettings()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SystemSettingDTO>>> getAllSettings(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        List<SystemSettingDTO> dtos = systemSettingUseCases.getAllSettings().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @PostMapping("/{key}")
    public ResponseEntity<ApiResponse<SystemSettingDTO>> updateSetting(
            @PathVariable String key,
            @Valid @RequestBody UpdateSettingDTO dto) {

        if (!adminService.isValidAdminCode(dto.adminCode())) {
            throw new UnauthorizedException("Invalid admin code");
        }

        SystemSetting updated = systemSettingUseCases.updateSetting(key, dto.value());
        return ResponseEntity.ok(ApiResponse.success(toDTO(updated)));
    }

    private SystemSettingDTO toDTO(SystemSetting setting) {
        return new SystemSettingDTO(setting.getKey(), setting.getValue(), setting.getDescription());
    }
}
