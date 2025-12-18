import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getRandomPokemon, Pokemon } from '../../../utils/pokeapi';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { FaQuestion, FaArrowLeft } from 'react-icons/fa';
import { GradientHeading, IconButton, MuteButton, Button } from '../../../components';

interface PokemonGameProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number, attempts?: number) => void;
    personalBest?: { score: number, attempts?: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function PokemonGame({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, onGameStart }: PokemonGameProps) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        loadNewPokemon();
    }, []);

    useEffect(() => {
        // Autosave score logic
        // Only submit when score or attempts actually change
        if (score > 0) {
            onSubmitScore(score, attempts);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [score, attempts]);

    // Resubmit score when user logs in
    useEffect(() => {
        if (isAuthenticated && score > 0) {
            onSubmitScore(score, attempts);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    const loadNewPokemon = async () => {
        // Assume new game session logic is vague here, but if score resets or manual next
        // Actually Pokemon game is continuous. Score accumulates.
        // We probably only reset alert if Score is 0?
        // But player resets manually? There is no Reset button here usually, just 'Next'.
        // Wait, if reloading page, score resets.
        // If we want to allow "New Game" within session, we might need a Reset button?
        // Just calling onGameStart() on init handles the "ActiveGame Change" case.
        // If score resets?
        if (score === 0 && onGameStart) onGameStart(); // Reset alert if starting from 0

        playSound('click'); // Play click sound on next/load


        setLoading(true);
        setRevealed(false);
        setSelectedAnswer(null);
        try {
            const newPokemon = await getRandomPokemon();

            // Generate 3 random wrong answers
            const wrongAnswers = await generateWrongAnswers(newPokemon.id);
            // Add correct answer and shuffle
            const allOptions = [...wrongAnswers, newPokemon.name];
            const shuffled = allOptions.sort(() => Math.random() - 0.5);

            // Update state atomically (visually)
            setPokemon(newPokemon);
            setOptions(shuffled);
        } catch (error) {
            console.error('Failed to load Pokemon:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateWrongAnswers = async (correctId: number): Promise<string[]> => {
        const wrongAnswers: string[] = [];
        const usedIds = new Set([correctId]);

        while (wrongAnswers.length < 3) {
            const randomId = Math.floor(Math.random() * 151) + 1;
            if (!usedIds.has(randomId)) {
                usedIds.add(randomId);
                try {
                    // Fetch Pokemon by specific ID (not random)
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
                    if (response.ok) {
                        const data = await response.json();
                        wrongAnswers.push(data.name);
                    }
                } catch (error) {
                    // Skip if fetch fails
                }
            }
        }
        return wrongAnswers;
    };

    const handleAnswer = (answer: string) => {
        if (revealed) return;

        setSelectedAnswer(answer);
        setAttempts(prev => prev + 1);
        setRevealed(true);

        if (answer.toLowerCase() === pokemon?.name.toLowerCase()) {
            setScore(prev => prev + 1);
            playSound('win');
        } else {
            playSound('gameover');
        }
    };

    const isCorrectAnswer = (option: string) => {
        return option.toLowerCase() === pokemon?.name.toLowerCase();
    };

    const getButtonClass = (option: string) => {
        const baseClass = "w-full px-4 py-3 rounded-lg font-bold text-base transition-all duration-300 transform hover:scale-105";

        if (!revealed) {
            return `${baseClass} bg-purple-600 hover:bg-purple-500 text-white`;
        }

        if (isCorrectAnswer(option)) {
            return `${baseClass} bg-green-600 text-white ring-4 ring-green-400`;
        }

        if (selectedAnswer === option && !isCorrectAnswer(option)) {
            return `${baseClass} bg-red-600 text-white ring-4 ring-red-400`;
        }

        return `${baseClass} bg-gray-600 text-gray-300 opacity-50`;
    };

    const cardClass = theme.glassCard('purple');

    return (
        <div className="w-full h-full" style={{ perspective: '1000px' }}>
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face (Game) */}
                <div
                    className="absolute inset-0 w-full h-full overflow-y-auto p-4 md:p-6 font-mono flex flex-col scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Score Header */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="text-xl md:text-2xl font-bold text-purple-400">
                                {t('game.score')}: {score}/{attempts}
                                {personalBest && personalBest.score > 0 && (
                                    <span className="ml-3 text-lg text-indigo-400 opacity-90">
                                        ({t('game.best')}: {personalBest.score}{personalBest.attempts ? `/${personalBest.attempts}` : ''})
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <IconButton
                                icon={<FaQuestion size={20} />}
                                onClick={() => setIsFlipped(true)}
                                color="purple"
                                title="Rules"
                            />
                            <MuteButton
                                isMuted={isMuted}
                                onToggle={toggleMute}
                                color="purple"
                            />
                            <Button
                                onClick={loadNewPokemon}
                                color="purple"
                                size="sm"
                                className="ml-2"
                            >
                                {t('pokemon.next')}
                            </Button>
                        </div>
                    </div>

                    {/* Game Area */}
                    <div className={`${cardClass} flex-1 flex items-center justify-center`}>
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="text-purple-400 font-bold animate-pulse text-xl">
                                    {t('game.loading')}
                                </div>
                            </div>
                        ) : pokemon ? (
                            <div className="space-y-4 w-full max-w-2xl">
                                {/* Pokemon Image */}
                                <div className="relative aspect-square max-w-xs mx-auto">
                                    <motion.img
                                        key={pokemon.id}
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        src={pokemon.sprites.other['official-artwork'].front_default}
                                        alt={revealed ? pokemon.name : '???'}
                                        className={`w-full h-full object-contain transition-all duration-500 ${revealed ? 'blur-none brightness-100' : 'blur-sm brightness-50 contrast-200'
                                            }`}
                                    />
                                </div>

                                {/* Hints */}
                                {!revealed && (
                                    <div className="text-center space-y-1">
                                        <p className="text-base opacity-80">
                                            {t('pokemon.guess_prompt')}
                                        </p>
                                        <div className="text-sm opacity-70">
                                            #{pokemon.id.toString().padStart(3, '0')}
                                        </div>
                                    </div>
                                )}

                                {/* Multiple Choice Options */}
                                <div className="grid grid-cols-2 gap-3">
                                    {options.map((option, index) => (
                                        <motion.button
                                            key={index}
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleAnswer(option)}
                                            disabled={revealed}
                                            className={getButtonClass(option)}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Revealed Answer */}
                                {revealed && (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center space-y-3 pt-4"
                                    >
                                        <div className="flex items-center justify-center gap-4 flex-wrap">
                                            <h2 className={`text-2xl md:text-3xl font-black uppercase ${selectedAnswer?.toLowerCase() === pokemon.name.toLowerCase()
                                                ? 'text-green-400'
                                                : 'text-red-400'
                                                }`}>
                                                {selectedAnswer?.toLowerCase() === pokemon.name.toLowerCase()
                                                    ? t('pokemon.correct')
                                                    : t('pokemon.wrong')}
                                            </h2>
                                            <button
                                                onClick={loadNewPokemon}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-colors text-sm"
                                            >
                                                {t('pokemon.next')}
                                            </button>
                                        </div>
                                        <p className="text-lg md:text-xl text-purple-300">
                                            {t('pokemon.answer')}: <span className="font-bold">{pokemon.name.toUpperCase()}</span>
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Back Face (Rules) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col p-8 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <GradientHeading gradient="purple-pink" level={2}>
                            {t('game.pokemon_quiz')} - {t('game.arcade_zone')}
                        </GradientHeading>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-white text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 text-left">
                        <section>
                            <h3 className="text-xl font-bold text-purple-400 mb-2">🐾 {t('game.pokemon_quiz')}</h3>
                            <p className="text-white/80 leading-relaxed">
                                {t('game.pokemon_rules')}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">❓</span>
                                <h4 className="font-bold text-white mb-1">{t('game.quiz')}</h4>
                                <p className="text-sm text-white/60">{t('game.pokemon_quiz_desc')}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">🏆</span>
                                <h4 className="font-bold text-white mb-1">{t('game.score')}</h4>
                                <p className="text-sm text-white/60">{t('game.pokemon_score_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
