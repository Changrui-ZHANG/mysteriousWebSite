import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { FaQuestion, FaArrowLeft, FaExpand, FaCompress, FaRedo } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { GradientHeading, ScoreDisplay } from '../../../components';
import ElasticSlider from '../../../components/ui/ElasticSlider/ElasticSlider';

// ===== BALL CONFIGURATION =====
const BALL_CONFIG = {
    /** Maximum number of balls allowed on screen */
    MAX_BALLS: 60000,
    /** Ball radius in pixels */
    RADIUS: 3,
    /** Initial horizontal speed */
    INITIAL_SPEED_X: 0,
    /** Initial vertical speed (negative = upward) */
    INITIAL_SPEED_Y: -5,
    /** Constant speed magnitude for uniform movement */
    SPEED: 5,
    /** Y offset from bottom for initial spawn */
    SPAWN_OFFSET_Y: 30,
} as const;

// ===== PADDLE CONFIGURATION =====
const PADDLE_CONFIG = {
    /** Paddle height in pixels */
    HEIGHT: 8,
    /** Default paddle width */
    DEFAULT_WIDTH: 140,
    /** Maximum paddle width (with powerup) */
    MAX_WIDTH: 450,
    /** Paddle width increase per powerup */
    WIDTH_INCREASE: 60,
    /** Duration of wide powerup effect in ms */
    WIDE_POWERUP_DURATION: 8000,
    /** Multiplier for ball angle based on impact position */
    IMPACT_MULTIPLIER: 6,
    /** Offset from bottom of canvas */
    BOTTOM_OFFSET: 5,
};

// ===== BRICK CONFIGURATION =====
const BRICK_CONFIG = {
    /** Target brick size for square bricks */
    TARGET_SIZE: 5,
    /** Padding between bricks */
    PADDING: 2,
    /** Left margin offset */
    OFFSET_LEFT: 5,
    /** Top margin offset */
    OFFSET_TOP: 50,
    /** Percentage of canvas height covered by bricks */
    HEIGHT_COVERAGE: 0.5,
} as const;

// ===== POWERUP CONFIGURATION =====
const POWERUP_CONFIG = {
    /** Probability of dropping a powerup (0-1) */
    DROP_CHANCE: 0.05,
    /** Probability of multi vs wide powerup (0-1) */
    MULTI_CHANCE: 0.7,
    /** Powerup fall speed */
    FALL_SPEED: 3,
    /** Powerup visual radius */
    RADIUS: 10,
    /** Soft cap for multi powerup (won't multiply if above this) */
    MULTI_SOFT_CAP: 5000,
    /** Max balls to duplicate per multi powerup */
    MULTI_LIMIT: 2000,
    /** Random velocity variation for new balls */
    VELOCITY_VARIATION: 3,
} as const;

// ===== AUDIO CONFIGURATION =====
const AUDIO_CONFIG = {
    /** Minimum ms between sound effects */
    THROTTLE_MS: 30,
    /** Background music URL */
    BGM_URL: 'https://cdn.pixabay.com/audio/2025/02/17/audio_f01b9210e8.mp3',
} as const;

// ===== LEVEL DESIGN CONFIGURATION =====
const LEVEL_CONFIG = {
    /** Number of level variants */
    LEVEL_COUNT: 16,

    /** Map metadata for selection screen - uses i18n keys */
    MAPS: [
        { id: 0, i18nKey: 'tunnel', difficultyKey: 'easy', icon: '🎯' },
        { id: 1, i18nKey: 'pyramid', difficultyKey: 'medium', icon: '🔺' },
        { id: 2, i18nKey: 'chambers', difficultyKey: 'hard', icon: '🏛️' },
        { id: 3, i18nKey: 'mosaic', difficultyKey: 'medium', icon: '👑' },
        { id: 4, i18nKey: 'fortress', difficultyKey: 'hard', icon: '🏰' },
        { id: 5, i18nKey: 'galactic', difficultyKey: 'expert', icon: '🌌' },
        { id: 6, i18nKey: 'bastion', difficultyKey: 'medium', icon: '🛡️' },
        { id: 7, i18nKey: 'coliseum', difficultyKey: 'hard', icon: '🏟️' },
        { id: 8, i18nKey: 'royal_maze', difficultyKey: 'expert', icon: '🏛️' },
        { id: 9, i18nKey: 'dark_maze', difficultyKey: 'medium', icon: '🌑' },
        { id: 10, i18nKey: 'crypts', difficultyKey: 'hard', icon: '💀' },
        { id: 11, i18nKey: 'crystal', difficultyKey: 'expert', icon: '💎' },
        { id: 12, i18nKey: 'mines', difficultyKey: 'medium', icon: '⛏️' },
        { id: 13, i18nKey: 'temple', difficultyKey: 'hard', icon: '🛕' },
        { id: 14, i18nKey: 'station', difficultyKey: 'expert', icon: '🛰️' },
        { id: 15, i18nKey: 'infinite', difficultyKey: 'extreme', icon: '🌀' }
    ],

    // Tunnel Level
    TUNNEL: {
        /** Width of tunnel entry in bricks */
        ENTRY_WIDTH: 6,
        /** Rows from bottom where barrier starts */
        BARRIER_OFFSET: 5,
    },

    // Pyramid Level
    PYRAMID: {
        /** Divisor for calculating max row based on distance */
        DISTANCE_DIVISOR: 1.5,
        /** Distance from center considered "core" */
        CORE_DISTANCE: 2,
        /** Chance of wall instead of brick in shell */
        WALL_CHANCE: 0.3,
    },

    // Grid Chambers Level
    CHAMBERS: {
        /** Columns between vertical walls */
        VERTICAL_WALL_INTERVAL: 10,
        /** Rows between horizontal walls */
        HORIZONTAL_WALL_INTERVAL: 8,
        /** Gap position in horizontal walls (relative to interval) */
        GAP_POSITION: 5,
        /** Chance of brick in empty space */
        BRICK_FILL_CHANCE: 0.8,
    },

    // Arena Level
} as const;

