/**
 * BrickBreaker Game Constants
 * All configuration values for the brick breaker game
 */

import { BGM_URLS } from '../../../../constants/urls';

// ===== BALL CONFIGURATION =====
export const BALL_CONFIG = {
    MAX_BALLS: 60000,
    RADIUS: 3,
    INITIAL_SPEED_X: 0,
    INITIAL_SPEED_Y: -5,
    SPEED: 5,
    SPAWN_OFFSET_Y: 30,
} as const;

// ===== PADDLE CONFIGURATION =====
export const PADDLE_CONFIG = {
    HEIGHT: 8,
    DEFAULT_WIDTH: 140,
    MAX_WIDTH: 450,
    WIDTH_INCREASE: 60,
    WIDE_POWERUP_DURATION: 8000,
    IMPACT_MULTIPLIER: 6,
    BOTTOM_OFFSET: 5,
} as const;

// ===== BRICK CONFIGURATION =====
export const BRICK_CONFIG = {
    TARGET_SIZE: 5,
    PADDING: 2,
    OFFSET_LEFT: 5,
    OFFSET_TOP: 50,
    HEIGHT_COVERAGE: 0.5,
} as const;

// ===== POWERUP CONFIGURATION =====
export const POWERUP_CONFIG = {
    DROP_CHANCE: 0.05,
    MULTI_CHANCE: 0.7,
    FALL_SPEED: 3,
    RADIUS: 10,
    MULTI_SOFT_CAP: 5000,
    MULTI_LIMIT: 2000,
    VELOCITY_VARIATION: 3,
} as const;

// ===== AUDIO CONFIGURATION =====
export const AUDIO_CONFIG = {
    THROTTLE_MS: 30,
    BGM_URL: BGM_URLS.BRICK_BREAKER,
} as const;

// ===== VISUAL CONFIGURATION =====
export const VISUAL_CONFIG = {
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
    BRICK_SATURATION: 75,
    BRICK_LIGHTNESS: 50,
} as const;

// ===== BRICK STATUS =====
export const BRICK_STATUS = {
    EMPTY: 0,
    NORMAL: 1,
    WALL: 2,
} as const;

// ===== LEVEL CONFIGURATION =====
export const LEVEL_CONFIG = {
    LEVEL_COUNT: 16,
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
    TUNNEL: { ENTRY_WIDTH: 6, BARRIER_OFFSET: 5 },
    PYRAMID: { DISTANCE_DIVISOR: 1.5, CORE_DISTANCE: 2, WALL_CHANCE: 0.3 },
    CHAMBERS: { VERTICAL_WALL_INTERVAL: 10, HORIZONTAL_WALL_INTERVAL: 8, GAP_POSITION: 5, BRICK_FILL_CHANCE: 0.8 },
} as const;

export type GameState = 'start' | 'playing' | 'gameover' | 'won';
export type SoundType = 'hit' | 'break' | 'gameover' | 'win' | 'click' | 'powerup';
