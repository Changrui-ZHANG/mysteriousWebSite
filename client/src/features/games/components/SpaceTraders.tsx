import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useSound } from '../../../hooks/useSound';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { registerAgent, getAgent, getMyShips, Agent, Ship } from '../../../utils/spacetraders';

interface SpaceTradersProps {
    isDarkMode: boolean;
}

export default function SpaceTraders({ isDarkMode }: SpaceTradersProps) {
    const { t } = useTranslation();
    const [token, setToken] = useState<string | null>(localStorage.getItem('spacetraders_token'));
    const [agent, setAgent] = useState<Agent | null>(null);
    const [ships, setShips] = useState<Ship[]>([]);
    const [callSign, setCallSign] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('arcade_muted') === 'true');
    const { playSound } = useSound(!isMuted);

    // Initial Load - only fetch if we have a valid token
    useEffect(() => {
        if (token && token.trim() !== '') {
            refreshData(token);
        }
    }, [token]);

    // Auto-logout on specific errors
    useEffect(() => {
        if (error && (
            error.toLowerCase().includes('missing bearer token') ||
            error.toLowerCase().includes('401') ||
            error.toLowerCase().includes('unauthorized')
        )) {
            const timer = setTimeout(() => {
                logout();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const refreshData = async (authToken: string) => {
        setLoading(true);
        setError(null);
        try {
            const agentData = await getAgent(authToken);
            setAgent(agentData);
            const shipsData = await getMyShips(authToken);
            setShips(shipsData);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('401')) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = await registerAgent(callSign);
            localStorage.setItem('spacetraders_token', data.token);
            setToken(data.token);
            setAgent(data.agent);
            // Refresh to get ships (starter ship is usually assigned)
            await refreshData(data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('spacetraders_token');
        setToken(null);
        setAgent(null);
        setShips([]);
    };

    const cardClass = `p-6 rounded-xl backdrop-blur-md border ${isDarkMode ? 'bg-black/60 border-cyan-500/30' : 'bg-white/80 border-cyan-500/20'}`;

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`${cardClass} max-w-md w-full text-center`}
                >
                    <h2 className="text-3xl font-bold mb-6 font-heading text-cyan-400">{t('spacetraders.join_fleet')}</h2>
                    <p className="mb-6 opacity-80">{t('spacetraders.register_desc')}</p>

                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder={t('spacetraders.callsign_placeholder')}
                            value={callSign}
                            onChange={(e) => setCallSign(e.target.value)}
                            className="px-4 py-3 rounded-lg bg-black/20 border border-cyan-500/50 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-center font-mono uppercase"
                            required
                            minLength={3}
                            maxLength={14}
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold text-white transition-colors disabled:opacity-50"
                        >
                            {loading ? t('game.loading') : t('spacetraders.register_agent')}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-red-500 text-sm font-mono">{error}</p>}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-y-auto p-4 md:p-8 font-mono">
            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <strong className="font-bold mr-2">ERROR:</strong> {error}
                            <div className="text-xs opacity-70 mt-1">Auto-logout in 3 seconds...</div>
                        </div>
                        <button
                            onClick={logout}
                            className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-bold text-white transition-colors text-sm whitespace-nowrap"
                        >
                            Clear Token & Restart
                        </button>
                    </div>
                </div>
            )}

            {/* Header / Stats */}
            <div className="flex justify-end mb-4 md:absolute md:top-6 md:right-6 z-10">
                <button
                    onClick={() => {
                        const newMute = !isMuted;
                        setIsMuted(newMute);
                        localStorage.setItem('arcade_muted', String(newMute));
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-cyan-400 text-sm transition-colors border border-cyan-500/20"
                >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                    <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8 md:mt-0">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cardClass}>
                    <h3 className="text-cyan-400 text-sm mb-2 uppercase tracking-widest">{t('spacetraders.agent')}</h3>
                    <div className="text-2xl font-bold truncate">{agent?.symbol}</div>
                    <div className="text-xs opacity-50 mt-1">{agent?.accountId}</div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className={cardClass}>
                    <h3 className="text-yellow-400 text-sm mb-2 uppercase tracking-widest">{t('spacetraders.credits')}</h3>
                    <div className="text-3xl font-bold text-yellow-500">
                        {agent?.credits.toLocaleString()} <span className="text-sm">cr</span>
                    </div>
                </motion.div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className={cardClass}>
                    <h3 className="text-purple-400 text-sm mb-2 uppercase tracking-widest">{t('spacetraders.headquarters')}</h3>
                    <div className="text-xl font-bold">{agent?.headquarters}</div>
                    <button onClick={() => { playSound('click'); logout(); }} className="mt-2 text-xs text-red-400 hover:text-red-300 underline">{t('spacetraders.logout')}</button>
                </motion.div>
            </div>

            {/* Fleet List */}
            <h3 className="text-xl font-bold mb-4 font-heading border-b border-white/10 pb-2">{t('spacetraders.command_fleet')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ships.map((ship, idx) => (
                    <motion.div
                        key={ship.symbol}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 + 0.3 }}
                        className={`${cardClass} group hover:border-cyan-400/60 transition-colors cursor-default`}
                        onMouseEnter={() => playSound('click')}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs text-cyan-400 mb-1">{ship.registration.role}</div>
                                <div className="font-bold text-lg">{ship.registration.name}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold ${ship.nav.status === 'DOCKED' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                {ship.nav.status}
                            </div>
                        </div>

                        <div className="space-y-2 text-sm opacity-70">
                            <div className="flex justify-between">
                                <span>{t('spacetraders.symbol')}:</span>
                                <span className="font-bold">{ship.symbol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>{t('spacetraders.location')}:</span>
                                <span>{ship.nav.waypointSymbol}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {ships.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 opacity-50 italic">
                        {t('spacetraders.no_ships')}
                    </div>
                )}
            </div>

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="text-cyan-400 font-bold animate-pulse text-xl">{t('spacetraders.uplinking')}</div>
                </div>
            )}
        </div>
    );
}
