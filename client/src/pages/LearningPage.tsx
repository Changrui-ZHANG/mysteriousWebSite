import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaSyncAlt, FaLightbulb, FaVolumeUp, FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { useSpeech } from '../hooks/useSpeech';
import { useTheme } from '../hooks/useTheme';
import { fetchJson, postJson } from '../utils/api';
import { STORAGE_KEYS } from '../constants/auth';
import AuthModal from '../features/auth/AuthModal';
import { GradientHeading, Button, LoadingSpinner } from '../components';

interface VocabularyItem {
    id: number;
    expression: string;
    meaning: string;
    meaningEn: string;
    meaningZh: string;
    example: string;
    level: string;
}

interface User {
    userId: string;
    username: string;
}

export function LearningPage({ isDarkMode }: { isDarkMode: boolean }) {
    const { t, i18n } = useTranslation();
    const { speak } = useSpeech({ lang: 'fr-FR' });
    const theme = useTheme(isDarkMode);

    // State
    const [item, setItem] = useState<VocabularyItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);

    // Auth & Favorites State
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
            if (data) {
                setItem(data);
            }
        } catch (err) {
            console.error("Error fetching random:", err);
            setItem(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load user from local storage
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (!storedUser) {
            // Show auth modal if not authenticated
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
            return;
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
            if (Array.isArray(ids)) {
                setFavorites(new Set(ids));
            }
        } catch (e) {
            console.error("Failed to fetch favorites", e);
        }
    };

    const fetchFavoritesDetails = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const details = await fetchJson<VocabularyItem[]>(`/api/vocabulary/favorites/${user.userId}/details`);
            if (Array.isArray(details)) {
                setFavoriteItems(details);
            } else {
                setItem(null);
            }
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
                alert("Vous n'avez pas encore de favoris !");
                setMode('discover');
                return;
            }
            fetchFavoritesDetails();
        } else {
            fetchRandom();
        }
    };

    const toggleFavorite = async (e: React.MouseEvent, targetItem?: VocabularyItem) => {
        e.stopPropagation();
        const currentItem = targetItem || item;
        if (!user || !currentItem) {
            alert("Connectez-vous pour sauvegarder vos favoris !");
            return;
        }

        const isFav = favorites.has(currentItem.id);
        const newSet = new Set(favorites);

        if (isFav) {
            newSet.delete(currentItem.id);
            setFavorites(newSet);
            // API call
            fetch(`/api/vocabulary/favorites/${user.userId}/${currentItem.id}`, { method: 'DELETE' }).catch(console.error);

            // If in review mode, update list immediately
            if (mode === 'review') {
                setFavoriteItems(prev => prev.filter(i => i.id !== currentItem.id));
            }
        } else {
            newSet.add(currentItem.id);
            setFavorites(newSet);
            postJson(`/api/vocabulary/favorites/${user.userId}/${currentItem.id}`, {}).catch(console.error);
        }
    };

    const getLocalizedMeaning = (itm: VocabularyItem) => {
        const lang = i18n.language;
        if (lang.startsWith('zh')) return itm.meaningZh || itm.meaning;
        if (lang.startsWith('en')) return itm.meaningEn || itm.meaning;
        return itm.meaning;
    };

    // Helper to render a card
    const renderCard = (itm: VocabularyItem, isMini = false) => (
        <motion.div
            layout
            key={itm.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => !isMini && !revealed && setRevealed(true)}
            className={`
                relative w-full ${isMini ? 'p-6 min-h-[250px]' : 'p-8 md:p-12 min-h-[400px]'} rounded-3xl text-center cursor-pointer transition-all duration-500 shadow-2xl
                ${isDarkMode
                    ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 hover:border-amber-500/30'
                    : 'bg-white border border-gray-100 shadow-xl hover:shadow-2xl hover:border-amber-200'
                }
            `}
        >
            <button
                onClick={(e) => toggleFavorite(e, itm)}
                className="absolute top-6 left-6 text-2xl z-10 hover:scale-110 transition-transform"
                title={favorites.has(itm.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                {favorites.has(itm.id)
                    ? <FaHeart className="text-red-500" />
                    : <FaRegHeart className="text-gray-400 hover:text-red-400" />
                }
            </button>

            <div className="absolute top-6 right-6">
                <span className={`
                    px-3 py-1 rounded-full text-xs font-bold tracking-widest border
                    ${itm.level === 'C2'
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }
                `}>
                    {itm.level}
                </span>
            </div>

            <div className={`${isMini ? 'mt-8' : ''}`}>
                <h2 className={`${isMini ? 'text-2xl' : 'text-3xl md:text-5xl'} font-serif font-bold mb-4 leading-tight`}>
                    « {itm.expression} »
                </h2>

                {(isMini || revealed) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4"
                    >
                        <p className={`${isMini ? 'text-base' : 'text-xl md:text-2xl'} font-light mb-4 ${isDarkMode ? 'text-amber-100' : 'text-gray-700'}`}>
                            {getLocalizedMeaning(itm)}
                        </p>

                        {!isMini && (
                            <div className={`text-left p-6 rounded-2xl ${isDarkMode ? 'bg-black/20 text-gray-300' : 'bg-gray-50 text-gray-600'}`}>
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest opacity-50">
                                    <FaLightbulb /> Exemple
                                </div>
                                <div className="flex gap-4">
                                    <p className="italic font-serif text-lg leading-relaxed flex-1">
                                        "{itm.example}"
                                    </p>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); speak(itm.example); }}
                                        className="self-start p-2 rounded-full hover:bg-current/10 transition-colors opacity-50 hover:opacity-100"
                                    >
                                        <FaVolumeUp />
                                    </button>
                                </div>
                            </div>
                        )}
                        {isMini && (
                            <p className="text-sm italic opacity-60 mt-2">"{itm.example}"</p>
                        )}
                    </motion.div>
                )}

                {!isMini && !revealed && (
                    <div className="text-sm opacity-50 uppercase tracking-widest mt-12 animate-pulse">
                        Tap to reveal
                    </div>
                )}
            </div>
        </motion.div>
    );

    return (
        <>
            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={handleLogin}
                isDarkMode={isDarkMode}
            />

            {!user ? (
                <div className={`min-h-screen flex items-center justify-center ${theme.textPrimary}`}>
                    <div className="text-center">
                        <GradientHeading gradient="amber-orange" level={1} className="mb-4">
                            {t('learning.title')}
                        </GradientHeading>
                        <p className="text-lg opacity-70 mb-6">{t('learning.login_required')}</p>
                        <Button
                            color="amber"
                            size="lg"
                            rounded="full"
                            onClick={() => setShowAuthModal(true)}
                        >
                            {t('auth.login')}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={`min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center transition-colors duration-500 ${theme.textPrimary}`}>

                    <div className="max-w-2xl w-full text-center mb-8">
                        <GradientHeading gradient="amber-orange" level={1} className="font-serif mb-4">
                            {t('learning.title')}
                        </GradientHeading>

                        <div className="flex justify-center gap-4 mt-6">
                            <button
                                onClick={() => switchMode('discover')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${mode === 'discover' ? 'bg-amber-500 text-white' : 'opacity-50 hover:opacity-100 bg-current/10'}`}
                            >
                                {t('learning.discover')}
                            </button>
                            <button
                                onClick={() => switchMode('review')}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${mode === 'review' ? 'bg-red-500 text-white' : 'opacity-50 hover:opacity-100 bg-current/10'}`}
                            >
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
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
                                >
                                    {favoriteItems.map(fav => renderCard(fav, true))}
                                </motion.div>
                            ) : item ? (
                                <div className="w-full max-w-xl mx-auto">
                                    {renderCard(item)}
                                </div>
                            ) : (
                                <div className="text-center py-20 text-red-500/70">
                                    <FaSyncAlt className="text-4xl mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">{t('learning.load_error')}</p>
                                    <button onClick={fetchRandom} className="mt-4 px-6 py-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:opacity-80 transition-opacity">
                                        {t('learning.retry')}
                                    </button>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {mode === 'discover' && (
                        <div className="mt-12 flex gap-4">
                            <button
                                onClick={fetchRandom}
                                className={`
                            group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg
                            ${isDarkMode
                                        ? 'bg-white text-gray-900 hover:bg-amber-400'
                                        : 'bg-gray-900 text-white hover:bg-amber-600'
                                    }
                        `}
                            >
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
