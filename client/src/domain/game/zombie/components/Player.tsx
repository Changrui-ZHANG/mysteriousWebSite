import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Player({ positionRef }: { positionRef: React.MutableRefObject<THREE.Vector3> }) {
    const group = useRef<THREE.Group>(null);

    useFrame(() => {
        if (group.current && positionRef.current) {
            group.current.position.copy(positionRef.current);
        }
    });

    return (
        <group ref={group}>
            {/* Player Light - Visibility Fix */}
            <pointLight intensity={5} distance={15} color="#60a5fa" />

            {/* Turret Body */}
            <mesh position={[0, 0.75, 0]} castShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color="#3b82f6" metalness={0.5} roughness={0.2} emissive="#1d4ed8" emissiveIntensity={0.5} />
            </mesh>
            {/* Barrel */}
            <mesh position={[0, 0.75, -1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.3, 0.3, 1.5, 16]} />
                <meshStandardMaterial color="#60a5fa" metalness={0.8} roughness={0.2} emissive="#60a5fa" emissiveIntensity={0.8} />
            </mesh>
        </group>
    );
}
