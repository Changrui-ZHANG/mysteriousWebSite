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
}

export default function Match3({ isDarkMode }: Match3Props) {
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
        let matchFound = false;

        // Rows
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2];
            const decidedColor = newBoard[i];
            const isBlank = newBoard[i] === '';

            if (rowOfThree.every(square => newBoard[square] === decidedColor && !isBlank)) {
                if ((i + 2) % WIDTH < (i % WIDTH)) continue; // Wrap around check

                rowOfThree.forEach(square => newBoard[square] = '');
                matchFound = true;
            }
        }

        // Columns
        for (let i = 0; i < 47; i++) {
            const columnOfThree = [i, i + WIDTH, i + WIDTH * 2];
            const decidedColor = newBoard[i];
            const isBlank = newBoard[i] === '';

            if (columnOfThree.every(square => newBoard[square] === decidedColor && !isBlank)) {
                columnOfThree.forEach(square => newBoard[square] = '');
                matchFound = true;
            }
        }

        if (matchFound) {
            setScore(prev => prev + 3);
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
    const resetGame = () => {
        setScore(0);
        createBoard();
    }

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} p-4`}>
            <div className="w-full flex justify-between items-center px-4 mb-4 md:px-8">
                <div className="text-xl font-bold font-mono text-fuchsia-400">{t('game.score')}: {score}</div>
                <button onClick={resetGame} className="text-sm font-bold text-white/50 hover:text-white bg-white/10 px-3 py-1 rounded-full">{t('game.reset')}</button>
            </div>

            <div className="w-full max-w-[400px] grid grid-cols-8 gap-0.5 md:gap-1 p-2 md:p-4 bg-black/40 rounded-lg mx-auto">
                <AnimatePresence initial={false}>
                    {board.map((candyColor, index) => (
                        <motion.div
                            key={index}
                            layout
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`w-full aspect-square rounded-md md:rounded-lg cursor-pointer shadow-lg ${candyColor} ${selectedCandies.includes(index) ? 'ring-2 md:ring-4 ring-white' : ''}`}
                            onClick={() => handleClick(index)}
                            style={{
                                boxShadow: `0 0 10px ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
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
