// API endpoint constants

const API_BASE = '/api';

export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: `${API_BASE}/auth/register`,
        LOGIN: `${API_BASE}/auth/login`
    },

    // Messages
    MESSAGES: {
        LIST: `${API_BASE}/messages`,
        ADD: `${API_BASE}/messages`,
        DELETE: (id: string) => `${API_BASE}/messages/${id}`,
        CLEAR: `${API_BASE}/messages/clear`,
        TOGGLE_MUTE: `${API_BASE}/messages/toggle-mute`,
        IS_MUTED: `${API_BASE}/messages/is-muted`
    },

    // Games
    GAMES: {
        LIST: `${API_BASE}/games`,
        TOGGLE: `${API_BASE}/games/{gameType}/toggle`,
        LEADERBOARD: (gameType: string) => `${API_BASE}/scores/leaderboard/${gameType}`,
        SUBMIT_SCORE: `${API_BASE}/scores`,
        PERSONAL_BEST: (userId: string, gameType: string) =>
            `${API_BASE}/scores/best/${userId}/${gameType}`
    },

    // Calendar
    CALENDAR: {
        CONFIG: `${API_BASE}/calendar-config`
    },

    // Suggestions
    SUGGESTIONS: {
        LIST: `${API_BASE}/suggestions`,
        ADD: `${API_BASE}/suggestions`,
        DELETE: (id: number) => `${API_BASE}/suggestions/${id}`
    },

    // External APIs
    EXTERNAL: {
        PUBLIC_HOLIDAYS: (year: number) =>
            `https://calendrier.api.gouv.fr/jours-feries/metropole/${year}.json`,
        SCHOOL_HOLIDAYS: (year: string) =>
            `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&rows=2000&refine.annee_scolaire=${year}`
    }
} as const;
