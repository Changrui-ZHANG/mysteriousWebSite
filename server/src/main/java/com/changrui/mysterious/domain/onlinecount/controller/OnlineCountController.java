package com.changrui.mysterious.domain.onlinecount.controller;

import com.changrui.mysterious.domain.onlinecount.service.WebSocketPresenceService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for tracking online user count.
 * Now uses WebSocket-based presence tracking.
 */
@RestController
@RequestMapping("/api/presence")
public class OnlineCountController {

    @Autowired
    private WebSocketPresenceService presenceService;

    @Autowired
    private AdminService adminService;

    /**
     * Get current online count (for initial page load).
     * Real-time updates are pushed via WebSocket.
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOnlineCount() {
        int count = presenceService.getOnlineCount();
        boolean showToAll = presenceService.isShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "count", count,
                "showToAll", showToAll)));
    }

    @PostMapping("/toggle-visibility")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleVisibility(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        boolean newValue = presenceService.toggleShowOnlineCountToAll();

        return ResponseEntity.ok(ApiResponse.success(
                Map.of("showToAll", newValue)));
    }
}
