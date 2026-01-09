/**
 * BrickBreakerOverlay - Game state overlays (start, gameover, won)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { GradientHeading } from '../../../../shared/components';
import { LEVEL_CONFIG, type GameState } from './constants';

interface BrickBreakerOverlayProps {
    gameState: GameState;
    selectedMap: number;
    score: number;
    unlockedMaps: number[];
    isLoadingMap: boolean;
    onShowMapSelector: () => void;
    onStartGame: () => void;
    onNextLevel: () => void;
}

export function BrickBreakerOverlay({
    gameState,
    selectedMap,
    score,
    unlockedMaps,
    isLoadingMap,
    onShowMapSelector,
    onStartGame,
    onNextLevel,
}: BrickBreakerOverlayProps) {
    const { t } = useTranslation();

    if (gameState === 'playing') return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-4 sm:p-6 md:p-8 text-center overflow-y-auto"
            >
                {gameState === 'start' && (
                    <div className="flex flex-col items-center max-w-full">
                        <GradientHeading gradient="cyan-purple" level={2} className="mb-3 md:mb-6 text-2xl md:text-3xl lg:text-4xl text-center">
                            {t('game.brick_breaker')}
                        </GradientHeading>
                        <p className="text-white/80 mb-4 font-serif text-sm md:text-xl max-w-md">
                            {t('game.brick_breaker_desc')}
                        </p>

                        <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 w-full max-w-[280px] sm:max-w-xs transition-all hover:bg-white/15">
                            <div className="text-3xl md:text-4xl mb-2">{LEVEL_CONFIG.MAPS[selectedMap].icon}</div>
                            <div className="text-cyan-400 font-bold text-base md:text-lg">
                                {t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.name`)}
                            </div>
                            <div className="text-white/60 text-xs md:text-sm mt-1 line-clamp-2">
                                {t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.desc`)}
                            </div>
                            <div className="text-yellow-400 text-[10px] md:text-xs mt-2 uppercase tracking-widest font-mono">
                                {t(`game.brick_breaker_difficulty.${LEVEL_CONFIG.MAPS[selectedMap].difficultyKey}`)}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center items-center">
                            <button
                                onClick={onShowMapSelector}
                                className="w-full sm:w-auto px-6 py-2.5 md:py-3 bg-purple-500/80 hover:bg-purple-500 text-white font-bold text-base md:text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                                disabled={isLoadingMap}
                            >
                                🗺️ {isLoadingMap ? t('game.loading') : t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="w-full sm:w-auto px-8 py-2.5 md:py-3 bg-cyan-500/80 hover:bg-cyan-500 text-black font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95 disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.loading') : t('game.start_game')}
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'gameover' && (
                    <div className="flex flex-col items-center max-w-full">
                        <h2 className="text-3xl md:text-6xl font-black font-heading text-red-500 mb-2 md:mb-4">
                            {t('game.game_over')}
                        </h2>
                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-base md:text-2xl">
                            {t('game.final_score')}: {score}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center items-center">
                            <button
                                onClick={onShowMapSelector}
                                className="w-full sm:w-auto px-6 py-2.5 md:py-3 bg-purple-500/80 hover:bg-purple-500 text-white font-bold text-base md:text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                            >
                                🗺️ {t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="w-full sm:w-auto px-8 py-2.5 md:py-3 bg-red-500/80 hover:bg-red-500 text-white font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.brick_breaker_generating') : t('game.try_again')}
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'won' && (
                    <div className="flex flex-col items-center max-w-full">
                        <h2 className="text-3xl md:text-6xl font-black font-heading text-green-400 mb-2 md:mb-4">
                            {t('game.you_win')}
                        </h2>
                        <p className="text-white/80 mb-4 md:mb-6 font-mono text-base md:text-2xl">
                            {t('game.final_score')}: {score}
                        </p>
                        {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && unlockedMaps.includes(selectedMap + 1) && (
                            <p className="text-yellow-400 mb-6 font-bold text-sm md:text-base animate-bounce">
                                🎉 {t('game.brick_breaker_new_map_unlocked', {
                                    name: t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap + 1].i18nKey}.name`)
                                })}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center items-center">
                            <button
                                onClick={onShowMapSelector}
                                className="w-full sm:w-auto px-6 py-2.5 md:py-3 bg-purple-500/80 hover:bg-purple-500 text-white font-bold text-base md:text-lg rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-95"
                            >
                                🗺️ {t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="w-full sm:w-auto px-8 py-2.5 md:py-3 bg-green-500/80 hover:bg-green-500 text-black font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] active:scale-95 disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.loading') : t('game.play_again')}
                            </button>
                            {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && (
                                <button
                                    onClick={onNextLevel}
                                    className="w-full sm:w-auto px-8 py-2.5 md:py-3 bg-yellow-500/80 hover:bg-yellow-500 text-black font-bold text-lg md:text-xl rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(234,179,8,0.4)] active:scale-95 disabled:opacity-50"
                                    disabled={isLoadingMap}
                                >
                                    {isLoadingMap ? t('game.loading') : `⏭️ ${t('game.brick_breaker_next_level')}`}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
