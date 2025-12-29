import React from 'react';

type AuroraVariant = 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'multi';

interface AuroraCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: AuroraVariant;
    isDarkMode: boolean;
}

const auroraGradients: Record<AuroraVariant, string> = {
    blue: 'from-blue-500/20 via-cyan-500/10 to-blue-600/20',
    purple: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
    cyan: 'from-cyan-400/20 via-teal-500/10 to-emerald-500/20',
    pink: 'from-pink-500/20 via-rose-500/10 to-red-500/20',
    green: 'from-emerald-500/20 via-green-500/10 to-teal-500/20',
    multi: 'from-blue-500/20 via-purple-500/15 to-pink-500/20',
};

const glowColors: Record<AuroraVariant, string> = {
    blue: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.3),inset_0_0_60px_rgba(59,130,246,0.1)]',
    purple: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.3),inset_0_0_60px_rgba(139,92,246,0.1)]',
    cyan: 'hover:shadow-[0_0_40px_rgba(34,211,238,0.3),inset_0_0_60px_rgba(34,211,238,0.1)]',
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.3),inset_0_0_60px_rgba(236,72,153,0.1)]',
    green: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.3),inset_0_0_60px_rgba(16,185,129,0.1)]',
    multi: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.3),inset_0_0_60px_rgba(59,130,246,0.1)]',
};

const borderColors: Record<AuroraVariant, string> = {
    blue: 'hover:border-blue-500/50',
    purple: 'hover:border-violet-500/50',
    cyan: 'hover:border-cyan-400/50',
    pink: 'hover:border-pink-500/50',
    green: 'hover:border-emerald-500/50',
    multi: 'hover:border-violet-500/50',
};

export function AuroraCard({ children, className = "", variant = 'blue', isDarkMode }: AuroraCardProps) {
    return (
        <div className={`relative overflow-hidden backdrop-blur-xl border transition-all duration-500 group
            ${isDarkMode 
                ? `bg-black/40 border-white/10 ${borderColors[variant]} ${glowColors[variant]}` 
                : `bg-white/60 border-white/40 shadow-lg ${borderColors[variant]}`
            } ${className}`}
        >
            {/* Aurora gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${auroraGradients[variant]} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
            
            {/* Animated aurora effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className={`absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br ${auroraGradients[variant]} blur-3xl animate-pulse`} />
                <div className={`absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl ${auroraGradients[variant]} blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
            </div>
            
            {/* Content - relative z-10 applied directly, no wrapper div */}
            {children}
        </div>
    );
}
