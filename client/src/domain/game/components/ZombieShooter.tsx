/**
 * ZombieShooter - 3D zombie shooter game using GameWindow
 */

import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense, useState, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { GameWindow } from './GameWindow';
import { HUD } from '../zombie/components/HUD';
import { World } from '../zombie/components/World';
import { RulesPanel } from '../zombie/components/RulesPanel';
import { GameScene } from '../zombie/GameScene';
import { SuperRewardModal } from '../zombie/components/SuperRewardModal';
import { useZombieShooter } from '../zombie/hooks/useZombieShooter';
import type { ZombieShooterProps } from '../zombie/types';

export default function ZombieShooter({ onSubmitScore, personalBest, onGameStart }: ZombieShooterProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const {
        playSound, gameState, setGameState, score, setScore, gameId,
        weaponCount, setWeaponCount, weaponDelay, setWeaponDelay,
        weaponTech, setWeaponTech, weaponDamage, setWeaponDamage,
        weaponBounce, setWeaponBounce, isHoming, critChance, setCritChance, critBonus,
        dangerLevel, setDangerLevel, wave, setWave, kills, setKills, zombieHp, setZombieHp,
        isPickingUpgrade, upgradeChoices, handleShowSuperRewards, handleUpgradeSelect,
        notifications, addNotification, mobileMoveHandlers, setMobileMoveHandlers,
        handleStart, handleGameOver,
    } = useZombieShooter({ onSubmitScore, onGameStart, isFlipped });

    const gameContent = (
        <div className="relative w-full h-full bg-black overflow-hidden">
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
            <div className="absolute bottom-[40%] md:bottom-44 left-8 z-50 pointer-events-none flex flex-col gap-2">
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
    );

    const mobileControls = gameState === 'playing' && !isPickingUpgrade && !isFlipped && mobileMoveHandlers && (
        <div className="flex justify-center gap-8 md:gap-12 pb-4 md:pb-6 md:hidden px-4">
            <button 
                className="w-14 h-14 md:w-16 md:h-16 bg-cyan-500/20 dark:bg-cyan-500/10 active:bg-cyan-500/50 dark:active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 backdrop-blur-md border border-cyan-500/40 dark:border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-200 hover:scale-105 active:scale-95"
                onTouchStart={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveLeft(true); 
                    playSound('click'); 
                }} 
                onTouchEnd={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveLeft(false); 
                }}
                onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveLeft(true); 
                }} 
                onMouseUp={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveLeft(false); 
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'manipulation' }}
            >
                <FaArrowLeft size={24} className="md:hidden" />
                <FaArrowLeft size={28} className="hidden md:block" />
            </button>
            <button 
                className="w-14 h-14 md:w-16 md:h-16 bg-cyan-500/20 dark:bg-cyan-500/10 active:bg-cyan-500/50 dark:active:bg-cyan-500/40 rounded-2xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 backdrop-blur-md border border-cyan-500/40 dark:border-cyan-500/30 select-none touch-manipulation shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-200 hover:scale-105 active:scale-95"
                onTouchStart={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveRight(true); 
                    playSound('click'); 
                }} 
                onTouchEnd={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveRight(false); 
                }}
                onMouseDown={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveRight(true); 
                }} 
                onMouseUp={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation();
                    mobileMoveHandlers.moveRight(false); 
                }}
                onContextMenu={(e) => e.preventDefault()}
                style={{ touchAction: 'manipulation' }}
            >
                <FaArrowRight size={24} className="md:hidden" />
                <FaArrowRight size={28} className="hidden md:block" />
            </button>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col">
            <GameWindow
                gameTitle="ZOMBIE SHOOTER"
                color="cyan"
                onReset={handleStart}
                showReset={gameState !== 'intro'}
                containerRef={containerRef}
                isFlipped={isFlipped}
                onFlipChange={setIsFlipped}
                fullscreenBg="bg-black"
                gameStatus={true}
                hud={gameState !== 'intro' ? {
                    score,
                    personalBest,
                    customInfo: (
                        <div className="flex items-center gap-3 text-xs">
                            <span>WAVE: {wave}</span>
                            <span>KILLS: {kills}</span>
                            <span>WEAPONS: {weaponCount}</span>
                        </div>
                    )
                } : undefined}
                rulesContent={<RulesPanel onBack={() => setIsFlipped(false)} />}
            >
                {gameContent}
            </GameWindow>
            {mobileControls}
        </div>
    );
}

export type { ZombieShooterProps };
