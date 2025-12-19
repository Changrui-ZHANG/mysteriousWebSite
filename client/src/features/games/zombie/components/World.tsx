import { Stars, Html } from '@react-three/drei';
import { useMemo } from 'react';

import { FIELD_DEPTH, FIELD_WIDTH, FRONT_WALL_Z, BACK_WALL_Z } from '../constants';

export function Ground() {
    // Cyberpunk Grid Floor
    return (
        <group>
            {/* Infinite-looking Grid */}
            <gridHelper args={[200, 50, '#4c1d95', '#2e1065']} position={[0, 0.01, 0]} />

            {/* Zone Tints - Subtle Colored Areas */}
            {/* Danger Zone Tint (Red) - [0, 8] */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 4]}>
                <planeGeometry args={[FIELD_WIDTH, 8]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.1} />
            </mesh>

            {/* Alert Zone Tint (Yellow) - [-10, 0] */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
                <planeGeometry args={[FIELD_WIDTH, 10]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.07} />
            </mesh>

            {/* Secure Zone Tint (Cyan) - [-22, -10] */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -16]}>
                <planeGeometry args={[FIELD_WIDTH, 12]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.04} />
            </mesh>

            {/* Security Zones Lines - Softened */}
            {/* Danger Line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <planeGeometry args={[FIELD_WIDTH, 0.1]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={[1, 10, 1]}>
                <planeGeometry args={[FIELD_WIDTH, 0.1]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.05} />
            </mesh>
            <Html position={[-10, 0.5, 0]} center transform>
                <div style={{ color: '#ef4444', opacity: 0.25, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    DANGER_IMMEDIAT
                </div>
            </Html>
            <Html position={[10, 0.5, 0]} center transform>
                <div style={{ color: '#ef4444', opacity: 0.25, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    DANGER_IMMEDIAT
                </div>
            </Html>

            {/* Alert Line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -10]}>
                <planeGeometry args={[FIELD_WIDTH, 0.1]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.2} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -10]} scale={[1, 10, 1]}>
                <planeGeometry args={[FIELD_WIDTH, 0.1]} />
                <meshBasicMaterial color="#facc15" transparent opacity={0.03} />
            </mesh>
            <Html position={[-10, 0.5, -10]} center transform>
                <div style={{ color: '#facc15', opacity: 0.2, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    ZONE_ALERTE
                </div>
            </Html>
            <Html position={[10, 0.5, -10]} center transform>
                <div style={{ color: '#facc15', opacity: 0.2, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    ZONE_ALERTE
                </div>
            </Html>

            {/* Secure Line */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -22]}>
                <planeGeometry args={[FIELD_WIDTH, 0.05]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
            </mesh>
            <Html position={[-10, 0.5, -22]} center transform>
                <div style={{ color: '#22d3ee', opacity: 0.15, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    LIMITE_SECURE
                </div>
            </Html>
            <Html position={[10, 0.5, -22]} center transform>
                <div style={{ color: '#22d3ee', opacity: 0.15, fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 'black', whiteSpace: 'nowrap', pointerEvents: 'none', letterSpacing: '0.4em' }}>
                    LIMITE_SECURE
                </div>
            </Html>

            {/* Dark Floor Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
                <planeGeometry args={[200, 200]} />
                <meshStandardMaterial color="#020617" roughness={0.2} metalness={0.8} />
            </mesh>
        </group>
    );
}

export function CityScenery() {
    const cityBlocks = useMemo(() => {
        return Array.from({ length: 60 }).map((_, i) => {
            const width = 4 + Math.random() * 6;
            const depth = 4 + Math.random() * 6;
            return {
                id: i,
                x: (Math.random() - 0.5) * 160, // Wider city
                z: -FIELD_DEPTH / 2 - 20 - Math.random() * 100, // Further back
                h: 20 + Math.random() * 60, // Taller buildings
                width,
                depth,
                color: Math.random() > 0.8 ? '#4f46e5' : '#1e1b4b' // Indigo/Dark Blue
            };
        });
    }, []);

    return (
        <group>
            {cityBlocks.map((block) => (
                <mesh key={block.id} position={[block.x, block.h / 2, block.z]}>
                    <boxGeometry args={[block.width, block.h, block.depth]} />
                    <meshStandardMaterial
                        color={block.color}
                        emissive={block.color}
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </mesh>
            ))}
        </group>
    );
}

export function MapBarriers() {
    const barrierHeight = 4; // Twice the size of standard zombies
    const arenaZCenter = (FRONT_WALL_Z + BACK_WALL_Z) / 2;
    const arenaDepth = Math.abs(FRONT_WALL_Z - BACK_WALL_Z);
    const xPos = FIELD_WIDTH / 2 + 0.5;

    return (
        <group>
            {/* Left Barrier */}
            <mesh position={[-xPos, barrierHeight / 2, arenaZCenter]}>
                <boxGeometry args={[1, barrierHeight, arenaDepth]} />
                <meshStandardMaterial
                    color="#475569"
                    emissive="#1e293b"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
            {/* Right Barrier */}
            <mesh position={[xPos, barrierHeight / 2, arenaZCenter]}>
                <boxGeometry args={[1, barrierHeight, arenaDepth]} />
                <meshStandardMaterial
                    color="#475569"
                    emissive="#1e293b"
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Front Barrier (Behind Player) */}
            <mesh position={[0, barrierHeight / 2, FRONT_WALL_Z + 0.5]}>
                <boxGeometry args={[FIELD_WIDTH + 2, barrierHeight, 1]} />
                <meshStandardMaterial color="#475569" emissive="#1e293b" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Back Barrier (Behind Zombies) */}
            <mesh position={[0, barrierHeight / 2, BACK_WALL_Z - 0.5]}>
                <boxGeometry args={[FIELD_WIDTH + 2, barrierHeight, 1]} />
                <meshStandardMaterial color="#475569" emissive="#1e293b" emissiveIntensity={0.5} metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Tactical Glows */}
            {/* Sides */}
            <mesh position={[-xPos + 0.45, barrierHeight / 2, arenaZCenter]}>
                <boxGeometry args={[0.05, barrierHeight, arenaDepth]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
            </mesh>
            <mesh position={[xPos - 0.45, barrierHeight / 2, arenaZCenter]}>
                <boxGeometry args={[0.05, barrierHeight, arenaDepth]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
            </mesh>
            {/* Front/Back */}
            <mesh position={[0, barrierHeight / 2, FRONT_WALL_Z + 0.05]}>
                <boxGeometry args={[FIELD_WIDTH, barrierHeight, 0.05]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0, barrierHeight / 2, BACK_WALL_Z - 0.05]}>
                <boxGeometry args={[FIELD_WIDTH, barrierHeight, 0.05]} />
                <meshBasicMaterial color="#ef4444" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

export function World() {
    return (
        <>
            <color attach="background" args={['#020617']} />
            <fog attach="fog" args={['#020617', 10, 90]} />

            <ambientLight intensity={0.4} />
            <hemisphereLight args={['#818cf8', '#312e81', 1]} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.5}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />

            <Ground />
            <MapBarriers />
            <CityScenery />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={0.5} />
        </>
    );
}
