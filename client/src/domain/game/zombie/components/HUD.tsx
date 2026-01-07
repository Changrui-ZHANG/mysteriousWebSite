import { useTranslation } from 'react-i18next';
import { HUDHeader, HUDWeaponPanel, HUDOverlays } from './hud/index';

interface HUDProps {
    gameState: 'intro' | 'playing' | 'gameover';
    score: number;
    personalBest?: { score: number } | null;
    weaponCount: number;
    weaponDelay: number;
    weaponTech: number;
    weaponDamage: number;
    weaponBounce: number;
    isHoming: boolean;
    critChance: number;
    critBonus: number;
    dangerLevel: number;
    wave: number;
    kills: number;
    zombieHp: number;
    onStart: () => void;
}

const CRT_OVERLAY = "pointer-events-none absolute inset-0 z-50 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_4px)] mix-blend-overlay opacity-50";

export function HUD({ gameState, score, personalBest, weaponCount, weaponDelay, weaponTech, weaponDamage, weaponBounce, isHoming, critChance, critBonus, dangerLevel, wave, kills, zombieHp, onStart }: HUDProps) {
    const { t } = useTranslation();
    const fireRate = Math.round((0.3 / (weaponDelay || 0.3)) * 100);
    const dangerOpacity = dangerLevel * 0.6;

    return (
        <div className="absolute inset-0 w-full h-full font-mono text-white select-none overflow-hidden pointer-events-none">
            {/* CRT & Danger Effects */}
            <div className={CRT_OVERLAY} />
            <div className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 ease-out"
                style={{ background: `radial-gradient(circle at center, transparent 40%, rgba(220, 38, 38, ${dangerOpacity}) 90%)`, boxShadow: dangerLevel > 0.5 ? `inset 0 0 ${dangerLevel * 50}px rgba(220, 38, 38, 0.5)` : 'none' }} />

            <HUDHeader weaponTech={weaponTech} isHoming={isHoming} wave={wave} kills={kills} personalBest={personalBest}
                weaponCount={weaponCount} weaponDamage={weaponDamage} critChance={critChance} weaponBounce={weaponBounce} zombieHp={zombieHp} fireRate={fireRate} />

            <HUDWeaponPanel weaponTech={weaponTech} isHoming={isHoming} weaponCount={weaponCount} weaponDamage={weaponDamage}
                critChance={critChance} critBonus={critBonus} weaponBounce={weaponBounce} zombieHp={zombieHp} fireRate={fireRate} dangerLevel={dangerLevel} />

            <HUDOverlays gameState={gameState} score={score} wave={wave} kills={kills} onStart={onStart} />

            {gameState === 'playing' && (
                <div className="absolute bottom-4 left-4 text-[10px] text-white/20 hidden md:block">{t('game.zombie_hud.controls')}</div>
            )}
        </div>
    );
}
