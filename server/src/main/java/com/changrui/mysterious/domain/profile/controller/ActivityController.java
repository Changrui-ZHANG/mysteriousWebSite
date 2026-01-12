package com.changrui.mysterious.domain.profile.controller;

import com.changrui.mysterious.domain.profile.model.ActivityStats;
import com.changrui.mysterious.domain.profile.model.UserAchievement;
import com.changrui.mysterious.domain.profile.service.ActivityService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for user activity and achievements.
 * REST endpoints for activity tracking and achievements.
 */
@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    /**
     * Record message activity
     */
    @PostMapping("/message")
    public ResponseEntity<ApiResponse<Void>> recordMessageActivity(@RequestParam String userId) {
        activityService.recordMessageActivity(userId);
        return ResponseEntity.ok(ApiResponse.successMessage("Message activity recorded"));
    }

    /**
     * Record game activity
     */
    @PostMapping("/game")
    public ResponseEntity<ApiResponse<Void>> recordGameActivity(
            @RequestParam String userId,
            @RequestParam String gameType,
            @RequestParam int score) {
        
        activityService.recordGameActivity(userId, gameType, score);
        return ResponseEntity.ok(ApiResponse.successMessage("Game activity recorded"));
    }

    /**
     * Get user activity statistics
     */
    @GetMapping("/{userId}/stats")
    public ResponseEntity<ApiResponse<ActivityStats>> getActivityStats(@PathVariable String userId) {
        ActivityStats stats = activityService.getActivityStats(userId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * Get user achievements
     */
    @GetMapping("/{userId}/achievements")
    public ResponseEntity<ApiResponse<List<UserAchievement>>> getUserAchievements(@PathVariable String userId) {
        List<UserAchievement> achievements = activityService.getUserAchievements(userId);
        return ResponseEntity.ok(ApiResponse.success(achievements));
    }

    /**
     * Initialize default achievements (admin endpoint)
     */
    @PostMapping("/achievements/init")
    public ResponseEntity<ApiResponse<Void>> initializeAchievements() {
        activityService.initializeDefaultAchievements();
        return ResponseEntity.ok(ApiResponse.successMessage("Default achievements initialized"));
    }
}