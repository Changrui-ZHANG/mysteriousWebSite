import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardGridProps {
    children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[300px]"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.1
                        }
                    }
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
