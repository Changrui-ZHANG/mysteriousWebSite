import { motion } from 'framer-motion'
import { useThemeManager } from '../../hooks/useThemeManager'

interface LiquidDecorationProps {
    className?: string; // For positioning (top, left, etc.)
    size?: string; // e.g. "w-64 h-64"
    color?: string; // Optional overlay color
    delay?: number;
}

export function LiquidDecoration({ className = "", size = "w-96 h-96", delay = 0 }: LiquidDecorationProps) {
    const { isDarkMode } = useThemeManager();
    return (
        <motion.div
            className={`absolute ${size} rounded-[40%] ${className} pointer-events-none z-0`}
            style={{
                backdropFilter: 'blur(40px)',
                background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)',
                boxShadow: isDarkMode
                    ? 'inset 0 0 40px rgba(255,255,255,0.05), 0 20px 40px rgba(0,0,0,0.5)'
                    : 'inset 0 0 40px rgba(255,255,255,0.8), 0 20px 40px rgba(0,0,0,0.1)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.4)',
                willChange: 'transform, border-radius',
                transform: 'translateZ(0)', // Force GPU acceleration
            }}
            animate={{
                borderRadius: [
                    "60% 40% 30% 70% / 60% 30% 70% 40%",
                    "40% 60% 60% 40% / 40% 60% 30% 60%",
                    "30% 60% 70% 40% / 50% 60% 30% 60%",
                    "60% 40% 30% 70% / 60% 30% 70% 40%"
                ],
                rotate: [0, 10, -10, 0],
                y: [0, -30, 0]
            }}
            transition={{
                duration: 20,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }}
        >
            {/* Inner Shine */}
            <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] rounded-full bg-white opacity-20 blur-2xl"></div>
        </motion.div>
    )
}
