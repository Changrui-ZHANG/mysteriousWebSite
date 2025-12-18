import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaTrophy, FaQuestion, FaClock } from 'react-icons/fa';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { GradientHeading, IconButton, MuteButton, Button } from '../../../components';

interface MazeGameProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest: { score: number; attempts?: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

interface MazeData {
    grid: number[][];
    start: number[];
    end: number[];
    width: number;
    height: number;
}

export default function MazeGame({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, onGameStart }: MazeGameProps) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const [maze, setMaze] = useState<MazeData | null>(null);
    const [playerPos, setPlayerPos] = useState<{ x: number; y: number } | null>(null);
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'won'>('loading');
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const { isMuted, toggleMute } = useMute();
    const [shiftTimer, setShiftTimer] = useState(3);

    const { playSound } = useSound(!isMuted);

    // Animation states
    const [lastFacing, setLastFacing] = useState<1 | -1>(1); // 1 = right, -1 = left
    const [isMoving, setIsMoving] = useState(false);
    const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const fetchMaze = async () => {
        playSound('click');
        setGameState('loading');
        if (onGameStart) onGameStart(); // Notify parent of new game
        try {
            const res = await fetch('/api/maze/generate');
            if (res.ok) {
                const data = await res.json();
                setMaze(data);
                setPlayerPos({ x: data.start[0], y: data.start[1] });
                setGameState('playing');
                setMoves(0);
                setStartTime(Date.now());
                setIsDragging(false);
                setExploredCells(new Set());
                setShiftTimer(3);
            }
        } catch (err) {
            console.error("Failed to load maze", err);
        }
    };

    useEffect(() => {
        fetchMaze();
    }, []);

