import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HUDOverlaysProps {
    gameState: 'intro' | 'playing' | 'gameover';
    score: number;
    wave: number;
    kills: number;
    onStart: () => void;
}

export function HUDOverlays({ gameState, score, wave, kills, onStart }: HUDOverlaysProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {gameState === 'intro' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
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
                        <motion.button whileHover={{ scale: 1.05, backgroundColor: 'rgba(34, 211, 238, 0.2)' }} whileTap={{ scale: 0.95 }} onClick={onStart}
                            className="group relative px-12 py-4 bg-cyan-900/30 border border-cyan-400/50 overflow-hidden">
                            <div className="absolute inset-0 bg-cyan-400/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 skew-x-12" />
                            <span className="relative text-cyan-300 font-bold tracking-[0.3em] group-hover:text-white transition-colors">{t('game.zombie_hud.initialize')}</span>
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {gameState === 'gameover' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/80 backdrop-blur-md pointer-events-auto">
                    <div className="text-center p-12 border-2 border-red-500/50 bg-black/60 relative overflow-hidden max-w-lg w-full">
                        <div className="absolute top-0 inset-x-0 h-1 bg-red-500 animate-[loading_2s_ease-in-out_infinite]" />
                        <h2 className="text-6xl font-black text-red-500 mb-6 tracking-tight glitch-text">{t('game.zombie_hud.system_failure')}</h2>
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
                        <motion.button whileHover={{ scale: 1.02 }} onClick={onStart}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold tracking-widest uppercase transition-colors">
                            {t('game.zombie_hud.restart')}
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
