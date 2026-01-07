import { useTranslation } from 'react-i18next';

interface HUDWeaponPanelProps {
    weaponTech: number;
    isHoming: boolean;
    weaponCount: number;
    weaponDamage: number;
    critChance: number;
    critBonus: number;
    weaponBounce: number;
    zombieHp: number;
    fireRate: number;
    dangerLevel: number;
}

const TECH_COLORS = ['bg-green-500 shadow-[0_0_8px_#22c55e]', 'bg-blue-500 shadow-[0_0_8px_#3b82f6]', 'bg-purple-500 shadow-[0_0_8px_#a855f7]', 'bg-cyan-500 shadow-[0_0_8px_#06b6d4]', 'bg-orange-500 shadow-[0_0_8px_#f97316]', 'bg-red-500 shadow-[0_0_8px_#ef4444]'];

export function HUDWeaponPanel({ weaponTech, isHoming, weaponCount, weaponDamage, critChance, critBonus, weaponBounce, zombieHp, fireRate, dangerLevel }: HUDWeaponPanelProps) {
    const { t } = useTranslation();

    return (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 z-[60] hidden md:block">
            <div className="flex flex-col items-center">
                {/* Tech Bay */}
                <div className="flex items-center justify-center gap-3 mb-2 px-6 py-1.5 bg-black/40 backdrop-blur-sm border-x border-t border-cyan-500/30 rounded-t-2xl">
                    {[1, 2, 3, 4, 5, 6].map((tech, idx) => (
                        <div key={tech} className="flex flex-col items-center">
                            <span className={`text-[10px] font-black transition-all duration-300 ${weaponTech >= tech ? 'text-white drop-shadow-[0_0_10px_#22d3ee]' : 'text-white/10'}`}>T{tech}</span>
                            <div className={`w-6 h-1 mt-1 rounded-full transition-all duration-500 ${weaponTech >= tech ? TECH_COLORS[idx] : 'bg-white/5'}`} />
                        </div>
                    ))}
                    <div className="w-[2px] h-4 bg-white/10 mx-1" />
                    <div className="flex flex-col items-center">
                        <span className={`text-[9px] font-black ${isHoming ? 'text-yellow-400 animate-pulse' : 'text-white/10'}`}>{t('game.zombie_hud.tracking')}</span>
                        <div className={`w-10 h-1 mt-1 rounded-full ${isHoming ? 'bg-yellow-400 shadow-[0_0_8px_#facc15]' : 'bg-white/5'}`} />
                    </div>
                </div>

                <div className="flex items-end justify-center gap-2 w-full">
                    {/* Left Stats */}
                    <div className="flex-1 bg-black/80 border border-cyan-500/30 p-2 backdrop-blur-md rounded-lg flex justify-around">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.fire_rate')}</span>
                            <span className="text-base font-bold text-cyan-400">{fireRate}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.damage')}</span>
                            <span className="text-base font-bold text-red-500">{weaponDamage}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.crit_chance')}</span>
                            <span className="text-base font-bold text-yellow-500">{critChance}%</span>
                        </div>
                    </div>

                    {/* Center Cannon */}
                    <div className="relative group mx-2">
                        <div className="absolute inset-0 bg-cyan-500/10 blur-xl rounded-full opacity-20" />
                        <div className="bg-black border-2 border-cyan-500 px-6 py-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] text-center relative overflow-hidden">
                            <div className="text-[8px] uppercase tracking-tighter text-cyan-400/80 font-bold">{t('game.zombie_hud.cannons')}</div>
                            <div className="text-3xl font-black text-white leading-none">{weaponCount}</div>
                        </div>
                    </div>

                    {/* Right Stats */}
                    <div className="flex-1 bg-black/80 border border-cyan-500/30 p-2 backdrop-blur-md rounded-lg flex justify-around">
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.bonus')}</span>
                            <span className="text-base font-bold text-orange-400">+{critBonus}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.rebounds')}</span>
                            <span className="text-base font-bold text-blue-400">x{weaponBounce}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[8px] uppercase opacity-50 font-bold">{t('game.zombie_hud.zombie_hp')}</span>
                            <span className="text-base font-bold text-green-500">{zombieHp}</span>
                        </div>
                    </div>
                </div>

                <div className="text-[9px] text-red-500 font-black animate-pulse uppercase tracking-[0.3em] h-3 mt-1">
                    {dangerLevel > 0.8 ? t('game.zombie_hud.danger_critical') : dangerLevel > 0.5 ? t('game.zombie_hud.danger_alert') : ''}
                </div>
            </div>
        </div>
    );
}
