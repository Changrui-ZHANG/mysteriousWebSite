import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchJson, deleteJson } from '../../../api/httpClient';

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
    isDarkMode: boolean;
    isSuperAdmin?: boolean;
}

export default function Leaderboard({ gameType, refreshTrigger, isDarkMode, isSuperAdmin = false }: LeaderboardProps) {
    const { t } = useTranslation();
    const [scores, setScores] = useState<Score[]>([]);
    const [refresh, setRefresh] = useState(0);

    const fetchTopScores = async () => {
        try {
            // Using fetchJson for auto-unwrapping ApiResponse
            const data = await fetchJson<Score[]>(`/api/scores/top/${gameType}`);
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
        if (!confirm(`Are you sure you want to reset the score for ${username} to 0?`)) return;

        try {
            const SUPER_ADMIN_CODE = 'ChangruiZ'; // Should align with App.tsx
            await deleteJson(`/api/scores/${id}?adminCode=${SUPER_ADMIN_CODE}`);
            setRefresh(prev => prev + 1);
        } catch (error) {
            console.error('Failed to reset score', error);
            alert('Failed to reset score');
        }
    };

    // if (scores.length === 0) return null; // Don't hide completely

    return (
        <div className={`mt-8 max-w-md mx-auto p-4 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/10'} backdrop-blur-sm`}>
            <h3 className="text-center font-bold text-lg mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                🏆 {t('game.leaderboard')} 🏆
            </h3>

            {scores.length === 0 ? (
                <div className={`text-center py-4 opacity-60 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>{score.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-fuchsia-400">
                                    {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                </span>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => handleReset(score.id, score.username)}
                                        className="w-5 h-5 flex items-center justify-center bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded transition-colors"
                                        title="Reset Score"
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
