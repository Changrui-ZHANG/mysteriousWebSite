import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaTrophy } from 'react-icons/fa';

interface MazeGameProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest: { score: number; attempts?: number } | null;
}

interface MazeData {
    grid: number[][];
    start: number[];
    end: number[];
    width: number;
    height: number;
}

export default function MazeGame({ isDarkMode, onSubmitScore, personalBest }: MazeGameProps) {
    const { t } = useTranslation();
    const [maze, setMaze] = useState<MazeData | null>(null);
    const [playerPos, setPlayerPos] = useState<{ x: number; y: number } | null>(null);
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'won'>('loading');
    const [moves, setMoves] = useState(0);
    const [startTime, setStartTime] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);

    const fetchMaze = async () => {
        setGameState('loading');
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
            }
        } catch (err) {
            console.error("Failed to load maze", err);
        }
    };

    useEffect(() => {
        fetchMaze();
    }, []);

    const tryMoveTo = useCallback((targetX: number, targetY: number) => {
        if (gameState !== 'playing' || !maze || !playerPos) return;

        // Check bounds
        if (targetX < 0 || targetX >= maze.width || targetY < 0 || targetY >= maze.height) return;

        // Check wall
        if (maze.grid[targetY][targetX] === 1) return;

        // Check adjacency (only allowing 1 step at a time for smooth pathing)
        const dx = Math.abs(targetX - playerPos.x);
        const dy = Math.abs(targetY - playerPos.y);

        if (dx + dy <= 1) {
            if (dx + dy === 1) {
                setPlayerPos({ x: targetX, y: targetY });
                setMoves(prev => prev + 1);

                // Win check
                if (targetX === maze.end[0] && targetY === maze.end[1]) {
                    setGameState('won');
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
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing' || !playerPos) return;

            // Support Arrow Keys, WASD (Qwerty), and ZQSD (Azerty)
            const key = e.key.toLowerCase();
            let tx = playerPos.x;
            let ty = playerPos.y;

            if (['arrowup', 'w', 'z'].includes(key)) {
                ty -= 1;
            } else if (['arrowdown', 's'].includes(key)) {
                ty += 1;
            } else if (['arrowleft', 'a', 'q'].includes(key)) {
                tx -= 1;
            } else if (['arrowright', 'd'].includes(key)) {
                tx += 1;
            }

            // Only try move if coordinates changed
            if (tx !== playerPos.x || ty !== playerPos.y) {
                tryMoveTo(tx, ty);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState, playerPos, tryMoveTo]);

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

    const handleManualMove = (dx: number, dy: number) => {
        if (!playerPos) return;
        // recalculate position based on current state (which might be stale in interval if not careful, but useEffect rebuilds)
        // Actually, for interval to work with fresh state, better to use functional update or ref for pos.
        // But since we include playerPos in dependency array of useEffect, the effect will restart on every move.
        // This is safe but might be slightly jittery if interval is fast. 100ms is slow enough.
        // Better approach: Use a ref for playerPos to read inside interval? 
        // Or just let the component re-render. With 100ms, re-rendering is fine.
        tryMoveTo(playerPos.x + dx, playerPos.y + dy);
    };

    if (!maze || !playerPos) return <div className="text-center p-10 text-xl font-bold animate-pulse text-cyan-500">{t('game.loading')}...</div>;

    const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    // const currentScore = Math.max(0, 5000 - Math.floor(((Date.now() - startTime) / 1000) * 10) - (moves * 2));

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-4 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} backdrop-blur-md rounded-xl border border-white/20 select-none`}>

            {/* Header */}
            <div className="flex justify-between w-full max-w-[500px] mb-4 items-end">
                <div className="flex flex-col gap-1">
                    <div className="text-xl font-bold font-mono text-cyan-400">{t('game.moves')}: {moves}</div>
                    {personalBest && (
                        <div className="text-xs font-mono text-yellow-500/80">
                            {t('game.best')}: {personalBest.score} {t('game.moves') || 'steps'}
                        </div>
                    )}
                </div>
                <button
                    onClick={fetchMaze}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
                >
                    {t('game.new_maze')}
                </button>
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
                    layout // Re-enable layout animation for smooth transitions between grid cells
                    className="absolute z-10 p-[2px] pointer-events-none" // pointer-events-none so drags pass through to grid
                    animate={{
                        left: `${(playerPos.x / maze.width) * 100}%`,
                        top: `${(playerPos.y / maze.height) * 100}%`,
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }} // Faster, tighter spring for responsive feel
                    style={{
                        width: `${100 / maze.width}%`,
                        height: `${100 / maze.height}%`,
                    }}
                >
                    <div className="w-full h-full bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] flex items-center justify-center text-[8px] text-black font-bold">
                        P
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
    );
}
