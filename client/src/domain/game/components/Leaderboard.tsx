import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTrophy, FaCrown, FaMedal } from 'react-icons/fa';
import { fetchJson, deleteJson } from '../../../shared/api/httpClient';
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
    const { user, adminCode } = useAuth();
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
        console.log('=== DEBUG SUPPRESSION SCORE ===');
        console.log('Score ID:', id);
        console.log('Username:', username);
        console.log('Admin code from context:', adminCode);
        console.log('Is admin:', isAdmin, 'Is super admin:', isSuperAdmin);
        console.log('LocalStorage admin code:', localStorage.getItem('admin_session_code'));
        console.log('LocalStorage is admin:', localStorage.getItem('messageWall_isAdmin'));
        console.log('LocalStorage is super admin:', localStorage.getItem('messageWall_isSuperAdmin'));

        if (!confirm(t('game.confirm_reset_score', { username }))) return;

        try {
            if (!adminCode) {
                console.error('❌ No admin code available');
                alert('Erreur: Pas de code admin disponible. Reconnectez-vous en tant qu\'admin.');
                return;
            }

            const deleteUrl = `${API_ENDPOINTS.GAMES.DELETE_SCORE(id)}?adminCode=${adminCode}`;
            console.log('🔗 Delete URL:', deleteUrl);

            await deleteJson(deleteUrl);
            setRefresh(prev => prev + 1);
            console.log('✅ Score deleted successfully');
        } catch (error) {
            console.error('❌ Failed to reset score', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`Erreur lors de la suppression: ${errorMessage}`);
        }
    };

    const handleClearAllScores = async () => {
        console.log('=== DEBUG SUPPRESSION TOUS LES SCORES ===');
        console.log('Game type:', gameType);
        console.log('Admin code from context:', adminCode);
        console.log('Is super admin:', isSuperAdmin);

        // Double confirmation pour éviter les suppressions accidentelles
        const firstConfirm = confirm(t('game.confirm_clear_all_scores', { gameType }));
        if (!firstConfirm) return;

        const secondConfirm = prompt(`⚠️ DERNIÈRE CHANCE ⚠️\n\nPour confirmer la suppression de TOUS les scores de ${gameType}, tapez exactement: SUPPRIMER`);
        if (secondConfirm !== 'SUPPRIMER') {
            alert('Suppression annulée. Vous devez taper exactement "SUPPRIMER" pour confirmer.');
            return;
        }

        try {
            if (!adminCode) {
                console.error('❌ No admin code available');
                alert('Erreur: Pas de code admin disponible. Reconnectez-vous en tant qu\'admin.');
                return;
            }

            const deleteUrl = `${API_ENDPOINTS.GAMES.DELETE_ALL_GAME_SCORES(gameType)}?adminCode=${adminCode}`;
            console.log('🔗 Delete all URL:', deleteUrl);

            const result = await deleteJson(deleteUrl);
            console.log('✅ All scores deleted successfully:', result);

            setRefresh(prev => prev + 1);
            const deletedCount = (result as any)?.deletedCount || 'N/A';
            alert(`✅ Tous les scores de ${gameType} ont été supprimés avec succès !\n\nNombre de scores supprimés: ${deletedCount}`);
        } catch (error) {
            console.error('❌ Failed to clear all scores', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`❌ Erreur lors de la suppression: ${errorMessage}`);
        }
    };

    const handleCleanupDuplicates = async () => {
        console.log('=== DEBUG NETTOYAGE DOUBLONS ===');
        console.log('Admin code from context:', adminCode);
        console.log('Is super admin:', isSuperAdmin);

        try {
            if (!adminCode) {
                console.error('❌ No admin code available');
                alert('Erreur: Pas de code admin disponible. Reconnectez-vous en tant qu\'admin.');
                return;
            }

            // D'abord, vérifier s'il y a des doublons
            const reportUrl = `${API_ENDPOINTS.GAMES.DUPLICATES_REPORT}?adminCode=${adminCode}`;
            console.log('🔍 Report URL:', reportUrl);

            const reportResponse = await fetch(reportUrl);
            const reportResult = await reportResponse.json();

            console.log('📊 Duplicates report:', reportResult);

            const totalDuplicates = reportResult.data?.totalDuplicates || 0;
            const duplicateGroups = reportResult.data?.duplicateGroups || 0;
            const totalScores = reportResult.data?.totalScores || 0;

            if (totalDuplicates === 0) {
                alert(`ℹ️ Aucun doublon trouvé !\n\nTotal des scores: ${totalScores}\nTous les scores sont uniques.`);
                return;
            }

            // Confirmer la suppression avec les détails
            const confirmMessage = `🔍 Rapport des doublons:\n\nTotal des scores: ${totalScores}\nGroupes avec doublons: ${duplicateGroups}\nDoublons à supprimer: ${totalDuplicates}\n\nVoulez-vous procéder au nettoyage ?`;

            if (!confirm(confirmMessage)) return;

            // Procéder au nettoyage
            const cleanupUrl = `${API_ENDPOINTS.GAMES.CLEANUP_DUPLICATES}?adminCode=${adminCode}`;
            console.log('🔗 Cleanup URL:', cleanupUrl);

            let response = await fetch(cleanupUrl, { method: 'POST' });
            let result = await response.json();

            console.log('✅ Duplicates cleaned up successfully:', result);

            let duplicatesRemoved = result.data?.duplicatesRemoved || 0;

            // Si aucun doublon n'a été supprimé, essayer la méthode force
            if (duplicatesRemoved === 0 && totalDuplicates > 0) {
                console.log('⚠️ Normal cleanup removed 0 duplicates, trying force cleanup...');

                const forceCleanupUrl = `${API_ENDPOINTS.GAMES.FORCE_CLEANUP_DUPLICATES}?adminCode=${adminCode}`;
                console.log('🔗 Force Cleanup URL:', forceCleanupUrl);

                response = await fetch(forceCleanupUrl, { method: 'POST' });
                result = await response.json();

                console.log('✅ Force duplicates cleaned up successfully:', result);
                duplicatesRemoved = result.data?.duplicatesRemoved || 0;
            }

            setRefresh(prev => prev + 1);

            // Afficher le nombre de doublons supprimés
            alert(`✅ Nettoyage des doublons terminé avec succès !\n\nNombre de doublons supprimés: ${duplicatesRemoved}\n\nSeuls les meilleurs scores de chaque utilisateur ont été conservés.`);
        } catch (error) {
            console.error('❌ Failed to cleanup duplicates', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            alert(`❌ Erreur lors du nettoyage: ${errorMessage}`);
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
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-gray-100 flex items-center gap-2 uppercase tracking-wider">
                            <FaTrophy className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                            {t('game.leaderboard')}
                            <span className="text-xs text-purple-400 font-normal">({scores.length} {t('game.players')})</span>
                        </h3>
                        {/* Super Admin Buttons */}
                        {isSuperAdmin && (
                            <div className="flex items-center gap-2">
                                {/* Cleanup Duplicates Button */}
                                <button
                                    onClick={handleCleanupDuplicates}
                                    className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 hover:text-yellow-200 rounded-full transition-all duration-300 backdrop-blur-xl border border-yellow-500/30 hover:border-yellow-400/50 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105 shadow-lg hover:shadow-yellow-500/20"
                                    title={t('game.cleanup_duplicates')}
                                >
                                    🧹 Clean
                                </button>
                                {/* Clear All Button */}
                                {scores.length > 0 && (
                                    <button
                                        onClick={handleClearAllScores}
                                        className="px-3 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200 rounded-full transition-all duration-300 backdrop-blur-xl border border-red-500/30 hover:border-red-400/50 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105 shadow-lg hover:shadow-red-500/20"
                                        title={t('game.clear_all_scores')}
                                    >
                                        🗑️ Clear All
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
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
                                <div key={score.id} className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 cursor-default ${isPersonalScore
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
                                            <span className={`font-mono font-bold text-sm ${isPersonalScore ? 'text-purple-300' :
                                                index === 0 ? 'text-yellow-300' :
                                                    index === 1 ? 'text-gray-300' :
                                                        index === 2 ? 'text-orange-300' :
                                                            'text-gray-400'
                                                }`}>
                                                #{index + 1}
                                            </span>
                                        </div>

                                        {/* Username */}
                                        <span className={`font-medium text-sm whitespace-nowrap ${isPersonalScore ? 'text-purple-100 font-bold' : 'text-gray-200'
                                            }`}>
                                            {score.username}
                                            {isPersonalScore && <span className="ml-1.5 text-purple-400 animate-pulse">★</span>}
                                        </span>

                                        {/* Score */}
                                        <span className={`font-mono font-bold text-sm whitespace-nowrap ${isPersonalScore ? 'text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]' :
                                            index === 0 ? 'text-yellow-300' :
                                                index === 1 ? 'text-gray-200' :
                                                    index === 2 ? 'text-orange-300' :
                                                        'text-cyan-400'
                                            }`}>
                                            {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                        </span>

                                        {/* Admin Delete Button */}
                                        {(isSuperAdmin || isAdmin) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReset(score.id, score.username);
                                                }}
                                                className="ml-2 w-6 h-6 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200 rounded-full transition-all duration-300 backdrop-blur-xl border border-red-500/30 hover:border-red-400/50 text-sm font-bold opacity-80 hover:opacity-100 hover:scale-110 shadow-lg hover:shadow-red-500/20"
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
                                <div key={score.id} className={`relative flex items-center justify-between p-2 rounded-lg text-xs transition-all duration-300 ${isPersonalScore
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
                                    <div className="relative flex items-center gap-1">
                                        <span className={`font-mono font-bold ${isPersonalScore ? 'text-purple-800 dark:text-purple-200 drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]' : ''}`}>
                                            {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                        </span>
                                        {/* Admin Delete Button */}
                                        {(isSuperAdmin || isAdmin) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReset(score.id, score.username);
                                                }}
                                                className="ml-2 w-5 h-5 flex items-center justify-center bg-red-100/90 dark:bg-red-500/20 hover:bg-red-200/90 dark:hover:bg-red-500/40 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 rounded-full transition-all duration-300 backdrop-blur-xl border border-red-300/50 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-400/50 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-110 shadow-md hover:shadow-red-500/20"
                                                title={t('game.reset_score')}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
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
            <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-center font-bold text-base md:text-lg bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider drop-shadow-sm flex items-center justify-center gap-2 flex-1">
                    <FaTrophy className="text-yellow-500" />
                    {t('game.leaderboard')}
                    <FaTrophy className="text-yellow-500" />
                </h3>
                {/* Super Admin Buttons */}
                {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                        {/* Cleanup Duplicates Button */}
                        <button
                            onClick={handleCleanupDuplicates}
                            className="px-2 py-1 bg-yellow-100/90 dark:bg-yellow-500/20 hover:bg-yellow-200/90 dark:hover:bg-yellow-500/40 text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 rounded-lg transition-all duration-300 backdrop-blur-xl border border-yellow-300/50 dark:border-yellow-500/30 hover:border-yellow-400 dark:hover:border-yellow-400/50 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105 shadow-md hover:shadow-yellow-500/20"
                            title={t('game.cleanup_duplicates')}
                        >
                            🧹
                        </button>
                        {/* Clear All Button */}
                        {scores.length > 0 && (
                            <button
                                onClick={handleClearAllScores}
                                className="px-2 py-1 bg-red-100/90 dark:bg-red-500/20 hover:bg-red-200/90 dark:hover:bg-red-500/40 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 rounded-lg transition-all duration-300 backdrop-blur-xl border border-red-300/50 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-400/50 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105 shadow-md hover:shadow-red-500/20"
                                title={t('game.clear_all_scores')}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                )}
            </div>

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
                            <div key={score.id} className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${isPersonalScore
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
                                        <span className={`font-black w-4 md:w-6 text-center drop-shadow-sm ${isPersonalScore ? 'text-purple-700 dark:text-purple-300 text-lg md:text-2xl' :
                                            index === 0 ? 'text-yellow-600 dark:text-yellow-300 text-base md:text-xl' :
                                                index === 1 ? 'text-gray-600 dark:text-gray-200 text-sm md:text-lg' :
                                                    'text-orange-600 dark:text-orange-300 text-xs md:text-base'
                                            }`}>#{index + 1}</span>
                                    </div>
                                    <span className={`font-bold drop-shadow-sm text-sm md:text-base truncate max-w-[100px] md:max-w-none ${isPersonalScore ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-white'
                                        }`}>
                                        {score.username}
                                        {isPersonalScore && <span className="ml-1 text-purple-500 animate-pulse">★</span>}
                                    </span>
                                </div>
                                <div className="relative flex items-center gap-1 md:gap-2">
                                    <span className={`font-mono font-bold drop-shadow-sm text-xs md:text-sm ${isPersonalScore ? 'text-purple-800 dark:text-purple-200 drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]' : 'text-cyan-700 dark:text-cyan-300'
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
