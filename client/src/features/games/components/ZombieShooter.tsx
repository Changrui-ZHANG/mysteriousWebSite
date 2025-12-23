import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useState, useMemo } from 'react';
import { useMute } from '../../../hooks/useMute';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useTheme } from '../../../hooks/useTheme';
import { FaQuestion, FaArrowLeft, FaArrowRight, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { RulesPage } from '../zombie/components/RulesPage';
import { GameScene } from '../zombie/GameScene';
import { SuperRewardModal } from '../zombie/components/SuperRewardModal';
import { SuperUpgrade } from '../zombie/types';
import { ZombieShooterProps } from '../zombie/types';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useFullScreen } from '../../../hooks/useFullScreen';
import ElasticSlider from '../../../components/ElasticSlider/ElasticSlider';
import { useRef } from 'react';

// ===== WEAPON INITIAL VALUES =====
const WEAPON_DEFAULTS = {
    /** Starting weapon count */
    COUNT: 1,
    /** Starting fire delay (seconds) */
    DELAY: 0.3,
    /** Starting tech level */
    TECH: 0,
    /** Starting base damage */
    DAMAGE: 50,
    /** Starting bounce count */
    BOUNCE: 1,
    /** Starting critical hit chance (%) */
    CRIT_CHANCE: 5,
    /** Starting critical bonus (%) */
    CRIT_BONUS: 100,
    /** Minimum fire delay (seconds) */
    MIN_DELAY: 0.05,
};

// ===== ZOMBIE DEFAULTS =====
const ZOMBIE_DEFAULTS = {
    /** Starting zombie HP */
    HP: 100,
};

// ===== NOTIFICATION CONFIGURATION =====
const NOTIFICATION_CONFIG = {
    /** Duration notifications stay on screen (ms) */
    DURATION: 3000,
} as const;

// ===== AUDIO CONFIGURATION =====
const AUDIO_CONFIG = {
    /** Background music URL */
    BGM_URL: 'https://cdn.pixabay.com/audio/2024/11/07/audio_6e5f80971b.mp3',
} as const;

// ===== SUPER UPGRADES =====
const SUPER_UPGRADES = [
    { id: 'dmg_50', name: 'Surcharge I', description: 'Dégâts de base +50%', icon: '🚀', type: 'damage_mult' as const, value: 1.5 },
    { id: 'dmg_100', name: 'Surcharge II', description: 'Doube vos dégâts de base (x2)', icon: '⚡', type: 'damage_mult' as const, value: 2.0 },
    { id: 'crit_b_50', name: 'Lames de Rasoir', description: 'Bonus de Critique +50%', icon: '🎯', type: 'crit_bonus' as const, value: 50 },
    { id: 'crit_b_150', name: 'Exécuteur D\'Élite', description: 'Bonus de Critique +150%', icon: '💀', type: 'crit_bonus' as const, value: 150 },
    { id: 'fire_50', name: 'Tempête de Plomb', description: 'Cadence de tir doublée (-50% délai)', icon: '🔥', type: 'fire_rate' as const, value: 0.5 },
    { id: 'homing_shot', name: 'Pistage Tactique', description: 'Les balles cherchent automatiquement les ennemis', icon: '🎯', type: 'homing' as const, value: 1 },
] as const;

// ===== UPGRADE SELECTION =====
const UPGRADE_CONFIG = {
    /** Number of upgrade choices presented */
    CHOICES_COUNT: 3,
} as const;

