export type GameKey = 'brick' | 'match3' | 'pokemon' | 'maze' | 'zombie';

export interface GameStatus {
    gameType: GameKey;
    enabled: boolean;
}

export interface PersonalBest {
    score: number;
    attempts?: number;
}

export interface ScoreData {
    score: number;
    attempts?: number;
}

export interface TopScore {
    userId: string;
    username: string;
    score: number;
    gameType: GameKey;
    timestamp: string;
}

export interface GameProps {
    onOpenLogin?: () => void;
    isSuperAdmin?: boolean;
    isAdmin?: boolean;
}
