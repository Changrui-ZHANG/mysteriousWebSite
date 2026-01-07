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
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-8 text-center"
            >
                {gameState === 'start' && (
                    <>
                        <GradientHeading gradient="cyan-purple" level={2} className="mb-4 md:mb-6">
                            {t('game.brick_breaker')}
                        </GradientHeading>
                        <p className="text-white/80 mb-2 font-serif text-base md:text-xl">
                            {t('game.brick_breaker_desc')}
                        </p>

                        <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                            <div className="text-4xl mb-2">{LEVEL_CONFIG.MAPS[selectedMap].icon}</div>
                            <div className="text-cyan-400 font-bold text-lg">
                                {t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.name`)}
                            </div>
                            <div className="text-white/60 text-sm">
                                {t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.desc`)}
                            </div>
                            <div className="text-yellow-400 text-xs mt-1">
                                {t(`game.brick_breaker_difficulty.${LEVEL_CONFIG.MAPS[selectedMap].difficultyKey}`)}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={onShowMapSelector}
                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                disabled={isLoadingMap}
                            >
                                🗺️ {isLoadingMap ? t('game.loading') : t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="px-8 py-3 bg-cyan-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.6)] disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.loading') : t('game.start_game')}
                            </button>
                        </div>
                    </>
                )}

                {gameState === 'gameover' && (
                    <>
                        <h2 className="text-4xl md:text-6xl font-black font-heading text-red-500 mb-4">
                            {t('game.game_over')}
                        </h2>
                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">
                            {t('game.final_score')}: {score}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={onShowMapSelector}
                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                            >
                                🗺️ {t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="px-8 py-3 bg-red-500 text-white font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.6)] disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.brick_breaker_generating') : t('game.try_again')}
                            </button>
                        </div>
                    </>
                )}

                {gameState === 'won' && (
                    <>
                        <h2 className="text-4xl md:text-6xl font-black font-heading text-green-400 mb-4">
                            {t('game.you_win')}
                        </h2>
                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">
                            {t('game.final_score')}: {score}
                        </p>
                        {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && unlockedMaps.includes(selectedMap + 1) && (
                            <p className="text-yellow-400 mb-4 font-bold">
                                🎉 {t('game.brick_breaker_new_map_unlocked', { 
                                    name: t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap + 1].i18nKey}.name`) 
                                })}
                            </p>
                        )}
                        <div className="flex gap-4">
                            <button
                                onClick={onShowMapSelector}
                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                            >
                                🗺️ {t('game.brick_breaker_choose_map')}
                            </button>
                            <button
                                onClick={onStartGame}
                                className="px-8 py-3 bg-green-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.6)] disabled:opacity-50"
                                disabled={isLoadingMap}
                            >
                                {isLoadingMap ? t('game.loading') : t('game.play_again')}
                            </button>
                            {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && (
                                <button
                                    onClick={onNextLevel}
                                    className="px-8 py-3 bg-yellow-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.6)] disabled:opacity-50"
                                    disabled={isLoadingMap}
                                >
                                    {isLoadingMap ? t('game.loading') : `⏭️ ${t('game.brick_breaker_next_level')}`}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