export default function ZombieShooter({ isDarkMode, onSubmitScore, personalBest, onGameStart }: ZombieShooterProps) {
    const theme = useTheme(isDarkMode);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);

    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
    const [score, setScore] = useState(0);
    const [weaponCount, setWeaponCount] = useState<number>(WEAPON_DEFAULTS.COUNT);
    const [weaponDelay, setWeaponDelay] = useState<number>(WEAPON_DEFAULTS.DELAY);
    const [weaponTech, setWeaponTech] = useState<number>(WEAPON_DEFAULTS.TECH);
    const [weaponDamage, setWeaponDamage] = useState<number>(WEAPON_DEFAULTS.DAMAGE);
    const [weaponBounce, setWeaponBounce] = useState<number>(WEAPON_DEFAULTS.BOUNCE);
    const [isHoming, setIsHoming] = useState(false);
    const [critChance, setCritChance] = useState<number>(WEAPON_DEFAULTS.CRIT_CHANCE);
    const [dangerLevel, setDangerLevel] = useState(0);
    const [wave, setWave] = useState(1);
    const [kills, setKills] = useState(0);
    const [zombieHp, setZombieHp] = useState<number>(ZOMBIE_DEFAULTS.HP);
    const [gameId, setGameId] = useState(0);

    useBGM(AUDIO_CONFIG.BGM_URL, !isMuted && gameState === 'playing' && !isFlipped, volume);
    const [critBonus, setCritBonus] = useState<number>(WEAPON_DEFAULTS.CRIT_BONUS);
    const [isPickingUpgrade, setIsPickingUpgrade] = useState(false);
    const [upgradeChoices, setUpgradeChoices] = useState<SuperUpgrade[]>([]);
    const [notifications, setNotifications] = useState<{ id: number; text: string; color: string }[]>([]);
    const [mobileMoveHandlers, setMobileMoveHandlers] = useState<{ moveLeft: (on: boolean) => void, moveRight: (on: boolean) => void } | null>(null);

    const superUpgrades = useMemo(() => [...SUPER_UPGRADES], []);

    const addNotification = (text: string, color: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, text, color }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, NOTIFICATION_CONFIG.DURATION);
    };

    const handleStart = () => {
        onGameStart?.();
        setScore(1);
        setWeaponCount(WEAPON_DEFAULTS.COUNT);
        setWeaponDelay(WEAPON_DEFAULTS.DELAY);
        setWeaponTech(WEAPON_DEFAULTS.TECH);
        setWeaponDamage(WEAPON_DEFAULTS.DAMAGE);
        setWeaponBounce(WEAPON_DEFAULTS.BOUNCE);
        setIsHoming(false);
        setCritChance(WEAPON_DEFAULTS.CRIT_CHANCE);
        setCritBonus(WEAPON_DEFAULTS.CRIT_BONUS);
        setIsPickingUpgrade(false);
        setDangerLevel(0);
        setWave(1);
        setKills(0);
        setZombieHp(ZOMBIE_DEFAULTS.HP);
        setNotifications([]);
        setGameState('playing');
        setGameId(prev => prev + 1);
        playSound('click');
    };

    const handleGameOver = () => {
        if (score > 0) onSubmitScore(score);
    };

    const handleShowSuperRewards = () => {
        const shuffled = [...superUpgrades].sort(() => Math.random() - 0.5);
        setUpgradeChoices(shuffled.slice(0, UPGRADE_CONFIG.CHOICES_COUNT));
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
                setWeaponDelay(prev => Math.max(WEAPON_DEFAULTS.MIN_DELAY, prev * upgrade.value));
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
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isFullScreen ? 'bg-black overflow-auto py-8' : ''}`} style={{ perspective: '1000px' }}>
            {/* EXTERNAL GLOBAL CONTROLS */}
            <div className="flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 z-[100] rounded-t-xl mx-4 mt-4">
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider
                        defaultValue={volume * 100}
                        onChange={(v) => setVolume(v / 100)}
                        color="cyan"
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                    />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); handleStart(); }}
                    className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title="Recommencer"
                >
                    <FaRedo size={18} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
                >
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title="Aide / Règles"
                >
                    <FaQuestion size={18} />
                </button>
            </div>

            <motion.div
                className="flex-1 h-full relative mx-4 mb-4"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE: GAME + HUD */}
                <div
                    className={`absolute inset-0 w-full h-full bg-black overflow-hidden border border-white/20 rounded-b-xl ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`}
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
                        onStart={handleStart}
                    />


                </div>

                {/* BACK FACE: RULES */}
                <div
                    className={`absolute inset-0 w-full h-full border border-white/20 rounded-xl overflow-hidden ${theme.bgCard} ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        zIndex: isFlipped ? 10 : 0
                    }}
                >
                    <RulesPage onBack={() => setIsFlipped(false)} />
                </div>
            </motion.div>

            {/* MOBILE NAVIGATION CONTROLS - External to game screen */}
            {gameState === 'playing' && !isPickingUpgrade && !isFlipped && (
                <div className="flex justify-center gap-12 pb-6 md:hidden mx-4">
                    <button
                        className="w-16 h-16 bg-cyan-500/10 active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 backdrop-blur-md border border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        onTouchStart={() => { mobileMoveHandlers?.moveLeft(true); playSound('click'); }}
                        onTouchEnd={() => mobileMoveHandlers?.moveLeft(false)}
                        onMouseDown={() => mobileMoveHandlers?.moveLeft(true)}
                        onMouseUp={() => mobileMoveHandlers?.moveLeft(false)}
                    >
                        <FaArrowLeft size={28} />
                    </button>
                    <button
                        className="w-16 h-16 bg-cyan-500/10 active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 backdrop-blur-md border border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        onTouchStart={() => { mobileMoveHandlers?.moveRight(true); playSound('click'); }}
                        onTouchEnd={() => mobileMoveHandlers?.moveRight(false)}
                        onMouseDown={() => mobileMoveHandlers?.moveRight(true)}
                        onMouseUp={() => mobileMoveHandlers?.moveRight(false)}
                    >
                        <FaArrowRight size={28} />
                    </button>
                </div>
            )}
        </div>
    );
}

// Re-export type if needed for consumers, though usually they import component
export type { ZombieShooterProps };
