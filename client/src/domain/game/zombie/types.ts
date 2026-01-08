import * as THREE from 'three';
import React from 'react';

export interface Zombie {
    id: number;
    position: THREE.Vector3;
    speed: number;
    hp: number;
    maxHp: number;
    active: boolean;
    type: 'walker' | 'runner' | 'tank' | 'boss';
    color: string;
    baseColor: string;
    size?: number;
    slowedUntil?: number; // timestamp or frame count
    lastAttackTime?: number; // Last time hit wall
}

export interface Projectile {
    id: number;
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    active: boolean;
    pierce: number;
    maxBounce: number;
    isCluster: boolean;
    chain: number;
    life: number; // TTL in frames
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
    type: 'scatter' | 'rapid' | 'tech' | 'damage' | 'crit' | 'bounce';
    color: string;
    active: boolean;
}

export interface FloatingText {
    id: number;
    position: THREE.Vector3;
    content: string;
    color: string;
    life: number;
    maxLife: number;
    isCrit?: boolean;
}

export interface ZombieShooterProps {
    onSubmitScore: (score: number) => void;
    personalBest?: { score: number; attempts?: number } | null;
    isAuthenticated?: boolean;
    onGameStart?: () => void;
}
export interface SuperUpgrade {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'damage_mult' | 'crit_bonus' | 'pierce' | 'fire_rate' | 'tech' | 'homing';
    value: number;
}
