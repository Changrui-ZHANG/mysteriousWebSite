import { z } from 'zod';
import { IdSchema, TimestampSchema, UsernameSchema } from '../../../shared/schemas/validation';

/**
 * Validation schemas for game domain
 */

// Game types
export const GameKeySchema = z.enum([
    'memory',
    'pokemon',
    'maze',
    'brickbreaker',
    'gravity'
]);

export type GameKey = z.infer<typeof GameKeySchema>;

// Game status
export const GameStatusSchema = z.enum([
    'idle',
    'playing',
    'paused',
    'ended',
    'loading'
]);

export type GameStatus = z.infer<typeof GameStatusSchema>;

// Score schema
export const ScoreSchema = z.object({
    id: IdSchema,
    userId: IdSchema,
    username: UsernameSchema,
    gameType: GameKeySchema,
    score: z.number().int().nonnegative(),
    timestamp: TimestampSchema,
    metadata: z.record(z.string(), z.unknown()).optional(), // Additional game-specific data
});

export type Score = z.infer<typeof ScoreSchema>;

// Personal best schema
export const PersonalBestSchema = z.object({
    score: z.number().int().nonnegative(),
    timestamp: TimestampSchema,
    gameType: GameKeySchema,
    attempts: z.number().int().positive().optional(),
});

export type PersonalBest = z.infer<typeof PersonalBestSchema>;

// Submit score request schema
export const SubmitScoreSchema = z.object({
    gameType: GameKeySchema,
    score: z.number().int().nonnegative(),
    username: UsernameSchema,
    metadata: z.record(z.string(), z.unknown()).optional(),
});

export type SubmitScoreRequest = z.infer<typeof SubmitScoreSchema>;

// Score filters schema
export const ScoreFiltersSchema = z.object({
    gameType: GameKeySchema.optional(),
    userId: IdSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    limit: z.number().int().positive().max(100).default(10),
    offset: z.number().int().nonnegative().default(0),
    sortBy: z.enum(['score', 'timestamp', 'username']).default('score'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
}).refine(
    (data) => !data.startDate || !data.endDate || data.startDate <= data.endDate,
    'Start date must be before or equal to end date'
);

export type ScoreFilters = z.infer<typeof ScoreFiltersSchema>;

// Leaderboard response schema
export const LeaderboardResponseSchema = z.object({
    scores: z.array(ScoreSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    gameType: GameKeySchema.optional(),
});

export type LeaderboardResponse = z.infer<typeof LeaderboardResponseSchema>;

// Game statistics schema
export const GameStatsSchema = z.object({
    gameType: GameKeySchema,
    totalScores: z.number().int().nonnegative(),
    averageScore: z.number().nonnegative(),
    highestScore: z.number().int().nonnegative(),
    lowestScore: z.number().int().nonnegative(),
    uniquePlayers: z.number().int().nonnegative(),
    totalPlayTime: z.number().nonnegative().optional(), // in seconds
    averagePlayTime: z.number().nonnegative().optional(), // in seconds
});

export type GameStats = z.infer<typeof GameStatsSchema>;

// User rank schema
export const UserRankSchema = z.object({
    userId: IdSchema,
    gameType: GameKeySchema,
    rank: z.number().int().positive(),
    totalPlayers: z.number().int().positive(),
    percentile: z.number().min(0).max(100),
    score: z.number().int().nonnegative(),
});

export type UserRank = z.infer<typeof UserRankSchema>;

// Game configuration schemas
export const MemoryGameConfigSchema = z.object({
    gridSize: z.number().int().min(2).max(8).default(4),
    timeLimit: z.number().int().positive().optional(), // in seconds
    theme: z.enum(['default', 'animals', 'colors']).default('default'),
});

export const PokemonGameConfigSchema = z.object({
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    timeLimit: z.number().int().positive().default(30), // in seconds
    generation: z.number().int().min(1).max(9).default(1),
});

export const MazeGameConfigSchema = z.object({
    width: z.number().int().min(10).max(50).default(20),
    height: z.number().int().min(10).max(50).default(20),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const BrickBreakerConfigSchema = z.object({
    rows: z.number().int().min(3).max(10).default(5),
    cols: z.number().int().min(5).max(15).default(10),
    ballSpeed: z.number().positive().default(1),
    paddleSpeed: z.number().positive().default(1),
});

export const GravityGameConfigSchema = z.object({
    gravity: z.number().positive().default(0.5),
    ballCount: z.number().int().min(1).max(10).default(3),
    obstacleCount: z.number().int().min(0).max(20).default(5),
});

// Game session schema
export const GameSessionSchema = z.object({
    id: IdSchema,
    userId: IdSchema,
    gameType: GameKeySchema,
    status: GameStatusSchema,
    startTime: TimestampSchema,
    endTime: TimestampSchema.optional(),
    currentScore: z.number().int().nonnegative().default(0),
    config: z.union([
        MemoryGameConfigSchema,
        PokemonGameConfigSchema,
        MazeGameConfigSchema,
        BrickBreakerConfigSchema,
        GravityGameConfigSchema,
    ]).optional(),
});

export type GameSession = z.infer<typeof GameSessionSchema>;

// Validation helpers
export const validateScore = (data: unknown) => {
    return ScoreSchema.safeParse(data);
};

export const validateSubmitScore = (data: unknown) => {
    return SubmitScoreSchema.safeParse(data);
};

export const validateScoreFilters = (data: unknown) => {
    return ScoreFiltersSchema.safeParse(data);
};

export const validateGameSession = (data: unknown) => {
    return GameSessionSchema.safeParse(data);
};