package com.changrui.mysterious.domain.game.controller;

import java.util.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for maze game generation.
 */
@RestController
@RequestMapping("/api/maze")
public class MazeController {

    private static final int WALL = 1;
    private static final int PATH = 0;

    @GetMapping("/generate")
    public Map<String, Object> generateMaze() {
        int width = 21;
        int height = 21;
        int[][] maze = new int[height][width];

        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                maze[y][x] = WALL;
            }
        }

        recursiveBacktracker(maze, 1, 1, width, height);

        maze[1][1] = PATH;
        maze[height - 2][width - 2] = PATH;

        Map<String, Object> response = new HashMap<>();
        response.put("grid", maze);
        response.put("start", new int[] { 1, 1 });
        response.put("end", new int[] { width - 2, height - 2 });
        response.put("width", width);
        response.put("height", height);

        return response;
    }

    private void recursiveBacktracker(int[][] maze, int cx, int cy, int width, int height) {
        maze[cy][cx] = PATH;

        int[][] directions = { { 0, -2 }, { 2, 0 }, { 0, 2 }, { -2, 0 } };
        Collections.shuffle(Arrays.asList(directions));

        for (int[] dir : directions) {
            int nx = cx + dir[0];
            int ny = cy + dir[1];

            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] == WALL) {
                maze[cy + dir[1] / 2][cx + dir[0] / 2] = PATH;
                recursiveBacktracker(maze, nx, ny, width, height);
            }
        }
    }
}
