package com.changrui.mysterious.infrastructure.web.controller;

import com.changrui.mysterious.application.dto.game.GameStatusDTO;
import com.changrui.mysterious.application.service.game.GameLogicService;
import com.changrui.mysterious.application.service.auth.AdminAuthenticationService;
import com.changrui.mysterious.domain.port.in.game.ScoreUseCases;
import com.changrui.mysterious.application.dto.common.ApiResponse;
import com.changrui.mysterious.domain.exception.UnauthorizedException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameLogicService gameLogicService;
    private final ScoreUseCases scoreUseCases; // Using ScoreUseCases for GameStatus management
    private final AdminAuthenticationService adminService;

    public GameController(GameLogicService gameLogicService, ScoreUseCases scoreUseCases,
            AdminAuthenticationService adminService) {
        this.gameLogicService = gameLogicService;
        this.scoreUseCases = scoreUseCases;
        this.adminService = adminService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<GameStatusDTO>>> getAllGames() {
        var dtos = scoreUseCases.getAllGameStatuses().stream()
                .map(s -> new GameStatusDTO(s.getGameType(), s.isEnabled()))
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/{gameType}/status")
    public ResponseEntity<ApiResponse<GameStatusDTO>> getGameStatus(@PathVariable String gameType) {
        var status = scoreUseCases.getGameStatus(gameType);
        var dto = new GameStatusDTO(status.getGameType(), status.isEnabled());
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @PostMapping("/{gameType}/toggle")
    public ResponseEntity<ApiResponse<GameStatusDTO>> toggleGameStatus(
            @PathVariable String gameType,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        var current = scoreUseCases.getGameStatus(gameType);
        boolean newEnabled = !current.isEnabled();
        scoreUseCases.setGameStatus(gameType, newEnabled);

        return ResponseEntity.ok(ApiResponse.success(new GameStatusDTO(gameType, newEnabled)));
    }

    @PostMapping("/{gameType}/status")
    public ResponseEntity<ApiResponse<Void>> setGameStatus(
            @PathVariable String gameType,
            @RequestParam boolean enabled,
            @RequestParam String adminCode) {

        if (!adminService.isValidAdminCode(adminCode)) {
            throw new UnauthorizedException("Invalid admin code");
        }

        scoreUseCases.setGameStatus(gameType, enabled);
        return ResponseEntity.ok(ApiResponse.successMessage("Game status updated"));
    }

    // --- Brick Breaker Endpoints ---

    @GetMapping("/maze/generate")
    public ResponseEntity<ApiResponse<int[][]>> generateMaze(
            @RequestParam(defaultValue = "20") int width,
            @RequestParam(defaultValue = "20") int height) {

        // Ensure odd dimensions for the maze generator
        if (width % 2 == 0)
            width++;
        if (height % 2 == 0)
            height++;

        int[][] maze = gameLogicService.generateRandomMaze(width, height);
        return ResponseEntity.ok(ApiResponse.success(maze));
    }
}
