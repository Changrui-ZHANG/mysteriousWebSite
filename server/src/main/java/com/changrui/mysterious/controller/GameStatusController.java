package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.exception.UnauthorizedException;
import com.changrui.mysterious.model.GameStatus;
import com.changrui.mysterious.repository.GameStatusRepository;
import com.changrui.mysterious.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing game status (enabled/disabled)
 */
@RestController
@RequestMapping("/api/games")
public class GameStatusController {

    @Autowired
    private GameStatusRepository gameStatusRepository;

    @Autowired
    private AdminService adminService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GameStatus>>> getAllStatuses() {
        return ResponseEntity.ok(ApiResponse.success(gameStatusRepository.findAll()));
    }

    @PostMapping("/{gameType}/toggle")
    public ResponseEntity<ApiResponse<GameStatus>> toggleGame(
            @PathVariable String gameType,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        GameStatus status = gameStatusRepository.findById(gameType)
                .map(existing -> {
                    existing.setEnabled(!existing.isEnabled());
                    return existing;
                })
                .orElseGet(() -> new GameStatus(gameType, false));

        gameStatusRepository.save(status);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
