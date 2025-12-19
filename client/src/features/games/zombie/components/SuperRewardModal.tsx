import { motion, AnimatePresence } from 'framer-motion';
import { SuperUpgrade } from '../types';

interface SuperRewardModalProps {
    isOpen: boolean;
    upgrades: SuperUpgrade[];
    onSelect: (upgrade: SuperUpgrade) => void;
}

export function SuperRewardModal({ isOpen, upgrades, onSelect }: SuperRewardModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-[200] flex items-start md:items-center justify-center bg-black/80 backdrop-blur-xl overflow-y-auto pt-10 md:pt-0">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="max-w-4xl w-full p-6 md:p-8"
                    >
                        <div className="text-center mb-8 md:mb-12">
                            <motion.h2
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                            >
                                RÉCOMPENSE <span className="text-cyan-400">SUPRÊME</span>
                            </motion.h2>
                            <p className="text-cyan-400/60 uppercase tracking-[0.3em] text-[10px] md:text-xs">Choisissez un module d'amélioration d'élite</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pb-12 md:pb-0">
                            {upgrades.map((upgrade, index) => (
                                <motion.button
                                    key={upgrade.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => onSelect(upgrade)}
                                    className="relative group flex flex-col bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-500/30 p-4 md:p-6 rounded-2xl text-left overflow-hidden hover:border-cyan-400 transition-colors pointer-events-auto"
                                >
                                    {/* Animated Background Glow */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="text-3xl md:text-4xl mb-3 md:mb-4 bg-cyan-400/10 w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center border border-cyan-400/20 group-hover:bg-cyan-400/20 transition-colors">
                                            {upgrade.icon}
                                        </div>
                                        <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 uppercase tracking-tight">{upgrade.name}</h3>
                                        <p className="text-cyan-200/60 text-xs md:text-sm leading-relaxed mb-4 md:mb-6">{upgrade.description}</p>

                                        <div className="pt-3 md:pt-4 border-t border-cyan-500/20 mt-auto">
                                            <span className="text-[10px] md:text-xs font-black text-cyan-400 tracking-widest uppercase group-hover:text-white transition-colors">Installer Module</span>
                                        </div>
                                    </div>

                                    {/* Decorative Corner */}
                                    <div className="absolute top-0 right-0 w-10 h-10 md:w-12 md:h-12 bg-cyan-400/10 transform translate-x-5 md:translate-x-6 -translate-y-5 md:-translate-y-6 rotate-45 group-hover:bg-cyan-400/20 transition-colors" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
