import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrophy, FaCrown, FaMedal } from 'react-icons/fa';
import { fetchJson, deleteJson } from '../../../shared/api/httpClient';
import { getAdminCode } from '../../../shared/constants/authStorage';
import { API_ENDPOINTS } from '../../../shared/constants/endpoints';
import { useAuth } from '../../../shared/contexts/AuthContext';

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
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
    compact?: boolean;
    horizontal?: boolean; // New prop for horizontal layout
}

export default function Leaderboard({ gameType, refreshTrigger, isAdmin = false, isSuperAdmin = false, compact = false, horizontal = false }: LeaderboardProps) {
    const { t } = useTranslation();
    const { user } = useAuth();
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

    // if (scores.length === 0) return null; // Don't hide completely

    // Horizontal layout for GameWindow integration
    if (horizontal) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center gap-4 mb-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                    <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                        <FaTrophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                        {t('game.leaderboard')}
                        <span className="text-xs text-purple-400 font-normal">({scores.length} {t('game.players')})</span>
                    </h3>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
                </div>
                
                {scores.length === 0 ? (
                    <div className="text-center py-3 text-sm text-gray-400">
                        {t('game.no_scores_yet')}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                        {scores.map((score, index) => {
                            const isPersonalScore = user && score.username === user.username;
                            const rankIcon = index === 0 ? <FaCrown className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" /> : 
                                           index === 1 ? <FaMedal className="text-gray-300 drop-shadow-[0_0_4px_rgba(192,192,192,0.6)]" /> : 
                                           index === 2 ? <FaMedal className="text-orange-400 drop-shadow-[0_0_4px_rgba(251,146,60,0.6)]" /> : null;
                            
                            return (
                                <div key={score.id} className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-default ${
                                    isPersonalScore 
                                        ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border-2 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5),inset_0_0_20px_rgba(168,85,247,0.1)]' 
                                        : index === 0 ? 'bg-gradient-to-r from-yellow-600/30 to-amber-600/30 border border-yellow-500/60 shadow-[0_0_15px_rgba(250,204,21,0.3)]' :
                                          index === 1 ? 'bg-gradient-to-r from-gray-600/30 to-slate-600/30 border border-gray-400/60 shadow-[0_0_10px_rgba(156,163,175,0.2)]' :
                                          index === 2 ? 'bg-gradient-to-r from-orange-600/30 to-amber-700/30 border border-orange-500/60 shadow-[0_0_10px_rgba(251,146,60,0.2)]' :
                                          'bg-slate-800/70 border border-slate-600/50 hover:border-purple-500/40 hover:bg-slate-700/70'
                                }`}>
                                    {/* Personal Score Glow Effect */}
                                    {isPersonalScore && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg animate-pulse"></div>
                                    )}
                                    
                                    <div className="relative flex items-center gap-3">
                                        {/* Rank */}
                                        <div className="flex items-center gap-1.5">
                                            {rankIcon}
                                            <span className={`font-mono font-bold text-sm ${
                                                isPersonalScore ? 'text-purple-300' : 
                                                index === 0 ? 'text-yellow-300' :
                                                index === 1 ? 'text-gray-300' :
                                                index === 2 ? 'text-orange-300' :
                                                'text-gray-400'
                                            }`}>
                                                #{index + 1}
                                            </span>
                                        </div>
                                        
                                        {/* Username */}
                                        <span className={`font-medium text-sm whitespace-nowrap ${
                                            isPersonalScore ? 'text-purple-100 font-bold' : 'text-gray-200'
                                        }`}>
                                            {score.username}
                                            {isPersonalScore && <span className="ml-1.5 text-purple-400 animate-pulse">★</span>}
                                        </span>
                                        
                                        {/* Score */}
                                        <span className={`font-mono font-bold text-sm whitespace-nowrap ${
                                            isPersonalScore ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]' : 
                                            index === 0 ? 'text-yellow-300' :
                                            index === 1 ? 'text-gray-200' :
                                            index === 2 ? 'text-orange-300' :
                                            'text-cyan-400'
                                        }`}>
                                            {score.score}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {scores.length === 0 ? (
                    <div className="text-center py-2 text-xs text-gray-500 dark:text-gray-400">
                        {t('game.no_scores_yet')}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {scores.slice(0, 3).map((score, index) => {
                            const isPersonalScore = user && score.username === user.username;
                            const rankIcon = index === 0 ? <FaCrown className="text-yellow-400" /> : 
                                           index === 1 ? <FaMedal className="text-gray-400" /> : 
                                           <FaMedal className="text-orange-400" />;
                            
                            return (
                                <div key={score.id} className={`relative flex items-center justify-between p-2 rounded-lg text-xs transition-all duration-300 ${
                                    isPersonalScore 
                                        ? 'bg-gradient-to-r from-purple-100/95 via-pink-100/90 to-purple-100/95 dark:from-purple-900/50 dark:via-pink-900/40 dark:to-purple-900/50 border-2 border-purple-400/70 dark:border-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse' 
                                        : index === 0 ? 'bg-yellow-100/90 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                          index === 1 ? 'bg-gray-100/90 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300' :
                                          'bg-orange-100/90 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                }`}>
                                    {/* Personal Score Glow Effect */}
                                    {isPersonalScore && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/30 to-purple-400/20 rounded-lg blur-sm animate-pulse"></div>
                                    )}
                                    
                                    <div className="relative flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {rankIcon}
                                            <span className={`font-bold w-4 ${isPersonalScore ? 'text-purple-700 dark:text-purple-300' : ''}`}>#{index + 1}</span>
                                        </div>
                                        <span className={`font-medium truncate max-w-[80px] ${isPersonalScore ? 'text-purple-800 dark:text-purple-200 font-bold' : ''}`}>
                                            {score.username}
                                            {isPersonalScore && <span className="ml-1 text-purple-500">★</span>}
                                        </span>
                                    </div>
                                    <span className={`relative font-mono font-bold ${isPersonalScore ? 'text-purple-800 dark:text-purple-200 drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]' : ''}`}>
                                        {score.score}
                                    </span>
                                </div>
                            );
                        })}
                        {scores.length > 3 && (
                            <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-1">
                                +{scores.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-2xl md:rounded-3xl p-4 md:p-6 mt-6 md:mt-8 max-w-sm md:max-w-md mx-auto shadow-lg">
            <h3 className="text-center font-bold text-base md:text-lg mb-3 md:mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-sm flex items-center justify-center gap-2">
                <FaTrophy className="text-yellow-500" />
                {t('game.leaderboard')}
                <FaTrophy className="text-yellow-500" />
            </h3>

            {scores.length === 0 ? (
                <div className="text-center py-3 md:py-4 opacity-60 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                    {t('game.no_scores_yet')}
                </div>
            ) : (
                <div className="flex flex-col gap-1.5 md:gap-2">
                    {scores.map((score, index) => {
                        const isPersonalScore = user && score.username === user.username;
                        const rankIcon = index === 0 ? <FaCrown className="text-yellow-500 drop-shadow-lg" /> : 
                                       index === 1 ? <FaMedal className="text-gray-500 drop-shadow-md" /> : 
                                       index === 2 ? <FaMedal className="text-orange-500 drop-shadow-md" /> : null;
                        
                        return (
                            <div key={score.id} className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
                                isPersonalScore 
                                    ? 'bg-gradient-to-r from-purple-100/95 via-pink-100/90 to-purple-100/95 dark:from-purple-900/50 dark:via-pink-900/40 dark:to-purple-900/50 border-2 border-purple-400/80 dark:border-purple-400/60 shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse' 
                                    : index === 0 ? 'bg-gradient-to-r from-yellow-100/90 via-orange-100/80 to-yellow-100/90 dark:from-yellow-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 border border-yellow-400/70 dark:border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]' :
                                      index === 1 ? 'bg-gradient-to-r from-gray-100/90 via-slate-100/80 to-gray-100/90 dark:from-gray-800/40 dark:via-slate-800/30 dark:to-gray-800/40 border border-gray-400/70 dark:border-gray-500/50 shadow-[0_0_10px_rgba(156,163,175,0.2)]' :
                                        'bg-gradient-to-r from-orange-100/90 via-amber-100/80 to-orange-100/90 dark:from-orange-900/40 dark:via-amber-900/30 dark:to-orange-900/40 border border-orange-500/70 dark:border-orange-600/50 shadow-[0_0_8px_rgba(234,88,12,0.2)]'
                            }`}>
                                {/* Personal Score Glow Effect */}
                                {isPersonalScore && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/30 to-purple-400/20 rounded-lg md:rounded-xl blur-sm animate-pulse"></div>
                                )}
                                
                                <div className="relative flex items-center gap-2 md:gap-3">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        {rankIcon}
                                        <span className={`font-black w-4 md:w-6 text-center drop-shadow-sm ${
                                            isPersonalScore ? 'text-purple-700 dark:text-purple-300 text-lg md:text-2xl' :
                                            index === 0 ? 'text-yellow-600 dark:text-yellow-300 text-base md:text-xl' :
                                            index === 1 ? 'text-gray-600 dark:text-gray-200 text-sm md:text-lg' :
                                                'text-orange-600 dark:text-orange-300 text-xs md:text-base'
                                        }`}>#{index + 1}</span>
                                    </div>
                                    <span className={`font-bold drop-shadow-sm text-sm md:text-base truncate max-w-[100px] md:max-w-none ${
                                        isPersonalScore ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-white'
                                    }`}>
                                        {score.username}
                                        {isPersonalScore && <span className="ml-1 text-purple-500 animate-pulse">★</span>}
                                    </span>
                                </div>
                                <div className="relative flex items-center gap-1 md:gap-2">
                                    <span className={`font-mono font-bold drop-shadow-sm text-xs md:text-sm ${
                                        isPersonalScore ? 'text-purple-800 dark:text-purple-200 drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]' : 'text-cyan-700 dark:text-cyan-300'
                                    }`}>
                                        {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                    </span>
                                    {(isSuperAdmin || isAdmin) && (
                                        <button
                                            onClick={() => handleReset(score.id, score.username)}
                                            className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-red-100/90 dark:bg-red-500/30 hover:bg-red-200/90 dark:hover:bg-red-500/50 text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-white rounded-full transition-all duration-300 backdrop-blur-xl border border-red-300/70 dark:border-red-500/40 hover:border-red-400 dark:hover:border-red-400 text-xs md:text-sm min-h-[20px] min-w-[20px]"
                                            title={t('game.reset_score')}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
