import * as THREE from 'three';

export interface Zombie {
    id: number;
    position: THREE.Vector3;
    speed: number;
    hp: number;
    maxHp: number;
    active: boolean;
    type: 'walker' | 'runner' | 'tank';
    color: string;
    size?: number;
}

export interface Projectile {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    active: boolean;
    pierce: number;
    maxBounce: number;
    isCluster: boolean;
}

export interface Particle {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    color: string;
    life: number;
    active: boolean;
}

export interface PowerUp {
    id: number;
    position: THREE.Vector3;
    type: 'scatter' | 'rapid' | 'tech';
    color: string;
    active: boolean;
}

export interface ZombieShooterProps {
    isDarkMode: boolean;
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number; attempts?: number;[key: string]: any } | null;
    isAuthenticated?: boolean;
    onGameStart?: () => void;
}
