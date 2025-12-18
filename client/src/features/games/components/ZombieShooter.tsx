import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { Suspense, useState } from 'react';
import { useMute } from '../../../hooks/useMute';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { RulesPage } from '../zombie/components/RulesPage';
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
    const [weaponDamage, setWeaponDamage] = useState(50);
    const [dangerLevel, setDangerLevel] = useState(0);
    const [wave, setWave] = useState(1);
    const [kills, setKills] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [gameId, setGameId] = useState(0);

    const handleStart = () => {
        onGameStart?.(); // Notify parent
        setScore(0);
        setWeaponCount(1);
        setWeaponDelay(0.3);
        setWeaponTech(0);
        setWeaponDamage(50);
        setDangerLevel(0);
        setWave(1);
        setKills(0);
        setGameState('playing');
        setGameId(prev => prev + 1);
        playSound('click');
    };

    const handleGameOver = () => {
        if (score > 0) onSubmitScore(score);
    };

    return (
        <div className={`relative w-full h-full overflow-hidden rounded-xl border border-white/20 ${theme.bgCard}`} style={{ perspective: '1000px' }}>
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE: GAME + HUD */}
                <div
                    className={`absolute inset-0 w-full h-full bg-black overflow-hidden ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        zIndex: isFlipped ? 0 : 10
                    }}
                >
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
                                        setWeaponDamage={setWeaponDamage}
                                        setDangerLevel={setDangerLevel}
                                        setWave={setWave}
                                        setKills={setKills}
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
                        weaponDamage={weaponDamage}
                        dangerLevel={dangerLevel}
                        wave={wave}
                        kills={kills}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                        isFlipped={isFlipped}
                        setIsFlipped={setIsFlipped}
                        onStart={handleStart}
                        onFlip={() => setIsFlipped(true)}
                    />
                </div>

                {/* BACK FACE: RULES */}
                <div
                    className={`absolute inset-0 w-full h-full ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        zIndex: isFlipped ? 10 : 0
                    }}
                >
                    <RulesPage onBack={() => setIsFlipped(false)} />
                </div>
            </motion.div>
        </div>
    );
}

// Re-export type if needed for consumers, though usually they import component
export type { ZombieShooterProps };
