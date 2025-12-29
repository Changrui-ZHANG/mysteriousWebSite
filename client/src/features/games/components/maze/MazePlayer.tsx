/**
 * MazePlayer - Animated player character for the maze game
 */

import { motion } from 'framer-motion';
import type { MazeData } from '../../hooks/useMazeGame';

interface MazePlayerProps {
    playerPos: { x: number; y: number };
    maze: MazeData;
    lastFacing: 1 | -1;
    isMoving: boolean;
    holdingDirection: { dx: number; dy: number } | null;
    isDragging: boolean;
}

export function MazePlayer({
    playerPos,
    maze,
    lastFacing,
    isMoving,
    holdingDirection,
    isDragging,
}: MazePlayerProps) {
    const isAnimating = isMoving || holdingDirection !== null || isDragging;

    return (
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
            <div className={`w-full h-full relative transition-transform duration-200 ${lastFacing === -1 ? '-scale-x-100' : 'scale-x-100'}`}>
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

                    <g className={isAnimating ? 'animate-bounce-fast' : 'animate-float'}>
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

                        {/* Backpack */}
                        <rect x="20" y="45" width="10" height="20" fill="#64748b" rx="2" />
                    </g>
                </svg>

                {/* Dust particles when moving */}
                {isAnimating && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full flex justify-center gap-1 opacity-50">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                        <div className="w-1 h-1 bg-white rounded-full animate-ping delay-75" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}
