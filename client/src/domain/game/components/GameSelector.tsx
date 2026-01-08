import { useTranslation } from 'react-i18next';

type GameKey = 'brick' | 'match3' | 'pokemon' | 'maze' | 'zombie';

interface GameSelectorProps {
    activeGame: GameKey;
    onSelectGame: (game: GameKey) => void;
    gameStatuses: Record<string, boolean>;
    onToggleStatus: (gameKey: string) => void;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const GAME_COLORS: Record<GameKey, string> = {
    brick: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-400/50',
    match3: 'bg-gradient-to-r from-fuchsia-400 via-purple-500 to-pink-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] border border-fuchsia-400/50',
    pokemon: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] border border-yellow-400/50',
    maze: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/50',
    zombie: 'bg-gradient-to-r from-red-500 via-rose-600 to-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-500/50'
};

const GAME_KEYS: GameKey[] = ['brick', 'match3', 'pokemon', 'maze', 'zombie'];

export function GameSelector({
    activeGame,
    onSelectGame,
    gameStatuses,
    onToggleStatus,
    isAdmin,
    isSuperAdmin
}: GameSelectorProps) {
    const { t } = useTranslation();

    const getGameLabel = (gameKey: GameKey) => {
        switch (gameKey) {
            case 'brick': return t('game.brick_breaker');
            case 'pokemon': return t('game.pokemon_quiz');
            default: return t(`game.${gameKey}`);
        }
    };

    return (
        <div className="flex justify-center gap-2 md:gap-4 lg:gap-8 mb-8 md:mb-12 flex-wrap px-2">
            {GAME_KEYS.map((gameKey) => {
                const isEnabled = gameStatuses[gameKey] !== false;
                const isLocked = !isEnabled && !isSuperAdmin;

                return (
                    <div key={gameKey} className="relative group flex flex-col items-center gap-1 md:gap-2">
                        <button
                            onClick={() => onSelectGame(gameKey)}
                            disabled={isLocked && !isSuperAdmin && !isAdmin}
                            className={`px-3 md:px-6 lg:px-8 py-2 md:py-2 lg:py-3 rounded-full text-xs md:text-sm lg:text-xl font-bold transition-all duration-300 transform backdrop-blur-xl min-h-[44px] min-w-[80px] md:min-w-[120px] ${activeGame === gameKey
                                ? 'scale-105 shadow-[0_0_25px_rgba(124,58,237,0.4)]'
                                : 'hover:scale-105'
                                } ${!isEnabled
                                    ? 'bg-gray-300/50 dark:bg-gray-600/50 text-gray-600 dark:text-gray-300 opacity-70 grayscale border border-red-400/50 dark:border-red-500/50 backdrop-blur-xl'
                                    : activeGame === gameKey
                                        ? GAME_COLORS[gameKey]
                                        : 'bg-gray-100/80 dark:bg-white/10 hover:bg-gray-200/80 dark:hover:bg-white/20 text-gray-800 dark:text-white border border-gray-300/50 dark:border-white/20 backdrop-blur-xl hover:border-gray-400/50 dark:hover:border-white/40'
                                }`}
                        >
                            {getGameLabel(gameKey)}
                            {!isEnabled && <span className="absolute -top-1 -right-1 bg-red-600 text-[8px] md:text-[10px] px-1 rounded text-white shadow-sm font-bold tracking-widest">{t('game.status_off')}</span>}
                        </button>

                        {(isSuperAdmin || isAdmin) && (
                            <div className="flex flex-col items-center gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                                <div className={`text-[8px] md:text-[10px] font-mono font-bold ${isEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    [{isEnabled ? t('game.status_active') : t('game.status_disabled')}]
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleStatus(gameKey);
                                    }}
                                    className={`text-[8px] md:text-[10px] font-bold px-2 md:px-4 py-1 md:py-1.5 rounded-full border transition-all duration-300 shadow-lg backdrop-blur-xl min-h-[32px] ${isEnabled
                                        ? 'bg-red-100/80 dark:bg-red-500/20 border-red-400/50 dark:border-red-500/50 text-red-700 dark:text-red-200 hover:bg-red-200/80 dark:hover:bg-red-500/30 hover:text-red-800 dark:hover:text-white'
                                        : 'bg-green-100/80 dark:bg-green-500/20 border-green-400/50 dark:border-green-500/50 text-green-700 dark:text-green-200 hover:bg-green-200/80 dark:hover:bg-green-500/30 hover:text-green-800 dark:hover:text-white'
                                        }`}
                                >
                                    {isEnabled ? t('game.action_disable') : t('game.action_enable')}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
