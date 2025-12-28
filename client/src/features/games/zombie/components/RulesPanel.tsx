import { FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface RulesPanelProps {
    onBack: () => void;
}

export function RulesPanel({ onBack }: RulesPanelProps) {
    const { t } = useTranslation();

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col p-4 md:p-8 bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 border-2 border-cyan-500/50 rounded-xl overflow-hidden pointer-events-auto">
            <div className="flex justify-between items-center mb-6 border-b border-cyan-500/30 pb-4">
                <h2 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    {t('zombie.rules.title')}
                </h2>
                <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <FaArrowLeft className="text-white text-xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 text-left scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2 select-text" style={{ touchAction: 'pan-y' }} onPointerDown={(e) => e.stopPropagation()}>
                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🎯 {t('zombie.rules.objective')}</h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">{t('zombie.rules.objective_desc')}</p>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">🎮 {t('zombie.rules.controls')}</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-yellow-400 font-bold">{t('zombie.rules.pc')}:</span>
                            <span className="text-white/70 ml-2">{t('zombie.rules.pc_desc')}</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <span className="text-yellow-400 font-bold">{t('zombie.rules.mobile')}:</span>
                            <span className="text-white/70 ml-2">{t('zombie.rules.mobile_desc')}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">⚡ {t('zombie.rules.powerups')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.scatter')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.scatter_desc')}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.firerate')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.firerate_desc')}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.crit')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.crit_desc')}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.tech')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.tech_desc')}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.damage')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.damage_desc')}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/30">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-3 h-3 rounded-full bg-white"></span>
                                <h4 className="font-bold text-white">{t('zombie.rules.bounce')}</h4>
                            </div>
                            <p className="text-xs md:text-sm text-white/60">{t('zombie.rules.bounce_desc')}</p>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-3">🔫 {t('zombie.rules.tech_upgrades')}</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="bg-green-500/10 p-2 rounded-lg border border-green-500/30">
                                <span className="text-green-300 font-bold text-xs">{t('zombie.rules.tech1')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech1_desc')}</p>
                            </div>
                            <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/30">
                                <span className="text-blue-300 font-bold text-xs">{t('zombie.rules.tech2')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech2_desc')}</p>
                            </div>
                            <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/30">
                                <span className="text-purple-300 font-bold text-xs">{t('zombie.rules.tech3')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech3_desc')}</p>
                            </div>
                            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30">
                                <span className="text-cyan-300 font-bold text-xs">{t('zombie.rules.tech4')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech4_desc')}</p>
                            </div>
                            <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/30">
                                <span className="text-orange-300 font-bold text-xs">{t('zombie.rules.tech5')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech5_desc')}</p>
                            </div>
                            <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/30">
                                <span className="text-red-300 font-bold text-xs">{t('zombie.rules.tech6')}</span>
                                <p className="text-white/70 text-[10px]">{t('zombie.rules.tech6_desc')}</p>
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/30 mt-2">
                            <span className="text-yellow-300 font-bold uppercase text-xs">{t('zombie.rules.homing')}:</span>
                            <span className="text-white/70 ml-2 text-xs">{t('zombie.rules.homing_desc')}</span>
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🎁 {t('zombie.rules.rewards')}</h3>
                    <div className="space-y-2 text-sm md:text-base">
                        <div className="bg-purple-500/20 p-3 rounded-lg border border-purple-500/30">
                            <h4 className="text-purple-300 font-black uppercase text-xs mb-1 tracking-widest">{t('zombie.rules.super_reward')}</h4>
                            <p className="text-white/80">{t('zombie.rules.super_reward_desc')}</p>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/30 font-bold text-red-400">
                            {t('zombie.rules.desperate_defense')}
                        </div>
                        <div className="bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/30 text-xs italic text-cyan-200">
                            {t('zombie.rules.elite_challenge')}
                        </div>
                    </div>
                </section>

                <section>
                    <h3 className="text-lg md:text-xl font-bold text-cyan-400 mb-2">🧟 {t('zombie.rules.bestiary')}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                        <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/10">
                            <span className="text-green-400 text-lg">●</span>
                            <span className="text-white font-bold">{t('zombie.rules.walker')}</span>
                            <span className="text-white/60 text-[10px]">{t('zombie.rules.walker_stats')}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/10">
                            <span className="text-yellow-400 text-lg">●</span>
                            <span className="text-white font-bold">{t('zombie.rules.runner')}</span>
                            <span className="text-white/60 text-[10px]">{t('zombie.rules.runner_stats')}</span>
                        </div>
                        <div className="bg-white/5 p-2 rounded flex flex-col items-center border border-white/10">
                            <span className="text-red-400 text-lg">●</span>
                            <span className="text-white font-bold">{t('zombie.rules.tank')}</span>
                            <span className="text-white/60 text-[10px]">{t('zombie.rules.tank_stats')}</span>
                        </div>
                        <div className="bg-purple-500/20 p-2 rounded flex flex-col items-center border border-purple-500/30">
                            <span className="text-purple-400 text-lg">●</span>
                            <span className="text-white font-bold text-cyan-300">{t('zombie.rules.boss')}</span>
                            <span className="text-white/60 text-[10px]">{t('zombie.rules.boss_stats')}</span>
                        </div>
                    </div>
                </section>

                <div className="text-center pt-4 border-t border-cyan-500/20">
                    <p className="text-white/50 text-xs md:text-sm">💡 {t('zombie.rules.tip')}</p>
                </div>
            </div>
        </div>
    );
}
