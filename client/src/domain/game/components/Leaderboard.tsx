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
            <div className="w-full gaming-leaderboard p-3 md:p-4 mt-6 mb-8 relative">
                {/* Decorative background illustrations for "Rank" theme */}
                <div className="absolute -bottom-6 -right-6 text-9xl text-accent-secondary/5 rotate-12 pointer-events-none select-none">
                    <FaTrophy />
                </div>
                <div className="absolute -top-4 -left-4 text-8xl text-accent-primary/5 -rotate-12 pointer-events-none select-none">
                    <FaCrown />
                </div>

                {/* Decorative rank glow line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-accent-secondary to-transparent"></div>

                <div className="relative z-10 w-full">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                                <h3 className="text-sm font-black text-primary flex items-center gap-2 uppercase tracking-[0.2em] drop-shadow-lg">
                                    <FaTrophy className="text-yellow-500 animate-pulse" />
                                    {t('game.leaderboard')}
                                    <span className="ml-2 text-[10px] text-accent-secondary font-bold px-2 py-0.5 bg-accent-secondary/10 rounded-full border border-accent-secondary/20 animate-pulse">
                                        RANKING
                                    </span>
                                </h3>
                            </div>
                            {/* Super Admin Buttons */}
                            {isSuperAdmin && (
                                <div className="flex items-center gap-2">
                                    {/* Cleanup Duplicates Button */}
                                    <button
                                        onClick={handleCleanupDuplicates}
                                        className="px-3 py-1 bg-accent-warning/10 hover:bg-accent-warning/20 text-accent-warning rounded-full transition-all duration-300 backdrop-blur-xl border border-accent-warning/20 hover:border-accent-warning/40 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105"
                                        title={t('game.cleanup_duplicates')}
                                    >
                                        🧹 Clean
                                    </button>
                                    {/* Clear All Button */}
                                    {scores.length > 0 && (
                                        <button
                                            onClick={handleClearAllScores}
                                            className="px-3 py-1 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-full transition-all duration-300 backdrop-blur-xl border border-accent-danger/20 hover:border-accent-danger/40 text-xs font-bold opacity-80 hover:opacity-100 hover:scale-105"
                                            title={t('game.clear_all_scores')}
                                        >
                                            🗑️ Clear
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent-secondary/20 to-transparent"></div>
                    </div>

                    {scores.length === 0 ? (
                        <div className="text-center py-6 text-sm text-secondary opacity-60 italic">
                            {t('game.no_scores_yet')}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3 justify-center w-full overflow-x-hidden p-1">
                            {scores.map((score, index) => {
                                const isPersonalScore = user && score.username === user.username;
                                const rankIcon = index === 0 ? <FaCrown className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" /> :
                                    index === 1 ? <FaMedal className="text-gray-300 drop-shadow-[0_0_6px_rgba(192,192,192,0.6)]" /> :
                                        index === 2 ? <FaMedal className="text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" /> : null;

                                return (
                                    <div key={score.id} className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-500 cursor-default group hover:scale-105 ${index === 0 ? 'bg-gradient-to-r from-rank-1-from to-rank-1-to border-2 border-rank-1-border shadow-[0_10px_20px_rgba(250,204,21,0.15)]' :
                                            isPersonalScore ? 'bg-gradient-to-r from-accent-primary/20 via-accent-secondary/10 to-accent-primary/20 border-2 border-accent-secondary shadow-[0_10px_25px_rgba(168,85,247,0.25)]' :
                                                index === 1 ? 'bg-gradient-to-r from-rank-2-from to-rank-2-to border-2 border-rank-2-border shadow-md' :
                                                    index === 2 ? 'bg-gradient-to-r from-rank-3-from to-rank-3-to border-2 border-rank-3-border shadow-md' :
                                                        'bg-surface/40 backdrop-blur-md border border-default hover:border-accent-primary/40 hover:bg-surface/60'
                                        }`}>
                                        {/* Dynamic rank-themed shine effect */}
                                        {index < 3 && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        )}

                                        <div className="relative flex items-center gap-3">
                                            {/* Rank */}
                                            <div className="flex items-center gap-1.5">
                                                {rankIcon}
                                                <span className={`font-mono font-black text-sm ${index === 0 ? 'text-rank-1-text' :
                                                        index === 1 ? 'text-rank-2-text' :
                                                            index === 2 ? 'text-rank-3-text' :
                                                                isPersonalScore ? 'text-accent-secondary' :
                                                                    'text-secondary'
                                                    }`}>
                                                    #{index + 1}
                                                </span>
                                            </div>

                                            {/* Username */}
                                            <span
                                                className={`font-black text-sm whitespace-nowrap animate-shine animate-neon tracking-tight ${isPersonalScore ? 'text-primary' : 'text-primary'
                                                    }`}
                                                style={{
                                                    '--neon-color': index === 0 ? 'var(--rank-1-border)' :
                                                        index === 1 ? 'var(--rank-2-border)' :
                                                            index === 2 ? 'var(--rank-3-border)' :
                                                                isPersonalScore ? 'var(--accent-secondary)' : 'transparent'
                                                } as React.CSSProperties}
                                            >
                                                {score.username}
                                                {isPersonalScore && <span className="ml-1.5 text-accent-secondary animate-pulse">★</span>}
                                            </span>

                                            {/* Score */}
                                            <span className={`font-mono font-black text-sm whitespace-nowrap px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 ${index === 0 ? 'text-rank-1-text' :
                                                    index === 1 ? 'text-rank-2-text' :
                                                        index === 2 ? 'text-rank-3-text' :
                                                            isPersonalScore ? 'text-accent-info drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' :
                                                                'text-accent-info'
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
                                                    className="w-5 h-5 flex items-center justify-center bg-accent-danger/20 hover:bg-accent-danger text-accent-danger hover:text-white rounded-full transition-all duration-300 border border-accent-danger/30 hover:shadow-[0_0_10px_rgba(239,68,68,0.5)]"
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
            </div>
        );
    }

    if (compact) {
        return (
            <div className="space-y-2">
                {scores.length === 0 ? (
                    <div className="text-center py-2 text-xs text-secondary opacity-60">
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
                                <div key={score.id} className={`relative flex items-center justify-between p-2 rounded-lg text-xs transition-all duration-300 ${index === 0 ? 'bg-gradient-to-r from-rank-1-from to-rank-1-to border border-rank-1-border' :
                                    isPersonalScore ? 'bg-gradient-to-r from-accent-primary/10 via-accent-secondary/5 to-accent-primary/10 border-2 border-accent-secondary/50 shadow-md animate-pulse' :
                                        index === 1 ? 'bg-gradient-to-r from-rank-2-from to-rank-2-to border border-rank-2-border' :
                                            index === 2 ? 'bg-gradient-to-r from-rank-3-from to-rank-3-to border border-rank-3-border' :
                                                'bg-surface border border-default'
                                    }`}>
                                    {/* Personal Score Glow Effect */}
                                    {isPersonalScore && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/30 to-purple-400/20 rounded-lg blur-sm animate-pulse"></div>
                                    )}

                                    <div className="relative flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {rankIcon}
                                            <span className={`font-bold w-4 ${isPersonalScore ? 'text-accent-secondary' : ''}`}>#{index + 1}</span>
                                        </div>
                                        <span
                                            className={`font-bold truncate max-w-[80px] animate-shine animate-neon`}
                                            style={{
                                                '--neon-color': index === 0 ? 'var(--rank-1-border)' :
                                                    index === 1 ? 'var(--rank-2-border)' :
                                                        index === 2 ? 'var(--rank-3-border)' :
                                                            isPersonalScore ? 'var(--accent-secondary)' : 'transparent'
                                            } as React.CSSProperties}
                                        >
                                            {score.username}
                                            {isPersonalScore && <span className="ml-1 text-accent-secondary">★</span>}
                                        </span>
                                    </div>
                                    <div className="relative flex items-center gap-1">
                                        <span className={`font-mono font-bold ${isPersonalScore ? 'text-accent-secondary drop-shadow-[0_0_4px_rgba(168,85,247,0.4)]' : ''}`}>
                                            {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                        </span>
                                        {/* Admin Delete Button */}
                                        {(isSuperAdmin || isAdmin) && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReset(score.id, score.username);
                                                }}
                                                className="ml-2 w-5 h-5 flex items-center justify-center bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-full transition-all duration-300 backdrop-blur-xl border border-accent-danger/20 hover:border-accent-danger/40 text-xs font-bold shadow-md"
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
                            <div className="text-center text-xs text-secondary opacity-60 pt-1">
                                +{scores.length - 3} more
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-surface-translucent backdrop-blur-xl border border-default rounded-2xl md:rounded-3xl p-4 md:p-6 mt-6 md:mt-8 max-w-sm md:max-w-md mx-auto shadow-lg">
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
                            className="px-2 py-1 bg-accent-warning/10 hover:bg-accent-warning/20 text-accent-warning rounded-lg transition-all duration-300 backdrop-blur-xl border border-accent-warning/20 hover:border-accent-warning/40 text-xs font-bold shadow-sm"
                            title={t('game.cleanup_duplicates')}
                        >
                            🧹
                        </button>
                        {/* Clear All Button */}
                        {scores.length > 0 && (
                            <button
                                onClick={handleClearAllScores}
                                className="px-2 py-1 bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-lg transition-all duration-300 backdrop-blur-xl border border-accent-danger/20 hover:border-accent-danger/40 text-xs font-bold shadow-sm"
                                title={t('game.clear_all_scores')}
                            >
                                🗑️
                            </button>
                        )}
                    </div>
                )}
            </div>

            {scores.length === 0 ? (
                <div className="text-center py-3 md:py-4 opacity-60 text-secondary text-sm md:text-base">
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
                            <div key={score.id} className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg md:rounded-xl backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${index === 0 ? 'bg-gradient-to-r from-rank-1-from to-rank-1-to border border-rank-1-border shadow-md' :
                                isPersonalScore ? 'bg-gradient-to-r from-accent-primary/10 via-accent-secondary/5 to-accent-primary/10 border-2 border-accent-secondary/50 shadow-md animate-pulse' :
                                    index === 1 ? 'bg-gradient-to-r from-rank-2-from to-rank-2-to border border-rank-2-border shadow-sm' :
                                        index === 2 ? 'bg-gradient-to-r from-rank-3-from to-rank-3-to border border-rank-3-border shadow-sm' :
                                            'bg-surface/50 border border-default'
                                }`}>
                                {/* Personal Score Glow Effect */}
                                {isPersonalScore && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/30 to-purple-400/20 rounded-lg md:rounded-xl blur-sm animate-pulse"></div>
                                )}

                                <div className="relative flex items-center gap-2 md:gap-3">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        {rankIcon}
                                        <span className={`font-black w-4 md:w-6 text-center drop-shadow-sm ${index === 0 ? 'text-rank-1-text' :
                                            index === 1 ? 'text-rank-2-text' :
                                                index === 2 ? 'text-rank-3-text' :
                                                    isPersonalScore ? 'text-accent-secondary' :
                                                        'text-secondary'
                                            } ${index < 3 ? 'text-sm md:text-xl' : 'text-xs md:text-base'}`}>#{index + 1}</span>
                                    </div>
                                    <span
                                        className={`font-bold drop-shadow-sm text-sm md:text-base truncate max-w-[100px] md:max-w-none animate-shine animate-neon`}
                                        style={{
                                            '--neon-color': index === 0 ? 'var(--rank-1-border)' :
                                                index === 1 ? 'var(--rank-2-border)' :
                                                    index === 2 ? 'var(--rank-3-border)' :
                                                        isPersonalScore ? 'var(--accent-secondary)' : 'transparent'
                                        } as React.CSSProperties}
                                    >
                                        {score.username}
                                        {isPersonalScore && <span className="ml-1 text-accent-secondary animate-pulse">★</span>}
                                    </span>
                                </div>
                                <div className="relative flex items-center gap-1 md:gap-2">
                                    <span className={`font-mono font-bold drop-shadow-sm text-xs md:text-sm ${isPersonalScore ? 'text-accent-secondary drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]' : 'text-accent-info'
                                        }`}>
                                        {score.score}{score.attempts ? `/${score.attempts}` : ''}
                                    </span>
                                    {(isSuperAdmin || isAdmin) && (
                                        <button
                                            onClick={() => handleReset(score.id, score.username)}
                                            className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-accent-danger/10 hover:bg-accent-danger/20 text-accent-danger rounded-full transition-all duration-300 backdrop-blur-xl border border-accent-danger/20 hover:border-accent-danger/40 text-xs md:text-sm min-h-[20px] min-w-[20px]"
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
