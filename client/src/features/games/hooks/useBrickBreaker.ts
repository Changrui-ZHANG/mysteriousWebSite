/**
 * useBrickBreaker - Hook for brick breaker game logic
 * Encapsulates game state, map management, and progression
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import {
    LEVEL_CONFIG,
    BRICK_CONFIG,
    type GameState,
    type SoundType,
} from '../components/brickbreaker/constants';

interface UseBrickBreakerProps {
    onSubmitScore: (score: number) => void;
    isAuthenticated: boolean;
    playSound: (sound: SoundType) => void;
}

export function useBrickBreaker({ onSubmitScore, playSound }: UseBrickBreakerProps) {
    const [gameState, setGameState] = useState<GameState>('start');
    const [points, setPoints] = useState(0);
    const [selectedMap, setSelectedMap] = useState(0);
    const [showMapSelector, setShowMapSelector] = useState(false);
    const [randomMapData, setRandomMapData] = useState<number[][] | null>(null);
    const [isLoadingMap, setIsLoadingMap] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);

    const [unlockedMaps, setUnlockedMaps] = useState<number[]>(() => {
        const saved = localStorage.getItem('brickbreaker_unlocked_maps');
        return saved ? JSON.parse(saved) : [0];
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const paddleWidthTimeoutRef = useRef<number | null>(null);

    const score = unlockedMaps.length;

    const fetchRandomMap = useCallback(async () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return null;

        const rect = container.getBoundingClientRect();
        const availableWidth = rect.width - (BRICK_CONFIG.OFFSET_LEFT * 2);
        const targetBrickSize = BRICK_CONFIG.TARGET_SIZE;
        const brickPadding = BRICK_CONFIG.PADDING;
        const targetCols = Math.floor(availableWidth / (targetBrickSize + brickPadding));
        const n = Math.floor((targetCols - 1) / 6);
        const cols = (n * 6) + 1;

        const brickWidth = (availableWidth - (cols * brickPadding)) / cols;
        const mazeCoverage = 0.35;
        const targetRows = Math.floor((rect.height * mazeCoverage) / (brickWidth + brickPadding));
        const m = Math.floor((targetRows - 1) / 6);
        const rows = (m * 6) + 1;

        try {
            const response = await fetch(`/api/games/brickbreaker/random-map?width=${cols}&height=${rows}&t=${Date.now()}`);
            const data = await response.json();
            if (data.success) return data.data.grid;
        } catch (err) {
            console.error('Error fetching random map:', err);
        }
        return null;
    }, []);

    const handleStartGame = useCallback(async (mapId?: number) => {
        playSound('click');
        const activeMapId = mapId !== undefined ? mapId : selectedMap;

        if (activeMapId === 15) {
            setIsLoadingMap(true);
            const mapData = await fetchRandomMap();
            setRandomMapData(mapData);
            setIsLoadingMap(false);
        } else {
            setRandomMapData(null);
        }

        if (mapId !== undefined) setSelectedMap(mapId);
        setPoints(0);
        setGameState('playing');
    }, [selectedMap, fetchRandomMap, playSound]);

    const handleNextLevel = useCallback(() => {
        if (selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT) {
            handleStartGame(selectedMap + 1);
        }
    }, [selectedMap, handleStartGame]);

    const handleReset = useCallback(() => {
        setPoints(0);
        setGameState('start');
        playSound('click');
    }, [playSound]);

    // Submit score and unlock next map on game end
    useEffect(() => {
        if (gameState === 'gameover' || gameState === 'won') {
            onSubmitScore(score);

            if (gameState === 'won' && selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT) {
                if (!unlockedMaps.includes(selectedMap + 1)) {
                    const newUnlocked = [...unlockedMaps, selectedMap + 1].sort((a, b) => a - b);
                    setUnlockedMaps(newUnlocked);
                    localStorage.setItem('brickbreaker_unlocked_maps', JSON.stringify(newUnlocked));
                }
            }
        }
    }, [gameState, score, onSubmitScore, selectedMap, unlockedMaps]);

    // Cleanup paddle width timeout
    useEffect(() => {
        return () => {
            if (paddleWidthTimeoutRef.current !== null) {
                clearTimeout(paddleWidthTimeoutRef.current);
            }
        };
    }, []);

    return {
        // State
        gameState,
        setGameState,
        points,
        setPoints,
        selectedMap,
        setSelectedMap,
        showMapSelector,
        setShowMapSelector,
        randomMapData,
        isLoadingMap,
        isFlipped,
        setIsFlipped,
        unlockedMaps,
        score,
        // Refs
        canvasRef,
        containerRef,
        paddleWidthTimeoutRef,
        // Actions
        handleStartGame,
        handleNextLevel,
        handleReset,
        playSound,
    };
}
