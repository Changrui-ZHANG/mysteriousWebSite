import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaSyncAlt, FaRegHeart, FaStar } from 'react-icons/fa';
import { useSpeech } from '../hooks/useSpeech';
import { useTheme } from '../hooks/useTheme';
import { fetchJson, postJson } from '../api/httpClient';
import { STORAGE_KEYS } from '../constants/authStorage';
import AuthModal from '../features/auth/AuthModal';
import { GradientHeading, Button, LoadingSpinner } from '../components';
import { VocabularyCard } from '../components/learning';
import type { VocabularyItem } from '../types/learning';

interface User {
    userId: string;
    username: string;
}

export function LearningPage({ isDarkMode }: { isDarkMode: boolean }) {
    const { t, i18n } = useTranslation();
    const { speak } = useSpeech({ lang: 'fr-FR' });
    const theme = useTheme(isDarkMode);

    const [item, setItem] = useState<VocabularyItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [mode, setMode] = useState<'discover' | 'review'>('discover');
    const [favoriteItems, setFavoriteItems] = useState<VocabularyItem[]>([]);
    const [showAuthModal, setShowAuthModal] = useState(false);

    const fetchRandom = async () => {
        setLoading(true);
        setRevealed(false);
        try {
            const data = await fetchJson<VocabularyItem>('/api/vocabulary/random');
            if (data) setItem(data);
        } catch (err) {
            console.error("Error fetching random:", err);
            setItem(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (!storedUser) {
            setShowAuthModal(true);
            setLoading(false);
            return;
        }
        try {
            const u = JSON.parse(storedUser);
            setUser(u);
            fetchFavorites(u.userId);
            fetchRandom();
        } catch (e) {
            console.error("Failed to parse user", e);
            setShowAuthModal(true);
            setLoading(false);
        }
    }, []);

    const handleLogin = (newUser: User) => {
        setUser(newUser);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
        setShowAuthModal(false);
        fetchFavorites(newUser.userId);
        fetchRandom();
    };

    const fetchFavorites = async (userId: string) => {
        try {
            const ids = await fetchJson<number[]>(`/api/vocabulary/favorites/${userId}`);
            if (Array.isArray(ids)) setFavorites(new Set(ids));
        } catch (e) { console.error("Failed to fetch favorites", e); }
    };

    const fetchFavoritesDetails = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const details = await fetchJson<VocabularyItem[]>(`/api/vocabulary/favorites/${user.userId}/details`);
            if (Array.isArray(details)) setFavoriteItems(details);
            else setItem(null);
        } catch (e) {
            console.error(e);
            setMode('discover');
            fetchRandom();
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'discover' | 'review') => {
        setMode(newMode);
        if (newMode === 'review') {
            if (favorites.size === 0) {
                alert(t('learning.no_favorites'));
                setMode('discover');
                return;
            }
            fetchFavoritesDetails();
        } else {
            fetchRandom();
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, targetItem: VocabularyItem) => {
        e.stopPropagation();
        if (!user) { alert(t('learning.login_to_save')); return; }

        const isFav = favorites.has(targetItem.id);
        const newSet = new Set(favorites);

        if (isFav) {
            newSet.delete(targetItem.id);
            setFavorites(newSet);
            fetch(`/api/vocabulary/favorites/${user.userId}/${targetItem.id}`, { method: 'DELETE' }).catch(console.error);
            if (mode === 'review') setFavoriteItems(prev => prev.filter(i => i.id !== targetItem.id));
        } else {
            newSet.add(targetItem.id);
            setFavorites(newSet);
            postJson(`/api/vocabulary/favorites/${user.userId}/${targetItem.id}`, {}).catch(console.error);
        }
    };

    const getLocalizedMeaning = (itm: VocabularyItem) => {
        const lang = i18n.language;
        if (lang.startsWith('zh')) return itm.meaningZh || itm.meaning;
        if (lang.startsWith('en')) return itm.meaningEn || itm.meaning;
        return itm.meaning;
    };

    return (
        <>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLogin} isDarkMode={isDarkMode} />

            {!user ? (
                <div className={`min-h-screen flex items-center justify-center ${theme.textPrimary}`}>
                    <div className="text-center">
                        <GradientHeading gradient="amber-orange" level={1} className="mb-4">{t('learning.title')}</GradientHeading>
                        <p className="text-lg opacity-70 mb-6">{t('learning.login_required')}</p>
                        <Button color="amber" size="lg" rounded="full" onClick={() => setShowAuthModal(true)}>{t('auth.login')}</Button>
                    </div>
                </div>
            ) : (
                <div className={`min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center transition-colors duration-500 ${theme.textPrimary}`}>
                    <div className="max-w-2xl w-full text-center mb-8">
                        <GradientHeading gradient="amber-orange" level={1} className="font-serif mb-4">{t('learning.title')}</GradientHeading>
                        <div className="flex justify-center gap-4 mt-6">
                            <button onClick={() => switchMode('discover')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'discover' ? 'bg-amber-500 text-white' : 'opacity-50 hover:opacity-100 bg-current/10'}`}>
                                {t('learning.discover')}
                            </button>
                            <button onClick={() => switchMode('review')} className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'review' ? 'bg-red-500 text-white' : 'opacity-50 hover:opacity-100 bg-current/10'}`}>
                                <FaStar /> {t('learning.review')} ({favorites.size})
                            </button>
                        </div>
                    </div>

                    <div className="w-full max-w-4xl relative min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <LoadingSpinner size="lg" color="amber" className="absolute inset-0 h-64" />
                            ) : (mode === 'review' && favoriteItems.length === 0) ? (
                                <div className="text-center py-20 opacity-50">
                                    <FaRegHeart className="text-6xl mx-auto mb-4" />
                                    <p>{t('learning.no_favorites')}</p>
                                    <button onClick={() => switchMode('discover')} className="mt-4 underline">{t('learning.back_to_discover')}</button>
                                </div>
                            ) : mode === 'review' ? (
                                <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    {favoriteItems.map(fav => (
                                        <VocabularyCard key={fav.id} item={fav} isMini isDarkMode={isDarkMode} isFavorite={favorites.has(fav.id)} localizedMeaning={getLocalizedMeaning(fav)} onToggleFavorite={(e) => toggleFavorite(e, fav)} />
                                    ))}
                                </motion.div>
                            ) : item ? (
                                <div className="w-full max-w-xl mx-auto">
                                    <VocabularyCard item={item} revealed={revealed} isDarkMode={isDarkMode} isFavorite={favorites.has(item.id)} localizedMeaning={getLocalizedMeaning(item)} onReveal={() => setRevealed(true)} onToggleFavorite={(e) => toggleFavorite(e, item)} onSpeak={speak} />
                                </div>
                            ) : (
                                <div className="text-center py-20 text-red-500/70">
                                    <FaSyncAlt className="text-4xl mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">{t('learning.load_error')}</p>
                                    <button onClick={fetchRandom} className="mt-4 px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:opacity-80 transition-opacity">{t('learning.retry')}</button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {mode === 'discover' && (
                        <div className="mt-12 flex gap-4">
                            <button onClick={fetchRandom} className={`group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg ${isDarkMode ? 'bg-white text-gray-900 hover:bg-amber-400' : 'bg-gray-900 text-white hover:bg-amber-600'}`}>
                                <FaSyncAlt className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                                <span>{t('learning.new_expression')}</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
