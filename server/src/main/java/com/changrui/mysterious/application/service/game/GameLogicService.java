package com.changrui.mysterious.application.service.game;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class GameLogicService {

    private static final int EMPTY = 0;
    private static final int BRICK = 1;
    private static final int WALL = 2;

    public int[][] generateRandomMaze(int width, int height) {
        // Use exact dimensions provided as they are now pre-calculated (6n+1)
        int[][] grid = new int[height][width];

        // 1. Initialize with BRICK (1) everywhere
        for (int y = 0; y < height; y++) {
            Arrays.fill(grid[y], BRICK);
        }

        // 2. Place WALLS (2) in a grid pattern (step of 6)
        // This ensures 5 bricks of space between walls:
        // brick-brick-brick-brick-brick-wall
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                if (x % 6 == 0 || y % 6 == 0) {
                    grid[y][x] = WALL;
                }
            }
        }

        // 3. Mark which "rooms" (centers) we will visit
        // Centers are at (3,3), (3,9), (15,3)...
        boolean[][] visited = new boolean[height][width];
        recursiveBacktracker(grid, visited, 3, 3, width, height);

        // 4. Ensure bottom area is clear (at least 21x11 area for 5px bricks)
        int centerX = width / 2;
        for (int y = height - 1; y >= height - 12; y--) {
            for (int x = centerX - 20; x <= centerX + 20; x++) {
                if (y >= 0 && x >= 0 && x < width) {
                    grid[y][x] = EMPTY;
                }
            }
        }

        return grid;
    }

    private void recursiveBacktracker(int[][] grid, boolean[][] visited, int cx, int cy, int width, int height) {
        if (cy < 0 || cy >= height || cx < 0 || cx >= width)
            return;
        visited[cy][cx] = true;

        Integer[] directions = { 0, 1, 2, 3 };
        List<Integer> dirList = Arrays.asList(directions);
        Collections.shuffle(dirList);

        for (int dir : dirList) {
            int dx = 0, dy = 0;
            int step = 6;

            switch (dir) {
                case 0:
                    dy = -step;
                    break; // Up
                case 1:
                    dx = step;
                    break; // Right
                case 2:
                    dy = step;
                    break; // Down
                case 3:
                    dx = -step;
                    break; // Left
            }

            int nx = cx + dx;
            int ny = cy + dy;

            if (nx > 0 && nx < width && ny > 0 && ny < height && !visited[ny][nx]) {
                // Remove the wall between cx,cy and nx,ny
                // Opening a 3-brick wide door TO ENSURE THE BALL FITS.
                if (dx != 0) {
                    int wallX = (dx > 0) ? cx + 3 : cx - 3;
                    if (wallX >= 0 && wallX < width) {
                        for (int i = -1; i <= 1; i++) {
                            if (cy + i >= 0 && cy + i < height)
                                grid[cy + i][wallX] = BRICK;
                        }
                    }
                } else {
                    int wallY = (dy > 0) ? cy + 3 : cy - 3;
                    if (wallY >= 0 && wallY < height) {
                        for (int i = -1; i <= 1; i++) {
                            if (cx + i >= 0 && cx + i < width)
                                grid[wallY][cx + i] = BRICK;
                        }
                    }
                }
                recursiveBacktracker(grid, visited, nx, ny, width, height);
            }
        }
    }
}
