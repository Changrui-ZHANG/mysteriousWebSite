/**
 * Match3 - Candy crush style matching game
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../../shared/hooks/useSound';
import { useMute } from '../../../shared/hooks/useMute';
import { useMatch3 } from '../hooks/useMatch3';
import { GameWindow } from './GameWindow';
import { Match3Rules, AUDIO_CONFIG } from './match3/index';

interface Match3Props {
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function Match3({ onSubmitScore, personalBest, isAuthenticated, onGameStart }: Match3Props) {
    const { t } = useTranslation();
    const { isMuted } = useMute();
    const { playSound } = useSound(!isMuted);

    const { board, score, selectedCandies, comboMultiplier, handleClick, createBoard } = useMatch3({
        onSubmitScore, isAuthenticated, onGameStart, playSound,
    });

    const comboInfo = comboMultiplier > 1 && (
        <span className="text-yellow-400 font-black animate-pulse">{t('game.combos')} x{comboMultiplier}</span>
    );

    return (
        <GameWindow
            color="pink"
            bgmUrl={AUDIO_CONFIG.BGM_URL}
            bgGradient="bg-gradient-to-b from-pink-900/50 to-slate-900/80"
            onReset={() => { createBoard(); playSound('click'); }}
            hud={{
                score,
                personalBest,
                customInfo: comboInfo,
            }}
            rulesContent={<Match3Rules onClose={() => { }} />}
        >
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-[400px] grid grid-cols-8 gap-0.5 md:gap-1 p-2 md:p-4 bg-black/40 rounded-lg mx-auto">
                    <AnimatePresence mode='popLayout'>
                        {board.map((candyColor, index) => (
                            <motion.div
                                key={`${index}-${candyColor}`}
                                layout={false}
                                initial={{ y: -20, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`w-full aspect-square rounded-md md:rounded-lg cursor-pointer ${candyColor ? 'shadow-lg z-10 candy-shadow' : 'invisible z-0'} ${candyColor} ${selectedCandies.includes(index) ? 'ring-2 md:ring-4 ring-white' : ''}`}
                                onClick={() => handleClick(index)}
                            />
                        ))}
                    </AnimatePresence>
                </div>
                <p className="mt-4 text-white/60 text-sm">{t('game.match3_desc')}</p>
            </div>
        </GameWindow>
    );
}
