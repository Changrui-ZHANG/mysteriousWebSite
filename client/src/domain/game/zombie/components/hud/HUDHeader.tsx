import { useTranslation } from 'react-i18next';

interface HUDHeaderProps {
    weaponTech: number;
    isHoming: boolean;
    wave: number;
    kills: number;
    personalBest?: { score: number } | null;
    weaponCount: number;
    weaponDamage: number;
    critChance: number;
    weaponBounce: number;
    zombieHp: number;
    fireRate: number;
}

export function HUDHeader({ weaponTech, isHoming, wave, kills, personalBest, weaponCount, weaponDamage, critChance, weaponBounce, zombieHp, fireRate }: HUDHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="absolute top-0 left-0 w-full p-2 md:p-4 flex justify-between items-start z-[60]">
            {/* Left: System Status */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <span className="text-[7px] text-cyan-400 font-bold tracking-[0.2em] opacity-60 uppercase leading-none">{t('game.zombie_hud.system_status')}</span>
                        <div className="flex items-center gap-1 mt-0.5 md:hidden">
                            {[1, 2, 3, 4, 5, 6].map(tech => (
                                <span key={tech} className={`text-[9px] font-black px-1 rounded-sm border ${weaponTech >= tech ? 'text-white border-cyan-500/50 bg-cyan-900/40 shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-white/20 border-white/5 bg-transparent'}`}>T{tech}</span>
                            ))}
                            <span className={`text-[8px] font-black px-1 ml-1 ${isHoming ? 'text-yellow-400 animate-pulse' : 'text-white/10'}`}>P</span>
                        </div>
                    </div>
                </div>
                {/* Mobile Primary Stats */}
                <div className="flex flex-row gap-3 md:hidden pl-1 mt-1">
                    <div className="flex items-center gap-1"><span className="text-xs">🚀</span><span className="text-[9px] font-black text-cyan-400 leading-none">{fireRate}%</span></div>
                    <div className="flex items-center gap-1"><span className="text-xs">⚡</span><span className="text-[9px] font-black text-red-500 leading-none">{weaponDamage}</span></div>
                    <div className="flex items-center gap-1"><span className="text-xs">🔫</span><span className="text-[9px] font-black text-white leading-none">x{weaponCount}</span></div>
                </div>
            </div>

            {/* Right: Scores */}
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                        <div className="bg-black/60 border border-cyan-500/30 px-2 py-0.5 transform -skew-x-12 backdrop-blur-md">
                            <div className="transform skew-x-12 flex flex-col items-center">
                                <span className="text-[6px] md:text-[7px] text-cyan-400 tracking-widest uppercase font-bold">{t('game.zombie_hud.wave')}</span>
                                <span className="text-sm md:text-xl font-black text-white leading-none">{wave}</span>
                            </div>
                        </div>
                        <div className="bg-black/60 border border-cyan-500/30 px-2 py-0.5 transform -skew-x-12 backdrop-blur-md">
                            <div className="transform skew-x-12 flex flex-col items-center">
                                <span className="text-[6px] md:text-[7px] text-cyan-400 tracking-widest uppercase font-bold">{t('game.zombie_hud.kills')}</span>
                                <span className="text-sm md:text-xl font-black text-white leading-none">{kills}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-black/60 transform -skew-x-12 border border-cyan-500/30 blur-[1px]" />
                    <div className="relative border-l-2 border-cyan-500/40 px-2 py-0.5 transform -skew-x-12 backdrop-blur-sm">
                        <div className="transform skew-x-12 flex items-center gap-1.5">
                            <span className="text-[7px] md:text-[8px] text-cyan-400 font-bold uppercase leading-none">{t('game.zombie_hud.record')}</span>
                            <span className="text-sm md:text-base font-black text-white leading-none">{personalBest?.score || 0}</span>
                        </div>
                    </div>
                </div>
                {/* Mobile Secondary Stats */}
                <div className="flex flex-row gap-3 md:hidden items-center pr-1">
                    <div className="flex items-center gap-1"><span className="text-xs">🎯</span><span className="text-[9px] font-black text-yellow-500 leading-none">{critChance}%</span></div>
                    <div className="flex items-center gap-1"><span className="text-xs">🛡️</span><span className="text-[9px] font-black text-white leading-none">x{weaponBounce}</span></div>
                    <div className="flex items-center gap-1"><span className="text-[10px]">💚</span><span className="text-[9px] font-black text-green-500 leading-none">{zombieHp}</span></div>
                </div>
            </div>
        </div>
    );
}
