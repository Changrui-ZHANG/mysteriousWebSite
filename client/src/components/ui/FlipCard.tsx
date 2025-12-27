import React from 'react';
import { motion } from 'framer-motion';

interface FlipCardProps {
    front: React.ReactNode;
    back: React.ReactNode;
    isFlipped: boolean;
    className?: string;
    /** Duration of the flip animation in seconds */
    duration?: number;
}

/**
 * Reusable 3D flip card component.
 * Used in game components to show rules on the back.
 */
export function FlipCard({
    front,
    back,
    isFlipped,
    className = '',
    duration = 0.6,
}: FlipCardProps) {
    return (
        <div className={`w-full h-full ${className}`} style={{ perspective: '1000px' }}>
            <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {front}
                </div>

                {/* Back Face */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    {back}
                </div>
            </motion.div>
        </div>
    );
}
