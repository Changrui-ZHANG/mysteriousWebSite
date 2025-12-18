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
    dangerLevel: number;
    wave: number;
    kills: number;
    isMuted: boolean;
    toggleMute: () => void;
    isFlipped: boolean;
    setIsFlipped: (v: boolean) => void;
    onStart: () => void;
    onFlip: () => void;
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
    dangerLevel,
    wave,
    kills,
    isMuted,
    toggleMute,
    setIsFlipped,
    onStart
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
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-[60]">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                        <h1 className="text-xl font-bold tracking-widest text-cyan-400 uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                            Système<span className="text-white">Opérationnel</span>
                        </h1>
                    </div>
                    <div className="text-xs text-cyan-200/60 pl-5 tracking-wider">
                        CONNEXION_SÉCURISÉE_ÉTABLIE
                    </div>
                </div>

                {/* Stats Cluster */}
                <div className="flex flex-col items-end gap-2">
                    {/* Wave / Kills Row */}
                    <div className="flex gap-2">
                        <div className="bg-black/60 border border-cyan-500/30 px-3 py-1 transform -skew-x-12 backdrop-blur-md">
                            <div className="transform skew-x-12 flex flex-col items-center">
                                <span className="text-[8px] text-cyan-400 tracking-widest uppercase">Vague</span>
                                <span className="text-xl md:text-2xl font-black text-white leading-none">{wave}</span>
                            </div>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 px-3 py-1 transform -skew-x-12 backdrop-blur-md">
                            <div className="transform skew-x-12 flex flex-col items-center">
                                <span className="text-[8px] text-cyan-400 tracking-widest uppercase">Kills</span>
                                <span className="text-xl md:text-2xl font-black text-white leading-none">{kills}</span>
                            </div>
                        </div>
                    </div>

                    {/* Score Panel */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-cyan-950/80 transform -skew-x-12 border border-cyan-500/30 blur-sm" />
                        <div className="relative bg-black/40 border-l-4 border-cyan-400 px-6 py-2 transform -skew-x-12 backdrop-blur-md">
                            <div className="transform skew-x-12 flex flex-col items-end">
                                <span className="text-xs text-cyan-400 font-bold tracking-widest opacity-80">DONNÉES_SCORE</span>
                                <span className="text-4xl font-black text-white tracking-tight drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    {score.toString().padStart(6, '0')}
                                </span>
                                {personalBest && (
                                    <span className="text-[10px] text-yellow-400 font-bold mt-1">
                                        RECORD: {personalBest.score}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Weapon HUD */}
            <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-2 md:px-4 z-[60]">
                <div className="flex items-end justify-center gap-1 md:gap-4">
                    {/* Weapon Stats Left */}
                    <div className="flex-1 bg-black/60 border-t-2 border-cyan-500/50 p-2 md:p-3 backdrop-blur-sm rounded-bl-xl clip-path-polygon-[0_0,100%_0,90%_100%,0%_100%]">
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center text-cyan-300">
                                <div className="flex flex-col">
                                    <span className="text-[8px] md:text-[10px] uppercase opacity-70">Cadence</span>
                                    <span className="text-sm md:text-xl font-bold">{fireRate}%</span>
                                </div>
                                <div className="h-6 md:h-8 w-[1px] bg-cyan-500/30 mx-1" />
                                <div className="flex flex-col items-end">
                                    <span className="text-[8px] md:text-[10px] uppercase opacity-70">Dégâts</span>
                                    <span className="text-sm md:text-xl font-bold text-red-400">{weaponDamage}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-cyan-300 pt-1 border-t border-cyan-500/20">
                                <span className="text-[8px] md:text-[10px] uppercase opacity-70">Modes Actifs</span>
                                <div className="flex gap-1 flex-wrap justify-end">
                                    {weaponTech >= 1 && (
                                        <span className="text-[8px] md:text-[10px] font-bold bg-green-500/30 text-green-300 px-1 rounded">PERF</span>
                                    )}
                                    {weaponTech >= 2 && (
                                        <span className="text-[8px] md:text-[10px] font-bold bg-blue-500/30 text-blue-300 px-1 rounded">REB</span>
                                    )}
                                    {weaponTech >= 3 && (
                                        <span className="text-[8px] md:text-[10px] font-bold bg-purple-500/30 text-purple-300 px-1 rounded">CHAÎNE</span>
                                    )}
                                    {weaponTech === 0 && (
                                        <span className="text-[8px] md:text-[10px] font-bold text-gray-400">STD</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Cannon Count */}
                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="bg-black/80 border-2 border-cyan-400 px-4 md:px-8 py-2 md:py-4 rounded-lg transform -translate-y-2 md:-translate-y-4 shadow-[0_0_20px_rgba(34,211,238,0.3)] min-w-[80px] md:min-w-[140px] text-center backdrop-blur-md">
                            <div className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-cyan-200 mb-0 md:mb-1">Canons</div>
                            <div className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                                {weaponCount}
                            </div>
                        </div>
                    </div>

                    {/* Weapon Stats Right */}
                    <div className="flex-1 bg-black/60 border-t-2 border-cyan-500/50 p-2 md:p-3 backdrop-blur-sm rounded-br-xl clip-path-polygon-[10%_0,100%_0,100%_100%,0%_100%]">
                        <div className="flex justify-between items-center px-1 md:px-2">
                            <div className="flex items-center gap-1 md:gap-2">
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                                    className="text-cyan-400 hover:text-white transition-colors pointer-events-auto p-1"
                                >
                                    {isMuted ? <FaVolumeMute size={16} className="md:w-5 md:h-5" /> : <FaVolumeUp size={16} className="md:w-5 md:h-5" />}
                                </button>
                                <span className="text-[8px] md:text-[10px] text-cyan-300 opacity-60 hidden sm:inline">AUDIO</span>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                                className="text-cyan-400 hover:text-white transition-colors pointer-events-auto p-1"
                                title="Règles"
                            >
                                <FaQuestion size={16} className="md:w-5 md:h-5" />
                            </button>
                            <div className="text-[8px] md:text-[10px] text-red-400 font-bold animate-pulse">
                                {dangerLevel > 0.5 ? 'ATT.' : dangerLevel > 0.8 ? 'CRIT' : 'OK'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intro / Menu Overlay */}
            <AnimatePresence>
                {gameState === 'intro' && (
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
                )}

                {gameState === 'gameover' && (
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
                )}
            </AnimatePresence>

            {/* Hint / Mouse Controls */}
            {gameState === 'playing' && (
                <div className="absolute bottom-4 left-4 text-[10px] text-white/20">
                    CONTROLES: SOURIS // CLAVIER
                </div>
            )}
        </div>
    );
}
