import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { FaVolumeMute, FaVolumeUp, FaQuestion } from 'react-icons/fa';


interface HUDProps {
    gameState: 'intro' | 'playing' | 'gameover';
    score: number;
    personalBest?: { score: number } | null;
    weaponCount: number;
    weaponDelay: number;
    weaponTech: number;
    weaponDamage: number;
    weaponBounce: number;
    isHoming: boolean;
    critChance: number;
    critBonus: number;
    dangerLevel: number;
    wave: number;
    kills: number;
    zombieHp: number;
    isMuted: boolean;
    toggleMute: () => void;
    setIsFlipped: (v: boolean) => void;
    onStart: () => void;
}

const CRT_OVERLAY = "pointer-events-none absolute inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_4px)] mix-blend-overlay opacity-50";

export function HUD({
    gameState,
    score,
    personalBest,
    weaponCount,
    weaponDelay,
    weaponTech,
    weaponDamage,
    weaponBounce,
    isHoming,
    critChance,
    critBonus,
    dangerLevel,
    wave,
    kills,
    zombieHp,
    isMuted,
    toggleMute,
    setIsFlipped,
    onStart,
}: HUDProps) {


    // Mouse Parallax Effect (Simplistic for now, can perform later)
    useEffect(() => {
        // Just listener for now to enable reticle in future
    }, []);

    const fireRate = Math.min(100, Math.round((0.3 / (weaponDelay || 0.3)) * 100));

    // Danger Vignette
    const dangerOpacity = dangerLevel * 0.6; // Max 0.6 opacity

    return (
        <div className="absolute inset-0 w-full h-full font-mono text-white select-none overflow-hidden pointer-events-none">
            {/* CRT & Danger Effects */}
            <div className={CRT_OVERLAY} />
            <div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
                style={{
                    background: `radial-gradient(circle at center, transparent 40%, rgba(220, 38, 38, ${dangerOpacity}) 90%)`,
                    boxShadow: dangerLevel > 0.5 ? `inset 0 0 ${dangerLevel * 50}px rgba(220, 38, 38, 0.5)` : 'none'
                }}
            />



            {/* Tactical Header */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex justify-between items-start z-[60]">
                {/* Left: System Status & Primary Stats */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                            className="text-cyan-400 p-2 bg-black/40 border border-cyan-500/30 rounded-lg backdrop-blur-sm pointer-events-auto active:scale-95 transition-transform"
                            title={isMuted ? "Activer le son" : "Couper le son"}
                        >
                            {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[8px] text-cyan-400 font-bold tracking-widest opacity-60 uppercase leading-none">System</span>
                            {/* Mobile Tech Pips */}
                            <div className="flex gap-1 mt-0.5 md:hidden">
                                {weaponTech >= 1 && <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]" />}
                                {weaponTech >= 2 && <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_5px_#3b82f6]" />}
                                {weaponTech >= 3 && <div className="w-1 h-1 rounded-full bg-purple-500 shadow-[0_0_5px_#a855f7]" />}
                                {isHoming && <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_5px_#facc15] animate-pulse" />}
                            </div>
                            {isHoming && <div className="text-[6px] text-yellow-500 font-black tracking-tighter mt-1 animate-pulse">PISTAGE ACTIVÉ</div>}
                        </div>
                    </div>

                    {/* MOBILE PRIMARY STATS (Left Side) */}
                    <div className="flex flex-col gap-1 md:hidden pl-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🚀</span>
                            <span className="text-[10px] font-black text-cyan-400 leading-none">{fireRate}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">⚡</span>
                            <span className="text-[10px] font-black text-red-500 leading-none">{weaponDamage}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">🔫</span>
                            <span className="text-[10px] font-black text-white leading-none">x{weaponCount}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Scores & Secondary Stats */}
                <div className="flex flex-col items-end gap-1.5 md:gap-2">
                    <div className="flex items-center gap-2">
                        {/* MOBILE ONLY RULES */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                            className="md:hidden text-cyan-400 p-2 bg-black/40 border border-cyan-500/30 rounded-lg backdrop-blur-sm pointer-events-auto active:scale-95 transition-transform"
                        >
                            <FaQuestion size={18} />
                        </button>

                        <div className="flex gap-1.5 md:gap-2">
                            <div className="bg-black/60 border border-cyan-500/30 px-2 md:px-3 py-0.5 md:py-1 transform -skew-x-12 backdrop-blur-md">
                                <div className="transform skew-x-12 flex flex-col items-center">
                                    <span className="text-[6px] md:text-[8px] text-cyan-400 tracking-widest uppercase font-bold">Vague</span>
                                    <span className="text-base md:text-2xl font-black text-white leading-none">{wave}</span>
                                </div>
                            </div>
                            <div className="bg-black/60 border border-cyan-500/30 px-2 md:px-3 py-0.5 md:py-1 transform -skew-x-12 backdrop-blur-md">
                                <div className="transform skew-x-12 flex flex-col items-center">
                                    <span className="text-[6px] md:text-[8px] text-cyan-400 tracking-widest uppercase font-bold">Kills</span>
                                    <span className="text-base md:text-2xl font-black text-white leading-none">{kills}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* PB / Score Display - Slightly Larger */}
                    <div className="relative mt-1">
                        <div className="absolute inset-0 bg-black/60 transform -skew-x-12 border border-cyan-500/30 blur-[1px]" />
                        <div className="relative border-l-2 border-cyan-500/40 px-3 py-1 transform -skew-x-12 backdrop-blur-sm">
                            <div className="transform skew-x-12 flex items-center gap-2">
                                <span className="text-[8px] md:text-[10px] text-cyan-400 font-bold tracking-widest uppercase leading-none">Record</span>
                                <span className="text-base md:text-lg font-black text-white leading-none">
                                    {personalBest?.score || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* MOBILE SECONDARY STATS (Right Side) */}
                    <div className="flex flex-col gap-1 md:hidden items-end pr-1">
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <span className="text-sm">🎯</span>
                            <span className="text-[10px] font-black text-yellow-500 leading-none">{critChance}%</span>
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <span className="text-sm">🛡️</span>
                            <span className="text-[10px] font-black text-white leading-none">x{weaponBounce}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <span className="text-[12px]">💚</span>
                            <span className="text-[10px] font-black text-green-500 leading-none">{zombieHp}</span>
                        </div>
                    </div>


                </div>
            </div>

            {/* Bottom Weapon HUD - Desktop Only */}
            < div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-[60] hidden md:block" >
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-end justify-center gap-4 w-full">
                        {/* Weapon Stats Left */}
                        <div className="flex-1 bg-black/60 border-t-2 border-cyan-500/50 p-3 backdrop-blur-sm rounded-bl-xl clip-path-polygon-[0_0,100%_0,90%_100%,0%_100%]">
                            <div className="flex flex-col gap-1 w-full">
                                <div className="flex justify-between items-center text-cyan-300 gap-1">
                                    <div className="flex-1 flex flex-col items-center">
                                        <span className="text-[10px] uppercase opacity-70 font-bold">Cadence</span>
                                        <span className="text-xl font-bold">{fireRate}%</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-cyan-500/30" />
                                    <div className="flex-1 flex flex-col items-center">
                                        <span className="text-[10px] uppercase opacity-70 font-bold">Dégâts</span>
                                        <span className="text-xl font-bold text-red-400">{weaponDamage}</span>
                                    </div>
                                    <div className="h-8 w-[1px] bg-cyan-500/30" />
                                    <div className="flex-1 flex flex-col items-center">
                                        <span className="text-[10px] uppercase opacity-70 font-bold">Chance Crit</span>
                                        <span className="text-xl font-bold text-yellow-500">{critChance}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Cannon Count */}
                        <div className="relative group shrink-0">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="bg-black/80 border-2 border-cyan-400 px-8 py-4 rounded-lg transform -translate-y-4 shadow-[0_0_20px_rgba(34,211,238,0.3)] min-w-[140px] text-center backdrop-blur-md">
                                <div className="text-[9px] uppercase tracking-[0.2em] text-cyan-200 mb-1 font-bold">Canons</div>
                                <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                    {weaponCount}
                                </div>
                            </div>
                        </div>

                        {/* Weapon Stats Right */}
                        <div className="flex-1 bg-black/60 border-t-2 border-cyan-500/50 p-3 backdrop-blur-sm rounded-br-xl clip-path-polygon-[10%_0,100%_0,100%_100%,0%_100%]">
                            <div className="flex items-center justify-between w-full text-cyan-300 gap-1">
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70 font-bold">Bonus Crit</span>
                                    <span className="text-xl font-bold text-orange-400">+{critBonus}%</span>
                                </div>
                                <div className="h-8 w-[1px] bg-cyan-500/30" />
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70 font-bold">Rebonds</span>
                                    <span className="text-xl font-bold text-blue-400">x{weaponBounce}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-cyan-500/30" />
                                <div className="flex-1 flex flex-col items-center">
                                    <span className="text-[10px] uppercase opacity-70 font-bold">HP Zombies</span>
                                    <span className="text-xl font-bold text-green-400">{zombieHp}</span>
                                </div>

                                <div className="h-8 w-[2px] bg-cyan-500/50 mx-2" />

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                        className="text-cyan-400 hover:text-white transition-colors pointer-events-auto p-1"
                                        title={isMuted ? "Activer le son" : "Couper le son"}
                                    >
                                        {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                                        className="text-cyan-400 hover:text-white transition-colors pointer-events-auto p-1"
                                        title="Règles"
                                    >
                                        <FaQuestion size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-[10px] text-red-400 font-black animate-pulse uppercase tracking-widest h-4">
                        {dangerLevel > 0.8 ? 'DANGER CRITIQUE' : dangerLevel > 0.5 ? 'ALERTE' : ''}
                    </div>
                </div>
            </div >

            {/* Intro / Menu Overlay */}
            <AnimatePresence>
                {
                    gameState === 'intro' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto"
                        >
                            <div className="text-center relative">
                                <div className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-600 opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 whitespace-nowrap blur-sm select-none">
                                    DÉFENSE ZOMBIE
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                                    PROTOCOLE <span className="text-cyan-400">ZOMBIE</span>
                                </h1>
                                <p className="text-cyan-200/80 mb-12 text-lg tracking-widest max-w-md mx-auto uppercase text-sm border-t border-b border-cyan-500/30 py-4">
                                    Protégez la zone. Collectez la Tech. Survivez.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.2)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onStart}
                                    className="group relative px-12 py-4 bg-cyan-900/30 border border-cyan-400/50 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
                                    <span className="relative text-cyan-300 font-bold tracking-[0.3em] group-hover:text-white transition-colors">
                                        INITIALISER
                                    </span>
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                }

                {
                    gameState === 'gameover' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/80 backdrop-blur-md pointer-events-auto"
                        >
                            <div className="text-center p-12 border-2 border-red-500/50 bg-black/60 relative overflow-hidden max-w-lg w-full">
                                <div className="absolute top-0 inset-x-0 h-1 bg-red-500 animate-[loading_2s_ease-in-out_infinite]" />

                                <h2 className="text-6xl font-black text-red-500 mb-6 tracking-tight glitch-text">
                                    ÉCHEC SYSTÈME
                                </h2>

                                <div className="flex justify-center gap-12 mb-8 text-2xl font-mono">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">Score Final</span>
                                        <span className="text-white font-bold">{score}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">Vagues</span>
                                        <span className="text-white font-bold">{wave}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">Éliminations</span>
                                        <span className="text-white font-bold">{kills}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={onStart}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase transition-colors"
                                >
                                    Redémarrer
                                </motion.button>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >

            {/* Hint / Mouse Controls */}
            {
                gameState === 'playing' && (
                    <div className="absolute bottom-4 left-4 text-[10px] text-white/20 hidden md:block">
                        CONTROLES: SOURIS // CLAVIER
                    </div>
                )
            }
        </div >
    );
}
