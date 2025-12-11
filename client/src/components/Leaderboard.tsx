import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Score {
    id: string;
    username: string;
    score: number;
    timestamp: number;
}

interface LeaderboardProps {
    gameType: string;
    refreshTrigger: number;
    isDarkMode: boolean;
}

export default function Leaderboard({ gameType, refreshTrigger, isDarkMode }: LeaderboardProps) {
    const { t } = useTranslation();
    const [scores, setScores] = useState<Score[]>([]);

    useEffect(() => {
        const fetchTopScores = async () => {
            try {
                const response = await fetch(`/api/scores/top/${gameType}`);
                if (response.ok) {
                    const data = await response.json();
                    setScores(data);
                }
            } catch (error) {
                console.error("Failed to fetch top scores", error);
            }
        };

        fetchTopScores();
    }, [gameType, refreshTrigger]);

    if (scores.length === 0) return null;

    return (
        <div className={`mt-8 max-w-md mx-auto p-4 rounded-xl border ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/10'} backdrop-blur-sm`}>
            <h3 className="text-center font-bold text-lg mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                🏆 {t('game.leaderboard')} 🏆
            </h3>
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
                        <span className="font-mono font-bold text-fuchsia-400">{score.score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
