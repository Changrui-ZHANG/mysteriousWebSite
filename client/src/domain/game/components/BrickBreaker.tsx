/**
 * BrickBreaker - Main brick breaker game component
 */

import { useRef, useState } from 'react';
import { useSound } from '../../../shared/hooks/useSound';
import { useMute } from '../../../shared/hooks/useMute';
import { useBrickBreaker } from '../hooks/useBrickBreaker';
import { useBrickBreakerEngine } from '../hooks/useBrickBreakerEngine';
import { GameWindow } from './GameWindow';
import { HUDItem } from './GameHUD';
import {
    MapSelector,
    BrickBreakerRules,
    BrickBreakerOverlay,
    AUDIO_CONFIG,
    LEVEL_CONFIG,
    PADDLE_CONFIG,
} from './brickbreaker/index';
import type { BrickBreakerProps } from './BrickBreakerProps';

export default function BrickBreaker({
    onSubmitScore,
    personalBest,
    isAuthenticated,
    isAdmin = false,
    isSuperAdmin = false,
}: BrickBreakerProps) {
    const { isMuted } = useMute();
    const { playSound } = useSound(!isMuted);
    const paddleWidthRef = useRef<number>(PADDLE_CONFIG.DEFAULT_WIDTH);
    const [isFlipped, setIsFlipped] = useState(false);

    const game = useBrickBreaker({ onSubmitScore, isAuthenticated, playSound });

    useBrickBreakerEngine({
        canvasRef: game.canvasRef,
        containerRef: game.containerRef,
        paddleWidthRef,
        paddleWidthTimeoutRef: game.paddleWidthTimeoutRef,
        gameState: game.gameState,
        setGameState: game.setGameState,
        setPoints: game.setPoints,
        selectedMap: game.selectedMap,
        randomMapData: game.randomMapData,
        playSound,
    });

    return (
        <>
            <GameWindow
                gameTitle="BRICK BREAKER"
                color="cyan"
                bgmUrl={AUDIO_CONFIG.BGM_URL}
                bgmEnabled={game.gameState === 'playing'}
                onReset={game.handleReset}
                showReset={game.gameState === 'playing'}
                containerRef={game.containerRef}
                isFlipped={isFlipped}
                onFlipChange={setIsFlipped}
                gameStatus={true}
                bgGradient="bg-gradient-to-b from-cyan-900/50 to-slate-900/80"
                hud={{
                    score: game.score,
                    attempts: LEVEL_CONFIG.LEVEL_COUNT,
                    personalBest,
                    customInfo: <HUDItem label="Points" value={game.points} />,
                    compact: true,
                }}
                rulesContent={<BrickBreakerRules onClose={() => setIsFlipped(false)} />}
            >
                <canvas ref={game.canvasRef} className="w-full h-full block touch-action-none" />
                <BrickBreakerOverlay
                    gameState={game.gameState}
                    selectedMap={game.selectedMap}
                    score={game.score}
                    unlockedMaps={game.unlockedMaps}
                    isLoadingMap={game.isLoadingMap}
                    onShowMapSelector={() => game.setShowMapSelector(true)}
                    onStartGame={() => game.handleStartGame()}
                    onNextLevel={game.handleNextLevel}
                />
            </GameWindow>

            <MapSelector
                isOpen={game.showMapSelector}
                selectedMap={game.selectedMap}
                unlockedMaps={game.unlockedMaps}
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                isLoadingMap={game.isLoadingMap}
                onSelectMap={game.setSelectedMap}
                onClose={() => game.setShowMapSelector(false)}
                onStartGame={() => game.handleStartGame()}
                playSound={playSound}
            />
        </>
    );
}
