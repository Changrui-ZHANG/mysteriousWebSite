package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.UnauthorizedException;
import com.changrui.mysterious.exception.ValidationException;
import com.changrui.mysterious.service.OnlineUserService;
import com.changrui.mysterious.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for tracking online users
 */
@RestController
@RequestMapping("/api/presence")
public class OnlineUserController {

    @Autowired
    private OnlineUserService onlineUserService;

    @Autowired
    private AdminService adminService;

    @PostMapping("/heartbeat")
    public ResponseEntity<ApiResponse<Void>> heartbeat(@RequestBody Map<String, String> payload) {
        String userId = payload.get("userId");

        if (userId == null || userId.isEmpty()) {
            throw new ValidationException("User ID is required");
        }

        onlineUserService.updateHeartbeat(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Heartbeat updated"));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOnlineCount() {
        long count = onlineUserService.getOnlineCount();
        boolean showToAll = onlineUserService.isShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "count", count,
                "showToAll", showToAll)));
    }

    @PostMapping("/toggle-visibility")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleVisibility(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        onlineUserService.toggleShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("showToAll", onlineUserService.isShowOnlineCountToAll())));
    }
}
