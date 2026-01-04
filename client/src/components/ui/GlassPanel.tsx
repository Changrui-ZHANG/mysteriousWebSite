import React from 'react';

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
    return (
        <div className={`backdrop-blur-surface border transition-all duration-700 group hover:shadow-lg
            bg-surface-translucent border-default hover:border-accent-primary/30
            ${className}`}>
            {children}
        </div>
    );
}