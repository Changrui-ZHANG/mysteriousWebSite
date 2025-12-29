// Props interface for BrickBreaker component

export interface BrickBreakerProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null;
    isAuthenticated: boolean;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

