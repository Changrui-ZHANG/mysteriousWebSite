/**
 * MapSelector - Modal for selecting brick breaker maps
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LEVEL_CONFIG } from './constants';

interface MapSelectorProps {
    isOpen: boolean;
    selectedMap: number;
    unlockedMaps: number[];
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isLoadingMap: boolean;
    onSelectMap: (mapId: number) => void;
    onClose: () => void;
    onStartGame: () => void;
    playSound: (sound: 'click') => void;
}

export function MapSelector({
    isOpen,
    selectedMap,
    unlockedMaps,
    isAdmin,
    isSuperAdmin,
    isLoadingMap,
    onSelectMap,
    onClose,
    onStartGame,
    playSound,
}: MapSelectorProps) {
    const { t } = useTranslation();
    const mapGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && mapGridRef.current) {
            setTimeout(() => {
                const selectedCard = mapGridRef.current?.querySelector(`#map-card-${selectedMap}`);
                selectedCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [isOpen, selectedMap]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 md:p-6"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50 }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 rounded-2xl border-2 border-cyan-500/30 shadow-2xl w-full max-w-[95%] max-h-[95%] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl md:text-3xl font-bold text-center mb-4 md:mb-8 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                            🗺️ {t('game.brick_breaker_map_selection')}
                        </h2>

                        <div
                            ref={mapGridRef}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent"
                        >
                            {LEVEL_CONFIG.MAPS.map((map) => {
                                const isUnlocked = unlockedMaps.includes(map.id) || isAdmin || isSuperAdmin;
                                const isSelected = selectedMap === map.id;

                                return (
                                    <motion.button
                                        key={map.id}
                                        id={`map-card-${map.id}`}
                                        whileHover={isUnlocked ? { scale: 1.05, y: -5 } : {}}
                                        whileTap={isUnlocked ? { scale: 0.95 } : {}}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                onSelectMap(map.id);
                                                playSound('click');
                                            }
                                        }}
                                        disabled={!isUnlocked}
                                        className={`
                                            relative p-6 rounded-xl border-2 transition-all
                                            ${isUnlocked
                                                ? isSelected
                                                    ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]'
                                                    : 'bg-white/5 border-white/20 hover:border-cyan-400/50'
                                                : 'bg-black/40 border-white/10 cursor-not-allowed opacity-50'
                                            }
                                        `}
                                    >
                                        {!isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="text-6xl">🔒</div>
                                            </div>
                                        )}

                                        <div className={isUnlocked ? '' : 'blur-sm'}>
                                            <div className="text-5xl mb-3">{map.icon}</div>
                                            <h3 className="text-xl font-bold text-white mb-2">
                                                {t(`game.brick_breaker_maps.${map.i18nKey}.name`)}
                                            </h3>
                                            <p className="text-sm text-white/60 mb-3">
                                                {t(`game.brick_breaker_maps.${map.i18nKey}.desc`)}
                                            </p>
                                            <div className={`
                                                inline-block px-3 py-1 rounded-full text-xs font-bold
                                                ${map.difficultyKey === 'easy' ? 'bg-green-500/20 text-green-400' :
                                                    map.difficultyKey === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-red-500/20 text-red-400'}
                                            `}>
                                                {t(`game.brick_breaker_difficulty.${map.difficultyKey}`)}
                                            </div>
                                        </div>

                                        {isSelected && isUnlocked && (
                                            <div className="absolute top-2 right-2 bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                ✓ {t('game.brick_breaker_selected')}
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-white/60">
                                {t('game.brick_breaker_maps_unlocked', { count: unlockedMaps.length, total: LEVEL_CONFIG.LEVEL_COUNT })}
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    onStartGame();
                                }}
                                disabled={isLoadingMap}
                                className="px-6 py-3 bg-cyan-500 text-black font-bold rounded-full hover:scale-110 transition-transform disabled:opacity-50"
                            >
                                {isLoadingMap ? t('game.brick_breaker_generating') : t('game.brick_breaker_confirm_start')}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
