import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaLightbulb, FaVolumeUp } from 'react-icons/fa';
import type { VocabularyItem } from '../../../types/learning';

interface VocabularyCardProps {
    item: VocabularyItem;
    isMini?: boolean;
    revealed?: boolean;
    isFavorite: boolean;
    localizedMeaning: string;
    onReveal?: () => void;
    onToggleFavorite: (e: React.MouseEvent) => void;
    onSpeak?: (text: string) => void;
}

export function VocabularyCard({
    item,
    isMini = false,
    revealed = true,
    isFavorite,
    localizedMeaning,
    onReveal,
    onToggleFavorite,
    onSpeak
}: VocabularyCardProps) {
    const { t } = useTranslation();
    
    return (
        <motion.div
            layout
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => !isMini && !revealed && onReveal?.()}
            className={`
                relative w-full ${isMini ? 'p-6 min-h-[250px]' : 'p-8 md:p-12 min-h-[400px]'} rounded-3xl text-center cursor-pointer transition-all duration-500 vocabulary-card
            `}
        >
            <button
                onClick={onToggleFavorite}
                className="absolute top-6 left-6 text-2xl z-10 hover:scale-110 transition-transform"
                title={isFavorite ? t('learning.remove_favorite') : t('learning.add_favorite')}
            >
                {isFavorite
                    ? <FaHeart className="text-red-500" />
                    : <FaRegHeart className="text-gray-400 hover:text-red-400" />
                }
            </button>

            <div className="absolute top-6 right-6">
                <span className={`
                    px-3 py-1 rounded-full text-xs font-bold tracking-widest border
                    ${item.level === 'C2'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }
                `}>
                    {item.level}
                </span>
            </div>

            <div className={`${isMini ? 'mt-8' : ''}`}>
                <h2 className={`${isMini ? 'text-2xl' : 'text-3xl md:text-5xl'} font-serif font-bold mb-4 leading-tight`}>
                    « {item.expression} »
                </h2>

                {(isMini || revealed) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                    >
                        <p className={`${isMini ? 'text-base' : 'text-xl md:text-2xl'} font-light mb-4 vocabulary-meaning`}>
                            {localizedMeaning}
                        </p>

                        {!isMini && (
                            <div className="text-left p-6 rounded-2xl vocabulary-example-box">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
                                    <FaLightbulb /> Exemple
                                </div>
                                <div className="flex gap-4">
                                    <p className="italic font-serif text-lg leading-relaxed flex-1">
                                        "{item.example}"
                                    </p>
                                    {onSpeak && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onSpeak(item.example); }}
                                            className="self-start p-2 rounded-full hover:bg-current/10 transition-colors opacity-50 hover:opacity-100"
                                        >
                                            <FaVolumeUp />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                        {isMini && (
                            <p className="text-sm italic opacity-60 mt-2">"{item.example}"</p>
                        )}
                    </motion.div>
                )}

                {!isMini && !revealed && (
                    <div className="text-sm opacity-50 uppercase tracking-widest mt-12 animate-pulse">
                        Tap to reveal
                    </div>
                )}
            </div>
        </motion.div>
    );
}
