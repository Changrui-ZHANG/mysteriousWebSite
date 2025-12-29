import { useTranslation } from 'react-i18next';

type ScoreColor = 'cyan' | 'purple' | 'amber' | 'fuchsia' | 'yellow';

interface PersonalBest {
    score: number;
    attempts?: number;
}

interface ScoreDisplayProps {
    score: number;
    personalBest?: PersonalBest | null;
    attempts?: number;
    color?: ScoreColor;
    showBest?: boolean;
    className?: string;
}

const colorClasses: Record<ScoreColor, { primary: string; secondary: string }> = {
    cyan: { primary: 'text-cyan-400', secondary: 'text-purple-400' },
    purple: { primary: 'text-purple-400', secondary: 'text-indigo-400' },
    amber: { primary: 'text-amber-400', secondary: 'text-orange-400' },
    fuchsia: { primary: 'text-fuchsia-400', secondary: 'text-purple-400' },
    yellow: { primary: 'text-yellow-400', secondary: 'text-amber-400' },
};

export function ScoreDisplay({
    score,
    personalBest,
    attempts,
    color = 'cyan',
    showBest = true,
    className = '',
}: ScoreDisplayProps) {
    const { t } = useTranslation();
    const colors = colorClasses[color];

    const bestScore = personalBest?.score !== undefined
        ? Math.max(score, personalBest.score)
        : score;

    return (
        <div className={`text-xl font-bold font-mono ${colors.primary} ${className}`}>
            {t('game.score')}: {attempts != null ? `${score}/${attempts}` : score}

            {showBest && personalBest && personalBest.score !== undefined && personalBest.score > 0 && (
                <span className={`ml-3 text-lg ${colors.secondary} opacity-80`}>
                    ({t('game.best')}: {bestScore}
                    {personalBest.attempts != null && `/${personalBest.attempts}`})
                </span>
            )}
        </div>
    );
}
