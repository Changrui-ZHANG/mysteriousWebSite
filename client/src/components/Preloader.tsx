import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

export function Preloader() {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        background: '#000',
                        color: 'white',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'Outfit, sans-serif'
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: 200 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                            style={{ height: '2px', background: 'white', marginBottom: '1rem', margin: '0 auto' }}
                        />
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{ fontSize: '2rem', letterSpacing: '0.5em', textTransform: 'uppercase' }}
                        >
                            Loading
                        </motion.h1>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
