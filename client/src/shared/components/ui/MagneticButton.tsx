import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MagneticButtonProps } from './MagneticButtonProps'

export default function MagneticButton({ children, onClick }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return
        const { clientX, clientY } = e
        const { width, height, left, top } = ref.current.getBoundingClientRect()
        const x = clientX - (left + width / 2)
        const y = clientY - (top + height / 2)
        setPosition({ x, y })
    }

    const reset = () => {
        setPosition({ x: 0, y: 0 })
    }

    return (
        <motion.div
            className="relative inline-block"
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x * 0.5, y: position.y * 0.5 }} // Move container slightly
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            <motion.button
                onClick={onClick}
                animate={{ x: position.x * 0.8, y: position.y * 0.8 }} // Move button slightly more/less
                transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
                className={`py-6 px-12 text-xl rounded-full border-none cursor-pointer font-semibold uppercase tracking-widest relative z-10 overflow-hidden transition-colors duration-300 
                    bg-accent-primary text-inverse
                    hover:opacity-90
                `}
            >
                {children}
            </motion.button>
        </motion.div>
    )
}
