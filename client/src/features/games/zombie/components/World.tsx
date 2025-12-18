import { Stars } from '@react-three/drei';
import { useMemo } from 'react';

import { FIELD_DEPTH } from '../constants';

export function Ground() {
    // Cyberpunk Grid Floor
    return (
        <group>
            {/* Infinite-looking Grid */}
            <gridHelper args={[200, 50, '#4c1d95', '#2e1065']} position={[0, 0.01, 0]} />

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
            <CityScenery />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={0.5} />
        </>
    );
}
