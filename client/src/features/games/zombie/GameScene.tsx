import { useTexture, Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { FIELD_DEPTH, FIELD_WIDTH, FRONT_WALL_Z, BACK_WALL_Z, PLAYER_SPEED, PROJECTILE_SPEED, ZOMBIE_BASE_SPEED, TOUCH_DEADZONE, TOUCH_SENSITIVITY, KNOCKBACK_FORCE, KNOCKBACK_RESISTANCE } from './constants';
import { Particle, PowerUp, Projectile, Zombie, FloatingText } from './types';
import { Player } from './components/Player';
import { useGameInput } from './hooks/useGameInput';

interface GameSceneProps {
    gameState: string;
    setGameState: (s: 'intro' | 'playing' | 'gameover') => void;
    setScore: (s: number | ((prev: number) => number)) => void;
    setWeaponCount: (n: number) => void;
    setWeaponDelay: (n: number) => void;
    setWeaponTech: (n: number) => void;
    setWeaponDamage: (n: number) => void;
    setCritChance: (n: number) => void;
    playSound: (s: 'hit' | 'break' | 'gameover' | 'win' | 'click' | 'powerup') => void;
    onGameOver: () => void;
    isPaused: boolean;
    setDangerLevel: (n: number) => void;
    setWave: (n: number) => void;
    weaponBounce: number;
    isHoming: boolean;
    setWeaponBounce: (n: number) => void;
    setKills: (updater: (prev: number) => number) => void;
    setZombieHp: (n: number) => void;
    onNotification: (text: string, color: string) => void;
    critBonus: number;
    onShowSuperRewards: () => void;
    onMobileButtons?: (handlers: { moveLeft: (on: boolean) => void, moveRight: (on: boolean) => void }) => void;
}

export function GameScene({
    gameState,
    setGameState,
    setScore,
    setWeaponCount,
    setWeaponDelay,
    setWeaponTech,
    setWeaponDamage,
    setCritChance,
    playSound,
    onGameOver,
    isPaused,
    setDangerLevel,
    setWave,
    weaponBounce,
    isHoming,
    setWeaponBounce,
    setKills,
    setZombieHp,
    onNotification,
    critBonus,
    onShowSuperRewards,
    onMobileButtons,
}: GameSceneProps) {
    const { t } = useTranslation();
    // Load Textures
    const [texWalker, texRunner, texTank, texBoss] = useTexture([
        '/textures/zombie_walker.png',
        '/textures/zombie_runner.png',
        '/textures/zombie_tank.png',
        '/textures/zombie_boss.png'
    ]);

    // Game State Refs
    const playerPos = useRef(new THREE.Vector3(0, 0, 8));
    const projectiles = useRef<Projectile[]>([]);
    const zombies = useRef<Zombie[]>([]);
    const particles = useRef<Particle[]>([]);
    const perfectStreak = useRef(0);
    const wasBreached = useRef(false);
    const floatingTexts = useRef<FloatingText[]>([]);
    const lastSuperWave = useRef(0);
    const frameCount = useRef(0);
    const lastShotTime = useRef(0);
    const difficultyLevel = useRef(1);
    const scoreRef = useRef(1);
    const lastDangerLevel = useRef(0);

    const { gl } = useThree();

    // New Progression System
    const powerUps = useRef<PowerUp[]>([]);
    const weaponStats = useRef({
        count: 1,
        delay: 0.3,
        tech: 0,
        damage: 50,
        critChance: 5,
        critMultiplier: 2,
        maxBounce: 1,
        isHoming: false
    });

    // Instanced Mesh Refs
    const meshProjectiles = useRef<THREE.InstancedMesh>(null);
    const meshPowerUps = useRef<THREE.InstancedMesh>(null);
    const meshWalkers = useRef<THREE.InstancedMesh>(null);
    const meshRunners = useRef<THREE.InstancedMesh>(null);
    const meshTanks = useRef<THREE.InstancedMesh>(null);
    const meshBosses = useRef<THREE.InstancedMesh>(null);
    const meshParticles = useRef<THREE.InstancedMesh>(null);
    const meshHealthBg = useRef<THREE.InstancedMesh>(null);
    const meshHealthFill = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Geometries & Materials
    const projectileGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 8, 8), []);
    const projectileMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#60a5fa' }), []);
    const zombieGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const particleGeometry = useMemo(() => new THREE.BoxGeometry(0.2, 0.2, 0.2), []);
    const particleMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff' }), []);
    const powerUpGeometry = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.5), []);
    const powerUpMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.2, metalness: 0.8, emissive: '#444444', emissiveIntensity: 0.5 }), []);
    const healthBarGeometry = useMemo(() => new THREE.PlaneGeometry(1, 0.12), []);
    const healthBarBgMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.5 }), []);
    const healthBarFillMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#10b981' }), []);

    // Controls (Modularized Hook)
    const { keys, lastInputSource, isPointerDown, mouseDeltaX } = useGameInput();

    useEffect(() => {
        weaponStats.current.maxBounce = weaponBounce;
    }, [weaponBounce]);

    useEffect(() => {
        weaponStats.current.isHoming = isHoming;
    }, [isHoming]);

    // Virtual Buttons Hookup
    useEffect(() => {
        if (onMobileButtons) {
            onMobileButtons({
                moveLeft: (on: boolean) => { if (keys.current) { keys.current['KeyA'] = on; lastInputSource.current = 'keyboard'; } },
                moveRight: (on: boolean) => { if (keys.current) { keys.current['KeyD'] = on; lastInputSource.current = 'keyboard'; } }
            });
        }
    }, [onMobileButtons, keys, lastInputSource]);

    // Handle Pointer Lock
    useEffect(() => {
        const handleLock = () => {
            if (gameState === 'playing' && !isPaused) {
                if (!document.pointerLockElement) {
                    gl.domElement.requestPointerLock();
                }
            }
        };

        // If paused or gameover, release the lock
        if ((isPaused || gameState !== 'playing') && document.pointerLockElement) {
            document.exitPointerLock();
        }

        gl.domElement.addEventListener('mousedown', handleLock);
        return () => gl.domElement.removeEventListener('mousedown', handleLock);
    }, [gameState, isPaused, gl]);

    useFrame((state) => {
        state.camera.lookAt(0, 0, -5);

        if (gameState !== 'playing' || isPaused) return;

        frameCount.current++;

        // --- LOGIC UPDATE ---

        // 1. Move Player (Keyboard)
        if (lastInputSource.current === 'keyboard') {
            if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
                playerPos.current.x = Math.max(-FIELD_WIDTH / 2 + 1, playerPos.current.x - PLAYER_SPEED);
            }
            if (keys.current['ArrowRight'] || keys.current['KeyD']) {
                playerPos.current.x = Math.min(FIELD_WIDTH / 2 - 1, playerPos.current.x + PLAYER_SPEED);
            }
        }

        // 1b. Move Player (Mouse vs Touch)
        if (lastInputSource.current === 'mouse') {
            const isLocked = !!document.pointerLockElement;

            if (isLocked) {
                // RELATIVE MOVEMENT (Pointer Locked)
                const sensitivity = 0.04;
                playerPos.current.x += mouseDeltaX.current * sensitivity;
                mouseDeltaX.current = 0; // Reset after consuming
            } else {
                // If not locked, we don't move or we move very slowly to cursor
                // We clear delta to avoid buildup
                mouseDeltaX.current = 0;
            }

            // Safety Clamp to Field
            playerPos.current.x = Math.max(-FIELD_WIDTH / 2 + 1, Math.min(FIELD_WIDTH / 2 - 1, playerPos.current.x));
        } else if (lastInputSource.current === 'touch') {
            // MOBILE TOUCH: Check if virtual buttons are NOT active before doing analog
            if (keys.current['KeyA'] || keys.current['KeyD']) {
                if (keys.current['KeyA']) playerPos.current.x = Math.max(-FIELD_WIDTH / 2 + 1, playerPos.current.x - PLAYER_SPEED);
                if (keys.current['KeyD']) playerPos.current.x = Math.min(FIELD_WIDTH / 2 - 1, playerPos.current.x + PLAYER_SPEED);
            } else if (isPointerDown.current) {
                // Analog Zone Control Fallback
                if (Math.abs(state.pointer.x) > TOUCH_DEADZONE) {
                    const speedFactor = Math.min(1, Math.abs(state.pointer.x) * TOUCH_SENSITIVITY);
                    const moveAmount = PLAYER_SPEED * speedFactor * Math.sign(state.pointer.x);
                    playerPos.current.x += moveAmount;
                    playerPos.current.x = Math.max(-FIELD_WIDTH / 2 + 1, Math.min(FIELD_WIDTH / 2 - 1, playerPos.current.x));
                }
            }
        }

        // 2. Shooting (Auto-fire)
        const stats = weaponStats.current;
        if (state.clock.elapsedTime - lastShotTime.current > stats.delay) {
            const projectilesToAdd = [];
            const spacing = 0.3;
            const startX = -((stats.count - 1) * spacing) / 2;
            const pierceCount = stats.tech >= 1 ? 3 : 0;
            const bounceCount = stats.maxBounce + (stats.tech >= 2 ? 3 : 0);
            const chainCount = stats.tech >= 3 ? 3 : 0;


            if (projectiles.current.length + stats.count < 200) {
                for (let i = 0; i < stats.count; i++) {
                    projectilesToAdd.push({
                        x: startX + (i * spacing),
                        z: Math.abs(startX + (i * spacing)) * 0.2
                    });
                }

                projectilesToAdd.forEach(offset => {
                    projectiles.current.push({
                        id: Math.random(),
                        position: new THREE.Vector3(playerPos.current.x + offset.x, 1, playerPos.current.z - 1.2 + offset.z),
                        velocity: new THREE.Vector3(offset.x * 0.05, 0, -PROJECTILE_SPEED),
                        active: true,
                        pierce: pierceCount,
                        maxBounce: bounceCount,
                        isCluster: false,
                        chain: chainCount,
                        life: 300 // ~5 seconds at 60fps
                    });
                });
                playSound('click');
            }
            lastShotTime.current = state.clock.elapsedTime;
        }

        // 3. Spawning Zombies
        const spawnRate = Math.max(30, 60 - difficultyLevel.current * 2);
        if (frameCount.current === 10 || frameCount.current % Math.floor(spawnRate) === 0) {
            if (zombies.current.length < 100) {
                const spawnX = (Math.random() - 0.5) * FIELD_WIDTH;
                // HP scales with wave: Base 100 * (1.2 ^ (Wave-1))
                // Flawless Bonus: +50% HP if 5 waves without breach
                let hp = 100 * Math.pow(1.2, difficultyLevel.current - 1);
                if (perfectStreak.current >= 5) hp *= 1.5;
                const typeRoll = Math.random();
                let type: Zombie['type'] = 'walker';
                let speed = ZOMBIE_BASE_SPEED + (difficultyLevel.current * 0.001);
                let color = '#10b981';
                let size = 1;

                if (typeRoll > 0.96) {
                    type = 'boss';
                    hp *= 10;
                    speed *= 0.3;
                    color = '#a855f7'; // Purple for Boss
                    size = 2.5;
                } else if (typeRoll > 0.88) {
                    type = 'tank';
                    hp *= 4;
                    speed *= 0.4;
                    color = '#ef4444';
                    size = 1.5;
                } else if (typeRoll > 0.7) {
                    type = 'runner';
                    hp = Math.max(1, Math.floor(hp * 0.5));
                    speed *= 1.6;
                    color = '#facc15';
                    size = 0.8;
                }

                zombies.current.push({
                    id: Math.random(),
                    position: new THREE.Vector3(spawnX, 1, -FIELD_DEPTH),
                    speed: speed,
                    hp: hp,
                    maxHp: hp,
                    active: true,
                    type,
                    color,
                    baseColor: color,
                    size
                });
            }
        }

        if (frameCount.current % 600 === 0) {
            // Check for Perfect Wave
            if (!wasBreached.current) {
                perfectStreak.current++;
                if (perfectStreak.current === 5) {
                    onNotification(t('game.zombie_notif.elite_challenge'), "#ef4444");
                } else if (perfectStreak.current < 5) {
                    onNotification(t('game.zombie_notif.perfect_streak', { streak: perfectStreak.current }), "#22d3ee");
                }
            } else {
                if (perfectStreak.current >= 5) {
                    onNotification(t('game.zombie_notif.elite_complete'), "#60a5fa");
                }
                perfectStreak.current = 0;
            }
            wasBreached.current = false; // Reset for next wave

            difficultyLevel.current++;
            setWave(difficultyLevel.current);
            scoreRef.current = Math.floor(difficultyLevel.current);
            setScore(scoreRef.current);

            // Calculate base HP for this wave
            let baseHp = 100 * Math.pow(1.2, difficultyLevel.current - 1);
            if (perfectStreak.current >= 5) baseHp *= 1.5;
            setZombieHp(Math.round(baseHp));

            onNotification(t('game.zombie_notif.wave', { wave: difficultyLevel.current }), "#60a5fa");

            // Super Reward every 10 waves
            const waveNum = Math.floor(difficultyLevel.current);
            if (waveNum % 10 === 0 && waveNum !== lastSuperWave.current) {
                lastSuperWave.current = waveNum;
                onShowSuperRewards();
            }
        }

        // 4. Update Projectiles
        for (let i = projectiles.current.length - 1; i >= 0; i--) {
            const p = projectiles.current[i];

            // Decrement TTL
            p.life--;
            if (p.life <= 0) {
                projectiles.current.splice(i, 1);
                continue;
            }

            p.position.add(p.velocity);

            // Homing Logic
            if (weaponStats.current.isHoming && zombies.current.length > 0) {
                let nearestZ: Zombie | null = null;
                let minDist = 30; // Max search distance

                zombies.current.forEach(z => {
                    if (z.hp > 0) {
                        const d = p.position.distanceTo(z.position);
                        if (d < minDist) {
                            minDist = d;
                            nearestZ = z;
                        }
                    }
                });

                if (nearestZ) {
                    const targetDir = (nearestZ as Zombie).position.clone().sub(p.position).normalize();
                    // Smoothly interpolate current velocity towards target direction
                    p.velocity.lerp(targetDir.multiplyScalar(PROJECTILE_SPEED), 0.1);
                }
            }

            if (p.maxBounce > 0) {
                // X-Bounce (Sides)
                if (p.position.x > FIELD_WIDTH / 2 || p.position.x < -FIELD_WIDTH / 2) {
                    p.velocity.x = -p.velocity.x;
                    p.maxBounce--;
                    p.position.x = Math.max(-FIELD_WIDTH / 2, Math.min(FIELD_WIDTH / 2, p.position.x));
                }
                // Z-Bounce (Front/Back)
                if (p.position.z > FRONT_WALL_Z || p.position.z < BACK_WALL_Z) {
                    p.velocity.z = -p.velocity.z;
                    p.maxBounce--;
                    p.position.z = Math.max(BACK_WALL_Z, Math.min(FRONT_WALL_Z, p.position.z));
                }
            }

            // Enhanced Cleanup: Remove only if out of bounce arena or too far
            if (p.position.z < BACK_WALL_Z - 5 || p.position.z > FRONT_WALL_Z + 5 ||
                Math.abs(p.position.x) > FIELD_WIDTH / 2 + 5) {
                projectiles.current.splice(i, 1);
            }
        }

        // 5. Update Zombies & Collisions
        const currentTime = state.clock.elapsedTime;
        for (let i = zombies.current.length - 1; i >= 0; i--) {
            const z = zombies.current[i];

            // Handle Slow Effect (Tech 4)
            let currentSpeed = z.speed;
            if (z.slowedUntil && z.slowedUntil > currentTime) {
                currentSpeed *= 0.75;
                z.color = '#60a5fa'; // Cryo-tint
            } else {
                z.color = z.baseColor;
            }
            // zombies move straight forward on the Z axis
            z.position.z += currentSpeed;

            if (z.position.z > playerPos.current.z) {
                setGameState('gameover');
                playSound('gameover');
                onGameOver();
                return;
            }

            let hit = false;
            for (let j = projectiles.current.length - 1; j >= 0; j--) {
                const p = projectiles.current[j];
                const collisionRadius = 0.7 + (z.size || 1) * 0.5;
                if (p.position.distanceTo(z.position) < collisionRadius) {
                    const stats = weaponStats.current;
                    const isCrit = Math.random() < stats.critChance / 100;
                    const finalDamage = isCrit ? stats.damage * (1 + critBonus / 100) : stats.damage;
                    z.hp -= finalDamage;
                    hit = true;
                    playSound(isCrit ? 'click' : 'break');

                    // --- TECH 4: CRYO-SHOCK ---
                    if (stats.tech >= 4) {
                        z.slowedUntil = currentTime + 1.5;
                    }

                    // --- TECH 5: RESONANCE (AoE) ---
                    if (stats.tech >= 5) {
                        const aoeRadius = 4;
                        const aoeDamage = finalDamage * 0.3;
                        zombies.current.forEach(otherZ => {
                            if (otherZ.id !== z.id && otherZ.hp > 0) {
                                if (otherZ.position.distanceTo(z.position) < aoeRadius) {
                                    otherZ.hp -= aoeDamage;
                                    // Visual feedback for AoE
                                    if (particles.current.length < 300) {
                                        particles.current.push({
                                            id: Math.random(),
                                            position: otherZ.position.clone(),
                                            velocity: new THREE.Vector3(0, 0.1, 0),
                                            color: '#22d3ee',
                                            life: 10,
                                            active: true
                                        });
                                    }
                                }
                            }
                        });
                    }

                    // --- TECH 6: SINGULARITY (Vortex on Crit) ---
                    if (stats.tech >= 6 && isCrit) {
                        const vortexRadius = 6;
                        zombies.current.forEach(otherZ => {
                            if (otherZ.id !== z.id && otherZ.hp > 0) {
                                const dist = otherZ.position.distanceTo(z.position);
                                if (dist < vortexRadius) {
                                    // Pull BACKWARDS (towards spawn, away from player)
                                    const pullDir = new THREE.Vector3(0, 0, -1); // Backward on Z
                                    const pullResistance = KNOCKBACK_RESISTANCE[otherZ.type] || 1;
                                    otherZ.position.add(pullDir.multiplyScalar(0.3 * pullResistance)); // Smoother, resisted pull
                                }
                            }
                        });
                        // Visual feedback for Singularity
                        if (particles.current.length < 300) {
                            for (let k = 0; k < 5; k++) {
                                particles.current.push({
                                    id: Math.random(),
                                    position: z.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2)),
                                    velocity: playerPos.current.clone().sub(z.position).normalize().multiplyScalar(-0.1),
                                    color: '#a855f7',
                                    life: 20,
                                    active: true
                                });
                            }
                        }
                    }

                    // --- FLOATING DAMAGE TEXT --- (max 50)
                    if (floatingTexts.current.length < 50) {
                        floatingTexts.current.push({
                            id: Math.random(),
                            position: z.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
                            content: `${Math.round(finalDamage)}`,
                            color: isCrit ? '#facc15' : '#ffffff',
                            life: 40,
                            maxLife: 40,
                            isCrit: isCrit
                        });
                    }

                    // --- KNOCKBACK LOGIC ---
                    const pushDir = z.position.clone().sub(playerPos.current).normalize();
                    pushDir.y = 0;
                    const resistance = KNOCKBACK_RESISTANCE[z.type] || 1;
                    z.position.z -= KNOCKBACK_FORCE * resistance;

                    // --- PARTICLES --- (max 300)
                    if (particles.current.length < 300) {
                        for (let k = 0; k < 2; k++) { // Reduced from 3 to 2
                            particles.current.push({
                                id: Math.random(),
                                position: z.position.clone(),
                                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.3, (Math.random() - 0.5) * 0.3),
                                color: isCrit ? '#facc15' : (z.hp <= 0 ? '#10b981' : '#fbbf24'),
                                life: isCrit ? 30 : (z.hp <= 0 ? 25 : 15), // Reduced life
                                active: true
                            });
                        }
                    }

                    // --- CHAIN / PIERCE LOGIC ---
                    if (p.chain > 0) {
                        // CHAIN SHOT: Find nearest other zombie
                        let closestZ = null;
                        let minDst = 10;
                        for (const otherZ of zombies.current) {
                            if (otherZ.id !== z.id && otherZ.hp > 0) {
                                const d = p.position.distanceTo(otherZ.position);
                                if (d < minDst) {
                                    minDst = d;
                                    closestZ = otherZ;
                                }
                            }
                        }

                        if (closestZ) {
                            const dir = closestZ.position.clone().sub(p.position).normalize();
                            p.velocity.copy(dir.multiplyScalar(PROJECTILE_SPEED));
                            p.chain--;
                            p.position.add(dir.multiplyScalar(0.5));
                        } else {
                            if (p.pierce > 0) p.pierce--;
                            else {
                                p.active = false;
                                projectiles.current.splice(j, 1);
                            }
                        }
                    } else if (p.pierce > 0) {
                        p.pierce--;
                    } else {
                        p.active = false;
                        projectiles.current.splice(j, 1);
                    }

                    break;
                }
            }

            if (hit && z.hp <= 0) {
                zombies.current.splice(i, 1);
                setKills(prev => prev + 1);

                // Loot Drops
                const distToPlayer = z.position.distanceTo(playerPos.current);
                const isClose = distToPlayer < 25;
                const isInDangerZone = z.position.z >= 0;
                const dropChance = (isInDangerZone || z.type === 'boss') ? 1.0 : (z.type === 'tank' ? 0.8 : (z.type === 'runner' ? 0.4 : 0.2));

                if (isClose && Math.random() < dropChance && powerUps.current.length < 50) {
                    const lootRoll = Math.random();
                    let type: PowerUp['type'] = 'scatter';
                    let color = '#facc15';

                    if (lootRoll > 0.9) {
                        type = 'crit';
                        color = '#facc15'; // Yellow for Crit
                    } else if (lootRoll > 0.75) {
                        type = 'bounce';
                        color = '#ffffff'; // White for Bounce
                    } else if (lootRoll > 0.6) {
                        type = 'damage';
                        color = '#f97316';
                    } else if (lootRoll > 0.45) {
                        type = 'tech';
                        color = '#ef4444';
                    } else if (lootRoll > 0.2) {
                        type = 'rapid';
                        color = '#3b82f6';
                    }

                    powerUps.current.push({
                        id: Math.random(),
                        position: z.position.clone(),
                        type,
                        color,
                        active: true
                    });
                }
            }
        }

        // --- DANGER CHECK ---
        let closestDist = 100;
        for (const z of zombies.current) {
            // Calculate absolute distance for danger logic
            const d = Math.abs(playerPos.current.z - z.position.z);
            if (d < closestDist) closestDist = d;
        }

        // Map Distance to Danger (0 to 1)
        // < 5m = 1.0
        // < 15m = 0.6
        // < 30m = 0.3
        // > 30m = 0
        let newDanger = 0;
        if (closestDist < 8) newDanger = 1;
        else if (closestDist < 18) newDanger = 0.6;
        else if (closestDist < 30) newDanger = 0.3;

        if (newDanger !== lastDangerLevel.current) {
            lastDangerLevel.current = newDanger;
            setDangerLevel(newDanger);
        }

        // 6. Update Particles
        for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.position.add(p.velocity);
            p.life--;
            if (p.life <= 0) particles.current.splice(i, 1);
        }

        // 7. Update PowerUps
        for (let i = powerUps.current.length - 1; i >= 0; i--) {
            const p = powerUps.current[i];
            p.position.z += 0.1;
            const dist = p.position.distanceTo(playerPos.current);
            if (dist < 5) {
                p.position.lerp(playerPos.current, 0.1);
            }

            if (dist < 1.5) {
                if (p.type === 'scatter') {
                    weaponStats.current.count++;
                    setWeaponCount(weaponStats.current.count);
                    onNotification("+1 CANON", "#facc15");
                } else if (p.type === 'rapid') {
                    weaponStats.current.delay = Math.max(0.05, weaponStats.current.delay * 0.9);
                    setWeaponDelay(weaponStats.current.delay);
                    onNotification(t('game.zombie_notif.pickup_rate'), "#3b82f6");
                } else if (p.type === 'tech') {
                    weaponStats.current.tech = Math.min(6, weaponStats.current.tech + 1);
                    setWeaponTech(weaponStats.current.tech);
                    onNotification(weaponStats.current.tech === 6 ? t('game.zombie_notif.pickup_tech_max') : t('game.zombie_notif.pickup_tech'), "#ef4444");
                } else if (p.type === 'damage') {
                    weaponStats.current.damage += 10;
                    setWeaponDamage(weaponStats.current.damage);
                    onNotification(t('game.zombie_notif.pickup_damage'), "#f97316");
                } else if (p.type === 'crit') {
                    weaponStats.current.critChance = Math.min(100, weaponStats.current.critChance + 10);
                    setCritChance(weaponStats.current.critChance);
                    onNotification(t('game.zombie_notif.pickup_crit'), "#facc15");
                } else if (p.type === 'bounce') {
                    weaponStats.current.maxBounce++;
                    setWeaponBounce(weaponStats.current.maxBounce);
                    onNotification(t('game.zombie_notif.pickup_bounce'), "#ffffff");
                }

                playSound('click');
                powerUps.current.splice(i, 1);
                continue;
            }

            if (p.position.z > 10) {
                powerUps.current.splice(i, 1);
            }
        }

        // --- RENDER UPDATE ---

        if (meshPowerUps.current) {
            const mesh = meshPowerUps.current;
            mesh.count = powerUps.current.length;
            powerUps.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.set(1, 1, 1);
                dummy.rotation.x += 0.02;
                dummy.rotation.y += 0.05;
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
                mesh.setColorAt(i, new THREE.Color(p.color));
            });
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }

        if (meshProjectiles.current) {
            const mesh = meshProjectiles.current;
            mesh.count = projectiles.current.length;
            projectiles.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.set(1, 1, 1);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
        }

        if (meshWalkers.current && meshRunners.current && meshTanks.current && meshBosses.current) {
            const walkers = meshWalkers.current;
            const runners = meshRunners.current;
            const tanks = meshTanks.current;
            const bosses = meshBosses.current;
            let idxW = 0, idxR = 0, idxT = 0, idxB = 0;
            zombies.current.forEach((z) => {
                dummy.position.copy(z.position);
                dummy.rotation.set(0, 0, 0);
                dummy.rotation.z = Math.sin(frameCount.current * 0.2 + z.id * 10) * 0.1;
                dummy.scale.setScalar(z.size || 1);
                dummy.updateMatrix();

                if (z.type === 'boss') {
                    bosses.setMatrixAt(idxB++, dummy.matrix);
                } else if (z.type === 'tank') {
                    tanks.setMatrixAt(idxT++, dummy.matrix);
                } else if (z.type === 'runner') {
                    runners.setMatrixAt(idxR++, dummy.matrix);
                } else {
                    walkers.setMatrixAt(idxW++, dummy.matrix);
                }
            });

            walkers.count = idxW;
            runners.count = idxR;
            tanks.count = idxT;
            bosses.count = idxB;

            walkers.instanceMatrix.needsUpdate = true;
            runners.instanceMatrix.needsUpdate = true;
            tanks.instanceMatrix.needsUpdate = true;
            bosses.instanceMatrix.needsUpdate = true;
        }

        // --- HEALTH BARS RENDER ---
        if (meshHealthBg.current && meshHealthFill.current) {
            const bgMesh = meshHealthBg.current;
            const fillMesh = meshHealthFill.current;
            let idxH = 0;
            zombies.current.forEach((z) => {
                // Only show health bar if zombie is damaged
                if (z.hp >= z.maxHp) return;

                const hpPercent = Math.max(0, z.hp / z.maxHp);
                const barWidth = (z.size || 1) * 1.2;

                // Background
                dummy.position.copy(z.position);
                dummy.position.y += (z.size || 1) + 0.5; // Offset above zombie
                dummy.position.z += 0.2; // Slightly forward
                dummy.scale.set(barWidth, 1, 1);
                dummy.rotation.x = -Math.PI / 4; // Tilt towards camera
                dummy.updateMatrix();
                bgMesh.setMatrixAt(idxH, dummy.matrix);

                // Fill
                const fillScale = barWidth * hpPercent;
                dummy.scale.set(fillScale, 0.8, 1);
                // Offset horizontal position to keep it left-aligned
                const offsetX = (barWidth * (1 - hpPercent)) / 2;
                dummy.position.x -= offsetX;
                dummy.position.y += 0.01; // Slightly higher
                dummy.updateMatrix();
                fillMesh.setMatrixAt(idxH, dummy.matrix);

                // Color transition from Green to Red
                const color = new THREE.Color().lerpColors(
                    new THREE.Color('#ef4444'),
                    new THREE.Color('#10b981'),
                    hpPercent
                );
                fillMesh.setColorAt(idxH, color);
                idxH++;
            });
            bgMesh.count = idxH;
            fillMesh.count = idxH;
            bgMesh.instanceMatrix.needsUpdate = true;
            fillMesh.instanceMatrix.needsUpdate = true;
            if (fillMesh.instanceColor) fillMesh.instanceColor.needsUpdate = true;
        }

        if (meshParticles.current) {
            const mesh = meshParticles.current;
            mesh.count = particles.current.length;
            particles.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.setScalar(p.life / 20);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
                mesh.setColorAt(i, new THREE.Color(p.color));
            });
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        }



        // Update Floating Texts
        for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
            const ft = floatingTexts.current[i];
            ft.position.y += 0.02; // Float up
            ft.life--;
            if (ft.life <= 0) floatingTexts.current.splice(i, 1);
        }
    });

    return (
        <group>
            <Player positionRef={playerPos} />
            <instancedMesh ref={meshProjectiles} args={[undefined, undefined, 1000]} geometry={projectileGeometry} material={projectileMaterial} frustumCulled={false} />
            <instancedMesh ref={meshWalkers} args={[zombieGeometry, undefined, 200]} frustumCulled={false}>
                <meshStandardMaterial map={texWalker} color="#ffffff" roughness={0.5} />
            </instancedMesh>
            <instancedMesh ref={meshRunners} args={[zombieGeometry, undefined, 100]} frustumCulled={false}>
                <meshStandardMaterial map={texRunner} color="#ffffff" roughness={0.5} />
            </instancedMesh>
            <instancedMesh ref={meshTanks} args={[zombieGeometry, undefined, 50]} frustumCulled={false}>
                <meshStandardMaterial map={texTank} color="#ffffff" roughness={0.5} />
            </instancedMesh>
            <instancedMesh ref={meshBosses} args={[zombieGeometry, undefined, 10]} frustumCulled={false}>
                <meshStandardMaterial map={texBoss} color="#ffffff" roughness={0.5} />
            </instancedMesh>

            <instancedMesh ref={meshHealthBg} args={[healthBarGeometry, healthBarBgMaterial, 200]} frustumCulled={false} />
            <instancedMesh ref={meshHealthFill} args={[healthBarGeometry, healthBarFillMaterial, 200]} frustumCulled={false} />

            <instancedMesh ref={meshParticles} args={[undefined, undefined, 1000]} geometry={particleGeometry} material={particleMaterial} frustumCulled={false} />
            <instancedMesh ref={meshPowerUps} args={[undefined, undefined, 50]} geometry={powerUpGeometry} material={powerUpMaterial} frustumCulled={false} />

            {/* Damage Numbers */}
            {floatingTexts.current.map((ft) => {
                const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
                return (
                    <Html
                        key={ft.id}
                        position={ft.position}
                        center
                        pointerEvents="none"
                        distanceFactor={isTouch ? 8 : 10}
                    >
                        <div
                            className={`font-black italic whitespace-nowrap select-none flex flex-col items-center justify-center`}
                            style={{
                                color: ft.color,
                                fontSize: isTouch ? (ft.isCrit ? '3rem' : '1.8rem') : (ft.isCrit ? '2rem' : '1.2rem'),
                                opacity: (ft.life / ft.maxLife) * 0.8,
                                textShadow: ft.isCrit ? '0 0 10px rgba(250, 204, 21, 0.6), 0 0 4px rgba(0,0,0,0.8)' : '0 1px 2px rgba(0,0,0,0.6)',
                                transform: `scale(${ft.isCrit ? 1.2 : 1})`,
                                fontWeight: 900,
                                letterSpacing: '-0.02em',
                                fontFamily: 'monospace'
                            }}
                        >
                            {ft.isCrit && <div className="text-[0.6rem] uppercase tracking-[0.2em] mb-[-0.2rem] opacity-90 text-yellow-500 font-bold">{t('game.zombie_hud.crit_hit')}</div>}
                            {ft.content}
                        </div>
                    </Html>
                );
            })}
            {/* Pointer Lock Hint - Only for PC (not touch) */}
            {!document.pointerLockElement && gameState === 'playing' && !isPaused &&
                lastInputSource.current !== 'touch' &&
                !('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
                window.innerWidth > 768 && (
                    <Html position={[0, 2, 0]} center>
                        <div className="bg-black/80 px-4 py-2 rounded-lg border border-cyan-500/50 backdrop-blur-sm pointer-events-none">
                            <span className="text-cyan-400 font-black text-xs uppercase tracking-widest animate-pulse text-center">
                                {t('game.zombie_hud.capture_mouse')}
                            </span>
                        </div>
                    </Html>
                )}
        </group>
    );
}
