import React from 'react';

type AuroraVariant = 'blue' | 'purple' | 'cyan' | 'pink' | 'green' | 'multi';

interface AuroraCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: AuroraVariant;
}

const auroraGradients: Record<AuroraVariant, string> = {
    blue: 'from-accent-primary/20 via-accent-info/10 to-accent-primary/20',
    purple: 'from-accent-secondary/20 via-accent-secondary/10 to-accent-primary/20',
    cyan: 'from-accent-info/20 via-accent-info/10 to-accent-success/20',
    pink: 'from-accent-danger/20 via-accent-danger/10 to-accent-warning/20',
    green: 'from-accent-success/20 via-accent-success/10 to-accent-info/20',
    multi: 'from-accent-primary/20 via-accent-secondary/15 to-accent-danger/20',
};

const auroraVariantClasses: Record<AuroraVariant, string> = {
    blue: 'aurora-card--primary',
    purple: 'aurora-card--secondary',
    cyan: 'aurora-card--info',
    pink: 'aurora-card--danger',
    green: 'aurora-card--success',
    multi: 'aurora-card--multi',
};

export function AuroraCard({ children, className = "", variant = 'blue' }: AuroraCardProps) {
    return (
        <div className={`aurora-card group ${auroraVariantClasses[variant]} ${className}`}>
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
