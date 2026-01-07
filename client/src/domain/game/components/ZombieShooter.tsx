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
    );

    const mobileControls = gameState === 'playing' && !isPickingUpgrade && !isFlipped && (
        <div className="flex justify-center gap-12 pb-6 md:hidden">
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
    );

    return (
        <div className="w-full h-full flex flex-col">
            <GameWindow
                color="cyan"
                onReset={handleStart}
                showReset={gameState !== 'intro'}
                containerRef={containerRef}
                isFlipped={isFlipped}
                onFlipChange={setIsFlipped}
                fullscreenBg="bg-black"
                rulesContent={<RulesPanel onBack={() => setIsFlipped(false)} />}
            >
                {gameContent}
            </GameWindow>
            {mobileControls}
        </div>
    );
}

export type { ZombieShooterProps };
