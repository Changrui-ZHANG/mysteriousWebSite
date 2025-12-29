import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useState, useRef } from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { FaQuestion, FaArrowLeft, FaArrowRight, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import ElasticSlider from '../../../components/ui/ElasticSlider/ElasticSlider';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { RulesPanel } from '../zombie/components/RulesPanel';
import { GameScene } from '../zombie/GameScene';
import { SuperRewardModal } from '../zombie/components/SuperRewardModal';
import { useZombieShooter } from '../zombie/hooks/useZombieShooter';
import type { ZombieShooterProps } from '../zombie/types';

export default function ZombieShooter({ isDarkMode, onSubmitScore, personalBest, onGameStart }: ZombieShooterProps) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);
    const [isFlipped, setIsFlipped] = useState(false);

    const {
        isMuted, toggleMute, playSound, volume, setVolume,
        gameState, setGameState, score, setScore, gameId,
        weaponCount, setWeaponCount, weaponDelay, setWeaponDelay,
        weaponTech, setWeaponTech, weaponDamage, setWeaponDamage,
        weaponBounce, setWeaponBounce, isHoming, critChance, setCritChance, critBonus,
        dangerLevel, setDangerLevel, wave, setWave, kills, setKills, zombieHp, setZombieHp,
        isPickingUpgrade, upgradeChoices, handleShowSuperRewards, handleUpgradeSelect,
        notifications, addNotification, mobileMoveHandlers, setMobileMoveHandlers,
        handleStart, handleGameOver,
    } = useZombieShooter({ onSubmitScore, onGameStart, isFlipped });

    return (
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isFullScreen ? 'bg-black overflow-auto py-8' : ''}`} style={{ perspective: '1000px' }}>
            {/* Global Controls */}
            <div className="flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 z-[100] rounded-t-xl mx-4 mt-4">
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider defaultValue={volume * 100} onChange={(v) => setVolume(v / 100)} color="cyan" isMuted={isMuted} onToggleMute={toggleMute} />
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleStart(); }} className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.zombie_hud.restart')}><FaRedo size={18} /></button>
                <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}>{isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}</button>
                <button onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }} className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95" title={t('game.help_rules')}><FaQuestion size={18} /></button>
            </div>

            <motion.div className="flex-1 h-full relative mx-4 mb-4" animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6 }} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front Face: Game */}
                <div className={`absolute inset-0 w-full h-full bg-black overflow-hidden border border-white/20 rounded-b-xl ${isFlipped ? 'pointer-events-none' : 'pointer-events-auto'}`} style={{ backfaceVisibility: 'hidden', zIndex: isFlipped ? 0 : 10 }}>
                    <div className="absolute inset-0 w-full h-full cursor-none">
                        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 10, 15], fov: 45 }}>
                            <Suspense fallback={null}>
                                <World />
                                {gameState !== 'intro' && (
                                    <GameScene key={gameId} gameState={gameState} setGameState={setGameState} setScore={setScore}
                                        setWeaponCount={setWeaponCount} setWeaponDelay={setWeaponDelay} setWeaponTech={setWeaponTech}
                                        setWeaponDamage={setWeaponDamage} weaponBounce={weaponBounce} isHoming={isHoming}
                                        setWeaponBounce={setWeaponBounce} setCritChance={setCritChance} setDangerLevel={setDangerLevel}
                                        setWave={setWave} setKills={setKills} setZombieHp={setZombieHp} playSound={playSound}
                                        onGameOver={handleGameOver} isPaused={isFlipped || isPickingUpgrade}
                                        onNotification={addNotification} critBonus={critBonus}
                                        onShowSuperRewards={handleShowSuperRewards} onMobileButtons={setMobileMoveHandlers} />
                                )}
                            </Suspense>
                        </Canvas>
                    </div>
                    <SuperRewardModal isOpen={isPickingUpgrade} upgrades={upgradeChoices} onSelect={handleUpgradeSelect} />
                    {/* Notifications */}
                    <div className="absolute bottom-[40%] md:bottom-44 left-8 z-[70] pointer-events-none flex flex-col gap-2">
                        <AnimatePresence>
                            {notifications.map((n, i) => (
                                <motion.div key={n.id} initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: i === notifications.length - 1 ? 1 : 0.4 }} exit={{ x: 50, opacity: 0 }} transition={{ duration: 0.3 }}
                                    className="px-1.5 md:px-4 py-1 md:py-2 rounded-r-lg border-l-4 font-black italic tracking-tighter text-xs md:text-lg bg-black/60 backdrop-blur-sm"
                                    style={{ color: n.color, borderColor: n.color, textShadow: i === notifications.length - 1 ? `0 0 10px ${n.color}88` : 'none' }}>
                                    {n.text}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    <HUD gameState={gameState} score={score} personalBest={personalBest} weaponCount={weaponCount} weaponDelay={weaponDelay}
                        weaponTech={weaponTech} weaponDamage={weaponDamage} weaponBounce={weaponBounce} isHoming={isHoming}
                        critChance={critChance} critBonus={critBonus} dangerLevel={dangerLevel} wave={wave} kills={kills} zombieHp={zombieHp} onStart={handleStart} />
                </div>

                {/* Back Face: Rules */}
                <div className={`absolute inset-0 w-full h-full border border-white/20 rounded-xl overflow-hidden ${theme.bgCard} ${isFlipped ? 'pointer-events-auto' : 'pointer-events-none'}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', zIndex: isFlipped ? 10 : 0 }}>
                    <RulesPanel onBack={() => setIsFlipped(false)} />
                </div>
            </motion.div>

            {/* Mobile Controls */}
            {gameState === 'playing' && !isPickingUpgrade && !isFlipped && (
                <div className="flex justify-center gap-12 pb-6 md:hidden mx-4">
                    <button className="w-16 h-16 bg-cyan-500/10 active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 backdrop-blur-md border border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        onTouchStart={() => { mobileMoveHandlers?.moveLeft(true); playSound('click'); }} onTouchEnd={() => mobileMoveHandlers?.moveLeft(false)}
                        onMouseDown={() => mobileMoveHandlers?.moveLeft(true)} onMouseUp={() => mobileMoveHandlers?.moveLeft(false)}>
                        <FaArrowLeft size={28} />
                    </button>
                    <button className="w-16 h-16 bg-cyan-500/10 active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-400 backdrop-blur-md border border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        onTouchStart={() => { mobileMoveHandlers?.moveRight(true); playSound('click'); }} onTouchEnd={() => mobileMoveHandlers?.moveRight(false)}
                        onMouseDown={() => mobileMoveHandlers?.moveRight(true)} onMouseUp={() => mobileMoveHandlers?.moveRight(false)}>
                        <FaArrowRight size={28} />
                    </button>
                </div>
            )}
        </div>
    );
}

export type { ZombieShooterProps };
