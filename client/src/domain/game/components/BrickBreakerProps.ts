export interface BrickBreakerProps {
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number } | null;
    isAuthenticated: boolean;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
}

