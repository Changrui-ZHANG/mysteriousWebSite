import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import { useMute } from '../../../hooks/useMute';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { GameScene } from '../zombie/GameScene';
import { ZombieShooterProps } from '../zombie/types';

export default function ZombieShooter({ isDarkMode, onSubmitScore, personalBest, onGameStart }: ZombieShooterProps) {
    const theme = useTheme(isDarkMode);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);

    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
    const [score, setScore] = useState(0);
    const [weaponCount, setWeaponCount] = useState(1);
    const [weaponDelay, setWeaponDelay] = useState(0.3);
    const [weaponTech, setWeaponTech] = useState(0);
    const [dangerLevel, setDangerLevel] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [gameId, setGameId] = useState(0);

    const handleStart = () => {
        onGameStart?.(); // Notify parent
        setScore(0);
        setWeaponCount(1);
        setWeaponDelay(0.3);
        setWeaponTech(0);
        setDangerLevel(0);
        setGameState('playing');
        setGameId(prev => prev + 1);
        playSound('click');
    };

    const handleGameOver = () => {
        if (score > 0) onSubmitScore(score);
    };

    return (
        <div className={`relative w-full h-full overflow-hidden rounded-xl border border-white/20 ${theme.bgCard}`}>

            {/* GAME LAYER */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute inset-0 w-full h-full cursor-none">
                    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 15], fov: 45 }}>
                        <Suspense fallback={null}>
                            <World />
                            {gameState !== 'intro' && (
                                <GameScene
                                    key={gameId}
                                    gameState={gameState}
                                    setGameState={setGameState}
                                    setScore={setScore}
                                    setWeaponCount={setWeaponCount}
                                    setWeaponDelay={setWeaponDelay}
                                    setWeaponTech={setWeaponTech}
                                    setDangerLevel={setDangerLevel}
                                    playSound={playSound}
                                    onGameOver={handleGameOver}
                                    isPaused={isFlipped}
                                />
                            )}
                        </Suspense>
                    </Canvas>
                </div>

                {/* UI LAYER */}
                <HUD
                    gameState={gameState}
                    score={score}
                    personalBest={personalBest}
                    weaponCount={weaponCount}
                    weaponDelay={weaponDelay}
                    weaponTech={weaponTech}
                    dangerLevel={dangerLevel}
                    isMuted={isMuted}
                    toggleMute={toggleMute}
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    onStart={handleStart}
                    onFlip={() => setIsFlipped(true)}
                />
            </div>
        </div>
    );
}

// Re-export type if needed for consumers, though usually they import component
export type { ZombieShooterProps };
