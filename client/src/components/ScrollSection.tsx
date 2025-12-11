import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollSectionProps {
    children: ReactNode;
    className?: string;
}

export function ScrollSection({ children, className }: ScrollSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-20%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`${className} p-4 md:p-16`}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                boxSizing: 'border-box'
            }}
        >
            {children}
        </motion.div>
    );
}
