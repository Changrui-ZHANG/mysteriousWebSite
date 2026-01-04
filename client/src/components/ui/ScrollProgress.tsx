import { motion, useScroll, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useThemeManager } from '../../hooks/useThemeManager'
import type { ScrollProgressProps } from './ScrollProgressProps'

export function ScrollProgress({ target }: ScrollProgressProps) {
    const { isDarkMode } = useThemeManager();
    // Set layoutEffect: false to avoid "ref not yet hydrated" warning
    const { scrollYProgress } = useScroll({ container: target, layoutEffect: false })
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const [percent, setPercent] = useState(0)

    useEffect(() => {
        return scrollYProgress.on('change', (v) => {
            setPercent(Math.round(v * 100))
        })
    }, [scrollYProgress])

    return (
        <div style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
        }}>
            <div style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                opacity: 0.5,
                marginBottom: '10px',
                color: isDarkMode ? 'white' : 'black'
            }}>
                SCROLL INDEX
            </div>

            <div style={{
                width: '2px',
                height: '100px',
                background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <motion.div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    transformOrigin: 'top',
                    background: isDarkMode ? 'white' : 'black',
                    scaleY
                }} />
            </div>

            <div style={{
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                color: isDarkMode ? 'white' : 'black',
                width: '30px',
                textAlign: 'center'
            }}>
                {percent.toString().padStart(2, '0')}
            </div>
        </div>
    )
}
