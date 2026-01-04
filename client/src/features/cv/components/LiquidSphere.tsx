import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, GradientTexture } from '@react-three/drei';
import * as THREE from 'three';

import { useThemeManager } from '../../../hooks/useThemeManager';

interface LiquidSphereProps { }

export function LiquidSphere({ }: LiquidSphereProps) {
    const { isDarkMode } = useThemeManager();
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();
        mesh.current.rotation.x = Math.cos(time / 8) * 0.08;
        mesh.current.rotation.y = Math.sin(time / 6) * 0.08;
    });

    return (
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
            <Sphere ref={mesh} args={[1, 100, 100]} scale={2.5}>
                <MeshDistortMaterial
                    color={isDarkMode ? "#0071e3" : "#3b82f6"}
                    speed={1.5}
                    distort={0.18}
                    radius={1}
                >
                    <GradientTexture
                        stops={[0, 1]}
                        colors={isDarkMode ? ['#000000', '#0071e3'] : ['#ffffff', '#3b82f6']}
                    />
                </MeshDistortMaterial>
            </Sphere>
        </Float>
    );
}
