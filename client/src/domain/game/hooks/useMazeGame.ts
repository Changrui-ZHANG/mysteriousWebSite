/**
 * useMazeGame - Hook for maze game logic
 * Encapsulates maze generation, player movement, fog of war, and dynamic shifting
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';

// ===== CONFIGURATION =====
export const MAZE_CONFIG = {
    FOG_VISION_RADIUS: 3,
    HOLD_INTERVAL: 100,
    MOVE_ANIMATION_DURATION: 150,
    SHIFT_INITIAL_COUNTDOWN: 3,
    SHIFT_INTERVAL: 1000,
    SHIFT_MAX_ATTEMPTS: 50,
    SHIFT_WALL_CANDIDATES: 10,
    SHIFT_EXTRA_WALLS: 2,
    SHIFT_BLOCK_INDEX_MIN: 2,
    SHIFT_BLOCK_INDEX_RANGE: 3,
} as const;

export type SoundType = 'hit' | 'break' | 'gameover' | 'win' | 'click' | 'powerup';

export interface MazeData {
    grid: number[][];
    start: number[];
    end: number[];
    width: number;
    height: number;
}

export type GameState = 'loading' | 'playing' | 'won';

interface UseMazeGameProps {
    onSubmitScore: (score: number) => void;
    isAuthenticated: boolean;
    onGameStart?: () => void;
    playSound: (sound: SoundType) => void;
}

export function useMazeGame({ onSubmitScore, isAuthenticated, onGameStart, playSound }: UseMazeGameProps) {
    const [maze, setMaze] = useState<MazeData | null>(null);
    const [playerPos, setPlayerPos] = useState<{ x: number; y: number } | null>(null);
    const [gameState, setGameState] = useState<GameState>('loading');
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const [shiftTimer, setShiftTimer] = useState<number>(MAZE_CONFIG.SHIFT_INITIAL_COUNTDOWN);
    const [exploredCells, setExploredCells] = useState<Set<string>>(new Set());
    const [lastFacing, setLastFacing] = useState<1 | -1>(1);
    const [isMoving, setIsMoving] = useState(false);
    const [holdingDirection, setHoldingDirection] = useState<{ dx: number; dy: number } | null>(null);

    const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const playerPosRef = useRef(playerPos);

    useEffect(() => {
        playerPosRef.current = playerPos;
    }, [playerPos]);

    const fetchMaze = useCallback(async () => {
        playSound('click');
        setGameState('loading');
        if (onGameStart) onGameStart();
        try {
            const res = await fetch(API_ENDPOINTS.GAMES.MAZE_GENERATE);
            if (res.ok) {
                const data = await res.json();
                setMaze(data);
                setPlayerPos({ x: data.start[0], y: data.start[1] });
                setGameState('playing');
                setMoves(0);
                setStartTime(Date.now());
                setIsDragging(false);
                setExploredCells(new Set());
                setShiftTimer(MAZE_CONFIG.SHIFT_INITIAL_COUNTDOWN);
            }
        } catch (err) {
            console.error("Failed to load maze", err);
        }
    }, [onGameStart, playSound]);

    useEffect(() => {
        fetchMaze();
    }, []);

    // Resubmit score when user logs in
    useEffect(() => {
        if (isAuthenticated && gameState === 'won' && moves > 0) {
            onSubmitScore(moves);
        }
    }, [isAuthenticated]);

    const tryMoveTo = useCallback((targetX: number, targetY: number) => {
        if (gameState !== 'playing' || !maze || !playerPos) return;

        if (targetX < 0 || targetX >= maze.width || targetY < 0 || targetY >= maze.height) return;
        if (maze.grid[targetY][targetX] === 1) {
            playSound('hit');
            return;
        }

        const dx = Math.abs(targetX - playerPos.x);
        const dy = Math.abs(targetY - playerPos.y);

        if (dx + dy === 1) {
            setPlayerPos({ x: targetX, y: targetY });
            setMoves(prev => prev + 1);

            if (targetX !== playerPos.x) {
                setLastFacing(targetX > playerPos.x ? 1 : -1);
            }

            setIsMoving(true);
            if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
            moveTimeoutRef.current = setTimeout(() => setIsMoving(false), MAZE_CONFIG.MOVE_ANIMATION_DURATION);

            playSound('click');

            if (targetX === maze.end[0] && targetY === maze.end[1]) {
                setGameState('won');
                playSound('win');
                setIsDragging(false);
                onSubmitScore(moves + 1);
            }
        }
    }, [gameState, maze, playerPos, onSubmitScore, moves, playSound]);

    const handleManualMove = useCallback((dx: number, dy: number) => {
        if (!playerPos) return;
        tryMoveTo(playerPos.x + dx, playerPos.y + dy);
    }, [playerPos, tryMoveTo]);

    const startMoving = useCallback((dx: number, dy: number) => {
        handleManualMove(dx, dy);
        setHoldingDirection({ dx, dy });
    }, [handleManualMove]);

    const stopMoving = useCallback(() => {
        setHoldingDirection(null);
    }, []);

    // Fog of War visibility
    useEffect(() => {
        if (!playerPos || !maze) return;

        setExploredCells(prev => {
            const newExplored = new Set(prev);
            const radius = MAZE_CONFIG.FOG_VISION_RADIUS;
            let changed = false;

            const minX = Math.max(0, playerPos.x - radius);
            const maxX = Math.min(maze.width - 1, playerPos.x + radius);
            const minY = Math.max(0, playerPos.y - radius);
            const maxY = Math.min(maze.height - 1, playerPos.y + radius);

            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const key = `${x}-${y}`;
                    if (!newExplored.has(key)) {
                        const dx = x - playerPos.x;
                        const dy = y - playerPos.y;
                        if (dx * dx + dy * dy <= radius * radius) {
                            newExplored.add(key);
                            changed = true;
                        }
                    }
                }
            }
            return changed ? newExplored : prev;
        });
    }, [playerPos, maze]);

    // Continuous movement interval
    useEffect(() => {
        if (holdingDirection) {
            moveIntervalRef.current = setInterval(() => {
                handleManualMove(holdingDirection.dx, holdingDirection.dy);
            }, MAZE_CONFIG.HOLD_INTERVAL);
        } else {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        }
        return () => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        };
    }, [holdingDirection, handleManualMove]);

    // BFS pathfinding
    const getShortestPath = useCallback((grid: number[][], startX: number, startY: number, endX: number, endY: number) => {
        const h = grid.length;
        const w = grid[0].length;
        const queue: { x: number, y: number, path: { x: number, y: number }[] }[] = [{ x: startX, y: startY, path: [] }];
        const visited = new Set<string>();
        visited.add(`${startX}-${startY}`);

        while (queue.length > 0) {
            const { x, y, path } = queue.shift()!;
            const newPath = [...path, { x, y }];

            if (x === endX && y === endY) return newPath;

            const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx >= 0 && nx < w && ny >= 0 && ny < h && grid[ny][nx] === 0) {
                    const key = `${nx}-${ny}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ x: nx, y: ny, path: newPath });
                    }
                }
            }
        }
        return null;
    }, []);

    // Dynamic maze shifting
    useEffect(() => {
        if (gameState !== 'playing' || !maze) return;

        const shiftInterval = setInterval(() => {
            setShiftTimer(prevTime => {
                if (prevTime <= 1) {
                    setMaze(currentMaze => {
                        if (!currentMaze || !playerPosRef.current) return currentMaze;

                        const currentPos = playerPosRef.current;
                        const w = currentMaze.width;
                        const h = currentMaze.height;

                        for (let attempt = 0; attempt < MAZE_CONFIG.SHIFT_MAX_ATTEMPTS; attempt++) {
                            const newGrid = currentMaze.grid.map(row => [...row]);

                            const currentPath = getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1]);
                            if (!currentPath || currentPath.length < 2) continue;

                            if (currentPath.length > 2) {
                                const blockIndex = Math.min(currentPath.length - 2, MAZE_CONFIG.SHIFT_BLOCK_INDEX_MIN + Math.floor(Math.random() * MAZE_CONFIG.SHIFT_BLOCK_INDEX_RANGE));
                                const nodeToBlock = currentPath[blockIndex];
                                if (nodeToBlock && newGrid[nodeToBlock.y][nodeToBlock.x] === 0) {
                                    newGrid[nodeToBlock.y][nodeToBlock.x] = 1;
                                }
                            }

                            let bestWall = { x: -1, y: -1, length: -1 };

                            for (let k = 0; k < MAZE_CONFIG.SHIFT_WALL_CANDIDATES; k++) {
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 1) {
                                    newGrid[ry][rx] = 0;
                                    const testPath = getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1]);
                                    if (testPath && testPath.length > bestWall.length) {
                                        bestWall = { x: rx, y: ry, length: testPath.length };
                                    }
                                    newGrid[ry][rx] = 1;
                                }
                            }

                            if (bestWall.length > 0) {
                                newGrid[bestWall.y][bestWall.x] = 0;
                            } else {
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 1) newGrid[ry][rx] = 0;
                            }

                            for (let ex = 0; ex < MAZE_CONFIG.SHIFT_EXTRA_WALLS; ex++) {
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 0 && (rx !== currentPos.x || ry !== currentPos.y)) {
                                    const isStart = rx === currentMaze.start[0] && ry === currentMaze.start[1];
                                    const isEnd = rx === currentMaze.end[0] && ry === currentMaze.end[1];
                                    if (!isStart && !isEnd) {
                                        newGrid[ry][rx] = 1;
                                    }
                                }
                            }

                            if (getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1])) {
                                return { ...currentMaze, grid: newGrid };
                            }
                        }

                        return currentMaze;
                    });

                    return MAZE_CONFIG.SHIFT_INITIAL_COUNTDOWN;
                }
                return prevTime - 1;
            });
        }, MAZE_CONFIG.SHIFT_INTERVAL);

        return () => clearInterval(shiftInterval);
    }, [gameState, getShortestPath]);

    return {
        maze,
        playerPos,
        gameState,
        moves,
        startTime,
        isDragging,
        shiftTimer,
        exploredCells,
        lastFacing,
        isMoving,
        holdingDirection,
        setIsDragging,
        setHoldingDirection,
        fetchMaze,
        tryMoveTo,
        handleManualMove,
        startMoving,
        stopMoving,
    };
}
