import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface BentoCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
    to: string;
    background?: ReactNode;
    delay?: number;
}

export function BentoCard({
    title,
    description,
    icon,
    children,
    className = "",
    to,
    background,
}: BentoCardProps) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { duration: 0.5, ease: "easeOut" }
                }
            }}
            className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-xl hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-accent-primary/10 transition-all duration-700 before:absolute before:inset-0 before:bg-gradient-to-tr before:from-transparent before:via-white/[0.02] before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000 after:absolute after:inset-0 after:rounded-3xl after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15)] after:pointer-events-none ${className}`}
        >
            <Link to={to} className="absolute inset-0 z-20 focus:outline-none focus:ring-2 focus:ring-accent-primary" aria-label={title}>
                <span className="sr-only">{title}</span>
            </Link>

            {/* Background Layer */}
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105 opacity-50 group-hover:opacity-100">
                {background}
                {/* Auto-generated Background Icon if not explicitly provided or to add depth */}
                {icon && (
                    <div className="absolute -right-4 -bottom-8 opacity-[0.05] text-current transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                        {/* Clone the icon and force large size by overriding className with !important */}
                        <div className="text-[10rem] leading-none [&>svg]:!w-[1em] [&>svg]:!h-[1em] [&>svg]:!max-w-none [&>svg]:!max-h-none">
                            {icon}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col h-full p-6 sm:p-8 pointer-events-none">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-surface/80 backdrop-blur-sm border border-white/10 text-accent-primary group-hover:scale-110 transition-transform duration-300 shadow-lg">
                        {icon}
                    </div>
                </div>

                <div className="mt-auto space-y-2">
                    <h3 className="text-2xl font-bold font-heading tracking-tight text-primary group-hover:translate-x-1 transition-transform duration-300">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm sm:text-base text-secondary line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                            {description}
                        </p>
                    )}
                </div>

                {children}
            </div>

            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-transparent via-transparent to-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </motion.div>
    );
}
