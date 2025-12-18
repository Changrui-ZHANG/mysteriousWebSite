import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FIELD_DEPTH, FIELD_WIDTH, PLAYER_SPEED, PROJECTILE_SPEED, ZOMBIE_BASE_SPEED, TOUCH_DEADZONE, TOUCH_SENSITIVITY, MOUSE_LERP_FACTOR, KNOCKBACK_FORCE, KNOCKBACK_RESISTANCE } from './constants';
import { Particle, PowerUp, Projectile, Zombie } from './types';
import { Player } from './components/Player';
import { useGameInput } from './hooks/useGameInput';

interface GameSceneProps {
    gameState: string;
    setGameState: (s: any) => void;
    setScore: (s: any) => void;
    setWeaponCount: (n: number) => void;
    setWeaponDelay: (n: number) => void;
    setWeaponTech: (n: number) => void;
    setWeaponDamage: (n: number) => void;
    playSound: (s: any) => void;
    onGameOver: () => void;
    isPaused: boolean;
    setDangerLevel: (n: number) => void;
    setWave: (n: number) => void;
    setKills: (updater: (prev: number) => number) => void;
}

export function GameScene({
    gameState,
    setGameState,
    setScore,
    setWeaponCount,
    setWeaponDelay,
    setWeaponTech,
    setWeaponDamage,
    playSound,
    onGameOver,
    isPaused,
    setDangerLevel,
    setWave,
    setKills
}: GameSceneProps) {
    // Load Textures
    const [texWalker, texRunner, texTank] = useTexture([
        '/textures/zombie_walker.png',
        '/textures/zombie_runner.png',
        '/textures/zombie_tank.png'
    ]);

    // Game State Refs
    const playerPos = useRef(new THREE.Vector3(0, 0, 8));
    const projectiles = useRef<Projectile[]>([]);
    const zombies = useRef<Zombie[]>([]);
    const particles = useRef<Particle[]>([]);
    const frameCount = useRef(0);
    const lastShotTime = useRef(0);
    const difficultyLevel = useRef(1);
    const scoreRef = useRef(0);
    const lastDangerLevel = useRef(0);

    // New Progression System
    const powerUps = useRef<PowerUp[]>([]);
    const weaponStats = useRef({
        count: 1,
        delay: 0.3,
        tech: 0,
        damage: 50
    });

    // Instanced Mesh Refs
    const meshProjectiles = useRef<THREE.InstancedMesh>(null);
    const meshPowerUps = useRef<THREE.InstancedMesh>(null);
    const meshWalkers = useRef<THREE.InstancedMesh>(null);
    const meshRunners = useRef<THREE.InstancedMesh>(null);
    const meshTanks = useRef<THREE.InstancedMesh>(null);
    const meshParticles = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Geometries & Materials
    const projectileGeometry = useMemo(() => new THREE.SphereGeometry(0.2, 8, 8), []);
    const projectileMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#60a5fa' }), []);
    const zombieGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
    const particleGeometry = useMemo(() => new THREE.BoxGeometry(0.2, 0.2, 0.2), []);
    const particleMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#fff' }), []);
    const powerUpGeometry = useMemo(() => new THREE.BoxGeometry(0.5, 0.5, 0.5), []);
    const powerUpMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fff', roughness: 0.2, metalness: 0.8, emissive: '#444444', emissiveIntensity: 0.5 }), []);

    // Controls (Modularized Hook)
    const { keys, lastInputSource, isPointerDown } = useGameInput();

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
            // PC MOUSE: Absolute Mapping (Hover)
            const targetX = state.pointer.x * (FIELD_WIDTH / 2);
            playerPos.current.x = THREE.MathUtils.lerp(playerPos.current.x, targetX, MOUSE_LERP_FACTOR);
            playerPos.current.x = Math.max(-FIELD_WIDTH / 2 + 1, Math.min(FIELD_WIDTH / 2 - 1, playerPos.current.x));
        } else if (lastInputSource.current === 'touch') {
            // MOBILE TOUCH: Analog Zone Control (Variable Speed)
            if (isPointerDown.current) {
                // state.pointer.x is -1 (left) to 1 (right)
                // We map this magnitude to speed for "gentle" control

                if (Math.abs(state.pointer.x) > TOUCH_DEADZONE) {
                    // Calculate speed factor (0 to 1) based on distance from center
                    // We want max speed at around 0.5 (halfway to edge) so it's responsive
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
            const bounceCount = stats.tech >= 2 ? 3 : 0;
            const chainCount = stats.tech >= 3 ? 3 : 0;

            if (projectiles.current.length + stats.count < 1000) {
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
                        chain: chainCount
                    });
                });
                playSound('click' as any);
            }
            lastShotTime.current = state.clock.elapsedTime;
        }

        // 3. Spawning Zombies
        const spawnRate = Math.max(30, 60 - difficultyLevel.current * 2);
        if (frameCount.current === 10 || frameCount.current % Math.floor(spawnRate) === 0) {
            if (zombies.current.length < 100) {
                const spawnX = (Math.random() - 0.5) * FIELD_WIDTH;
                // HP scales with wave: Base 100 + (Difficulty * 20)
                // This ensures "2 shots to kill" feel at start (100 HP vs 50 Dmg)
                let hp = 100 + (difficultyLevel.current * 20);
                const typeRoll = Math.random();
                let type: Zombie['type'] = 'walker';
                let speed = ZOMBIE_BASE_SPEED + (difficultyLevel.current * 0.001);
                let color = '#10b981';
                let size = 1;

                if (typeRoll > 0.9) {
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
                    size
                });
            }
        }

        if (frameCount.current % 600 === 0) difficultyLevel.current++;

        // 4. Update Projectiles
        for (let i = projectiles.current.length - 1; i >= 0; i--) {
            const p = projectiles.current[i];
            p.position.add(p.velocity);

            if (p.maxBounce > 0) {
                if (p.position.x > FIELD_WIDTH / 2 || p.position.x < -FIELD_WIDTH / 2) {
                    p.velocity.x = -p.velocity.x;
                    p.maxBounce--;
                    p.position.x = Math.max(-FIELD_WIDTH / 2, Math.min(FIELD_WIDTH / 2, p.position.x));
                }
            }

            if (p.position.z < -FIELD_DEPTH - 5) {
                projectiles.current.splice(i, 1);
            }
        }

        // 5. Update Zombies & Collisions
        for (let i = zombies.current.length - 1; i >= 0; i--) {
            const z = zombies.current[i];
            z.position.z += z.speed;

            if (z.position.x < playerPos.current.x - 0.5) z.position.x += 0.02;
            else if (z.position.x > playerPos.current.x + 0.5) z.position.x -= 0.02;

            if (z.position.z > playerPos.current.z) {
                setGameState('gameover');
                playSound('gameover');
                onGameOver();
                return;
            }

            let hit = false;
            for (let j = projectiles.current.length - 1; j >= 0; j--) {
                const p = projectiles.current[j];
                if (p.position.distanceTo(z.position) < 1.2) {
                    z.hp -= weaponStats.current.damage; // Apply weapon damage
                    hit = true;
                    playSound('break' as any);

                    // --- KNOCKBACK LOGIC ---
                    const pushDir = z.position.clone().sub(playerPos.current).normalize();
                    pushDir.y = 0;
                    const resistance = KNOCKBACK_RESISTANCE[z.type] || 1;
                    z.position.z -= KNOCKBACK_FORCE * resistance;

                    // --- PARTICLES ---
                    if (particles.current.length < 1000) {
                        for (let k = 0; k < 3; k++) {
                            particles.current.push({
                                id: Math.random(),
                                position: z.position.clone(),
                                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.3, Math.random() * 0.3, (Math.random() - 0.5) * 0.3),
                                color: z.hp <= 0 ? '#10b981' : '#fbbf24',
                                life: z.hp <= 0 ? 40 : 20,
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
                scoreRef.current += (z.type === 'tank' ? 5 : z.type === 'runner' ? 2 : 1);
                setScore(scoreRef.current);

                // Loot Drops
                const distToPlayer = z.position.distanceTo(playerPos.current);
                const isClose = distToPlayer < 25;
                const dropChance = z.type === 'tank' ? 0.8 : (z.type === 'runner' ? 0.4 : 0.2);

                if (isClose && Math.random() < dropChance && powerUps.current.length < 50) {
                    const lootRoll = Math.random();
                    let type: PowerUp['type'] = 'scatter';
                    let color = '#facc15';

                    if (lootRoll > 0.85) {
                        type = 'damage';
                        color = '#f97316'; // Orange for damage
                    } else if (lootRoll > 0.7) {
                        type = 'tech';
                        color = '#ef4444';
                    } else if (lootRoll > 0.4) {
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
                } else if (p.type === 'rapid') {
                    weaponStats.current.delay = Math.max(0.05, weaponStats.current.delay * 0.9);
                    setWeaponDelay(weaponStats.current.delay);
                } else if (p.type === 'tech') {
                    weaponStats.current.tech++;
                    setWeaponTech(weaponStats.current.tech);
                } else if (p.type === 'damage') {
                    weaponStats.current.damage += 10;
                    setWeaponDamage(weaponStats.current.damage);
                }

                playSound('click' as any);
                powerUps.current.splice(i, 1);
                continue;
            }

            if (p.position.z > 10) {
                powerUps.current.splice(i, 1);
            }
        }

        // --- RENDER UPDATE ---

        if (meshPowerUps.current) {
            meshPowerUps.current.count = powerUps.current.length;
            powerUps.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.set(1, 1, 1);
                dummy.rotation.x += 0.02;
                dummy.rotation.y += 0.05;
                dummy.updateMatrix();
                meshPowerUps.current!.setMatrixAt(i, dummy.matrix);
                meshPowerUps.current!.setColorAt(i, new THREE.Color(p.color));
            });
            meshPowerUps.current.instanceMatrix.needsUpdate = true;
            if (meshPowerUps.current.instanceColor) meshPowerUps.current.instanceColor.needsUpdate = true;
        }

        if (meshProjectiles.current) {
            meshProjectiles.current.count = projectiles.current.length;
            projectiles.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.set(1, 1, 1);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                meshProjectiles.current!.setMatrixAt(i, dummy.matrix);
            });
            meshProjectiles.current.instanceMatrix.needsUpdate = true;
        }

        if (meshWalkers.current && meshRunners.current && meshTanks.current) {
            let idxW = 0, idxR = 0, idxT = 0;
            zombies.current.forEach((z) => {
                dummy.position.copy(z.position);
                dummy.rotation.set(0, 0, 0);
                dummy.rotation.z = Math.sin(frameCount.current * 0.2 + z.id * 10) * 0.1;
                dummy.scale.setScalar(z.size || 1);
                dummy.updateMatrix();

                if (z.type === 'tank') {
                    meshTanks.current!.setMatrixAt(idxT++, dummy.matrix);
                } else if (z.type === 'runner') {
                    meshRunners.current!.setMatrixAt(idxR++, dummy.matrix);
                } else {
                    meshWalkers.current!.setMatrixAt(idxW++, dummy.matrix);
                }
            });

            meshWalkers.current.count = idxW;
            meshRunners.current.count = idxR;
            meshTanks.current.count = idxT;

            meshWalkers.current.instanceMatrix.needsUpdate = true;
            meshRunners.current.instanceMatrix.needsUpdate = true;
            meshTanks.current.instanceMatrix.needsUpdate = true;
        }

        if (meshParticles.current) {
            meshParticles.current.count = particles.current.length;
            particles.current.forEach((p, i) => {
                dummy.position.copy(p.position);
                dummy.scale.setScalar(p.life / 20);
                dummy.rotation.set(0, 0, 0);
                dummy.updateMatrix();
                meshParticles.current!.setMatrixAt(i, dummy.matrix);
                meshParticles.current!.setColorAt(i, new THREE.Color(p.color));
            });
            meshParticles.current.instanceMatrix.needsUpdate = true;
            if (meshParticles.current.instanceColor) meshParticles.current.instanceColor.needsUpdate = true;
        }

        // Update logical wave number based on difficulty
        const currentWave = Math.floor(difficultyLevel.current);
        setWave(currentWave);
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
            <instancedMesh ref={meshParticles} args={[undefined, undefined, 1000]} geometry={particleGeometry} material={particleMaterial} frustumCulled={false} />
            <instancedMesh ref={meshPowerUps} args={[undefined, undefined, 50]} geometry={powerUpGeometry} material={powerUpMaterial} frustumCulled={false} />
        </group>
    );
}
