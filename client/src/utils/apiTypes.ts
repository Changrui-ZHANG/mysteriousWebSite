/**
 * API Response types matching backend ApiResponse<T> structure
 */
export interface ApiResponse<T> {
    success: boolean;
    message: string | null;
    data: T | null;
    timestamp: string;
}

export interface ApiError {
    success: false;
    message: string;
    data: null;
    timestamp: string;
}

/**
 * Auth response types
 */
export interface AuthResponseDTO {
    userId: string;
    username: string;
    message: string;
}

/**
 * Score types
 */
export interface Score {
    id: string;
    username: string;
    userId: string;
    gameType: string;
    score: number;
    timestamp: number;
    attempts?: number;
}

/**
 * Suggestion types
 */
export interface SuggestionStatus {
    status: 'pending' | 'reviewed' | 'implemented';
}
