import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

interface TiltCardProps {
    children: React.ReactNode;
    style?: React.CSSProperties;
    isDarkMode: boolean;
}

export function TiltCard({ children, style, isDarkMode }: TiltCardProps) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
                ...style
            }}
            whileHover={{ scale: 1.05 }}
            className="tilt-card"
        >
            <div
                className={`h-full p-8 rounded-3xl backdrop-blur-md border shadow-2xl transition-colors duration-300 ${isDarkMode
                        ? 'bg-white/5 border-white/10 shadow-black/50'
                        : 'bg-black/5 border-black/10 shadow-black/10'
                    }`}
                style={{
                    transform: "translateZ(50px)",
                    transformStyle: "preserve-3d",
                }}
            >
                {children}
            </div>
        </motion.div>
    );
}
