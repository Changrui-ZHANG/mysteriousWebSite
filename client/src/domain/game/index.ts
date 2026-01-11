// Page component
export { Game } from './GamePage';

// Components
export { GravityPlayground } from './components/GravityPlayground';
export { ScoreDisplay } from './components/ScoreDisplay';
export { GameHUD } from './components/GameHUD';
export { default as Leaderboard } from './components/Leaderboard';

// Services
export { ScoreService } from './services/ScoreService';

// Repositories
export { ScoreRepository } from './repositories/ScoreRepository';

// Hooks
export { useBrickBreaker } from './hooks/useBrickBreaker';
export { useBrickBreakerEngine } from './hooks/useBrickBreakerEngine';
export { useMatch3 } from './hooks/useMatch3';
export { useMazeGame } from './hooks/useMazeGame';

// Schemas
export * from './schemas/gameSchemas';

// Types
export type { GameKey, GameStatus, PersonalBest } from './types';
