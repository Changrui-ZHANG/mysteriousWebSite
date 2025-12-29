import { EXTERNAL_APIS } from '../../../constants/urls';

const BASE_URL = EXTERNAL_APIS.POKEMON;

export interface Pokemon {
    id: number;
    name: string;
    sprites: {
        front_default: string;
        other: {
            'official-artwork': {
                front_default: string;
            };
        };
    };
}

export async function getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 151) + 1;
    return getPokemonById(randomId);
}

export async function getPokemonById(id: number): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
    }

    return await response.json();
}

export async function getPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/${name.toLowerCase()}`);

    if (!response.ok) {
        throw new Error('Pokemon not found');
    }

    return await response.json();
}

/**
 * Get multiple random Pokemon names for quiz wrong answers
 * Excludes the correct Pokemon ID
 */
export async function getRandomPokemonNames(excludeId: number, count: number = 3): Promise<string[]> {
    const names: string[] = [];
    const usedIds = new Set([excludeId]);

    while (names.length < count) {
        const randomId = Math.floor(Math.random() * 151) + 1;
        if (!usedIds.has(randomId)) {
            usedIds.add(randomId);
            try {
                const pokemon = await getPokemonById(randomId);
                names.push(pokemon.name);
            } catch {
                // Skip if fetch fails, try another
            }
        }
    }
    return names;
}
