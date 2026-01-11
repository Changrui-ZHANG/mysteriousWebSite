/**
 * Application configuration constants
 * Centralizes all hardcoded values for better maintainability
 */

// Timing constants
export const TIMING = {
    // UI feedback timings
    MESSAGE_HIGHLIGHT_DURATION: 1000, // ms
    TOAST_DEFAULT_DURATION: 6000, // ms
    TOAST_ERROR_DURATION: 8000, // ms
    TOAST_SUCCESS_DURATION: 4000, // ms
    
    // Theme transition timing
    THEME_TRANSITION_DURATION: 50, // ms
    
    // WebSocket reconnection
    WEBSOCKET_RECONNECT_DELAY: 3000, // ms
    WEBSOCKET_MAX_RECONNECT_ATTEMPTS: 5,
    
    // API timeouts
    API_TIMEOUT_DEFAULT: 10000, // ms
    API_TIMEOUT_UPLOAD: 30000, // ms
    
    // Debounce delays
    SEARCH_DEBOUNCE_DELAY: 300, // ms
    VALIDATION_DEBOUNCE_DELAY: 500, // ms
} as const;

// Limits and constraints
export const LIMITS = {
    // Message constraints
    MESSAGE_MAX_LENGTH: 500,
    MESSAGE_MIN_LENGTH: 1,
    USERNAME_MAX_LENGTH: 50,
    USERNAME_MIN_LENGTH: 1,
    
    // Pagination
    MESSAGES_PER_PAGE_DEFAULT: 50,
    MESSAGES_PER_PAGE_MAX: 100,
    
    // File uploads
    FILE_SIZE_MAX: 10 * 1024 * 1024, // 10MB
    IMAGE_SIZE_MAX: 5 * 1024 * 1024, // 5MB
    
    // Performance
    VIRTUAL_LIST_OVERSCAN: 5,
    MAX_CACHED_TRANSLATIONS: 100,
} as const;

// Feature flags
export const FEATURES = {
    // Core features
    ENABLE_TRANSLATIONS: true,
    ENABLE_USER_PRESENCE: true,
    ENABLE_MESSAGE_REACTIONS: false,
    ENABLE_FILE_UPLOADS: false,
    
    // Admin features
    ENABLE_GLOBAL_MUTE: true,
    ENABLE_MESSAGE_MODERATION: true,
    
    // Performance features
    ENABLE_VIRTUAL_SCROLLING: false,
    ENABLE_MESSAGE_CACHING: true,
    
    // Development features
    ENABLE_DEBUG_LOGS: import.meta.env?.DEV || false,
    ENABLE_PERFORMANCE_MONITORING: false,
} as const;

// Storage keys
export const STORAGE_KEYS = {
    USER_ID: 'messagewall_user_id',
    USERNAME: 'messagewall_username',
    THEME: 'app-theme',
    ADMIN_CODE: 'admin_code',
    LANGUAGE: 'app-language',
    PREFERENCES: 'user_preferences',
} as const;

// API configuration
export const API_CONFIG = {
    // Base configuration
    BASE_URL: import.meta.env?.VITE_API_BASE_URL || '/api',
    VERSION: 'v1',
    
    // Request configuration
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    
    // Retry configuration
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // ms
    RETRY_BACKOFF: 'exponential' as const,
} as const;

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
    URL: import.meta.env?.VITE_WS_URL || 'ws://localhost:8080/ws',
    RECONNECT_INTERVAL: TIMING.WEBSOCKET_RECONNECT_DELAY,
    MAX_RECONNECT_ATTEMPTS: TIMING.WEBSOCKET_MAX_RECONNECT_ATTEMPTS,
    HEARTBEAT_INTERVAL: 30000, // ms
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
    LANGUAGE_CODE: /^[a-z]{2}(-[A-Z]{2})?$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erreur de connexion réseau',
    API_ERROR: 'Erreur du serveur',
    VALIDATION_ERROR: 'Données invalides',
    PERMISSION_DENIED: 'Permission refusée',
    RESOURCE_NOT_FOUND: 'Ressource non trouvée',
    UNKNOWN_ERROR: 'Erreur inconnue',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    MESSAGE_SENT: 'Message envoyé avec succès',
    MESSAGE_DELETED: 'Message supprimé',
    SETTINGS_SAVED: 'Paramètres sauvegardés',
    TRANSLATION_COMPLETE: 'Traduction terminée',
} as const;

// CSS classes for consistent styling
export const CSS_CLASSES = {
    // Theme transition
    NO_TRANSITIONS: 'no-transitions',
    
    // Loading states
    LOADING: 'loading',
    SKELETON: 'skeleton',
    
    // Interactive states
    HIGHLIGHTED: 'highlighted',
    SELECTED: 'selected',
    DISABLED: 'disabled',
    
    // Animations
    FADE_IN: 'fade-in',
    FADE_OUT: 'fade-out',
    SLIDE_IN: 'slide-in',
    SLIDE_OUT: 'slide-out',
} as const;

// Environment-specific configuration
export const ENV_CONFIG = {
    IS_DEVELOPMENT: import.meta.env?.DEV || false,
    IS_PRODUCTION: import.meta.env?.PROD || false,
    IS_TEST: import.meta.env?.MODE === 'test',
    
    // Feature toggles based on environment
    ENABLE_DEVTOOLS: import.meta.env?.DEV || false,
    ENABLE_LOGGING: !(import.meta.env?.PROD || false),
    ENABLE_ANALYTICS: import.meta.env?.PROD || false,
} as const;

// Export all constants as a single object for easy importing
export const CONFIG = {
    TIMING,
    LIMITS,
    FEATURES,
    STORAGE_KEYS,
    API_CONFIG,
    WEBSOCKET_CONFIG,
    VALIDATION_PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CSS_CLASSES,
    ENV_CONFIG,
} as const;

export default CONFIG;