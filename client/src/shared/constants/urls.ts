/**
 * Centralized URL constants for external resources
 * Prevents hardcoded URLs scattered across the codebase
 */

// Background Music URLs
export const BGM_URLS = {
    BRICK_BREAKER: 'https://cdn.pixabay.com/audio/2025/02/17/audio_f01b9210e8.mp3',
    MAZE_GAME: 'https://cdn.pixabay.com/audio/2024/10/15/audio_acaf834253.mp3',
    SPACE_TRADERS: 'https://cdn.pixabay.com/audio/2024/08/17/audio_d796bdb6af.mp3',
    ZOMBIE_SHOOTER: 'https://cdn.pixabay.com/audio/2024/11/07/audio_6e5f80971b.mp3',
    POKEMON_GAME: 'https://cdn.pixabay.com/audio/2025/11/11/audio_3c21779078.mp3',
    MATCH3: 'https://cdn.pixabay.com/audio/2024/10/10/audio_2290aa59a9.mp3',
} as const;

// External API URLs
export const EXTERNAL_APIS = {
    POKEMON: 'https://pokeapi.co/api/v2/pokemon',
    TRANSLATION: 'https://api.mymemory.translated.net/get',
} as const;

// Social Links
export const SOCIAL_LINKS = {
    GITHUB: 'https://github.com/Changrui-ZHANG',
    LINKEDIN: 'https://www.linkedin.com/in/changrui-zhang/',
} as const;

// Asset URLs
export const ASSET_URLS = {
    NOISE_TEXTURE: 'https://grainy-gradients.vercel.app/noise.svg',
} as const;
