package com.changrui.mysterious.controller;

import com.changrui.mysterious.dto.common.ApiResponse;
import com.changrui.mysterious.service.BrickBreakerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/games/brickbreaker")
public class BrickBreakerController {

    private static final Logger logger = LoggerFactory.getLogger(BrickBreakerController.class);

    @Autowired
    private BrickBreakerService brickBreakerService;

    @GetMapping("/random-map")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRandomMap(
            @RequestParam(defaultValue = "15") int width,
            @RequestParam(defaultValue = "15") int height) {

        logger.info("Generating random map: {}x{}", width, height);

        // Clamp dimensions for safety and maze compatibility (max 100x100 for safety)
        int w = Math.max(10, Math.min(width, 100));
        int h = Math.max(10, Math.min(height, 100));

        try {
            int[][] grid = brickBreakerService.generateRandomMaze(w, h);

            Map<String, Object> data = new HashMap<>();
            data.put("grid", grid);
            data.put("width", w);
            data.put("height", h);

            return ResponseEntity.ok(ApiResponse.success(data));
        } catch (Exception e) {
            logger.error("Error generating maze", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Maze generation failed: " + e.getMessage()));
        }
    }
}
