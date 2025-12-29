/**
 * useMatch3 - Hook for Match3 game logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BOARD_CONFIG, CANDY_COLORS, SCORING_CONFIG } from '../components/match3/constants';

const WIDTH = BOARD_CONFIG.WIDTH;

interface UseMatch3Props {
    onSubmitScore: (score: number) => void;
    isAuthenticated: boolean;
    onGameStart?: () => void;
    playSound: (sound: 'click' | 'break', count?: number) => void;
}

export function useMatch3({ onSubmitScore, isAuthenticated, onGameStart, playSound }: UseMatch3Props) {
    const [board, setBoard] = useState<string[]>([]);
    const [score, setScore] = useState(0);
    const [selectedCandies, setSelectedCandies] = useState<number[]>([]);
    const [comboMultiplier, setComboMultiplier] = useState(0);

    const onSubmitScoreRef = useRef(onSubmitScore);
    useEffect(() => { onSubmitScoreRef.current = onSubmitScore; }, [onSubmitScore]);

    const createBoard = useCallback(() => {
        const randomBoard = [];
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            randomBoard.push(CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)]);
        }
        setBoard(randomBoard);
    }, []);

    useEffect(() => { createBoard(); }, [createBoard]);

    // Check for matches
    const checkForMatches = useCallback(() => {
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
                while (col + matchLen < WIDTH && newBoard[i + matchLen] === candy1) matchLen++;
                if (matchLen >= SCORING_CONFIG.MIN_MATCH_LENGTH) {
                    for (let k = 0; k < matchLen; k++) matchedIndices.add(i + k);
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
                while (row + matchLen < WIDTH && newBoard[(row + matchLen) * WIDTH + col] === candy1) matchLen++;
                if (matchLen >= SCORING_CONFIG.MIN_MATCH_LENGTH) {
                    for (let k = 0; k < matchLen; k++) matchedIndices.add((row + k) * WIDTH + col);
                    turnBaseScore += (matchLen - 2) * matchLen;
                    row += matchLen - 1;
                }
            }
        }

        if (matchedIndices.size > 0) {
            const nextMultiplier = comboMultiplier + 1;
            setScore(prev => prev + (turnBaseScore * nextMultiplier));
            setComboMultiplier(prev => prev + 1);
            matchedIndices.forEach(index => { newBoard[index] = ''; });
            setBoard(newBoard);
            playSound('break', matchedIndices.size);
            return true;
        }
        return false;
    }, [board, comboMultiplier, playSound]);

    // Move candies down
    const moveIntoSquareBelow = useCallback(() => {
        const newBoard = [...board];
        let moved = false;

        for (let i = 0; i < 64 - WIDTH; i++) {
            const isFirstRow = i < WIDTH;
            if (isFirstRow && newBoard[i] === '') {
                newBoard[i] = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
                moved = true;
            }
            if (newBoard[i + WIDTH] === '') {
                newBoard[i + WIDTH] = newBoard[i];
                newBoard[i] = '';
                moved = true;
            }
        }

        for (let i = 0; i < WIDTH; i++) {
            if (newBoard[i] === '') {
                newBoard[i] = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
                moved = true;
            }
        }

        if (moved) setBoard(newBoard);
    }, [board]);

    // Game loop
    useEffect(() => {
        const timer = setInterval(() => {
            moveIntoSquareBelow();
            checkForMatches();
        }, BOARD_CONFIG.GAME_LOOP_INTERVAL);
        return () => clearInterval(timer);
    }, [moveIntoSquareBelow, checkForMatches]);

    // Handle clicks
    const handleClick = useCallback((index: number) => {
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
            const isAdjacent = [1, -1, WIDTH, -WIDTH].includes(index - firstIndex);

            if (isAdjacent) {
                const newBoard = [...board];
                const temp = newBoard[firstIndex];
                newBoard[firstIndex] = newBoard[index];
                newBoard[index] = temp;
                setBoard(newBoard);
                setSelectedCandies([]);
                setComboMultiplier(0);
            } else {
                setSelectedCandies([index]);
            }
        }
    }, [selectedCandies, board, playSound]);

    // Resubmit score when user logs in
    useEffect(() => {
        if (isAuthenticated && score > 0) onSubmitScoreRef.current(score);
    }, [isAuthenticated, score]);

    // Autosave score with debounce
    useEffect(() => {
        if (score > 0) {
            const timer = setTimeout(() => onSubmitScoreRef.current(score), BOARD_CONFIG.SCORE_SUBMIT_DEBOUNCE);
            return () => clearTimeout(timer);
        }
    }, [score]);

    const resetGame = useCallback(() => {
        if (onGameStart) onGameStart();
        playSound('click');
        if (score > 0) onSubmitScoreRef.current(score);
        setScore(0);
        setComboMultiplier(0);
        createBoard();
    }, [onGameStart, playSound, score, createBoard]);

    return { board, score, selectedCandies, comboMultiplier, handleClick, resetGame, createBoard };
}
