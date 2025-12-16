import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'amber' | 'purple' | 'cyan' | 'blue' | 'white';
    className?: string;
}

const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
};

const colorClasses = {
    amber: 'border-amber-500/30 border-t-amber-500',
    purple: 'border-purple-500/30 border-t-purple-500',
    cyan: 'border-cyan-500/30 border-t-cyan-500',
    blue: 'border-blue-500/30 border-t-blue-500',
    white: 'border-white/30 border-t-white',
};

/**
 * Reusable loading spinner component
 * Configurable size and color with smooth animation
 */
export function LoadingSpinner({
    size = 'md',
    color = 'amber',
    className = ''
}: LoadingSpinnerProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-center ${className}`}
        >
            <div
                className={`
                    ${sizeClasses[size]} 
                    ${colorClasses[color]} 
                    rounded-full animate-spin
                `}
            />
        </motion.div>
    );
}

export default LoadingSpinner;
