import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useState, useMemo } from 'react';
import { useMute } from '../../../hooks/useMute';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { RulesPage } from '../zombie/components/RulesPage';
import { GameScene } from '../zombie/GameScene';
import { SuperRewardModal } from '../zombie/components/SuperRewardModal';
import { SuperUpgrade } from '../zombie/types';
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
    const [weaponBounce, setWeaponBounce] = useState(1);
    const [isHoming, setIsHoming] = useState(false);
    const [critChance, setCritChance] = useState(5);
    const [dangerLevel, setDangerLevel] = useState(0);
    const [wave, setWave] = useState(1);
    const [kills, setKills] = useState(0);
    const [zombieHp, setZombieHp] = useState(100);
    const [isFlipped, setIsFlipped] = useState(false);
    const [gameId, setGameId] = useState(0);
    const [critBonus, setCritBonus] = useState(100);
    const [isPickingUpgrade, setIsPickingUpgrade] = useState(false);
    const [upgradeChoices, setUpgradeChoices] = useState<SuperUpgrade[]>([]);
    const [notifications, setNotifications] = useState<{ id: number; text: string; color: string }[]>([]);
    const [mobileMoveHandlers, setMobileMoveHandlers] = useState<{ moveLeft: (on: boolean) => void, moveRight: (on: boolean) => void } | null>(null);

    const superUpgrades = useMemo(() => [
        { id: 'dmg_50', name: 'Surcharge I', description: 'Dégâts de base +50%', icon: '🚀', type: 'damage_mult' as const, value: 1.5 },
        { id: 'dmg_100', name: 'Surcharge II', description: 'Doube vos dégâts de base (x2)', icon: '⚡', type: 'damage_mult' as const, value: 2.0 },
        { id: 'crit_b_50', name: 'Lames de Rasoir', description: 'Bonus de Critique +50%', icon: '🎯', type: 'crit_bonus' as const, value: 50 },
        { id: 'crit_b_150', name: 'Exécuteur D\'Élite', description: 'Bonus de Critique +150%', icon: '💀', type: 'crit_bonus' as const, value: 150 },
        { id: 'fire_50', name: 'Tempête de Plomb', description: 'Cadence de tir doublée (-50% délai)', icon: '🔥', type: 'fire_rate' as const, value: 0.5 },
        { id: 'homing_shot', name: 'Pistage Tactique', description: 'Les balles cherchent automatiquement les ennemis', icon: '🎯', type: 'homing' as const, value: 1 },
    ], []);

    const addNotification = (text: string, color: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, text, color }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    const handleStart = () => {
        onGameStart?.(); // Notify parent
        setScore(1);
        setWeaponCount(1);
        setWeaponDelay(0.3);
        setWeaponTech(0);
        setWeaponDamage(50);
        setWeaponBounce(1);
        setIsHoming(false);
        setCritChance(5);
        setCritBonus(100);
        setIsPickingUpgrade(false);
        setDangerLevel(0);
        setWave(1);
        setKills(0);
        setZombieHp(100);
        setNotifications([]);
        setGameState('playing');
        setGameId(prev => prev + 1);
        playSound('click');
    };

    const handleGameOver = () => {
        if (score > 0) onSubmitScore(score);
    };

    const handleShowSuperRewards = () => {
        // Shuffle and take 3
        const shuffled = [...superUpgrades].sort(() => Math.random() - 0.5);
        setUpgradeChoices(shuffled.slice(0, 4));
        setIsPickingUpgrade(true);
    };

    const handleUpgradeSelect = (upgrade: SuperUpgrade) => {
        switch (upgrade.type) {
            case 'damage_mult':
                setWeaponDamage(prev => Math.round(prev * upgrade.value));
                break;
            case 'crit_bonus':
                setCritBonus(prev => prev + upgrade.value);
                break;
            case 'fire_rate':
                setWeaponDelay(prev => Math.max(0.05, prev * upgrade.value));
                break;
            case 'tech':
                setWeaponTech(prev => prev + upgrade.value);
                break;
            case 'homing':
                setIsHoming(true);
                break;
        }
        addNotification(`INSTALLÉ : ${upgrade.name}`, "#22d3ee");
        setIsPickingUpgrade(false);
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
                                        weaponBounce={weaponBounce}
                                        isHoming={isHoming}
                                        setWeaponBounce={setWeaponBounce}
                                        setCritChance={setCritChance}
                                        setDangerLevel={setDangerLevel}
                                        setWave={setWave}
                                        setKills={setKills}
                                        setZombieHp={setZombieHp}
                                        playSound={playSound}
                                        onGameOver={handleGameOver}
                                        isPaused={isFlipped || isPickingUpgrade}
                                        onNotification={addNotification}
                                        critBonus={critBonus}
                                        onShowSuperRewards={handleShowSuperRewards}
                                        onMobileButtons={setMobileMoveHandlers}
                                    />
                                )}
                            </Suspense>
                        </Canvas>
                    </div>

                    <SuperRewardModal
                        isOpen={isPickingUpgrade}
                        upgrades={upgradeChoices}
                        onSelect={handleUpgradeSelect}
                    />

                    {/* NOTIFICATIONS LAYER */}
                    <div className="absolute bottom-[40%] md:bottom-44 left-8 z-[70] pointer-events-none flex flex-col gap-2">
                        <AnimatePresence>
                            {notifications.map((n, i) => (
                                <motion.div
                                    key={n.id}
                                    initial={{ x: -100, opacity: 0 }}
                                    animate={{
                                        x: 0,
                                        opacity: i === notifications.length - 1 ? 1 : 0.4
                                    }}
                                    exit={{ x: 50, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-1.5 md:px-4 py-1 md:py-2 rounded-r-lg border-l-4 font-black italic tracking-tighter text-xs md:text-lg bg-black/60 backdrop-blur-sm"
                                    style={{
                                        color: n.color,
                                        borderColor: n.color,
                                        textShadow: i === notifications.length - 1 ? `0 0 10px ${n.color}88` : 'none'
                                    }}
                                >
                                    {n.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>
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
                        weaponBounce={weaponBounce}
                        isHoming={isHoming}
                        critChance={critChance}
                        critBonus={critBonus}
                        dangerLevel={dangerLevel}
                        wave={wave}
                        kills={kills}
                        zombieHp={zombieHp}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                        setIsFlipped={setIsFlipped}
                        onStart={handleStart}
                    />

                    {/* MOBILE VIRTUAL BUTTONS - Tactical Navigation Pads */}
                    {gameState === 'playing' && !isPickingUpgrade && !isFlipped && (
                        <div className="absolute inset-x-0 bottom-0 h-40 z-50 pointer-events-none flex items-stretch px-4 pb-4">
                            <div
                                className="flex-1 pointer-events-auto group relative overflow-hidden rounded-l-2xl border-l border-t border-b border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-transparent backdrop-blur-sm"
                                onTouchStart={() => { mobileMoveHandlers?.moveLeft(true); playSound('click'); }}
                                onTouchEnd={() => mobileMoveHandlers?.moveLeft(false)}
                                onMouseDown={() => mobileMoveHandlers?.moveLeft(true)}
                                onMouseUp={() => mobileMoveHandlers?.moveLeft(false)}
                            >
                                <div className="absolute inset-0 bg-cyan-400/5 group-active:bg-cyan-400/20 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-lg border border-cyan-500/50 flex items-center justify-center rotate-45 group-active:scale-90 transition-transform bg-black/40">
                                            <span className="text-2xl text-cyan-400 -rotate-45 font-black">{"<"}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Corner Decoration */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400" />
                            </div>

                            <div className="w-4" /> {/* Gap for Center UI clearance */}

                            <div
                                className="flex-1 pointer-events-auto group relative overflow-hidden rounded-r-2xl border-r border-t border-b border-cyan-500/30 bg-gradient-to-bl from-cyan-900/20 to-transparent backdrop-blur-sm"
                                onTouchStart={() => { mobileMoveHandlers?.moveRight(true); playSound('click'); }}
                                onTouchEnd={() => mobileMoveHandlers?.moveRight(false)}
                                onMouseDown={() => mobileMoveHandlers?.moveRight(true)}
                                onMouseUp={() => mobileMoveHandlers?.moveRight(false)}
                            >
                                <div className="absolute inset-0 bg-cyan-400/5 group-active:bg-cyan-400/20 transition-colors" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 rounded-lg border border-cyan-500/50 flex items-center justify-center rotate-45 group-active:scale-90 transition-transform bg-black/40">
                                            <span className="text-2xl text-cyan-400 -rotate-45 font-black">{">"}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Corner Decoration */}
                                <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400" />
                            </div>
                        </div>
                    )}
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