    // Resubmit score when user logs in (if game won)
    useEffect(() => {
        // Calculate current elapsed as string if needed, but onSubmitScore expects number (steps? or time?)
        // The current onSubmitScore in tryMoveTo sends `moves + 1`.
        // So for resubmitting, we should send `moves` (assuming it's final state).
        // Wait, logic in tryMoveTo uses `moves + 1`.
        if (isAuthenticated && gameState === 'won' && moves > 0) {
            onSubmitScore(moves);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const tryMoveTo = useCallback((targetX: number, targetY: number) => {
        if (gameState !== 'playing' || !maze || !playerPos) return;

        // Check bounds
        if (targetX < 0 || targetX >= maze.width || targetY < 0 || targetY >= maze.height) return;

        // Check wall
        if (maze.grid[targetY][targetX] === 1) {
            playSound('hit'); // Wall hit sound
            return;
        }

        // Check adjacency (only allowing 1 step at a time for smooth pathing)
        const dx = Math.abs(targetX - playerPos.x);
        const dy = Math.abs(targetY - playerPos.y);

        if (dx + dy <= 1) {
            if (dx + dy === 1) {
                setPlayerPos({ x: targetX, y: targetY });
                setMoves(prev => prev + 1);

                // Update direction if horizontal move
                if (targetX !== playerPos.x) {
                    setLastFacing(targetX > playerPos.x ? 1 : -1);
                }

                // Trigger move animation
                setIsMoving(true);
                if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
                moveTimeoutRef.current = setTimeout(() => setIsMoving(false), 150);

                playSound('click');

                // Win check
                if (targetX === maze.end[0] && targetY === maze.end[1]) {
                    setGameState('won');
                    playSound('win');
                    setIsDragging(false);
                    // const timeTaken = (Date.now() - startTime) / 1000;

                    // Score is now just the steps taken (moves + 1 for the final step)
                    // Wait, 'moves' is updated via setState, so it might be stale here if we use 'moves' directly?
                    // 'moves' in dependency array ensures this callback is recreated.
                    // But we just did setMoves(prev => prev + 1).
                    // So the current 'moves' variable is the OLD value.
                    // The actual moves taken is moves + 1.

                    const finalScore = moves + 1;

                    onSubmitScore(finalScore);
                }
            }
        }
    }, [gameState, maze, playerPos, startTime, onSubmitScore, moves]);

    // Keyboard controls
    // Keyboard controls for continuous movement
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;

            const key = e.key.toLowerCase();
            let dx = 0;
            let dy = 0;

            if (['arrowup', 'w', 'z'].includes(key)) dy = -1;
            else if (['arrowdown', 's'].includes(key)) dy = 1;
            else if (['arrowleft', 'a', 'q'].includes(key)) dx = -1;
            else if (['arrowright', 'd'].includes(key)) dx = 1;

            if (dx !== 0 || dy !== 0) {
                // Determine new direction
                // Only update if not already moving in that direction to avoid resetting interval
                setHoldingDirection(prev => {
                    if (prev?.dx === dx && prev?.dy === dy) return prev;
                    // Initial immediate move for responsiveness
                    handleManualMove(dx, dy);
                    return { dx, dy };
                });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            // Stop ONLY if the released key matches current direction
            // Requires knowing which key maps to which direction, bit tricky with multi-key.
            // Simplified: if key maps to current holdingDirection, stop.

            let dx = 0;
            let dy = 0;
            if (['arrowup', 'w', 'z'].includes(key)) dy = -1;
            else if (['arrowdown', 's'].includes(key)) dy = 1;
            else if (['arrowleft', 'a', 'q'].includes(key)) dx = -1;
            else if (['arrowright', 'd'].includes(key)) dx = 1;

            if (dx !== 0 || dy !== 0) {
                setHoldingDirection(prev => {
                    if (prev && prev.dx === dx && prev.dy === dy) {
                        return null;
                    }
                    return prev;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState, playerPos]); // Dependencies updated, handleManualMove ref logic handles actual pos

    // Pointer Event Handlers for Continuous Drag
    const handlePointerDown = (e: React.PointerEvent) => {
        if (gameState !== 'playing') return;
        setIsDragging(true);
        // Try initial move if clicking directly on a neighbor
        handlePointerMove(e);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !maze || !gridRef.current) return;

        e.preventDefault(); // Prevent scrolling on touch

        const rect = gridRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate grid coordinates
        const cellWidth = rect.width / maze.width;
        const cellHeight = rect.height / maze.height;

        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        tryMoveTo(col, row);
    };

    // Global pointer up to catch releases outside
    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('pointerup', handleGlobalUp);
        window.addEventListener('pointercancel', handleGlobalUp);
        return () => {
            window.removeEventListener('pointerup', handleGlobalUp);
            window.removeEventListener('pointercancel', handleGlobalUp);
        };
    }, []);


    const [holdingDirection, setHoldingDirection] = useState<{ dx: number; dy: number } | null>(null);
    const moveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [exploredCells, setExploredCells] = useState<Set<string>>(new Set());

    const startMoving = (dx: number, dy: number) => {
        handleManualMove(dx, dy); // Move immediately once
        setHoldingDirection({ dx, dy });
    };

    const stopMoving = () => {
        setHoldingDirection(null);
    };

    // Initialize/Update Visibility (Fog of War)
    useEffect(() => {
        if (!playerPos || !maze) return;

        setExploredCells(prev => {
            const newExplored = new Set(prev);
            const radius = 3;
            let changed = false;

            // Simple bounding box loop optimization
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

    // Reset explored on new maze
    useEffect(() => {
        if (maze && maze.start) {
            // Initial explore around start will be handled by the playerPos effect
            // But we should clear old explored cells when maze changes ID or strictly when we fetch new.
            // Since we don't have a unique ID, we rely on the clear in fetchMaze
            // fetchMaze calls setMoves(0), let's clear here too? 
            // Actually fetchMaze should clear it.
        }
    }, [maze]);

    useEffect(() => {
        if (holdingDirection) {
            moveIntervalRef.current = setInterval(() => {
                handleManualMove(holdingDirection.dx, holdingDirection.dy);
            }, 100); // 100ms interval for smooth movement
        } else {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        }
        return () => {
            if (moveIntervalRef.current) clearInterval(moveIntervalRef.current);
        };
    }, [holdingDirection, playerPos, maze, gameState]); // Dependencies for move logic

    // BFS Solver that returns the actual path (for blocking logic)
    const getShortestPath = (grid: number[][], startX: number, startY: number, endX: number, endY: number): { x: number, y: number }[] | null => {
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
    };

    // Ref for playerPos to use inside interval without resetting it

    // Ref for playerPos to use inside interval without resetting it
    const playerPosRef = useRef(playerPos);
    useEffect(() => {
        playerPosRef.current = playerPos;
    }, [playerPos]);

    // Dynamic Maze Shifting with Countdown
    useEffect(() => {
        if (gameState !== 'playing' || !maze) return;

        const shiftInterval = setInterval(() => {
            setShiftTimer(prevTime => {
                if (prevTime <= 1) {
                    // Trigger Shift Logic
                    setMaze(currentMaze => {
                        if (!currentMaze || !playerPosRef.current) return currentMaze;

                        const currentPos = playerPosRef.current;
                        const w = currentMaze.width;
                        const h = currentMaze.height;

                        // Retry loop to find a valid configuration
                        for (let attempt = 0; attempt < 50; attempt++) {
                            const newGrid = currentMaze.grid.map(row => [...row]);

                            // 1. Calculate CURRENT Path
                            // Use 'isSolvable' logic but returning path
                            const currentPath = getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1]);
                            if (!currentPath || currentPath.length < 2) continue; // No path to block? Should happen only if trapped.

                            // 2. Block a node ON THE CURRENT PATH (Force detour)
                            if (currentPath.length > 2) {
                                // Block somewhat effectively
                                const blockIndex = Math.min(currentPath.length - 2, 2 + Math.floor(Math.random() * 3));
                                const nodeToBlock = currentPath[blockIndex];
                                if (nodeToBlock && newGrid[nodeToBlock.y][nodeToBlock.x] === 0) {
                                    newGrid[nodeToBlock.y][nodeToBlock.x] = 1;
                                }
                            }

                            // 3. Open a Wall that MAXIMIZES Path Length (Make it painful)
                            // Candidates approach: Try 10 random walls, see which one gives longest path
                            let bestWall = { x: -1, y: -1, length: -1 };

                            for (let k = 0; k < 10; k++) {
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 1) { // It's a wall candidate
                                    // Temporarily open
                                    newGrid[ry][rx] = 0;
                                    const testPath = getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1]);
                                    if (testPath) {
                                        if (testPath.length > bestWall.length) {
                                            bestWall = { x: rx, y: ry, length: testPath.length };
                                        }
                                    }
                                    // Revert
                                    newGrid[ry][rx] = 1;
                                }
                            }

                            // Apply best wall found (if any)
                            if (bestWall.length > 0) {
                                newGrid[bestWall.y][bestWall.x] = 0;
                            } else {
                                // Fallback: If no candidate made it solvable (maybe we fully blocked it?), just open a random one to ensure solvability
                                // Or rely on the Retry loop to pick a different Block? 
                                // Let's just open a random one to be safe
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 1) newGrid[ry][rx] = 0;
                            }

                            // 4. Add "False Paths" (Extra Walls)
                            // Add 1-2 random walls in open space to increase density/dead-ends
                            for (let ex = 0; ex < 2; ex++) {
                                const rx = 1 + Math.floor(Math.random() * (w - 2));
                                const ry = 1 + Math.floor(Math.random() * (h - 2));
                                if (newGrid[ry][rx] === 0 && (rx !== currentPos.x || ry !== currentPos.y)) {
                                    // Don't block if it's start/end
                                    const isStart = rx === currentMaze.start[0] && ry === currentMaze.start[1];
                                    const isEnd = rx === currentMaze.end[0] && ry === currentMaze.end[1];
                                    if (!isStart && !isEnd) {
                                        newGrid[ry][rx] = 1;
                                    }
                                }
                            }

                            // 5. Verify Solvability of NEW grid
                            if (getShortestPath(newGrid, currentPos.x, currentPos.y, currentMaze.end[0], currentMaze.end[1])) {
                                return { ...currentMaze, grid: newGrid };
                            }
                        }

                        // If all attempts failed (unlikely), return previous state
                        return currentMaze;
                    });

                    return 3; // Reset timer
                }
                return prevTime - 1;
            });
        }, 1000); // 1s interval

        return () => clearInterval(shiftInterval);
    }, [gameState]);

