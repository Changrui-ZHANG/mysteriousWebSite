import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = '',
    hoverEffect = false,
    onClick
}) => {
    return (
        <div
            className={`
                glass-panel 
                ${hoverEffect ? 'glass-panel-hover cursor-pointer' : ''} 
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export const LiquidBackground: React.FC = () => {
    return (
        <div className="liquid-background">
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
            <div className="liquid-blob"></div>
        </div>
    );
};
