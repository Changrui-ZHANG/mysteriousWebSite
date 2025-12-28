import React from 'react';

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
    isDarkMode: boolean;
}

export function GlassPanel({ children, className = "", isDarkMode }: GlassPanelProps) {
    return (
        <div className={`backdrop-blur-3xl border transition-all duration-700 group hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] ${isDarkMode
            ? 'bg-black/40 border-white/10 hover:border-blue-500/50 hover:bg-black/60'
            : 'bg-white/40 border-white/40 shadow-xl hover:border-blue-500/30 hover:bg-white/60'
            } ${className}`}>
            {children}
        </div>
    );
}