    const handleManualMove = (dx: number, dy: number) => {
        if (!playerPos) return;
        tryMoveTo(playerPos.x + dx, playerPos.y + dy);
    };

    if (!maze || !playerPos) return <div className="text-center p-10 text-xl font-bold animate-pulse text-cyan-500">{t('game.loading')}...</div>;

    const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    // const currentScore = Math.max(0, 5000 - Math.floor(((Date.now() - startTime) / 1000) * 10) - (moves * 2));

    return (
        <div className="w-full h-full" style={{ perspective: '1000px' }}>
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face (Game) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center p-4 ${theme.bgCard} backdrop-blur-md rounded-xl border border-white/20 select-none`}
                    style={{ backfaceVisibility: 'hidden' }}
                >

                    {/* Header */}
                    <div className="flex justify-between w-full max-w-[500px] mb-4 items-end">
                        <div className="flex flex-col gap-1">
                            <div className="text-xl font-bold font-mono text-cyan-400">{t('game.moves')}: {moves}</div>
                            {/* Shift Timer */}
                            <div className={`text-sm font-bold font-mono flex items-center gap-2 transition-colors ${shiftTimer <= 3 ? 'text-red-500 animate-pulse' : 'text-pink-400'}`}>
                                <FaClock /> {t('game.next_shift')}: {shiftTimer}s
                            </div>
                            {personalBest && (
                                <div className="text-xs font-mono text-yellow-500/80">
                                    {t('game.best')}: {personalBest.score} {t('game.moves') || 'steps'}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <IconButton
                                icon={<FaQuestion size={20} />}
                                onClick={() => setIsFlipped(true)}
                                color="cyan"
                                title="Rules"
                            />
                            <MuteButton
                                isMuted={isMuted}
                                onToggle={toggleMute}
                                color="cyan"
                            />
                            <Button
                                onClick={fetchMaze}
                                color="cyan"
                                size="sm"
                            >
                                {t('game.new_maze')}
                            </Button>
                        </div>
                    </div>

                    {/* Maze Grid */}
                    <div
                        ref={gridRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
                        className="relative bg-black border-4 border-cyan-900 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.5)] overflow-hidden touch-none"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${maze.width}, 1fr)`,
                            width: 'min(90vw, 400px)',
                            aspectRatio: '1',
                            cursor: isDragging ? 'grabbing' : 'grab' // visual feedback
                        }}
                    >
                        {/* Render Walls/Paths */}
                        {maze.grid.map((row, y) => (
                            row.map((cell, x) => {
                                const isExplored = exploredCells.has(`${x}-${y}`);
                                // Current vision radius for simple lighting effect (optional, implies "flashlight")
                                const distSq = (x - playerPos.x) ** 2 + (y - playerPos.y) ** 2;
                                const isVisible = distSq <= 9; // radius 3 squared

                                // Fog Logic:
                                // If not explored -> Black
                                // If explored but not visible -> Dimmed
                                // If visible -> Bright

                                if (!isExplored) {
                                    return <div key={`${x}-${y}`} className="w-full h-full bg-black" />;
                                }

                                return (
                                    <div
                                        key={`${x}-${y}`}
                                        className={`w-full h-full select-none transition-all duration-300 ${cell === 1
                                            ? isVisible ? 'bg-slate-700 border-[0.5px] border-white/10' : 'bg-slate-900 border-[0.5px] border-white/5'
                                            : isVisible ? 'bg-slate-800/80' : 'bg-slate-950/80'
                                            } ${!isVisible ? 'brightness-[0.4] grayscale' : ''}`}
                                    />
                                );
                            })
                        ))}

                        {/* Start Marker */}
                        <div
                            className="absolute bg-green-500/50 flex items-center justify-center text-[10px] text-white font-bold pointer-events-none"
                            style={{
                                width: `${100 / maze.width}%`,
                                height: `${100 / maze.height}%`,
                                left: `${(maze.start[0] / maze.width) * 100}%`,
                                top: `${(maze.start[1] / maze.height) * 100}%`,
                            }}
                        >S</div>

                        {/* End Marker */}
                        <div
                            className="absolute bg-red-500/50 flex items-center justify-center text-[10px] text-white font-bold animate-pulse pointer-events-none"
                            style={{
                                width: `${100 / maze.width}%`,
                                height: `${100 / maze.height}%`,
                                left: `${(maze.end[0] / maze.width) * 100}%`,
                                top: `${(maze.end[1] / maze.height) * 100}%`,
                            }}
                        >E</div>

                        {/* Player */}
                        <motion.div
                            layout
                            className="absolute z-10 p-[2px] pointer-events-none flex items-center justify-center"
                            animate={{
                                left: `${(playerPos.x / maze.width) * 100}%`,
                                top: `${(playerPos.y / maze.height) * 100}%`,
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            style={{
                                width: `${100 / maze.width}%`,
                                height: `${100 / maze.height}%`,
                            }}
                        >
                            {/* Animated Character */}
                            <div className={`w-full h-full relative transition-transform duration-200 ${lastFacing === -1 ? '-scale-x-100' : 'scale-x-100'
                                }`}>
                                {/* Simple Pixel Art Style Hero SVG */}
                                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md overflow-visible">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>

                                    {/* Body Bounce Animation */}
                                    <g className={`${(isMoving || holdingDirection || isDragging) ? 'animate-bounce-fast' : 'animate-float'}`}>
                                        {/* Legs */}
                                        <rect x="35" y="70" width="10" height="20" fill="#334155" rx="2" />
                                        <rect x="55" y="70" width="10" height="20" fill="#334155" rx="2" />

                                        {/* Body */}
                                        <rect x="30" y="40" width="40" height="35" fill="#06b6d4" rx="5" filter="url(#glow)" />

                                        {/* Head */}
                                        <rect x="25" y="15" width="50" height="35" fill="#e2e8f0" rx="6" />

                                        {/* Visor/Eyes */}
                                        <rect x="35" y="25" width="30" height="10" fill="#0f172a" rx="2" />
                                        <circle cx="42" cy="30" r="2" fill="#06b6d4" className="animate-pulse" />
                                        <circle cx="58" cy="30" r="2" fill="#06b6d4" className="animate-pulse" />

                                        {/* Backpack/Jetpack */}
                                        <rect x="20" y="45" width="10" height="20" fill="#64748b" rx="2" />
                                    </g>
                                </svg>

                                {/* Dust particles when moving */}
                                {(isMoving || holdingDirection || isDragging) && (
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center gap-1 opacity-50">
                                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                                        <div className="w-1 h-1 bg-white rounded-full animate-ping delay-75" />
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Win Overlay */}
                        <AnimatePresence>
                            {gameState === 'won' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 text-center p-4 border-2 border-yellow-500/50 rounded-lg backdrop-blur-xl"
                                >
                                    <FaTrophy className="text-5xl text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                    <h2 className="text-3xl font-black text-white mb-2">{t('game.you_win')}!</h2>

                                    <div className="bg-white/10 p-4 rounded-lg mb-6 w-full max-w-[200px] text-sm font-mono text-left space-y-1">
                                        <div className="flex justify-between text-cyan-300">
                                            <span>{t('game.moves')}:</span>
                                            <span>{moves}</span>
                                        </div>
                                        <div className="flex justify-between text-pink-300">
                                            <span>{t('game.time')}:</span>
                                            <span>{timeElapsed}s</span>
                                        </div>
                                        <div className="h-[1px] bg-white/20 my-2" />
                                        <div className="flex justify-between text-yellow-400 font-bold text-lg">
                                            <span>Score:</span>
                                            <span>{moves}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={fetchMaze}
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-2 rounded-full transform hover:scale-105 transition-transform cursor-pointer pointer-events-auto"
                                    >
                                        {t('game.play_again')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Controls (Virtual D-Pad) */}
                    <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
                        <div />
                        <button
                            className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                            onPointerDown={(e) => { e.preventDefault(); startMoving(0, -1); }}
                            onPointerUp={stopMoving}
                            onPointerLeave={stopMoving}
                        >
                            <FaArrowUp />
                        </button>
                        <div />

                        <button
                            className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                            onPointerDown={(e) => { e.preventDefault(); startMoving(-1, 0); }}
                            onPointerUp={stopMoving}
                            onPointerLeave={stopMoving}
                        >
                            <FaArrowLeft />
                        </button>
                        <button
                            className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                            onPointerDown={(e) => { e.preventDefault(); startMoving(0, 1); }}
                            onPointerUp={stopMoving}
                            onPointerLeave={stopMoving}
                        >
                            <FaArrowDown />
                        </button>
                        <button
                            className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                            onPointerDown={(e) => { e.preventDefault(); startMoving(1, 0); }}
                            onPointerUp={stopMoving}
                            onPointerLeave={stopMoving}
                        >
                            <FaArrowRight />
                        </button>
                    </div>

                    <div className="mt-4 text-center text-white/50 text-xs hidden md:block">
                        {t('game.use_mouse')}
                    </div>
                </div>

                {/* Back Face (Rules) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col p-8 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <GradientHeading gradient="cyan-blue" level={2}>
                            {t('game.maze')} - {t('game.arcade_zone')}
                        </GradientHeading>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-white text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 text-left">
                        <section>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">🌀 {t('game.maze')}</h3>
                            <p className="text-white/80 leading-relaxed">
                                {t('game.maze_rules')}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">🎮</span>
                                <h4 className="font-bold text-white mb-1">{t('game.controls')}</h4>
                                <p className="text-sm text-white/60">{t('game.use_mouse')}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">⏱️</span>
                                <h4 className="font-bold text-white mb-1">{t('game.time')}</h4>
                                <p className="text-sm text-white/60">{t('game.match3_speed')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
