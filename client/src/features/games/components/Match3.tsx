import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { FaQuestion, FaArrowLeft, FaExpand, FaCompress } from 'react-icons/fa';
import { GradientHeading, Button } from '../../../components';
import { useFullScreen } from '../../../hooks/useFullScreen';
import ElasticSlider from '../../../components/ElasticSlider/ElasticSlider';

const WIDTH = 8;
const CANDY_COLORS = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500'
];

interface Match3Props {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function Match3({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, onGameStart }: Match3Props) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const [board, setBoard] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [selectedCandies, setSelectedCandies] = useState<number[]>([]);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);

    useBGM('https://cdn.pixabay.com/audio/2024/10/10/audio_2290aa59a9.mp3', !isMuted && !isFlipped, volume);

    // Combo state
    const [comboMultiplier, setComboMultiplier] = useState(0);

    // Initialize board
    const createBoard = () => {
        const randomBoard = [];
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            const randomColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
            randomBoard.push(randomColor);
        }
        setBoard(randomBoard);
    };

    useEffect(() => {
        createBoard();
    }, []);

    // Check for matches
    const checkForMatches = () => {
        const newBoard = [...board];
        const matchedIndices = new Set<number>();
        let turnBaseScore = 0;

        // Rows
        for (let row = 0; row < WIDTH; row++) {
            for (let col = 0; col < WIDTH - 2; col++) {
                const i = row * WIDTH + col;
                const candy1 = newBoard[i];
                if (!candy1) continue;

                let matchLen = 1;
                while (col + matchLen < WIDTH && newBoard[i + matchLen] === candy1) {
                    matchLen++;
                }

                if (matchLen >= 3) {
                    for (let k = 0; k < matchLen; k++) {
                        matchedIndices.add(i + k);
                    }
                    turnBaseScore += (matchLen - 2) * matchLen;
                    col += matchLen - 1;
                }
            }
        }

        // Columns
        for (let col = 0; col < WIDTH; col++) {
            for (let row = 0; row < WIDTH - 2; row++) {
                const i = row * WIDTH + col;
                const candy1 = newBoard[i];
                if (!candy1) continue;

                let matchLen = 1;
                while (row + matchLen < WIDTH && newBoard[(row + matchLen) * WIDTH + col] === candy1) {
                    matchLen++;
                }

                if (matchLen >= 3) {
                    for (let k = 0; k < matchLen; k++) {
                        matchedIndices.add((row + k) * WIDTH + col);
                    }
                    turnBaseScore += (matchLen - 2) * matchLen;
                    row += matchLen - 1;
                }
            }
        }

        if (matchedIndices.size > 0) {
            const nextMultiplier = comboMultiplier + 1;
            setScore(prev => prev + (turnBaseScore * nextMultiplier));
            setComboMultiplier(prev => prev + 1);
            matchedIndices.forEach(index => {
                newBoard[index] = '';
            });
            setBoard(newBoard);
            playSound('break', matchedIndices.size); // Dynamic sound based on match count
            return true;
        }
        return false;
    };

    // Move candies down
    const moveIntoSquareBelow = () => {
        const newBoard = [...board];
        let moved = false;

        for (let i = 0; i < 64 - WIDTH; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (isFirstRow && newBoard[i] === '') {
                const randomNumber = Math.floor(Math.random() * CANDY_COLORS.length);
                newBoard[i] = CANDY_COLORS[randomNumber];
                moved = true;
            }

            if (newBoard[i + WIDTH] === '') {
                newBoard[i + WIDTH] = newBoard[i];
                newBoard[i] = '';
                moved = true;
            }
        }

        // Ensure top row is filled if empty
        for (let i = 0; i < WIDTH; i++) {
            if (newBoard[i] === '') {
                const randomNumber = Math.floor(Math.random() * CANDY_COLORS.length);
                newBoard[i] = CANDY_COLORS[randomNumber];
                moved = true;
            }
        }

        if (moved) {
            setBoard(newBoard);
        }
    };

    // Game loop
    useEffect(() => {
        const timer = setInterval(() => {
            // Prioritize falling over matching to avoid flickering
            moveIntoSquareBelow();
            checkForMatches();
        }, 100);
        return () => clearInterval(timer);
    }, [board, comboMultiplier]);

    // Handle clicks
    const handleClick = (index: number) => {
        if (selectedCandies.includes(index)) {
            setSelectedCandies([]);
            playSound('click');
            return;
        }

        if (selectedCandies.length === 0) {
            setSelectedCandies([index]);
            playSound('click');
        } else {
            const firstIndex = selectedCandies[0];
            const secondIndex = index;

            // Check adjacency
            const isAdjacent = [1, -1, WIDTH, -WIDTH].includes(secondIndex - firstIndex);

            if (isAdjacent) {
                const newBoard = [...board];
                // Simple swap for strings
                const temp = newBoard[firstIndex];
                newBoard[firstIndex] = newBoard[secondIndex];
                newBoard[secondIndex] = temp;

                setBoard(newBoard);
                setSelectedCandies([]);
                setComboMultiplier(0); // Reset combo on user move
            } else {
                setSelectedCandies([index]);
            }
        }
    };

    // Reset Game
    // Use a ref to access the latest onSubmitScore without triggering effect on prop change
    const onSubmitScoreRef = useRef(onSubmitScore);
    useEffect(() => {
        onSubmitScoreRef.current = onSubmitScore;
    }, [onSubmitScore]);

    // Resubmit score when user logs in
    useEffect(() => {
        if (isAuthenticated && score > 0) {
            onSubmitScoreRef.current(score);
        }
    }, [isAuthenticated, score]);

    // Autosave score on change with debounce
    useEffect(() => {
        if (score > 0) {
            const timer = setTimeout(() => {
                onSubmitScoreRef.current(score);
            }, 1000); // Wait 1s after last score change before saving
            return () => clearTimeout(timer);
        }
    }, [score]);

    // Reset Game
    const resetGame = () => {
        if (onGameStart) onGameStart();
        playSound('click');
        // Force save current score before resetting if valid
        if (score > 0) {
            onSubmitScoreRef.current(score);
        }
        setScore(0);
        setComboMultiplier(0);
        createBoard();
    }

    return (
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isFullScreen ? 'bg-slate-900 overflow-auto py-8' : ''}`} style={{ perspective: '1000px' }}>
            {/* EXTERNAL GLOBAL CONTROLS */}
            <div className="flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 z-[100] rounded-t-xl mx-4 mt-4">
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider
                        defaultValue={volume * 100}
                        onChange={(v) => setVolume(v / 100)}
                        color="pink"
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                    />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                    className="text-pink-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
                >
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }}
                    className="text-pink-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title="Aide / Règles"
                >
                    <FaQuestion size={18} />
                </button>
            </div>

            <motion.div
                className="flex-1 w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face (Game) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md transition-colors duration-500 overflow-hidden ${theme.bgCard} p-4`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="w-full flex justify-between items-center px-4 mb-4 md:px-8">
                        <div className="flex gap-4 items-center">
                            <div className="text-xl font-bold font-mono text-fuchsia-400 flex items-center">
                                {t('game.score')}: {score}
                                {comboMultiplier > 1 && (
                                    <span className="ml-2 text-yellow-400 font-black animate-pulse text-xl md:text-2xl">
                                        {t('game.combos')} x{comboMultiplier}
                                    </span>
                                )}
                                {personalBest && personalBest.score !== undefined && (
                                    <span className="ml-3 text-lg text-purple-400 opacity-80">
                                        ({t('game.best')}: {Math.max(score, personalBest.score)})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={resetGame}
                                variant="ghost"
                                size="sm"
                                rounded="full"
                            >
                                {t('game.reset')}
                            </Button>
                        </div>
                    </div>

                    <div className="w-full max-w-[400px] grid grid-cols-8 gap-0.5 md:gap-1 p-2 md:p-4 bg-black/40 rounded-lg mx-auto">
                        <AnimatePresence mode='popLayout'>
                            {board.map((candyColor, index) => (
                                <motion.div
                                    key={`${index}-${candyColor}`} // Key changes when content changes, triggering animation
                                    layout={false} // Disable layout animation to avoid "reshuffling" artifacts
                                    initial={{ y: -20, opacity: 0, scale: 0.8 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`w-full aspect-square rounded-md md:rounded-lg cursor-pointer ${candyColor ? 'shadow-lg z-10' : 'invisible z-0'} ${candyColor} ${selectedCandies.includes(index) ? 'ring-2 md:ring-4 ring-white' : ''}`}
                                    onClick={() => handleClick(index)}
                                    style={{
                                        boxShadow: candyColor ? `0 0 10px ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}` : 'none'
                                    }}
                                >
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <p className="mt-4 text-white/60 text-sm">{t('game.match3_desc')}</p>
                </div>

                {/* Back Face (Rules) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col p-8 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <GradientHeading gradient="purple-pink" level={2}>
                            {t('game.match3')} - {t('game.arcade_zone')}
                        </GradientHeading>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-white text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-fuchsia-500/50 scrollbar-track-transparent pr-2">
                        <section className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm shadow-xl">
                            <h3 className="text-xl font-bold text-fuchsia-400 mb-3 flex items-center gap-2">
                                <span className="bg-fuchsia-500/20 p-2 rounded-lg">🎯</span>
                                {t('game.objective')}
                            </h3>
                            <p className="text-white/80 leading-relaxed text-sm md:text-base">
                                {t('game.match3_rules_text')}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-fuchsia-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">💥</span>
                                    <h4 className="font-bold text-white">{t('game.combos')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.match3_combos')}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">⚡</span>
                                    <h4 className="font-bold text-white">{t('game.speed')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.match3_speed')}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-fuchsia-500/10 to-transparent p-4 rounded-xl border-l-4 border-fuchsia-400">
                            <p className="text-xs md:text-sm text-fuchsia-200 italic">
                                💡 Astuce : Les alignements de 4 ou 5 blocs rapportent des bonus massifs !
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
