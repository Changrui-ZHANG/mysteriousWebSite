import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface VisualEffectProps {
    isDarkMode: boolean;
}

function FlowParticles({ isDarkMode }: { isDarkMode: boolean }) {
    const count = 1000; // Reduced for performance optimization
    const mesh = useRef<THREE.Points>(null!);

    // Generate random initial positions and "speed" attributes
    const { positions, speeds } = useMemo(() => {
        const p = new Float32Array(count * 3);
        const s = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Spread particles in a wide area
            p[i * 3] = (Math.random() - 0.5) * 15;     // x
            p[i * 3 + 1] = (Math.random() - 0.5) * 10; // y
            p[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

            s[i] = Math.random(); // Random speed factor
        }
        return { positions: p, speeds: s };
    }, []);

    useFrame(() => {

        // We update the buffer attributes directly for performance
        if (mesh.current) {
            // Access the underlying buffer geometry attribute
            const positionAttribute = mesh.current.geometry.attributes.position;
            const currentPositions = positionAttribute.array;

            for (let i = 0; i < count; i++) {
                const i3 = i * 3;
                // Get current position

                // Re-read current position to modify it
                let cx = currentPositions[i3];
                let cy = currentPositions[i3 + 1];
                let cz = currentPositions[i3 + 2];

                // Constant flow based on position only, not time
                // This creates a fixed "wind" tunnel effect rather than a changing weather system
                const flowX = Math.sin(cy * 0.5) * 0.002;
                const flowY = Math.cos(cx * 0.5) * 0.002;
                const flowZ = Math.sin(cx * 0.5) * 0.001;

                // Apply constant movement
                // Base speed is now dominant and constant per particle
                cx += (0.003 + speeds[i] * 0.002) + flowX;
                cy += flowY;
                cz += flowZ;

                // Cyclic boundary: if it goes too far right, bring it to left
                if (cx > 8) cx = -8;
                if (cy > 5) cy = -5;
                if (cy < -5) cy = 5;
                if (cz > 5) cz = -5;
                if (cz < -5) cz = 5;

                // Update buffer
                currentPositions[i3] = cx;
                currentPositions[i3 + 1] = cy;
                currentPositions[i3 + 2] = cz;
            }

            // Notify Three.js that positions have changed
            positionAttribute.needsUpdate = true;
        }
    });

    return (
        <Points ref={mesh} stride={3} positions={positions}>
            <PointMaterial
                transparent
                color={isDarkMode ? "#88b0ff" : "#000000"} // Cyan in dark, Black in light for max contrast
                size={isDarkMode ? 0.02 : 0.03} // Slightly larger in light mode
                sizeAttenuation={true}
                depthWrite={false}
                opacity={isDarkMode ? 0.8 : 0.6}
                blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
            />
        </Points>
    )
}

function Bg({ isDarkMode }: { isDarkMode: boolean }) {
    return (
        <mesh scale={100}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial
                color={isDarkMode ? "#050510" : "#e0e0e0"}
                side={THREE.BackSide}
            />
        </mesh>
    )
}

export function VisualEffect({ isDarkMode }: VisualEffectProps) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            {/* Background color for the container as a seamless transition */}
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}
                style={{ background: isDarkMode ? '#020205' : '#f0f0f0', transition: 'background 0.3s ease' }}>
                <ambientLight intensity={0.5} />
                <Bg isDarkMode={isDarkMode} />
                <FlowParticles isDarkMode={isDarkMode} />
            </Canvas>
        </div>
    )
}
