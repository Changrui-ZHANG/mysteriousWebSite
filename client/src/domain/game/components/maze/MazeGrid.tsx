/**
 * MazeGrid - Renders the maze grid with fog of war
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaTrophy } from 'react-icons/fa';
import { MAZE_CONFIG, type MazeData, type GameState } from '../../hooks/useMazeGame';
import { MazePlayer } from './MazePlayer';

interface MazeGridProps {
    maze: MazeData;
    playerPos: { x: number; y: number };
    gameState: GameState;
    moves: number;
    timeElapsed: string;
    exploredCells: Set<string>;
    lastFacing: 1 | -1;
    isMoving: boolean;
    holdingDirection: { dx: number; dy: number } | null;
    isDragging: boolean;
    gridRef: React.RefObject<HTMLDivElement>;
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerMove: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPlayAgain: () => void;
}

export function MazeGrid({
    maze,
    playerPos,
    gameState,
    moves,
    timeElapsed,
    exploredCells,
    lastFacing,
    isMoving,
    holdingDirection,
    isDragging,
    gridRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPlayAgain,
}: MazeGridProps) {
    const { t } = useTranslation();

    return (
        <div
            ref={gridRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="relative bg-black border-4 border-cyan-900 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.5)] overflow-hidden touch-none"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${maze.width}, 1fr)`,
                width: 'min(90vw, 400px)',
                aspectRatio: '1',
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
        >
            {/* Render Walls/Paths */}
            {maze.grid.map((row, y) => (
                row.map((cell, x) => {
                    const isExplored = exploredCells.has(`${x}-${y}`);
                    const distSq = (x - playerPos.x) ** 2 + (y - playerPos.y) ** 2;
                    const isVisible = distSq <= MAZE_CONFIG.FOG_VISION_RADIUS * MAZE_CONFIG.FOG_VISION_RADIUS;

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
            <MazePlayer
                playerPos={playerPos}
                maze={maze}
                lastFacing={lastFacing}
                isMoving={isMoving}
                holdingDirection={holdingDirection}
                isDragging={isDragging}
            />

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
                                <span>{t('game.score')}:</span>
                                <span>{moves}</span>
                            </div>
                        </div>

                        <button
                            onClick={onPlayAgain}
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-6 py-2 rounded-full transform hover:scale-105 transition-transform cursor-pointer pointer-events-auto"
                        >
                            {t('game.play_again')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
