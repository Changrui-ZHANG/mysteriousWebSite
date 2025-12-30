import React from 'react';

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
    return (
        <div className={`backdrop-blur-[--glass-blur] border transition-all duration-700 group hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] 
            bg-[--color-glass-bg] border-[--color-border-default] shadow-xl hover:border-blue-500/30
            ${className}`}>
            {children}
        </div>
    );
}