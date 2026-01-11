import { BaseService } from '../../../shared/services/BaseService';
import { fetchJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import type { Score, PersonalBest } from '../types';

interface SubmitScoreData {
    gameType: string;
    score: number;
    username: string;
}

/**
 * Service for score-related API operations
 */
export class ScoreService extends BaseService<Score, SubmitScoreData> {
    constructor() {
        super(API_ENDPOINTS.SCORES);
    }

    /**
     * Submit a new score
     */
    async submitScore(data: SubmitScoreData): Promise<boolean> {
        try {
            await this.create(data);
            return true;
        } catch (error) {
            console.error('Failed to submit score:', error);
            return false;
        }
    }

    /**
     * Get top scores for a specific game
     */
    async getTopScores(gameType: string): Promise<Score[]> {
        return fetchJson<Score[]>(`${this.baseUrl}/top/${gameType}`);
    }

    /**
     * Get personal best for a user and game
     */
    async getPersonalBest(userId: string, gameType: string): Promise<PersonalBest | null> {
        try {
            return await fetchJson<PersonalBest>(`${this.baseUrl}/personal-best/${userId}/${gameType}`);
        } catch (error) {
            // Return null if no personal best found
            return null;
        }
    }

    /**
     * Get user's score history for a game
     */
    async getUserScoreHistory(userId: string, gameType: string): Promise<Score[]> {
        return fetchJson<Score[]>(
            this.buildUrl(`/user/${userId}`, { gameType })
        );
    }

    /**
     * Get leaderboard with pagination
     */
    async getLeaderboard(gameType: string, page: number = 1, limit: number = 10): Promise<{
        scores: Score[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        return fetchJson<{
            scores: Score[];
            total: number;
            page: number;
            totalPages: number;
        }>(this.buildUrl(`/leaderboard/${gameType}`, { page, limit }));
    }
}