/**
 * FloatingParticles - Decorative floating particles for atmospheric effect
 * Used in HomePage background
 */

import { motion } from 'framer-motion';

const PARTICLE_COUNT = 12;

export function FloatingParticles() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[...Array(PARTICLE_COUNT)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        opacity: 0,
                        scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{
                        y: ["-10%", "110%"],
                        x: [Math.random() * 100 + "%", (Math.random() * 20 - 10) + "%"],
                        opacity: [0, 0.3, 0]
                    }}
                    transition={{
                        duration: Math.random() * 20 + 20,
                        repeat: Infinity,
                        delay: Math.random() * 20,
                        ease: "linear"
                    }}
                    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
}
