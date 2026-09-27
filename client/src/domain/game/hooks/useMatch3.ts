/**
 * useMatch3 - Hook for Match3 game logic
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BOARD_CONFIG, CANDY_COLORS, SCORING_CONFIG } from '../components/match3/constants';

const WIDTH = BOARD_CONFIG.WIDTH;

const randomCandy = () => CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];

/** Clears matches; returns the same board reference when nothing matched */
function checkForMatches(board: string[]) {
    const matchedIndices = new Set<number>();
    let turnBaseScore = 0;

    // Rows
    for (let row = 0; row < WIDTH; row++) {
        for (let col = 0; col < WIDTH - 2; col++) {
            const i = row * WIDTH + col;
            const candy1 = board[i];
            if (!candy1) continue;
            let matchLen = 1;
            while (col + matchLen < WIDTH && board[i + matchLen] === candy1) matchLen++;
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
            const candy1 = board[i];
            if (!candy1) continue;
            let matchLen = 1;
            while (row + matchLen < WIDTH && board[(row + matchLen) * WIDTH + col] === candy1) matchLen++;
            if (matchLen >= SCORING_CONFIG.MIN_MATCH_LENGTH) {
                for (let k = 0; k < matchLen; k++) matchedIndices.add((row + k) * WIDTH + col);
                turnBaseScore += (matchLen - 2) * matchLen;
                row += matchLen - 1;
            }
        }
    }

    if (matchedIndices.size === 0) return { board, matchedCount: 0, turnBaseScore: 0 };
    const newBoard = [...board];
    matchedIndices.forEach(index => { newBoard[index] = ''; });
    return { board: newBoard, matchedCount: matchedIndices.size, turnBaseScore };
}

/** Moves candies down one step and refills the top row; returns the same reference when nothing moved */
function moveIntoSquareBelow(board: string[]) {
    const newBoard = [...board];
    let moved = false;

    for (let i = 0; i < WIDTH * WIDTH - WIDTH; i++) {
        const isFirstRow = i < WIDTH;
        if (isFirstRow && newBoard[i] === '') {
            newBoard[i] = randomCandy();
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
            newBoard[i] = randomCandy();
            moved = true;
        }
    }

    return moved ? newBoard : board;
}

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
    const playSoundRef = useRef(playSound);
    useEffect(() => { playSoundRef.current = playSound; }, [playSound]);

    // Refs mirror state so the game loop stays stable and never reads a stale board
    const boardRef = useRef<string[]>([]);
    const comboRef = useRef(0);
    const scoreRef = useRef(0);
    const lastSubmittedRef = useRef(0);

    const updateBoard = useCallback((next: string[]) => {
        boardRef.current = next;
        setBoard(next);
    }, []);

    const submitOnce = useCallback((value: number) => {
        if (value <= 0 || value === lastSubmittedRef.current) return;
        lastSubmittedRef.current = value;
        onSubmitScoreRef.current(value);
    }, []);

    const createBoard = useCallback(() => {
        const randomBoard = [];
        for (let i = 0; i < WIDTH * WIDTH; i++) {
            randomBoard.push(randomCandy());
        }
        updateBoard(randomBoard);
    }, [updateBoard]);

    useEffect(() => { createBoard(); }, [createBoard]);

    // Game loop: fall first, then detect matches on the resulting board
    useEffect(() => {
        const timer = setInterval(() => {
            const moved = moveIntoSquareBelow(boardRef.current);
            const { board: checked, matchedCount, turnBaseScore } = checkForMatches(moved);
            if (checked !== boardRef.current) updateBoard(checked);
            if (matchedCount > 0) {
                comboRef.current += 1;
                scoreRef.current += turnBaseScore * comboRef.current;
                setComboMultiplier(comboRef.current);
                setScore(scoreRef.current);
                playSoundRef.current('break', matchedCount);
            }
        }, BOARD_CONFIG.GAME_LOOP_INTERVAL);
        return () => clearInterval(timer);
    }, [updateBoard]);

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
            const diff = index - firstIndex;
            const sameRow = Math.floor(index / WIDTH) === Math.floor(firstIndex / WIDTH);
            const isAdjacent = (Math.abs(diff) === 1 && sameRow) || Math.abs(diff) === WIDTH;

            if (isAdjacent) {
                const newBoard = [...boardRef.current];
                const temp = newBoard[firstIndex];
                newBoard[firstIndex] = newBoard[index];
                newBoard[index] = temp;
                updateBoard(newBoard);
                setSelectedCandies([]);
                comboRef.current = 0;
                setComboMultiplier(0);
            } else {
                setSelectedCandies([index]);
            }
        }
    }, [selectedCandies, playSound, updateBoard]);

    // Resubmit score when user logs in (guest submissions are not saved)
    useEffect(() => {
        if (isAuthenticated && scoreRef.current > 0) {
            lastSubmittedRef.current = scoreRef.current;
            onSubmitScoreRef.current(scoreRef.current);
        }
    }, [isAuthenticated]);

    // Autosave score with debounce
    useEffect(() => {
        if (score > 0) {
            const timer = setTimeout(() => submitOnce(score), BOARD_CONFIG.SCORE_SUBMIT_DEBOUNCE);
            return () => clearTimeout(timer);
        }
    }, [score, submitOnce]);

    const resetGame = useCallback(() => {
        if (onGameStart) onGameStart();
        playSound('click');
        submitOnce(scoreRef.current);
        scoreRef.current = 0;
        comboRef.current = 0;
        lastSubmittedRef.current = 0;
        setScore(0);
        setComboMultiplier(0);
        createBoard();
    }, [onGameStart, playSound, submitOnce, createBoard]);

    return { board, score, selectedCandies, comboMultiplier, handleClick, resetGame, createBoard };
}
