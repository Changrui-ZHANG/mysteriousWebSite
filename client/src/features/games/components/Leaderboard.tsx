import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchJson, deleteJson } from '../../../api/httpClient';
import { getAdminCode } from '../../../constants/authStorage';
import { API_ENDPOINTS } from '../../../constants/endpoints';

interface Score {
    id: string;
    username: string;
    score: number;
    timestamp: number;
    attempts?: number;
}

interface LeaderboardProps {
    gameType: string;
    refreshTrigger: number;
    isSuperAdmin?: boolean;
}

export default function Leaderboard({ gameType, refreshTrigger, isSuperAdmin = false }: LeaderboardProps) {
    const { t } = useTranslation();
    const [scores, setScores] = useState<Score[]>([]);
    const [refresh, setRefresh] = useState(0);

    const fetchTopScores = async () => {
        try {
            // Using fetchJson for auto-unwrapping ApiResponse
            const data = await fetchJson<Score[]>(API_ENDPOINTS.GAMES.TOP_SCORES(gameType));
            if (Array.isArray(data)) {
                setScores(data);
            } else {
                console.error("Expected array of scores but got:", data);
                setScores([]);
            }
        } catch (error) {
            console.error("Failed to fetch top scores", error);
            setScores([]);
        }
    };

    useEffect(() => {
        fetchTopScores();
    }, [gameType, refreshTrigger, refresh]);

    const handleReset = async (id: string, username: string) => {
        if (!confirm(t('game.confirm_reset_score', { username }))) return;

        try {
            const adminCode = getAdminCode();
            if (!adminCode) return;
            await deleteJson(`${API_ENDPOINTS.GAMES.DELETE_SCORE(id)}?adminCode=${adminCode}`);
            setRefresh(prev => prev + 1);
        } catch (error) {
            console.error('Failed to reset score', error);
            alert(t('game.error_reset_score'));
        }
    };

    // if (scores.length === 0) return null; // Don't hide completely

    return (
        <div className="leaderboard-card mt-8 max-w-md mx-auto">
            <h3 className="text-center font-bold text-lg mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                🏆 {t('game.leaderboard')} 🏆
            </h3>

            {scores.length === 0 ? (
                <div className="text-center py-4 opacity-60 text-[var(--color-text-muted)]">
                    {t('game.no_scores_yet')}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {scores.map((score, index) => (
                        <div key={score.id} className={`flex items-center justify-between p-2 rounded-lg ${index === 0 ? 'bg-yellow-500/20 border border-yellow-500/30' :
                            index === 1 ? 'bg-gray-400/20 border border-gray-400/30' :
                                'bg-orange-700/20 border border-orange-700/30'
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className={`font-black w-6 text-center ${index === 0 ? 'text-yellow-400 text-xl' :
                                    index === 1 ? 'text-gray-400 text-lg' :
                                        'text-orange-600 text-base'
                                    }`}>#{index + 1}</span>
                                <span className="font-bold text-[var(--color-text-primary)]">{score.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-fuchsia-400">
                                    {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                </span>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleReset(score.id, score.username)}
                                        className="w-5 h-5 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded transition-colors"
                                        title={t('game.reset_score')}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
