import { EXTERNAL_APIS } from '../constants/urls';

// PokeAPI Client
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

// Get a random Pokemon (from first 151 - Gen 1)
export async function getRandomPokemon(): Promise<Pokemon> {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const response = await fetch(`${BASE_URL}/pokemon/${randomId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Pokemon');
    }

    return await response.json();
}

// Get Pokemon by name
export async function getPokemonByName(name: string): Promise<Pokemon> {
    const response = await fetch(`${BASE_URL}/pokemon/${name.toLowerCase()}`);

    if (!response.ok) {
        throw new Error('Pokemon not found');
    }

    return await response.json();
}
