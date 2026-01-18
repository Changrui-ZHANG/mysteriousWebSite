package com.changrui.mysterious.domain.game.controller;

import com.changrui.mysterious.domain.game.dto.ScoreSubmissionDTO;
import com.changrui.mysterious.domain.game.model.Score;
import com.changrui.mysterious.domain.game.service.ScoreMaintenanceService;
import com.changrui.mysterious.domain.game.service.ScoreService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for managing game scores.
 */
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired
    private ScoreService scoreService;

    @Autowired
    private ScoreMaintenanceService maintenanceService;

    @Autowired
    private AdminService adminService;

    @GetMapping("/top/{gameType}")
    public ResponseEntity<ApiResponse<List<Score>>> getTopScores(@PathVariable String gameType) {
        return ResponseEntity.ok(ApiResponse.success(scoreService.getTopScores(gameType)));
    }

    @GetMapping("/user/{userId}/{gameType}")
    public ResponseEntity<ApiResponse<Score>> getUserHighScore(
            @PathVariable String userId,
            @PathVariable String gameType) {
        return ResponseEntity.ok(ApiResponse.success(scoreService.getUserBestScore(userId, gameType)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitScore(
            @Valid @RequestBody ScoreSubmissionDTO dto) {
        var result = scoreService.submitScore(dto);
        return ResponseEntity.ok(ApiResponse.success(
                result.message(),
                Map.of("message", result.message(), "newHighScore", result.newHighScore())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScore(
            @PathVariable String id,
            @RequestParam String adminCode) {
        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }
        scoreService.deleteScore(id);
        return ResponseEntity.ok(ApiResponse.successMessage("Score deleted successfully"));
    }

    @PostMapping("/cleanup-duplicates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cleanupDuplicateScores(
            @RequestParam String adminCode) {
        if (!adminService.isSuperAdmin(adminCode)) {
            throw new UnauthorizedException("Super admin access required");
        }
        int duplicatesRemoved = maintenanceService.cleanupDuplicateScores();
        return ResponseEntity.ok(ApiResponse.success(
                "Duplicate scores cleaned up successfully",
                Map.of("duplicatesRemoved", duplicatesRemoved)));
    }

    @GetMapping("/duplicates-report")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDuplicatesReport(
            @RequestParam String adminCode) {
        if (!adminService.isSuperAdmin(adminCode)) {
            throw new UnauthorizedException("Super admin access required");
        }
        Map<String, Object> report = maintenanceService.getDuplicateScoresReport();
        return ResponseEntity.ok(ApiResponse.success("Duplicates report generated", report));
    }

    @PostMapping("/force-cleanup-duplicates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forceCleanupDuplicateScores(
            @RequestParam String adminCode) {
        if (!adminService.isSuperAdmin(adminCode)) {
            throw new UnauthorizedException("Super admin access required");
        }
        int duplicatesRemoved = maintenanceService.forceCleanupDuplicates();
        return ResponseEntity.ok(ApiResponse.success(
                "Duplicate scores force cleaned up successfully",
                Map.of("duplicatesRemoved", duplicatesRemoved)));
    }

    @DeleteMapping("/clear/{gameType}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAllScoresForGame(
            @PathVariable String gameType,
            @RequestParam String adminCode) {
        if (!adminService.isSuperAdmin(adminCode)) {
            throw new UnauthorizedException("Super admin access required");
        }

        int deletedCount = maintenanceService.deleteAllScoresForGame(gameType);
        return ResponseEntity.ok(ApiResponse.success(
                "All scores deleted for game: " + gameType,
                Map.of("gameType", gameType, "deletedCount", deletedCount)));
    }
}
