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
    brick: 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]',
    match3: 'bg-fuchsia-500 text-black shadow-[0_0_20px_rgba(217,70,239,0.5)]',
    pokemon: 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]',
    maze: 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]',
    zombie: 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
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
        <div className="flex justify-center gap-4 md:gap-8 mb-12 flex-wrap">
            {GAME_KEYS.map((gameKey) => {
                const isEnabled = gameStatuses[gameKey] !== false;
                const isLocked = !isEnabled && !isSuperAdmin;

                return (
                    <div key={gameKey} className="relative group flex flex-col items-center gap-2">
                        <button
                            onClick={() => onSelectGame(gameKey)}
                            disabled={isLocked && !isSuperAdmin && !isAdmin}
                            className={`px-6 md:px-8 py-2 md:py-3 rounded-full text-sm md:text-xl font-bold transition-all duration-300 transform ${activeGame === gameKey
                                ? 'scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                : 'hover:scale-105'
                                } ${!isEnabled
                                    ? 'bg-gray-800 text-gray-500 opacity-70 grayscale border border-red-500/50'
                                    : activeGame === gameKey
                                        ? GAME_COLORS[gameKey]
                                        : 'bg-white/10 hover:bg-white/20'
                                }`}
                        >
                            {getGameLabel(gameKey)}
                            {!isEnabled && <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] px-1 rounded text-white shadow-sm font-bold tracking-widest">OFF</span>}
                        </button>

                        {(isSuperAdmin || isAdmin) && (
                            <div className="flex flex-col items-center gap-1 mt-1">
                                <div className={`text-[10px] font-mono font-bold ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                                    [{isEnabled ? 'ACTIVE' : 'DISABLED'}]
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleStatus(gameKey);
                                    }}
                                    className={`text-[10px] font-bold px-4 py-1.5 rounded-full border transition-colors shadow-lg ${isEnabled
                                        ? 'bg-red-900/40 border-red-500 text-red-200 hover:bg-red-600 hover:text-white'
                                        : 'bg-green-900/40 border-green-500 text-green-200 hover:bg-green-600 hover:text-white'
                                        }`}
                                >
                                    {isEnabled ? 'DISABLE' : 'ENABLE'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
