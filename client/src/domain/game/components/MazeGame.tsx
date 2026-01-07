import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClock } from 'react-icons/fa';
import { useSound } from '../../../shared/hooks/useSound';
import { useMute } from '../../../shared/hooks/useMute';
import { Button } from '../../../shared/components';
import { BGM_URLS } from '../../../shared/constants/urls';
import { useMazeGame } from '../hooks/useMazeGame';
import { MazeGrid, MazeControls, MazeRules } from './maze';
import { GameWindow } from './GameWindow';

interface MazeGameProps {
    onSubmitScore: (score: number) => void;
    personalBest: { score: number; attempts?: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function MazeGame({ onSubmitScore, personalBest, isAuthenticated, onGameStart }: MazeGameProps) {
    const { t } = useTranslation();
    const { isMuted } = useMute();
    const { playSound } = useSound(!isMuted);
    const gridRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const {
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
    } = useMazeGame({
        onSubmitScore,
        isAuthenticated,
        onGameStart,
        playSound,
    });

    // Keyboard controls
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
                setHoldingDirection(prev => {
                    if (prev?.dx === dx && prev?.dy === dy) return prev;
                    handleManualMove(dx, dy);
                    return { dx, dy };
                });
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            let dx = 0;
            let dy = 0;

            if (['arrowup', 'w', 'z'].includes(key)) dy = -1;
            else if (['arrowdown', 's'].includes(key)) dy = 1;
            else if (['arrowleft', 'a', 'q'].includes(key)) dx = -1;
            else if (['arrowright', 'd'].includes(key)) dx = 1;

            if (dx !== 0 || dy !== 0) {
                setHoldingDirection(prev => {
                    if (prev && prev.dx === dx && prev.dy === dy) return null;
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
    }, [gameState, handleManualMove, setHoldingDirection]);

    // Pointer handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        if (gameState !== 'playing') return;
        setIsDragging(true);
        handlePointerMove(e);
    };

    const handlePointerUp = () => setIsDragging(false);

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || !maze || !gridRef.current) return;
        e.preventDefault();

        const rect = gridRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellWidth = rect.width / maze.width;
        const cellHeight = rect.height / maze.height;

        const col = Math.floor(x / cellWidth);
        const row = Math.floor(y / cellHeight);

        tryMoveTo(col, row);
    };

    // Global pointer up
    useEffect(() => {
        const handleGlobalUp = () => setIsDragging(false);
        window.addEventListener('pointerup', handleGlobalUp);
        window.addEventListener('pointercancel', handleGlobalUp);
        return () => {
            window.removeEventListener('pointerup', handleGlobalUp);
            window.removeEventListener('pointercancel', handleGlobalUp);
        };
    }, [setIsDragging]);

    if (!maze || !playerPos) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl border border-cyan-500/20">
                <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-4 bg-cyan-500/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🧩</span>
                    </div>
                </div>
                <h2 className="text-cyan-400 font-black tracking-widest uppercase animate-pulse">
                    {t('game.loading')}...
                </h2>
                <p className="text-white/40 text-xs mt-2 font-mono">
                    GENERATING UNIQUE CHALLENGE
                </p>
            </div>
        );
    }

    const timeElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    return (
        <GameWindow
            color="cyan"
            bgmUrl={BGM_URLS.MAZE_GAME}
            onReset={fetchMaze}
            isFlipped={isFlipped}
            onFlipChange={setIsFlipped}
            rulesContent={<MazeRules onClose={() => setIsFlipped(false)} />}
        >
            <div
                className={`w-full h-full flex flex-col items-center justify-center p-4 select-none overflow-hidden`}
            >
                {/* Header */}
                <div className="flex justify-between w-full max-w-[500px] mb-4 items-end">
                    <div className="flex flex-col gap-1">
                        <div className="text-xl font-bold font-mono text-cyan-400">{t('game.moves')}: {moves}</div>
                        <div className={`text-sm font-bold font-mono flex items-center gap-2 transition-colors ${shiftTimer <= 3 ? 'text-red-500 animate-pulse' : 'text-pink-400'}`}>
                            <FaClock /> {t('game.next_shift')}: {shiftTimer}s
                        </div>
                        {personalBest && (
                            <div className="text-xs font-mono text-yellow-500/80">
                                {t('game.best')}: {personalBest.score} {t('game.moves')}
                            </div>
                        )}
                    </div>
                    <Button onClick={fetchMaze} color="cyan" size="sm">
                        {t('game.new_maze')}
                    </Button>
                </div>

                <MazeGrid
                    maze={maze}
                    playerPos={playerPos}
                    gameState={gameState}
                    moves={moves}
                    timeElapsed={timeElapsed}
                    exploredCells={exploredCells}
                    lastFacing={lastFacing}
                    isMoving={isMoving}
                    holdingDirection={holdingDirection}
                    isDragging={isDragging}
                    gridRef={gridRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPlayAgain={fetchMaze}
                />

                <MazeControls onStartMoving={startMoving} onStopMoving={stopMoving} />

                <div className="mt-4 text-center text-white/50 text-xs hidden md:block">
                    {t('game.use_mouse')}
                </div>
            </div>
        </GameWindow>
    );
}
