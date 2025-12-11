import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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
}

export default function Match3({ isDarkMode, onSubmitScore, personalBest }: Match3Props) {
    const { t } = useTranslation();
    const [board, setBoard] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [selectedCandies, setSelectedCandies] = useState<number[]>([]);

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
                    row += matchLen - 1;
                }
            }
        }

        if (matchedIndices.size > 0) {
            setScore(prev => prev + matchedIndices.size);
            matchedIndices.forEach(index => {
                newBoard[index] = '';
            });
            setBoard(newBoard);
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
    }, [board]);

    // Handle clicks
    const handleClick = (index: number) => {
        if (selectedCandies.includes(index)) {
            setSelectedCandies([]);
            return;
        }

        if (selectedCandies.length === 0) {
            setSelectedCandies([index]);
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
            } else {
                setSelectedCandies([index]);
            }
        }
    };

    // Reset Game
    // Autosave score on change with debounce
    useEffect(() => {
        if (score > 0) {
            const timer = setTimeout(() => {
                onSubmitScore(score);
            }, 1000); // Wait 1s after last score change before saving
            return () => clearTimeout(timer);
        }
    }, [score, onSubmitScore]);

    // Reset Game
    const resetGame = () => {
        // Score is already saved by effect
        setScore(0);
        createBoard();
    }

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} p-4`}>
            <div className="w-full flex justify-between items-center px-4 mb-4 md:px-8">
                <div className="flex gap-4 items-center">
                    <div className="text-xl font-bold font-mono text-fuchsia-400">
                        {t('game.score')}: {score}
                        {personalBest && personalBest.score !== undefined && (
                            <span className="ml-3 text-lg text-purple-400 opacity-80">
                                ({t('game.best')}: {Math.max(score, personalBest.score)})
                            </span>
                        )}
                    </div>
                </div>
                <button onClick={resetGame} className="text-sm font-bold text-white/50 hover:text-white bg-white/10 px-3 py-1 rounded-full">{t('game.reset')}</button>
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
    );
}
