/**
 * MazeControls - Mobile D-Pad controls for maze game
 */

import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface MazeControlsProps {
    onStartMoving: (dx: number, dy: number) => void;
    onStopMoving: () => void;
}

export function MazeControls({ onStartMoving, onStopMoving }: MazeControlsProps) {
    return (
        <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
            <div />
            <button
                className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); onStartMoving(0, -1); }}
                onPointerUp={onStopMoving}
                onPointerLeave={onStopMoving}
            >
                <FaArrowUp />
            </button>
            <div />

            <button
                className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); onStartMoving(-1, 0); }}
                onPointerUp={onStopMoving}
                onPointerLeave={onStopMoving}
            >
                <FaArrowLeft />
            </button>
            <button
                className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); onStartMoving(0, 1); }}
                onPointerUp={onStopMoving}
                onPointerLeave={onStopMoving}
            >
                <FaArrowDown />
            </button>
            <button
                className="w-14 h-14 bg-white/10 active:bg-cyan-500/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 select-none touch-manipulation"
                onPointerDown={(e) => { e.preventDefault(); onStartMoving(1, 0); }}
                onPointerUp={onStopMoving}
                onPointerLeave={onStopMoving}
            >
                <FaArrowRight />
            </button>
        </div>
    );
}
