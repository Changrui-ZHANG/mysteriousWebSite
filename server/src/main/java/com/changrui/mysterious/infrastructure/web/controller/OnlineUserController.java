package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.service.auth.AdminAuthenticationService;
import com.changrui.mysterious.domain.port.in.presence.OnlineUserUseCases;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.exception.UnauthorizedException;
import com.changrui.mysterious.domain.exception.ValidationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/presence")
public class OnlineUserController {

    private final OnlineUserUseCases onlineUserUseCases;
    private final AdminAuthenticationService adminService;

    public OnlineUserController(OnlineUserUseCases onlineUserUseCases, AdminAuthenticationService adminService) {
        this.onlineUserUseCases = onlineUserUseCases;
        this.adminService = adminService;
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<ApiResponse<Void>> heartbeat(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");

        if (userId == null || userId.isEmpty()) {
            throw new ValidationException("User ID is required");
        }

        onlineUserUseCases.updateHeartbeat(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Heartbeat updated"));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOnlineCount() {
        long count = onlineUserUseCases.getOnlineCount();
        boolean showToAll = onlineUserUseCases.isShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "count", count,
                "showToAll", showToAll)));
    }

    @PostMapping("/toggle-visibility")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleVisibility(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        onlineUserUseCases.toggleShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("showToAll", onlineUserUseCases.isShowOnlineCountToAll())));
    }
}
