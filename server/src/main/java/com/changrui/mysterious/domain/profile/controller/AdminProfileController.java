package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.service.ActivityService;
import com.changrui.mysterious.domain.profile.service.ProfileMigrationService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin controller for profile management.
 * Administrative endpoints for profile system.
 */
@RestController
@RequestMapping("/api/admin/profiles")
public class AdminProfileController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ProfileMigrationService migrationService;

    @Autowired
    private AdminService adminService;

    /**
     * Initialize default achievements (admin only)
     */
    @PostMapping("/achievements/init")
    public ResponseEntity<ApiResponse<Void>> initializeAchievements(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        activityService.initializeDefaultAchievements();
        return ResponseEntity.ok(ApiResponse.successMessage("Default achievements initialized"));
    }

    /**
     * Force check achievements for a user (admin only)
     */
    @PostMapping("/{userId}/achievements/check")
    public ResponseEntity<ApiResponse<Void>> checkUserAchievements(
            @PathVariable String userId,
            @RequestParam String adminCode) {
        
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        var stats = activityService.getActivityStats(userId);
        activityService.checkAndUnlockAchievements(userId, stats);
        
        return ResponseEntity.ok(ApiResponse.successMessage("Achievements checked for user: " + userId));
    }

    /**
     * Force migration of existing users to profiles (admin only)
     */
    @PostMapping("/migrate")
    public ResponseEntity<ApiResponse<Void>> forceMigration(@RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        migrationService.forceMigration();
        return ResponseEntity.ok(ApiResponse.successMessage("Profile migration completed"));
    }
}