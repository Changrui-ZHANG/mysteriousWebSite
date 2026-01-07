package com.changrui.mysterious.domain.game.controller;

import com.changrui.mysterious.domain.game.model.GameStatus;
import com.changrui.mysterious.domain.game.service.GameStatusService;
import com.changrui.mysterious.domain.user.service.AdminService;
import com.changrui.mysterious.shared.dto.ApiResponse;
import com.changrui.mysterious.shared.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing game status (enabled/disabled).
 */
@RestController
@RequestMapping("/api/games")
public class GameStatusController {

    @Autowired
    private GameStatusService gameStatusService;

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GameStatus>>> getAllStatuses() {
        return ResponseEntity.ok(ApiResponse.success(gameStatusService.getAllStatuses()));
    }

    @PostMapping("/{gameType}/toggle")
    public ResponseEntity<ApiResponse<GameStatus>> toggleGame(
            @PathVariable String gameType,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        return ResponseEntity.ok(ApiResponse.success(gameStatusService.toggleGame(gameType)));
    }
}
