import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getRandomPokemon, getRandomPokemonNames, Pokemon } from '../services/pokeApi';
import { useSound } from '../../../hooks/useSound';
import { useMute } from '../../../hooks/useMute';
import { BGM_URLS } from '../../../constants/urls';
import { PokemonRules } from './pokemon/index';
import { GameWindow } from './GameWindow';

interface PokemonGameProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number, attempts?: number) => void;
    personalBest?: { score: number, attempts?: number } | null;
    isAuthenticated: boolean;
    onGameStart?: () => void;
}

export default function PokemonGame({ isDarkMode, onSubmitScore, personalBest, isAuthenticated, onGameStart }: PokemonGameProps) {
    const { t } = useTranslation();
    const [pokemon, setPokemon] = useState<Pokemon | null>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isMuted } = useMute();
    const { playSound } = useSound(!isMuted);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => { loadNewPokemon(); }, []);

    useEffect(() => {
        if (score > 0) onSubmitScore(score, attempts);
    }, [isAuthenticated]);

    const loadNewPokemon = async () => {
        if (score === 0 && onGameStart) onGameStart();
        if (score > 0) onSubmitScore(score, attempts);
        playSound('click');
        setLoading(true);
        setRevealed(false);
        setSelectedAnswer(null);
        try {
            const newPokemon = await getRandomPokemon();
            const wrongAnswers = await getRandomPokemonNames(newPokemon.id, 3);
            const shuffled = [...wrongAnswers, newPokemon.name].sort(() => Math.random() - 0.5);
            setPokemon(newPokemon);
            setOptions(shuffled);
        } catch (error) {
            console.error('Failed to load Pokemon:', error);
        } finally {
            setLoading(false);
        }
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

    const isCorrect = (opt: string) => opt.toLowerCase() === pokemon?.name.toLowerCase();

    const getButtonClass = (option: string) => {
        const base = "w-full px-4 py-3 rounded-lg font-bold text-base transition-all duration-300 transform hover:scale-105";
        if (!revealed) return `${base} bg-purple-600 hover:bg-purple-500 text-white`;
        if (isCorrect(option)) return `${base} bg-green-600 text-white ring-4 ring-green-400`;
        if (selectedAnswer === option) return `${base} bg-red-600 text-white ring-4 ring-red-400`;
        return `${base} bg-gray-600 text-gray-300 opacity-50`;
    };

    return (
        <GameWindow
            color="purple"
            bgmUrl={BGM_URLS.POKEMON_GAME}
            hud={{
                score,
                attempts,
                personalBest: personalBest ?? undefined,
                rightContent: (
                    <button onClick={loadNewPokemon} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white text-sm transition-colors">
                        {t('pokemon.next')}
                    </button>
                )
            }}
            onReset={() => { setScore(0); setAttempts(0); loadNewPokemon(); }}
            isFlipped={isFlipped}
            onFlipChange={setIsFlipped}
            rulesContent={<PokemonRules bgCard={isDarkMode ? 'bg-slate-900' : 'bg-white'} onClose={() => setIsFlipped(false)} />}
        >
            <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto w-full h-full">
                {loading ? (
                    <div className="text-purple-400 font-bold animate-pulse text-xl">{t('game.loading')}</div>
                ) : pokemon ? (
                    <div className="w-full max-w-lg mx-auto space-y-4">
                        {/* Pokemon Image */}
                        <div className="relative w-56 h-56 md:w-64 md:h-64 mx-auto">
                            <motion.img key={pokemon.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                src={pokemon.sprites.other['official-artwork'].front_default} alt={revealed ? pokemon.name : '???'}
                                className={`w-full h-full object-contain transition-all duration-500 ${revealed ? 'blur-none brightness-100' : 'blur-sm brightness-50 contrast-200'}`} />
                        </div>

                        {/* Hint */}
                        {!revealed && (
                            <div className="text-center">
                                <p className="text-lg opacity-80">{t('pokemon.guess_prompt')}</p>
                                <div className="text-base opacity-70">#{pokemon.id.toString().padStart(3, '0')}</div>
                            </div>
                        )}

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4">
                            {options.map((option, i) => (
                                <motion.button key={i} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
                                    onClick={() => handleAnswer(option)} disabled={revealed} className={getButtonClass(option)}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </motion.button>
                            ))}
                        </div>

                        {/* Result */}
                        {revealed && (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-3 pt-4">
                                <div className="flex items-center justify-center gap-4 flex-wrap">
                                    <h2 className={`text-3xl font-black uppercase ${isCorrect(selectedAnswer || '') ? 'text-green-400' : 'text-red-400'}`}>
                                        {isCorrect(selectedAnswer || '') ? t('pokemon.correct') : t('pokemon.wrong')}
                                    </h2>
                                    <button onClick={loadNewPokemon} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold text-white transition-colors">{t('pokemon.next')}</button>
                                </div>
                                <p className="text-xl text-purple-300">{t('pokemon.answer')}: <span className="font-bold">{pokemon.name.toUpperCase()}</span></p>
                            </motion.div>
                        )}
                    </div>
                ) : null}
            </div>
        </GameWindow>
    );
}