// ===== VISUAL CONFIGURATION =====
const VISUAL_CONFIG = {
    COLORS: {
        DARK: {
            BALL: '#22d3ee',
            PADDLE: '#e879f9',
            BACKGROUND: '#0f172a',
            WALL: '#94a3b8',
        },
        LIGHT: {
            BALL: '#0891b2',
            PADDLE: '#c026d3',
            BACKGROUND: '#f8fafc',
            WALL: '#64748b',
        },
        POWERUPS: {
            MULTI: '#facc15',
            WIDE: '#4ade80',
            TEXT: '#000',
        },
    },
    /** HSL saturation for brick colors */
    BRICK_SATURATION: 75,
    /** HSL lightness for brick colors */
    BRICK_LIGHTNESS: 50,
} as const;

// ===== BRICK STATUS ENUM =====
const BRICK_STATUS = {
    EMPTY: 0,
    NORMAL: 1,
    WALL: 2,
} as const;

export default function BrickBreaker({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, isAdmin = false, isSuperAdmin = false }: {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null,
    isAuthenticated: boolean,
    isAdmin?: boolean,
    isSuperAdmin?: boolean
}) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [points, setPoints] = useState(0);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);
    useBGM(AUDIO_CONFIG.BGM_URL, !isMuted && gameState === 'playing', volume);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);

    // Map selection and progression
    const [selectedMap, setSelectedMap] = useState(0);
    const [showMapSelector, setShowMapSelector] = useState(false);
    const [unlockedMaps, setUnlockedMaps] = useState<number[]>(() => {
        // Load progression from localStorage
        const saved = localStorage.getItem('brickbreaker_unlocked_maps');
        return saved ? JSON.parse(saved) : [0]; // First map unlocked by default
    });

    // Score is strictly the number of unique maps unlocked
    const score = unlockedMaps.length;

    // State for backend-generated random map
    const [randomMapData, setRandomMapData] = useState<number[][] | null>(null);
    const [isLoadingMap, setIsLoadingMap] = useState(false);

    // Auto-scroll to selected map when menu opens
    useEffect(() => {
        if (showMapSelector && mapGridRef.current) {
            // Small timeout to ensure DOM is rendered inside AnimatePresence
            setTimeout(() => {
                const selectedCard = mapGridRef.current?.querySelector(`#map-card-${selectedMap}`);
                if (selectedCard) {
                    selectedCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [showMapSelector, selectedMap]);

    const handleStartGame = async (mapId?: number) => {
        playSound('click');
        const activeMapId = mapId !== undefined ? mapId : selectedMap;

        if (activeMapId === 15) {
            setIsLoadingMap(true);
            try {
                // IMPORTANT: Use the same logic as the game loop to calculate dimensions
                const canvas = canvasRef.current;
                const container = containerRef.current;
                if (!canvas || !container) {
                    setGameState('playing');
                    return;
                }

                const rect = container.getBoundingClientRect();
                const availableWidth = rect.width - (BRICK_CONFIG.OFFSET_LEFT * 2);
                const targetBrickSize = BRICK_CONFIG.TARGET_SIZE;
                const brickPadding = BRICK_CONFIG.PADDING;
                const targetCols = Math.floor(availableWidth / (targetBrickSize + brickPadding));
                // Adjust to 6n + 1 for perfect maze symmetry
                const n = Math.floor((targetCols - 1) / 6);
                const cols = (n * 6) + 1;

                const brickWidth = (availableWidth - (cols * brickPadding)) / cols;
                const mazeCoverage = 0.35; // Reduced from 0.45/0.75
                const targetRows = Math.floor((rect.height * mazeCoverage) / (brickWidth + brickPadding));
                const m = Math.floor((targetRows - 1) / 6);
                const rows = (m * 6) + 1;

                console.log(`Fetching maze for: ${cols}x${rows} (Canvas: ${rect.width}x${rect.height}, Coverage: ${mazeCoverage})`);

                // Fetch random maze with cache buster
                const response = await fetch(`/api/games/brickbreaker/random-map?width=${cols}&height=${rows}&t=${Date.now()}`);
                const data = await response.json();

                if (data.success) {
                    setRandomMapData(data.data.grid);
                    if (mapId !== undefined) setSelectedMap(mapId);
                    setPoints(0);
                    setGameState('playing');
                } else {
                    console.error('Failed to generate map:', data.message);
                    setGameState('playing');
                }
            } catch (err) {
                console.error('Error fetching random map:', err);
                setGameState('playing');
            } finally {
                setIsLoadingMap(false);
            }
        } else {
            if (mapId !== undefined) setSelectedMap(mapId);
            setRandomMapData(null);
            setPoints(0);
            setGameState('playing');
        }
    };

    const handleNextLevel = () => {
        if (selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT) {
            handleStartGame(selectedMap + 1);
        }
    };

    // Persist paddle width across re-renders
    const paddleWidthRef = useRef(PADDLE_CONFIG.DEFAULT_WIDTH);
    const paddleWidthTimeoutRef = useRef<number | null>(null);
    const mapGridRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ((gameState === 'gameover' || gameState === 'won')) {
            onSubmitScore(score);

            // Unlock next map on victory
            if (gameState === 'won' && selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT) {
                if (!unlockedMaps.includes(selectedMap + 1)) {
                    const newUnlocked = [...unlockedMaps, selectedMap + 1].sort((a, b) => a - b);
                    setUnlockedMaps(newUnlocked);
                    localStorage.setItem('brickbreaker_unlocked_maps', JSON.stringify(newUnlocked));
                }
            }
        }
    }, [gameState, score, isAuthenticated, onSubmitScore, selectedMap, unlockedMaps]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        // DYNAMIC SIZING: Fill the container
        const updateCanvasSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            console.log('Internal Resolution Updated:', canvas.width, 'x', canvas.height);
        };
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let animationFrameId: number;

        // Reset paddle width when game is not playing (start, gameover, won)
        if (gameState !== 'playing') {
            paddleWidthRef.current = PADDLE_CONFIG.DEFAULT_WIDTH;
            setPoints(0);
            if (paddleWidthTimeoutRef.current !== null) {
                clearTimeout(paddleWidthTimeoutRef.current);
                paddleWidthTimeoutRef.current = null;
            }
        }

        // --- GAME CONFIG (from constants) ---
        const paddleHeight = PADDLE_CONFIG.HEIGHT;
        let paddleX = (canvas.width - paddleWidthRef.current) / 2;

        // ULTRA OPTIMIZATION: TypedArrays for ball data
        const ballsX = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsY = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsDX = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsDY = new Float32Array(BALL_CONFIG.MAX_BALLS);
        let activeBallCount = 0;

        const addBall = (x: number, y: number, dx: number, dy: number) => {
            if (activeBallCount < BALL_CONFIG.MAX_BALLS) {
                ballsX[activeBallCount] = x;
                ballsY[activeBallCount] = y;
                ballsDX[activeBallCount] = dx;
                ballsDY[activeBallCount] = dy;
                activeBallCount++;
            }
        };

        // Initial ball centered
        addBall(
            canvas.width / 2,
            canvas.height - BALL_CONFIG.SPAWN_OFFSET_Y,
            BALL_CONFIG.INITIAL_SPEED_X,
            BALL_CONFIG.INITIAL_SPEED_Y
        );
        const ballRadius = BALL_CONFIG.RADIUS;

        interface PowerUp {
            x: number;
            y: number;
            dy: number;
            type: 'multi' | 'wide';
        }
        let powerUps: PowerUp[] = [];


        // UPDATED BRICK CONFIG: Square Bricks & Dynamic Grid
        const brickPadding = BRICK_CONFIG.PADDING;
        const brickOffsetLeft = BRICK_CONFIG.OFFSET_LEFT;
        const availableWidth = canvas.width - (brickOffsetLeft * 2);

        // Calculate dynamic columns to ensure square bricks
        const targetBrickSize = BRICK_CONFIG.TARGET_SIZE;
        let brickColumnCount = Math.floor(availableWidth / (targetBrickSize + brickPadding));
        if (selectedMap === 15 && randomMapData && randomMapData[0]) {
            brickColumnCount = randomMapData[0].length;
        }

        const brickWidth = (availableWidth - (brickColumnCount * brickPadding)) / brickColumnCount;
        const brickHeight = brickWidth; // SQUARE !!
        const currentHeightCoverage = selectedMap === 15 ? 0.35 : BRICK_CONFIG.HEIGHT_COVERAGE;
        let brickRowCount = Math.floor((canvas.height * currentHeightCoverage) / (brickHeight + brickPadding));
        if (selectedMap === 15 && randomMapData) {
            brickRowCount = randomMapData.length;
        }
        const brickOffsetTop = BRICK_CONFIG.OFFSET_TOP;

        // Level Data: 0=Empty, 1=Brick, 2=Indestructible Wall
        const bricks: Uint8Array[] = [];
        const brickColors: string[] = [];

        // Pre-calc colors
        for (let c = 0; c < brickColumnCount; c++) {
            brickColors[c] = `hsl(${c * (360 / brickColumnCount)}, ${VISUAL_CONFIG.BRICK_SATURATION}%, ${VISUAL_CONFIG.BRICK_LIGHTNESS}%)`;
        }

        // Init Grid
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = new Uint8Array(brickRowCount).fill(0);
        }

        // --- MAP GENERATOR ---
        const generateMap = () => {
            const mapType = selectedMap; // Use selected map instead of random

            // Map 0: "The Tunnel" (User Request)
            // A solid wall barrier with a single entry point leading to the loot
            if (mapType === 0) {
                const tunnelEntryWidth = LEVEL_CONFIG.TUNNEL.ENTRY_WIDTH;
                const tunnelCenter = Math.floor(brickColumnCount / 2);
                const barrierRow = brickRowCount - LEVEL_CONFIG.TUNNEL.BARRIER_OFFSET;

                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount; r++) {
                        // The Barrier
                        if (r === barrierRow || r === barrierRow - 1) {
                            if (Math.abs(c - tunnelCenter) > tunnelEntryWidth / 2) {
                                bricks[c][r] = 2; // Wall
                            }
                        }
                        // The Loot (Top area)
                        else if (r < barrierRow - 3) {
                            if (r % 2 === 0 || c % 2 === 0) bricks[c][r] = 1;
                        }
                    }
                }
            }
            // Map 1: "The Pyramid" 
            else if (mapType === 1) {
                const center = Math.floor(brickColumnCount / 2);
                for (let c = 0; c < brickColumnCount; c++) {
                    const distFromCenter = Math.abs(c - center);
                    const maxR = Math.floor(brickRowCount - (distFromCenter / LEVEL_CONFIG.PYRAMID.DISTANCE_DIVISOR));

                    for (let r = 0; r < maxR; r++) {
                        // Outer shell is wall
                        if (r === maxR - 1 || distFromCenter < LEVEL_CONFIG.PYRAMID.CORE_DISTANCE) {
                            bricks[c][r] = Math.random() < LEVEL_CONFIG.PYRAMID.WALL_CHANCE ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        } else {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 2: "The Grid Chambers"
            else if (mapType === 2) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount; r++) {
                        // Vertical Walls
                        if (c % LEVEL_CONFIG.CHAMBERS.VERTICAL_WALL_INTERVAL === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        }
                        // Horizontal Walls
                        else if (r % LEVEL_CONFIG.CHAMBERS.HORIZONTAL_WALL_INTERVAL === 0) {
                            if (c % LEVEL_CONFIG.CHAMBERS.VERTICAL_WALL_INTERVAL !== LEVEL_CONFIG.CHAMBERS.GAP_POSITION) {
                                bricks[c][r] = BRICK_STATUS.WALL;
                            }
                        }
                        else {
                            if (Math.random() < LEVEL_CONFIG.CHAMBERS.BRICK_FILL_CHANCE) bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 3: "La Mosaïque Royale" (Very Dense)
            else if (mapType === 3) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 2; r < Math.floor(brickRowCount * 0.7); r++) {
                        if ((c + r) % 5 === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        } else {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 4: "La Forteresse" (Massive Structure)
            else if (mapType === 4) {
                const margin = 3;
                for (let c = margin; c < brickColumnCount - margin; c++) {
                    for (let r = 2; r < brickRowCount - 6; r++) {
                        // Thick walls on edges of the structure
                        if (c === margin || c === brickColumnCount - margin - 1 || r === 2) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        } else {
                            bricks[c][r] = (c + r) % 7 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 5: "L'Empire Galactique"
            else if (mapType === 5) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 4; r++) {
                        if (Math.random() < 0.92) {
                            bricks[c][r] = Math.random() < 0.15 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 6: "Le Bastion" (Defensive Towers)
            else if (mapType === 6) {
                const towers = [
                    Math.floor(brickColumnCount * 0.2),
                    Math.floor(brickColumnCount * 0.5),
                    Math.floor(brickColumnCount * 0.8)
                ];
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 2; r < 8; r++) {
                        // Lines of bricks
                        if (r % 2 === 0) bricks[c][r] = BRICK_STATUS.NORMAL;
                        // Tower walls
                        for (const tc of towers) {
                            if (Math.abs(c - tc) <= 1 && r >= 1) {
                                bricks[c][r] = BRICK_STATUS.WALL;
                            }
                        }
                    }
                }
            }
            // Map 7: "Le Colisée" (Arcade Arena)
            else if (mapType === 7) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 3; r++) {
                        // Central Imperial Pillars
                        if ((c === 5 || c === brickColumnCount - 6) && (r === 2 || r === 6)) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        }
                        // Side Columns
                        else if ((c === 0 || c === brickColumnCount - 1) && r % 4 === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        }
                        // Organized Brick Galleries (Seats)
                        else if (r < brickRowCount - 6) {
                            // U-Shape Arena: Top rows and side columns
                            const isSide = (c < 4 || c > brickColumnCount - 5);
                            const isTop = (r < 3);
                            if (isSide || isTop) {
                                bricks[c][r] = BRICK_STATUS.NORMAL;
                            }
                        }
                    }
                }
            }
            // Map 8: "Le Labyrinthe Royal"
            else if (mapType === 8) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 3; r++) {
                        if (c % 4 === 0 && r % 3 === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        } else if (c % 4 !== 0 && r % 3 !== 0) {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 9: "Le Dédale Sombre" (Horizontal Maze)
            else if (mapType === 9) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 3; r++) {
                        if (r % 3 === 0) {
                            // Wall lines with gaps
                            if (c % 8 !== 3 && c % 8 !== 4) bricks[c][r] = BRICK_STATUS.WALL;
                        } else {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 10: "Les Cryptes Oubliées" (Vertical Maze)
            else if (mapType === 10) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 5; r++) {
                        if (c % 5 === 0) {
                            // Vertical walls with gaps
                            if (r % 6 !== 0) bricks[c][r] = BRICK_STATUS.WALL;
                        } else {
                            bricks[c][r] = (c + r) % 7 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 11: "Le Labyrinthe de Cristal"
            else if (mapType === 11) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 4; r++) {
                        if ((c + r) % 4 === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        } else {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 12: "Les Mines d'Or" (Scattered Clusters)
            else if (mapType === 12) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 3; r++) {
                        const noise = Math.sin(c * 0.5) * Math.cos(r * 0.5);
                        if (noise > 0.2) {
                            bricks[c][r] = Math.random() < 0.2 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 13: "Le Temple Maudit" (Cross Structure)
            else if (mapType === 13) {
                const centerX = Math.floor(brickColumnCount / 2);
                const centerY = Math.floor(brickRowCount / 3);
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 1; r < brickRowCount - 3; r++) {
                        // The Cross
                        if (c === centerX || r === centerY) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        } else if (Math.abs(c - centerX) < 5 && Math.abs(r - centerY) < 5) {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
            // Map 14: "La Station Intergalactique" (Symmetrical Tech)
            else if (mapType === 14) {
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount - 4; r++) {
                        const isWing = c === 1 || c === brickColumnCount - 2;
                        const isMain = r < 5 && c > 3 && c < brickColumnCount - 4;
                        if (isWing) {
                            bricks[c][r] = r % 3 === 0 ? BRICK_STATUS.WALL : BRICK_STATUS.NORMAL;
                        } else if (isMain) {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        } else if (r === 6 && c % 4 === 0) {
                            bricks[c][r] = BRICK_STATUS.WALL;
                        }
                    }
                }
            }
            // Map 15: "Le Dédale Infini" (Backend Generated Maze)
            else if (mapType === 15) {
                if (randomMapData) {
                    for (let y = 0; y < randomMapData.length; y++) {
                        for (let x = 0; x < randomMapData[y].length; x++) {
                            if (x < brickColumnCount && y < brickRowCount) {
                                bricks[x][y] = randomMapData[y][x];
                            }
                        }
                    }
                } else {
                    // Fallback: simple rows while waiting or if error
                    for (let c = 0; c < brickColumnCount; c++) {
                        for (let r = 1; r < 4; r++) {
                            bricks[c][r] = BRICK_STATUS.NORMAL;
                        }
                    }
                }
            }
        };
        generateMap();

        const colors = isDarkMode ? VISUAL_CONFIG.COLORS.DARK : VISUAL_CONFIG.COLORS.LIGHT;
        const ballColor = colors.BALL;
        const bgColor = colors.BACKGROUND;
        const wallColor = colors.WALL;

        let lastSoundTime = 0;
        const playSoundThrottled = (type: any) => {
            const now = Date.now();
            if (now - lastSoundTime > AUDIO_CONFIG.THROTTLE_MS) {
                playSound(type);
                lastSoundTime = now;
            }
        };

        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                // Optimization: Draw all normal bricks of this column first
                ctx.fillStyle = brickColors[c];
                let hasNormal = false;

                // First pass: Normal bricks
                ctx.beginPath();
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r] === 1) {
                        const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const by = r * (brickHeight + brickPadding) + brickOffsetTop;
                        ctx.rect(bx, by, brickWidth, brickHeight);
                        hasNormal = true;
                    }
                }
                if (hasNormal) ctx.fill();

                // Second pass: Walls (different color)
                let hasWalls = false;
                ctx.beginPath();
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r] === 2) {
                        const bx = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const by = r * (brickHeight + brickPadding) + brickOffsetTop;
                        ctx.rect(bx, by, brickWidth, brickHeight);
                        hasWalls = true;
                    }
                }
                if (hasWalls) {
                    ctx.fillStyle = wallColor;
                    ctx.fill();
                }
            }
        };

        const drawPaddle = () => {
            const paddleWidth = paddleWidthRef.current;
            const h = paddleHeight;
            const y = canvas.height - h - 5;
            const segments = 7;
            const segW = paddleWidth / segments;

            // Draw 7 segments: Red, Orange, Yellow, Cyan (Center), Yellow, Orange, Red
            const segmentColors = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#eab308', '#f97316', '#ef4444'];

            ctx.save();
            // Create a rounded clip for the whole paddle
            ctx.beginPath();
            ctx.roundRect(paddleX, y, paddleWidth, h, 8);
            ctx.clip();

            for (let i = 0; i < segments; i++) {
                ctx.fillStyle = segmentColors[i];
                ctx.fillRect(paddleX + i * segW, y, segW, h);

                // Add a small divider line
                if (i > 0) {
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.beginPath();
                    ctx.moveTo(paddleX + i * segW, y);
                    ctx.lineTo(paddleX + i * segW, y + h);
                    ctx.stroke();
                }
            }

            // Gloss effect
            const gradient = ctx.createLinearGradient(paddleX, y, paddleX, y + h);
            gradient.addColorStop(0, 'rgba(255,255,255,0.3)');
            gradient.addColorStop(0.5, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
            ctx.fillStyle = gradient;
            ctx.fillRect(paddleX, y, paddleWidth, h);

            ctx.restore();

            // Outer glow
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        };

        const drawPowerUps = () => {
            powerUps.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = p.type === 'multi' ? '#facc15' : '#4ade80';
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : '+', p.x, p.y + 4);
            });
        };

        const handlePowerUp = (type: string) => {
            if (type === 'multi') {
                const currentCount = activeBallCount;
                if (currentCount > POWERUP_CONFIG.MULTI_SOFT_CAP) return;
                const limit = Math.min(currentCount, POWERUP_CONFIG.MULTI_LIMIT);

                for (let i = 0; i < limit; i++) {
                    if (activeBallCount + 2 >= BALL_CONFIG.MAX_BALLS) break;
                    const x = ballsX[i];
                    const y = ballsY[i];
                    const dx = ballsDX[i];
                    const dy = ballsDY[i];
                    addBall(x, y, dx + (Math.random() - 0.5) * POWERUP_CONFIG.VELOCITY_VARIATION, -Math.abs(dy));
                    addBall(x, y, dx - (Math.random() - 0.5) * POWERUP_CONFIG.VELOCITY_VARIATION, -Math.abs(dy));
                }
                playSoundThrottled('powerup');
            } else if (type === 'wide') {
                // Clear any existing timeout to prevent premature reset
                if (paddleWidthTimeoutRef.current !== null) {
                    clearTimeout(paddleWidthTimeoutRef.current);
                }

                paddleWidthRef.current = Math.min(paddleWidthRef.current + PADDLE_CONFIG.WIDTH_INCREASE, PADDLE_CONFIG.MAX_WIDTH);

                // Set new timeout and store its ID
                paddleWidthTimeoutRef.current = window.setTimeout(() => {
                    paddleWidthRef.current = PADDLE_CONFIG.DEFAULT_WIDTH;
                    paddleWidthTimeoutRef.current = null;
                }, PADDLE_CONFIG.WIDE_POWERUP_DURATION);

                playSoundThrottled('powerup');
            }
        };

        const draw = () => {
            if (gameState !== 'playing') {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawBricks();
                drawPaddle();
                ctx.fillStyle = ballColor;
                for (let i = 0; i < activeBallCount; i++) {
                    ctx.beginPath();
                    ctx.arc(ballsX[i], ballsY[i], ballRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                return;
            }

            // Solid clear to remove trail/shadow
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawBricks();
            drawPaddle();
            drawPowerUps();

            // PowerUps logic
            powerUps = powerUps.filter(p => {
                p.y += 3;
                if (p.y + 10 > canvas.height - paddleHeight - 5 && p.x > paddleX && p.x < paddleX + paddleWidthRef.current) {
                    handlePowerUp(p.type);
                    return false;
                }
                return p.y < canvas.height;
            });

            // Ball Logic - Inlined for max speed
            ctx.fillStyle = ballColor;
            ctx.beginPath();

            let aliveBalls = 0;
            // COMPACTION: We write valid balls into the first 'aliveBalls' slots of the same arrays
            for (let i = 0; i < activeBallCount; i++) {
                let bx = ballsX[i];
                let by = ballsY[i];
                let bdx = ballsDX[i];
                let bdy = ballsDY[i];
                let deleted = false;

                // Wall physics
                if (bx + bdx > canvas.width - ballRadius || bx + bdx < ballRadius) {
                    bdx = -bdx;
                    playSoundThrottled('hit');
                }
                if (by + bdy < ballRadius) {
                    bdy = -bdy;
                    playSoundThrottled('hit');
                } else if (by + bdy > canvas.height - ballRadius - 5) {
                    // Improved collision: check if ANY part of the ball overlaps with the paddle X range
                    // Also verify the ball is actually moving down (bdy > 0) to avoid sticky glitches
                    if (bdy > 0 && bx + ballRadius >= paddleX && bx - ballRadius <= paddleX + paddleWidthRef.current) {
                        const paddleWidth = paddleWidthRef.current;
                        const relativePos = (bx - (paddleX + paddleWidth / 2)) / (paddleWidth / 2); // -1 (left) to 1 (right)

                        // IMPACT MAPPING: Aligned with the 7 visual segments
                        // We use a slightly non-linear mapping to make the edges more distinctive
                        // relativePos^3 keeps the sign and makes the center flatter (more vertical)
                        // but gives high slope at the edges.
                        const bounceCurve = Math.pow(Math.abs(relativePos), 1.5) * (relativePos < 0 ? -1 : 1);
                        bdx = bounceCurve * 6;

                        // 2. Initial upward impulse
                        bdy = -Math.abs(bdy);

                        // 3. MINIMUM VERTICAL SPEED PROTECTION
                        // To prevent the ball from crawling horizontally on the edges,
                        // we ensure the vertical component is at least 30% of its total speed.
                        // Mag = 2.0 (user config)
                        const totalSpeed = BALL_CONFIG.SPEED;
                        const minVerticalVelocity = totalSpeed * 0.4; // 40% of speed guaranteed vertical

                        // Initial normalization to totalSpeed
                        let currentMag = Math.sqrt(bdx * bdx + bdy * bdy);
                        bdx = (bdx / currentMag) * totalSpeed;
                        bdy = (bdy / currentMag) * totalSpeed;

                        // Ensure vertical speed is high enough
                        if (Math.abs(bdy) < minVerticalVelocity) {
                            bdy = -minVerticalVelocity;
                            // Recalculate bdx to keep total speed constant
                            bdx = Math.sign(bdx) * Math.sqrt(totalSpeed * totalSpeed - bdy * bdy);
                        }

                        playSoundThrottled('hit');
                    } else if (by + bdy > canvas.height + ballRadius) {
                        // Only delete if it's truly off-screen past the paddle
                        deleted = true;
                    }
                }

                // IMPROVED GRID COLLISION - Check ball edges, not just center
                if (!deleted && by < brickOffsetTop + (brickRowCount * (brickHeight + brickPadding))) {
                    // Check all 4 corners of the ball's bounding box
                    const ballLeft = bx - ballRadius;
                    const ballRight = bx + ballRadius;
                    const ballTop = by - ballRadius;
                    const ballBottom = by + ballRadius;

                    // Determine which grid cells the ball might be touching
                    const minGx = Math.floor((ballLeft - brickOffsetLeft) / (brickWidth + brickPadding));
                    const maxGx = Math.floor((ballRight - brickOffsetLeft) / (brickWidth + brickPadding));
                    const minGy = Math.floor((ballTop - brickOffsetTop) / (brickHeight + brickPadding));
                    const maxGy = Math.floor((ballBottom - brickOffsetTop) / (brickHeight + brickPadding));

                    let hitBrick = false;

                    // Check all potentially colliding cells
                    for (let checkGx = Math.max(0, minGx); checkGx <= Math.min(brickColumnCount - 1, maxGx); checkGx++) {
                        for (let checkGy = Math.max(0, minGy); checkGy <= Math.min(brickRowCount - 1, maxGy); checkGy++) {
                            const cell = bricks[checkGx][checkGy];
                            if (cell > 0) { // Brick or wall exists
                                // Calculate brick boundaries
                                const brickX = checkGx * (brickWidth + brickPadding) + brickOffsetLeft;
                                const brickY = checkGy * (brickHeight + brickPadding) + brickOffsetTop;

                                // AABB collision check
                                if (ballRight > brickX && ballLeft < brickX + brickWidth &&
                                    ballBottom > brickY && ballTop < brickY + brickHeight) {

                                    if (cell === 1) { // Normal brick
                                        bricks[checkGx][checkGy] = 0;
                                        setPoints(s => s + 10);
                                        if (Math.random() < POWERUP_CONFIG.DROP_CHANCE) {
                                            powerUps.push({
                                                x: brickX + brickWidth / 2,
                                                y: brickY + brickHeight / 2,
                                                dy: POWERUP_CONFIG.FALL_SPEED,
                                                type: Math.random() < POWERUP_CONFIG.MULTI_CHANCE ? 'multi' : 'wide'
                                            });
                                        }
                                        playSoundThrottled('break');
                                    } else if (cell === 2) { // Wall
                                        playSoundThrottled('hit');
                                    }

                                    // Determine bounce direction based on overlap
                                    const brickCenterX = brickX + brickWidth / 2;
                                    const brickCenterY = brickY + brickHeight / 2;
                                    const dx = bx - brickCenterX;
                                    const dy = by - brickCenterY;

                                    const overlapX = (brickWidth / 2 + ballRadius) - Math.abs(dx);
                                    const overlapY = (brickHeight / 2 + ballRadius) - Math.abs(dy);

                                    if (overlapX < overlapY) {
                                        // Collision on left/right side
                                        bdx = ((dx > 0) ? Math.abs(bdx) : -Math.abs(bdx));
                                        // Push ball out of brick
                                        bx = brickCenterX + (dx > 0 ? 1 : -1) * (brickWidth / 2 + ballRadius);
                                    } else {
                                        // Collision on top/bottom
                                        bdy = ((dy > 0) ? Math.abs(bdy) : -Math.abs(bdy));
                                        // Push ball out of brick
                                        by = brickCenterY + (dy > 0 ? 1 : -1) * (brickHeight / 2 + ballRadius);
                                    }

                                    // Add minor variation and normalize to preserve uniform speed
                                    bdx += (Math.random() - 0.5) * 0.05;
                                    bdy += (Math.random() - 0.5) * 0.05;
                                    const mag = Math.sqrt(bdx * bdx + bdy * bdy);
                                    bdx = (bdx / mag) * BALL_CONFIG.SPEED;
                                    bdy = (bdy / mag) * BALL_CONFIG.SPEED;

                                    hitBrick = true;
                                    break;
                                }
                            }
                        }
                        if (hitBrick) break;
                    }
                }

                if (!deleted) {
                    bx += bdx;
                    by += bdy;

                    // Compact in-place
                    if (i !== aliveBalls) {
                        ballsX[aliveBalls] = bx;
                        ballsY[aliveBalls] = by;
                        ballsDX[aliveBalls] = bdx;
                        ballsDY[aliveBalls] = bdy;
                    } else {
                        ballsX[i] = bx;
                        ballsY[i] = by;
                        ballsDX[i] = bdx;
                        ballsDY[i] = bdy;
                    }
                    aliveBalls++;

                    ctx.moveTo(bx + ballRadius, by);
                    ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
                }
            }
            ctx.fill();
            activeBallCount = aliveBalls;

            if (activeBallCount === 0) {
                setGameState('gameover');
                playSound('gameover');
                return;
            }

            let activeBricks = 0;
            for (let c = 0; c < brickColumnCount; c++)
                for (let r = 0; r < brickRowCount; r++)
                    if (bricks[c][r] === 1) activeBricks++;

            if (activeBricks === 0) {
                setGameState('won');
                playSound('win');
                return;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Calculation of scaleX (Mapping screen mouse X to internal coordinate system)
            // This correctly handles ANY zoom level or screen stretch
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            paddleX = (e.clientX - rect.left) * scaleX - paddleWidthRef.current / 2;
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            paddleX = (e.touches[0].clientX - rect.left) * scaleX - paddleWidthRef.current / 2;
        };

        if (gameState === 'playing') {
            document.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            draw();
        } else {
            // Static preview/reset
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawPaddle();
            ctx.fillStyle = ballColor;
            for (let i = 0; i < activeBallCount; i++) {
                ctx.beginPath();
                ctx.arc(ballsX[i], ballsY[i], ballRadius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', updateCanvasSize);
            // Clean up paddle width timeout to prevent memory leaks
            if (paddleWidthTimeoutRef.current !== null) {
                clearTimeout(paddleWidthTimeoutRef.current);
            }
        };
    }, [gameState, isDarkMode, playSound, selectedMap, randomMapData, isFullScreen]);

    // Re-generate map when switching fullscreen to fill the new space with more bricks/walls
    useEffect(() => {
        if (gameState === 'playing') {
            handleStartGame(selectedMap);
        }
    }, [isFullScreen]);

    return (
        <div ref={containerRef} className={`relative w-full h-full flex flex-col ${isFullScreen ? 'bg-slate-900' : ''}`} style={{ perspective: '1000px' }}>
            {/* EXTERNAL GLOBAL CONTROLS */}
            <div className={`
                flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border border-white/10 z-[100] transition-all
                ${isFullScreen ? 'rounded-none border-x-0 border-t-0' : 'rounded-t-xl mx-4 mt-4'}
            `}>
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider
                        defaultValue={volume * 100}
                        onChange={(v) => setVolume(v / 100)}
                        color="cyan"
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                    />
                </div>
                {gameState === 'playing' && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setPoints(0); setGameState('start'); playSound('click'); }}
                        className="text-yellow-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                        title={t('game.reset')}
                    >
                        <FaRedo size={18} />
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title={isFullScreen ? t('game.fullscreen_exit') : t('game.fullscreen')}
                >
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title={t('game.help_rules')}
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
                    className={`
                        absolute inset-0 w-full h-full flex flex-col items-center justify-center transition-all duration-500 ${theme.bgCard}
                        ${isFullScreen ? 'rounded-none border-0' : 'border border-white/20 rounded-xl backdrop-blur-md overflow-hidden'}
                    `}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="absolute top-4 left-6 text-xl font-bold font-mono z-20 flex flex-col gap-1">
                        <div className="flex gap-4">
                            <ScoreDisplay
                                score={score}
                                attempts={LEVEL_CONFIG.LEVEL_COUNT}
                                personalBest={personalBest}
                                color="cyan"
                            />
                        </div>
                        <div className="text-sm text-white/40 ml-1">
                            Points: {points}
                        </div>
                    </div>

                    <canvas
                        ref={canvasRef}
                        className="w-full h-full block touch-action-none"
                    />

                    <AnimatePresence>
                        {gameState !== 'playing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-8 text-center"
                            >
                                {gameState === 'start' && (
                                    <>
                                        <GradientHeading gradient="cyan-purple" level={2} className="mb-4 md:mb-6">
                                            {t('game.brick_breaker')}
                                        </GradientHeading>
                                        <p className="text-white/80 mb-2 font-serif text-base md:text-xl">{t('game.brick_breaker_desc')}</p>

                                        {/* Current Map Display */}
                                        <div className="mb-6 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                                            <div className="text-4xl mb-2">{LEVEL_CONFIG.MAPS[selectedMap].icon}</div>
                                            <div className="text-cyan-400 font-bold text-lg">{t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.name`)}</div>
                                            <div className="text-white/60 text-sm">{t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap].i18nKey}.desc`)}</div>
                                            <div className="text-yellow-400 text-xs mt-1">{t(`game.brick_breaker_difficulty.${LEVEL_CONFIG.MAPS[selectedMap].difficultyKey}`)}</div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowMapSelector(true)}
                                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                                disabled={isLoadingMap}
                                            >
                                                🗺️ {isLoadingMap ? t('game.loading') : t('game.brick_breaker_choose_map')}
                                            </button>
                                            <button
                                                onClick={() => handleStartGame()}
                                                className="px-8 py-3 bg-cyan-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.6)] disabled:opacity-50"
                                                disabled={isLoadingMap}
                                            >
                                                {isLoadingMap ? t('game.loading') : t('game.start_game')}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {gameState === 'gameover' && (
                                    <>
                                        <h2 className="text-4xl md:text-6xl font-black font-heading text-red-500 mb-4">{t('game.game_over')}</h2>
                                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">{t('game.final_score')}: {score}</p>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowMapSelector(true)}
                                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                            >
                                                🗺️ Choisir Carte
                                            </button>
                                            <button
                                                onClick={() => handleStartGame()}
                                                className="px-8 py-3 bg-red-500 text-white font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.6)] disabled:opacity-50"
                                                disabled={isLoadingMap}
                                            >
                                                {isLoadingMap ? t('game.brick_breaker_generating') : t('game.try_again')}
                                            </button>
                                        </div>
                                    </>
                                )}
                                {gameState === 'won' && (
                                    <>
                                        <h2 className="text-4xl md:text-6xl font-black font-heading text-green-400 mb-4">{t('game.you_win')}</h2>
                                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">{t('game.final_score')}: {score}</p>
                                        {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && unlockedMaps.includes(selectedMap + 1) && (
                                            <p className="text-yellow-400 mb-4 font-bold">🎉 {t('game.brick_breaker_new_map_unlocked', { name: t(`game.brick_breaker_maps.${LEVEL_CONFIG.MAPS[selectedMap + 1].i18nKey}.name`) })}</p>
                                        )}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setShowMapSelector(true)}
                                                className="px-6 py-3 bg-purple-500 text-white font-bold text-lg rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(168,85,247,0.6)]"
                                            >
                                                🗺️ {t('game.brick_breaker_choose_map')}
                                            </button>
                                            <button
                                                onClick={() => handleStartGame()}
                                                className="px-8 py-3 bg-green-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.6)] disabled:opacity-50"
                                                disabled={isLoadingMap}
                                            >
                                                {isLoadingMap ? t('game.loading') : t('game.play_again')}
                                            </button>
                                            {selectedMap + 1 < LEVEL_CONFIG.LEVEL_COUNT && (
                                                <button
                                                    onClick={handleNextLevel}
                                                    className="px-8 py-3 bg-yellow-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.6)] disabled:opacity-50"
                                                    disabled={isLoadingMap}
                                                >
                                                    {isLoadingMap ? t('game.loading') : `⏭️ ${t('game.brick_breaker_next_level')}`}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Back Face (Rules) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col p-8 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <GradientHeading gradient="cyan-purple" level={2}>
                            {t('game.brick_breaker')} - {t('game.arcade_zone')}
                        </GradientHeading>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-white text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2">
                        <section className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                <span className="bg-cyan-500/20 p-2 rounded-lg">🎯</span>
                                {t('game.objective')}
                            </h3>
                            <p className="text-white/80 leading-relaxed text-sm md:text-base">
                                {t('game.brick_breaker_rules')}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">🎮</span>
                                    <h4 className="font-bold text-white">{t('game.controls')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_controls')}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">⭐</span>
                                    <h4 className="font-bold text-white">{t('game.bonus')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_bonus')}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-4 rounded-xl border-l-4 border-cyan-400">
                            <p className="text-xs md:text-sm text-cyan-200 italic">
                                💡 {t('game.match3_speed')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Map Selector Modal (Moved here to avoid covering control bar) */}
                <AnimatePresence>
                    {showMapSelector && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 md:p-6"
                            onClick={() => setShowMapSelector(false)}
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
                                                        setSelectedMap(map.id);
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
                                                {/* Lock Icon for Locked Maps */}
                                                {!isUnlocked && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="text-6xl">🔒</div>
                                                    </div>
                                                )}

                                                <div className={isUnlocked ? '' : 'blur-sm'}>
                                                    <div className="text-5xl mb-3">{map.icon}</div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{t(`game.brick_breaker_maps.${map.i18nKey}.name`)}</h3>
                                                    <p className="text-sm text-white/60 mb-3">{t(`game.brick_breaker_maps.${map.i18nKey}.desc`)}</p>
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
                                            setShowMapSelector(false);
                                            handleStartGame();
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
            </motion.div>


        </div>
    );
}
