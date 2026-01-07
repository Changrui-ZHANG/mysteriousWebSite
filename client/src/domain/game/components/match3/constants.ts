/**
 * Match3 Game Constants
 */

import { BGM_URLS } from '../../../../shared/constants/urls';

export const BOARD_CONFIG = {
    WIDTH: 8,
    GAME_LOOP_INTERVAL: 100,
    SCORE_SUBMIT_DEBOUNCE: 1000,
} as const;

export const AUDIO_CONFIG = {
    BGM_URL: BGM_URLS.MATCH3,
} as const;

export const CANDY_COLORS = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-blue-500',
    'bg-purple-500'
] as const;

export const SCORING_CONFIG = {
    MIN_MATCH_LENGTH: 3,
    POINTS_PER_EXTRA: 1,
} as const;
