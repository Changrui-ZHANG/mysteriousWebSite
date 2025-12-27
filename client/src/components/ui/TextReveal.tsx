import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface TextRevealProps {
    children: string;
    className?: string;
    style?: React.CSSProperties;
}

export function TextReveal({ children, className, style }: TextRevealProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" })

    // Split text into words
    const words = children.split(" ")

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100,
            },
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
            style={{ display: 'flex', flexWrap: 'wrap', ...style }}
        >
            {words.map((word, index) => (
                <motion.span variants={child} key={index} style={{ marginRight: '0.25em' }}>
                    {word}
                </motion.span>
            ))}
        </motion.div>
    )
}
