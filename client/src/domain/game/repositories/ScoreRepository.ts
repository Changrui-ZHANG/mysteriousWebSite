import { BaseService } from '../../../shared/services/BaseService';
import { fetchJson } from '../../../shared/api/httpClient';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import type { Score, PersonalBest, GameKey } from '../types';

interface SubmitScoreData {
    gameType: GameKey;
    score: number;
    username: string;
}

interface ScoreFilters {
    gameType?: GameKey;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

interface LeaderboardResponse {
    scores: Score[];
    total: number;
    page: number;
    totalPages: number;
}

/**
 * Repository for score data access
 * Handles all score-related database operations
 */
export class ScoreRepository extends BaseService<Score, SubmitScoreData> {
    constructor() {
        super(API_ENDPOINTS.SCORES);
    }

    /**
     * Submit a new score
     */
    async submitScore(data: SubmitScoreData): Promise<Score> {
        return this.create(data);
    }

    /**
     * Get top scores for a specific game
     */
    async getTopScores(gameType: GameKey, limit: number = 10): Promise<Score[]> {
        return fetchJson<Score[]>(
            this.buildUrl(`/top/${gameType}`, { limit })
        );
    }

    /**
     * Get personal best for a user and game
     */
    async getPersonalBest(userId: string, gameType: GameKey): Promise<PersonalBest | null> {
        try {
            return await fetchJson<PersonalBest>(`${this.baseUrl}/personal-best/${userId}/${gameType}`);
        } catch (error) {
            // Return null if no personal best found
            return null;
        }
    }

    /**
     * Get user's score history
     */
    async getUserScoreHistory(userId: string, filters?: Omit<ScoreFilters, 'userId'>): Promise<Score[]> {
        const params: Record<string, string | number> = {};
        if (filters?.gameType) params.gameType = filters.gameType;
        if (filters?.startDate) params.startDate = filters.startDate.toISOString();
        if (filters?.endDate) params.endDate = filters.endDate.toISOString();
        if (filters?.limit) params.limit = filters.limit;
        if (filters?.offset) params.offset = filters.offset;

        return fetchJson<Score[]>(this.buildUrl(`/user/${userId}`, params));
    }

    /**
     * Get leaderboard with pagination
     */
    async getLeaderboard(
        gameType: GameKey, 
        page: number = 1, 
        limit: number = 10
    ): Promise<LeaderboardResponse> {
        return fetchJson<LeaderboardResponse>(
            this.buildUrl(`/leaderboard/${gameType}`, { page, limit })
        );
    }

    /**
     * Get global leaderboard across all games
     */
    async getGlobalLeaderboard(page: number = 1, limit: number = 10): Promise<LeaderboardResponse> {
        return fetchJson<LeaderboardResponse>(
            this.buildUrl('/leaderboard/global', { page, limit })
        );
    }

    /**
     * Get score statistics for a game
     */
    async getGameStats(gameType: GameKey): Promise<{
        totalScores: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        uniquePlayers: number;
    }> {
        return fetchJson<{
            totalScores: number;
            averageScore: number;
            highestScore: number;
            lowestScore: number;
            uniquePlayers: number;
        }>(`${this.baseUrl}/stats/${gameType}`);
    }

    /**
     * Get user's rank for a specific game
     */
    async getUserRank(userId: string, gameType: GameKey): Promise<{
        rank: number;
        totalPlayers: number;
        percentile: number;
    } | null> {
        try {
            return await fetchJson<{
                rank: number;
                totalPlayers: number;
                percentile: number;
            }>(`${this.baseUrl}/rank/${userId}/${gameType}`);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get recent scores across all games
     */
    async getRecentScores(limit: number = 20): Promise<Score[]> {
        return fetchJson<Score[]>(
            this.buildUrl('/recent', { limit })
        );
    }
}