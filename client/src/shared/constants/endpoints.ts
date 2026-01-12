// API endpoint constants

const API_BASE = '/api';

export const API_ENDPOINTS = {

    // Messages
    MESSAGES: {
        LIST: `${API_BASE}/messages`,
        ADD: `${API_BASE}/messages`,
        DELETE: (id: string) => `${API_BASE}/messages/${id}`,
        CLEAR: `${API_BASE}/messages/clear`,
        TOGGLE_MUTE: `${API_BASE}/messages/toggle-mute`,
        IS_MUTED: `${API_BASE}/messages/is-muted`
    },

    // Presence
    PRESENCE: {
        COUNT: `${API_BASE}/presence/count`,
        TOGGLE_VISIBILITY: `${API_BASE}/presence/toggle-visibility`
    },

    // Games
    GAMES: {
        LIST: `${API_BASE}/games`,
        TOGGLE: `${API_BASE}/games/{gameType}/toggle`,
        LEADERBOARD: (gameType: string) => `${API_BASE}/scores/leaderboard/${gameType}`,
        SUBMIT_SCORE: `${API_BASE}/scores`,
        PERSONAL_BEST: (userId: string, gameType: string) =>
            `${API_BASE}/scores/best/${userId}/${gameType}`,
        TOP_SCORES: (gameType: string) => `${API_BASE}/scores/top/${gameType}`,
        USER_SCORE: (userId: string, gameType: string) => `${API_BASE}/scores/user/${userId}/${gameType}`,
        DELETE_SCORE: (id: string) => `${API_BASE}/scores/${id}`,
        DELETE_ALL_GAME_SCORES: (gameType: string) => `${API_BASE}/scores/clear/${gameType}`,
        CLEANUP_DUPLICATES: `${API_BASE}/scores/cleanup-duplicates`,
        FORCE_CLEANUP_DUPLICATES: `${API_BASE}/scores/force-cleanup-duplicates`,
        DUPLICATES_REPORT: `${API_BASE}/scores/duplicates-report`,
        MAZE_GENERATE: `${API_BASE}/maze/generate`
    },

    // Scores
    SCORES: `${API_BASE}/scores`,

    // Calendar
    CALENDAR: {
        CONFIG: `${API_BASE}/calendar-config`
    },

    // Vocabulary
    VOCABULARY: {
        RANDOM: `${API_BASE}/vocabulary/random`
    },

    // Settings
    SETTINGS: {
        PUBLIC: `${API_BASE}/settings/public`
    },

    // Auth
    AUTH: {
        REGISTER: `${API_BASE}/auth/register`,
        LOGIN: `${API_BASE}/auth/login`,
        VERIFY_ADMIN: `${API_BASE}/auth/verify-admin`
    },

    // Suggestions
    SUGGESTIONS: {
        LIST: `${API_BASE}/suggestions`,
        ADD: `${API_BASE}/suggestions`,
        DELETE: (id: string) => `${API_BASE}/suggestions/${id}`
    },

    // Notes
    NOTES: {
        LIST: (userId: string) => `${API_BASE}/notes?userId=${userId}`,
        LIST_ALL: (adminCode: string) => `${API_BASE}/notes/all?adminCode=${adminCode}`,
        CREATE: `${API_BASE}/notes`,
        UPDATE: (id: string, userId: string) => `${API_BASE}/notes/${id}?userId=${userId}`,
        DELETE: (id: string, userId: string) => `${API_BASE}/notes/${id}?userId=${userId}`
    },

    // External APIs
    EXTERNAL: {
        PUBLIC_HOLIDAYS: (year: number) =>
            `https://calendrier.api.gouv.fr/jours-feries/metropole/${year}.json`,
        SCHOOL_HOLIDAYS: (year: string) =>
            `https://data.education.gouv.fr/api/records/1.0/search/?dataset=fr-en-calendrier-scolaire&q=&rows=2000&refine.annee_scolaire=${year}`
    },

    // User Management (Super Admin)
    SUPER_ADMIN: {
        USERS: `${API_BASE}/superadmin/users`,
        USER: (id: string) => `${API_BASE}/superadmin/users/${id}`
    },

    // Profiles
    PROFILES: {
        LIST: `${API_BASE}/profiles`,
        GET: (userId: string) => `${API_BASE}/profiles/${userId}`,
        CREATE: `${API_BASE}/profiles`,
        UPDATE: (userId: string) => `${API_BASE}/profiles/${userId}`,
        DELETE: (userId: string) => `${API_BASE}/profiles/${userId}`,
        SEARCH: `${API_BASE}/profiles/search`,
        DIRECTORY: `${API_BASE}/profiles/directory`,
        PRIVACY: (userId: string) => `${API_BASE}/profiles/${userId}/privacy`,
        STATS: (userId: string) => `${API_BASE}/profiles/${userId}/stats`,
        ACHIEVEMENTS: (userId: string) => `${API_BASE}/profiles/${userId}/achievements`
    },

    // Avatars
    AVATARS: {
        UPLOAD: (userId: string) => `${API_BASE}/profiles/${userId}/avatar`,
        DELETE: (userId: string) => `${API_BASE}/profiles/${userId}/avatar`,
        DEFAULTS: `${API_BASE}/avatars/defaults`
    },

    // Activity
    ACTIVITY: {
        MESSAGE: `${API_BASE}/activity/message`,
        GAME: `${API_BASE}/activity/game`
    }
} as const;
