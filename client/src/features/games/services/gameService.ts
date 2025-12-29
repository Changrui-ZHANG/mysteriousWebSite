/**
 * Game Services - API calls for games feature
 * Isolates all external API interactions from components
 */

import { fetchJson } from '../../../api/httpClient';
import { API_ENDPOINTS } from '../../../constants/endpoints';

// ============================================
// POKEMON SERVICE
// ============================================

interface Pokemon {
    id: number;
    name: string;
    sprites: {
        front_default: string;
        other?: {
            'official-artwork'?: {
                front_default: string;
            };
        };
    };
}

export async function fetchRandomPokemon(pokemonId: number): Promise<Pokemon | null> {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// MAZE SERVICE
// ============================================

interface MazeData {
    maze: number[][];
    start: { x: number; y: number };
    end: { x: number; y: number };
}

export async function generateMaze(): Promise<MazeData | null> {
    try {
        const response = await fetch(API_ENDPOINTS.GAMES.MAZE_GENERATE);
        if (response.ok) {
            const data = await response.json();
            return data.data || data;
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// BRICK BREAKER SERVICE
// ============================================

interface BrickBreakerMap {
    layout: number[][];
}

export async function fetchRandomBrickBreakerMap(cols: number, rows: number): Promise<BrickBreakerMap | null> {
    try {
        const response = await fetch(`/api/games/brickbreaker/random-map?width=${cols}&height=${rows}&t=${Date.now()}`);
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch {
        return null;
    }
}

// ============================================
// SCORE SERVICE
// ============================================

interface Score {
    id: string;
    username: string;
    score: number;
    timestamp: number;
    attempts?: number;
}

export async function fetchTopScores(gameType: string): Promise<Score[]> {
    try {
        const data = await fetchJson<Score[]>(`/api/scores/top/${gameType}`);
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export async function submitScore(gameType: string, score: number, username: string): Promise<boolean> {
    try {
        await fetchJson('/api/scores', {
            method: 'POST',
            body: JSON.stringify({ gameType, score, username })
        });
        return true;
    } catch {
        return false;
    }
}
