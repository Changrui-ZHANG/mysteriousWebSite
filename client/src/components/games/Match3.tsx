import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        // Rows
        for (let i = 0; i < 64; i++) {
            const rowOfThree = [i, i + 1, i + 2];
            const decidedColor = board[i];
            const isBlank = board[i] === '';

            if (rowOfThree.every(square => board[square] === decidedColor && !isBlank)) {
                if ((i + 2) % WIDTH < (i % WIDTH)) continue; // Wrap around check

                rowOfThree.forEach(square => board[square] = '');
                setScore(prev => prev + 3);
                return true;
            }
        }
        // Columns
        for (let i = 0; i < 47; i++) {
            const columnOfThree = [i, i + WIDTH, i + WIDTH * 2];
            const decidedColor = board[i];
            const isBlank = board[i] === '';

            if (columnOfThree.every(square => board[square] === decidedColor && !isBlank)) {
                columnOfThree.forEach(square => board[square] = '');
                setScore(prev => prev + 3);
                return true;
            }
        }
        return false;
    };

    // Move candies down
    const moveIntoSquareBelow = () => {
        for (let i = 0; i < 64 - WIDTH; i++) {
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7];
            const isFirstRow = firstRow.includes(i);

            if (isFirstRow && board[i] === '') {
                const randomNumber = Math.floor(Math.random() * CANDY_COLORS.length);
                board[i] = CANDY_COLORS[randomNumber];
            }

            if (board[i + WIDTH] === '') {
                board[i + WIDTH] = board[i];
                board[i] = '';
            }
        }
    };

    // Game loop
    useEffect(() => {
        const timer = setInterval(() => {
            checkForMatches();
            moveIntoSquareBelow();
            setBoard([...board]);
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
                newBoard[firstIndex] = board[secondIndex];
                newBoard[secondIndex] = board[firstIndex];
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
        <div className={`w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-black/80' : 'bg-white/80'}`}>
            <div className="absolute top-4 flex justify-between w-full px-8">
                <div className="text-xl font-bold font-mono text-fuchsia-400">{t('game.score')}: {score}</div>
                <button onClick={resetGame} className="text-sm font-bold text-white/50 hover:text-white">{t('game.reset')}</button>
            </div>

            <div className="grid grid-cols-8 gap-1 p-4 bg-black/40 rounded-lg">
                {board.map((candyColor, index) => (
                    <motion.div
                        key={index}
                        layout
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={`w-10 h-10 rounded-lg cursor-pointer shadow-lg ${candyColor} ${selectedCandies.includes(index) ? 'ring-4 ring-white' : ''}`}
                        onClick={() => handleClick(index)}
                        style={{
                            boxShadow: `0 0 10px ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
                        }}
                    >
                    </motion.div>
                ))}
            </div>

            <p className="mt-4 text-white/60 text-sm">{t('game.match3_desc')}</p>
        </div>
    );
}
