const BASE_URL = 'https://api.spacetraders.io/v2';

export interface Agent {
    accountId: string;
    symbol: string;
    headquarters: string;
    credits: number;
    startingFaction: string;
}

export interface Ship {
    symbol: string;
    registration: {
        name: string;
        role: string;
    };
    nav: {
        systemSymbol: string;
        waypointSymbol: string;
        status: string;
    };
}

export async function registerAgent(symbol: string, faction: string = 'COSMIC'): Promise<{ token: string; agent: Agent }> {
    const response = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            symbol,
            faction,
        }),
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.data;
}

export async function getAgent(token: string): Promise<Agent> {
    if (!token || !token.trim()) throw new Error("No token provided");

    const response = await fetch(`${BASE_URL}/my/agent`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.data;
}

export async function getMyShips(token: string): Promise<Ship[]> {
    if (!token || !token.trim()) throw new Error("No token provided");

    const response = await fetch(`${BASE_URL}/my/ships`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });

    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.data;
}
