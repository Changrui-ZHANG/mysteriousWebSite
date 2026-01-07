package com.changrui.mysterious.domain.game.service;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for generating brick breaker game maps.
 */
@Service
public class BrickBreakerService {

    private static final int WALL = 1;
    private static final int PATH = 0;

    /**
     * Generate a random maze for the brick breaker game.
     */
    public int[][] generateRandomMaze(int width, int height) {
        int w = width | 1;
        int h = height | 1;

        int[][] maze = new int[h][w];

        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                maze[y][x] = WALL;
            }
        }

        recursiveBacktracker(maze, 1, 1, w, h);

        maze[1][1] = PATH;
        maze[h - 2][w - 2] = PATH;

        return maze;
    }

    private void recursiveBacktracker(int[][] maze, int cx, int cy, int width, int height) {
        maze[cy][cx] = PATH;

        int[][] directions = { { 0, -2 }, { 2, 0 }, { 0, 2 }, { -2, 0 } };
        List<int[]> dirList = Arrays.asList(directions);
        Collections.shuffle(dirList);

        for (int[] dir : dirList) {
            int nx = cx + dir[0];
            int ny = cy + dir[1];

            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && maze[ny][nx] == WALL) {
                maze[cy + dir[1] / 2][cx + dir[0] / 2] = PATH;
                recursiveBacktracker(maze, nx, ny, width, height);
            }
        }
    }
}
