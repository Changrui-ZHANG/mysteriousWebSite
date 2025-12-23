import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


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
    onStart,
}: HUDProps) {
    const { t } = useTranslation();

    // Mouse Parallax Effect (Simplistic for now, can perform later)
    useEffect(() => {
        // Just listener for now to enable reticle in future
    }, []);

    const fireRate = Math.round((0.3 / (weaponDelay || 0.3)) * 100);

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



            {/* Tactical Header - More Compact */}
            <div className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-start z-[60]">
                {/* Left: System Status & Primary Stats */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-cyan-400 font-bold tracking-[0.2em] opacity-60 uppercase leading-none">{t('game.zombie_hud.system_status')}</span>
                            {/* Mobile Persistent Tech Row - Larger */}
                            <div className="flex items-center gap-1 mt-0.5 md:hidden">
                                {[1, 2, 3, 4, 5, 6].map(t => (
                                    <span key={t} className={`text-[9px] font-black px-1 rounded-sm border ${weaponTech >= t
                                        ? 'text-white border-cyan-500/50 bg-cyan-900/40 shadow-[0_0_5px_rgba(6,182,212,0.5)]'
                                        : 'text-white/20 border-white/5 bg-transparent'
                                        }`}>T{t}</span>
                                ))}
                                <span className={`text-[8px] font-black px-1 ml-1 ${isHoming ? 'text-yellow-400 animate-pulse' : 'text-white/10'}`}>P</span>
                            </div>
                        </div>
                    </div>

                    {/* MOBILE PRIMARY STATS (Left Side) */}
                    <div className="flex flex-row gap-3 md:hidden pl-1 mt-1">
                        <div className="flex items-center gap-1">
                            <span className="text-xs">🚀</span>
                            <span className="text-[9px] font-black text-cyan-400 leading-none">{fireRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs">⚡</span>
                            <span className="text-[9px] font-black text-red-500 leading-none">{weaponDamage}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs">🔫</span>
                            <span className="text-[9px] font-black text-white leading-none">x{weaponCount}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Scores & Secondary Stats */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-1">
                            <div className="bg-black/60 border border-cyan-500/30 px-2 py-0.5 transform -skew-x-12 backdrop-blur-md">
                                <div className="transform skew-x-12 flex flex-col items-center">
                                    <span className="text-[6px] md:text-[7px] text-cyan-400 tracking-widest uppercase font-bold">{t('game.zombie_hud.wave')}</span>
                                    <span className="text-sm md:text-xl font-black text-white leading-none">{wave}</span>
                                </div>
                            </div>
                            <div className="bg-black/60 border border-cyan-500/30 px-2 py-0.5 transform -skew-x-12 backdrop-blur-md">
                                <div className="transform skew-x-12 flex flex-col items-center">
                                    <span className="text-[6px] md:text-[7px] text-cyan-400 tracking-widest uppercase font-bold">{t('game.zombie_hud.kills')}</span>
                                    <span className="text-sm md:text-xl font-black text-white leading-none">{kills}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* PB / Score Display - Compact */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-black/60 transform -skew-x-12 border border-cyan-500/30 blur-[1px]" />
                        <div className="relative border-l-2 border-cyan-500/40 px-2 py-0.5 transform -skew-x-12 backdrop-blur-sm">
                            <div className="transform skew-x-12 flex items-center gap-1.5">
                                <span className="text-[7px] md:text-[8px] text-cyan-400 font-bold uppercase leading-none">{t('game.zombie_hud.record')}</span>
                                <span className="text-sm md:text-base font-black text-white leading-none">
                                    {personalBest?.score || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* MOBILE SECONDARY STATS (Right Side) */}
                    <div className="flex flex-row gap-3 md:hidden items-center pr-1">
                        <div className="flex items-center gap-1">
                            <span className="text-xs">🎯</span>
                            <span className="text-[9px] font-black text-yellow-500 leading-none">{critChance}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-xs">🛡️</span>
                            <span className="text-[9px] font-black text-white leading-none">x{weaponBounce}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px]">💚</span>
                            <span className="text-[9px] font-black text-green-500 leading-none">{zombieHp}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Weapon HUD - Redesigned for Compactness & Visibility */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-[60] hidden md:block">
                <div className="flex flex-col items-center">
                    {/* Tech Bay - Prominent & Horizontal */}
                    <div className="flex items-center justify-center gap-3 mb-2 px-6 py-1.5 bg-black/40 backdrop-blur-sm border-x border-t border-cyan-500/30 rounded-t-2xl">
                        {[1, 2, 3, 4, 5, 6].map(t => (
                            <div key={t} className="flex flex-col items-center">
                                <span className={`text-[10px] font-black transition-all duration-300 ${weaponTech >= t
                                    ? `text-white drop-shadow-[0_0_10px_#22d3ee]`
                                    : 'text-white/10'
                                    }`}>T{t}</span>
                                <div className={`w-6 h-1 mt-1 rounded-full transition-all duration-500 ${weaponTech >= t
                                    ? (t === 1 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' :
                                        t === 2 ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' :
                                            t === 3 ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]' :
                                                t === 4 ? 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]' :
                                                    t === 5 ? 'bg-orange-500 shadow-[0_0_8px_#f97316]' :
                                                        'bg-red-500 shadow-[0_0_8px_#ef4444]')
                                    : 'bg-white/5'
                                    }`} />
                            </div>
                        ))}
                        <div className="w-[2px] h-4 bg-white/10 mx-1" />
                        <div className="flex flex-col items-center">
                            <span className={`text-[9px] font-black ${isHoming ? 'text-yellow-400 animate-pulse' : 'text-white/10'}`}>{t('game.zombie_hud.tracking')}</span>
                            <div className={`w-10 h-1 mt-1 rounded-full ${isHoming ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-white/5'}`} />
                        </div>
                    </div>

                    <div className="flex items-end justify-center gap-2 w-full">
                        {/* Left Stats Cluster */}
                        <div className="flex-1 bg-black/80 border border-cyan-500/30 p-2 backdrop-blur-md rounded-lg flex justify-around">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.fire_rate')}</span>
                                <span className="text-base font-bold text-cyan-400">{fireRate}%</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.damage')}</span>
                                <span className="text-base font-bold text-red-500">{weaponDamage}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.crit_chance')}</span>
                                <span className="text-base font-bold text-yellow-500">{critChance}%</span>
                            </div>
                        </div>

                        {/* Centered Cannon Control */}
                        <div className="relative group mx-2">
                            <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full opacity-20" />
                            <div className="bg-black border-2 border-cyan-500 px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] text-center relative overflow-hidden">
                                <div className="text-[8px] uppercase tracking-tighter text-cyan-400/80 font-bold">{t('game.zombie_hud.cannons')}</div>
                                <div className="text-3xl font-black text-white leading-none">{weaponCount}</div>
                            </div>
                        </div>

                        {/* Right Stats Cluster */}
                        <div className="flex-1 bg-black/80 border border-cyan-500/30 p-2 backdrop-blur-md rounded-lg flex justify-around">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.bonus')}</span>
                                <span className="text-base font-bold text-orange-400">+{critBonus}%</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.rebounds')}</span>
                                <span className="text-base font-bold text-blue-400">x{weaponBounce}</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.zombie_hp')}</span>
                                <span className="text-base font-bold text-green-500">{zombieHp}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-[9px] text-red-500 font-black animate-pulse uppercase tracking-[0.3em] h-3 mt-1">
                        {dangerLevel > 0.8 ? t('game.zombie_hud.danger_critical') : dangerLevel > 0.5 ? t('game.zombie_hud.danger_alert') : ''}
                    </div>
                </div>
            </div>

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
                                    {t('game.zombie_hud.title_bg')}
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
                                    {t('game.zombie_hud.protocol')} <span className="text-cyan-400">ZOMBIE</span>
                                </h1>
                                <p className="text-cyan-200/80 mb-12 text-lg tracking-widest max-w-md mx-auto uppercase text-sm border-t border-b border-cyan-500/30 py-4">
                                    {t('game.zombie_hud.protect_zone')}
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.2)' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onStart}
                                    className="group relative px-12 py-4 bg-cyan-900/30 border border-cyan-400/50 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-cyan-400/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
                                    <span className="relative text-cyan-300 font-bold tracking-[0.3em] group-hover:text-white transition-colors">
                                        {t('game.zombie_hud.initialize')}
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
                                    {t('game.zombie_hud.system_failure')}
                                </h2>

                                <div className="flex justify-center gap-12 mb-8 text-2xl font-mono">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">{t('game.zombie_hud.final_score')}</span>
                                        <span className="text-white font-bold">{score}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">{t('game.zombie_hud.waves')}</span>
                                        <span className="text-white font-bold">{wave}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-red-400/60 uppercase">{t('game.zombie_hud.eliminations')}</span>
                                        <span className="text-white font-bold">{kills}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    onClick={onStart}
                                    className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase transition-colors"
                                >
                                    {t('game.zombie_hud.restart')}
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
                        {t('game.zombie_hud.controls')}
                    </div>
                )
            }
        </div >
    );
}
