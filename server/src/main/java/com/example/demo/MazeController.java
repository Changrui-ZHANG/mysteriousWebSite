package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.*;

@RestController
@RequestMapping("/api/maze")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost", "http://localhost:3001",
        "http://changrui.freeboxos.fr:3001", "http://changrui.freeboxos.fr", "http://changrui.freeboxos.fr:5173" })
public class MazeController {

    private static final int WALL = 1;
    private static final int PATH = 0;

    @GetMapping("/generate")
    public Map<String, Object> generateMaze() {
        int width = 21; // Must be odd for this algorithm
        int height = 21; // Must be odd
        int[][] maze = new int[height][width];

        // Initialize with walls
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                maze[y][x] = WALL;
            }
        }

        // Start carving from (1, 1)
        recursiveBacktracker(maze, 1, 1, width, height);

        // Ensure start and end are open
        maze[1][1] = PATH; // Start (Top-Left)
        maze[height - 2][width - 2] = PATH; // End (Bottom-Right)

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

        // Directions: Up, Right, Down, Left (jumping 2 steps)
        int[][] directions = { { 0, -2 }, { 2, 0 }, { 0, 2 }, { -2, 0 } };
        Collections.shuffle(Arrays.asList(directions)); // Randomize

        for (int[] dir : directions) {
            int nx = cx + dir[0];
            int ny = cy + dir[1];

            // Check if neighbour is within bounds and is a wall (visited cells are paths)
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] == WALL) {
                // Carve through the wall between current and next
                maze[cy + dir[1] / 2][cx + dir[0] / 2] = PATH;
                recursiveBacktracker(maze, nx, ny, width, height);
            }
        }
    }
}
