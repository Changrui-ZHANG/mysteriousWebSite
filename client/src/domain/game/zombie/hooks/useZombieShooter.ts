/**
 * useZombieShooter - Hook for zombie shooter game state management
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMute } from '../../../../shared/hooks/useMute';
import { useSound } from '../../../../shared/hooks/useSound';
import { useBGM } from '../../../../shared/hooks/useBGM';
import { useBGMVolume } from '../../../../shared/hooks/useBGMVolume';
import { BGM_URLS } from '../../../../shared/constants/urls';
import type { SuperUpgrade } from '../types';

const WEAPON_DEFAULTS = {
    COUNT: 1, DELAY: 0.3, TECH: 0, DAMAGE: 50, BOUNCE: 1,
    CRIT_CHANCE: 5, CRIT_BONUS: 100, MIN_DELAY: 0.05,
};

const ZOMBIE_DEFAULTS = { HP: 100 };
const NOTIFICATION_DURATION = 3000;
const UPGRADE_CHOICES_COUNT = 3;

const SUPER_UPGRADES_CONFIG = [
    { id: 'dmg_50', nameKey: 'game.zombie_upgrades.dmg_50_name', descKey: 'game.zombie_upgrades.dmg_50_desc', icon: '🚀', type: 'damage_mult' as const, value: 1.5 },
    { id: 'dmg_100', nameKey: 'game.zombie_upgrades.dmg_100_name', descKey: 'game.zombie_upgrades.dmg_100_desc', icon: '⚡', type: 'damage_mult' as const, value: 2.0 },
    { id: 'crit_b_50', nameKey: 'game.zombie_upgrades.crit_b_50_name', descKey: 'game.zombie_upgrades.crit_b_50_desc', icon: '🎯', type: 'crit_bonus' as const, value: 50 },
    { id: 'crit_b_150', nameKey: 'game.zombie_upgrades.crit_b_150_name', descKey: 'game.zombie_upgrades.crit_b_150_desc', icon: '💀', type: 'crit_bonus' as const, value: 150 },
    { id: 'fire_50', nameKey: 'game.zombie_upgrades.fire_50_name', descKey: 'game.zombie_upgrades.fire_50_desc', icon: '🔥', type: 'fire_rate' as const, value: 0.5 },
    { id: 'homing_shot', nameKey: 'game.zombie_upgrades.homing_shot_name', descKey: 'game.zombie_upgrades.homing_shot_desc', icon: '🎯', type: 'homing' as const, value: 1 },
];

interface UseZombieShooterProps {
    onSubmitScore: (score: number) => void;
    onGameStart?: () => void;
    isFlipped: boolean;
}

export function useZombieShooter({ onSubmitScore, onGameStart, isFlipped }: UseZombieShooterProps) {
    const { t } = useTranslation();
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);

    const [gameState, setGameState] = useState<'intro' | 'playing' | 'gameover'>('intro');
    const [score, setScore] = useState(0);
    const [weaponCount, setWeaponCount] = useState(WEAPON_DEFAULTS.COUNT);
    const [weaponDelay, setWeaponDelay] = useState(WEAPON_DEFAULTS.DELAY);
    const [weaponTech, setWeaponTech] = useState(WEAPON_DEFAULTS.TECH);
    const [weaponDamage, setWeaponDamage] = useState(WEAPON_DEFAULTS.DAMAGE);
    const [weaponBounce, setWeaponBounce] = useState(WEAPON_DEFAULTS.BOUNCE);
    const [isHoming, setIsHoming] = useState(false);
    const [critChance, setCritChance] = useState(WEAPON_DEFAULTS.CRIT_CHANCE);
    const [critBonus, setCritBonus] = useState(WEAPON_DEFAULTS.CRIT_BONUS);
    const [dangerLevel, setDangerLevel] = useState(0);
    const [wave, setWave] = useState(1);
    const [kills, setKills] = useState(0);
    const [zombieHp, setZombieHp] = useState(ZOMBIE_DEFAULTS.HP);
    const [gameId, setGameId] = useState(0);
    const [isPickingUpgrade, setIsPickingUpgrade] = useState(false);
    const [upgradeChoices, setUpgradeChoices] = useState<SuperUpgrade[]>([]);
    const [notifications, setNotifications] = useState<{ id: number; text: string; color: string }[]>([]);
    const [mobileMoveHandlers, setMobileMoveHandlers] = useState<{ moveLeft: (on: boolean) => void, moveRight: (on: boolean) => void } | null>(null);

    useBGM(BGM_URLS.ZOMBIE_SHOOTER, !isMuted && gameState === 'playing' && !isFlipped, volume);

    const superUpgrades = useMemo(() => SUPER_UPGRADES_CONFIG.map(u => ({
        ...u, name: t(u.nameKey), description: t(u.descKey),
    })), [t]);

    const addNotification = useCallback((text: string, color: string) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, text, color }]);
        setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), NOTIFICATION_DURATION);
    }, []);

    const handleStart = useCallback(() => {
        onGameStart?.();
        setScore(1);
        setWeaponCount(WEAPON_DEFAULTS.COUNT);
        setWeaponDelay(WEAPON_DEFAULTS.DELAY);
        setWeaponTech(WEAPON_DEFAULTS.TECH);
        setWeaponDamage(WEAPON_DEFAULTS.DAMAGE);
        setWeaponBounce(WEAPON_DEFAULTS.BOUNCE);
        setIsHoming(false);
        setCritChance(WEAPON_DEFAULTS.CRIT_CHANCE);
        setCritBonus(WEAPON_DEFAULTS.CRIT_BONUS);
        setIsPickingUpgrade(false);
        setDangerLevel(0);
        setWave(1);
        setKills(0);
        setZombieHp(ZOMBIE_DEFAULTS.HP);
        setNotifications([]);
        setGameState('playing');
        setGameId(prev => prev + 1);
        playSound('click');
    }, [onGameStart, playSound]);

    const handleGameOver = useCallback(() => {
        if (score > 0) onSubmitScore(score);
    }, [score, onSubmitScore]);

    const handleShowSuperRewards = useCallback(() => {
        const availableUpgrades = superUpgrades.filter(u => !(u.type === 'homing' && isHoming));
        const shuffled = [...availableUpgrades].sort(() => Math.random() - 0.5);
        setUpgradeChoices(shuffled.slice(0, UPGRADE_CHOICES_COUNT));
        setIsPickingUpgrade(true);
    }, [superUpgrades, isHoming]);

    const handleUpgradeSelect = useCallback((upgrade: SuperUpgrade) => {
        switch (upgrade.type) {
            case 'damage_mult': setWeaponDamage(prev => Math.round(prev * upgrade.value)); break;
            case 'crit_bonus': setCritBonus(prev => prev + upgrade.value); break;
            case 'fire_rate': setWeaponDelay(prev => Math.max(WEAPON_DEFAULTS.MIN_DELAY, prev * upgrade.value)); break;
            case 'tech': setWeaponTech(prev => prev + upgrade.value); break;
            case 'homing': setIsHoming(true); break;
        }
        addNotification(`${t('game.zombie_hud.installed')} : ${upgrade.name}`, "#22d3ee");
        setIsPickingUpgrade(false);
    }, [addNotification, t]);

    return {
        // Audio
        isMuted, toggleMute, playSound, volume, setVolume,
        // Game state
        gameState, setGameState, score, setScore, gameId,
        // Weapon stats
        weaponCount, setWeaponCount, weaponDelay, setWeaponDelay,
        weaponTech, setWeaponTech, weaponDamage, setWeaponDamage,
        weaponBounce, setWeaponBounce, isHoming, critChance, setCritChance, critBonus,
        // Game stats
        dangerLevel, setDangerLevel, wave, setWave, kills, setKills, zombieHp, setZombieHp,
        // Upgrades
        isPickingUpgrade, upgradeChoices, handleShowSuperRewards, handleUpgradeSelect,
        // Notifications
        notifications, addNotification,
        // Mobile
        mobileMoveHandlers, setMobileMoveHandlers,
        // Actions
        handleStart, handleGameOver,
    };
}
