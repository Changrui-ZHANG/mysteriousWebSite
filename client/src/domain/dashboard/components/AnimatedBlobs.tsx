/**
 * AnimatedBlobs - Atmospheric drifting color blobs for glass effect background
 */

import { motion } from 'framer-motion';

const BLOB_CONFIGS = [
    {
        position: "absolute top-0 left-[-10%] w-[50%] h-[50%]",
        color: "bg-purple-600/10",
        animation: { x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.9, 1] },
        duration: 20
    },
    {
        position: "absolute bottom-0 right-[-10%] w-[50%] h-[50%]",
        color: "bg-blue-600/10",
        animation: { x: [0, -40, 30, 0], y: [0, 50, -20, 0], scale: [1, 1.2, 0.8, 1] },
        duration: 25
    },
    {
        position: "absolute top-[20%] right-[10%] w-[30%] h-[30%]",
        color: "bg-cyan-500/5",
        animation: { x: [0, 20, -40, 0], y: [0, 60, -30, 0] },
        duration: 18
    }
];

export function AnimatedBlobs() {
    return (
        <>
            {BLOB_CONFIGS.map((blob, i) => (
                <motion.div
                    key={i}
                    animate={blob.animation}
                    transition={{ duration: blob.duration, repeat: Infinity, ease: "linear" }}
                    className={`${blob.position} ${blob.color} rounded-full blur-[120px] pointer-events-none`}
                />
            ))}
        </>
    );
}
