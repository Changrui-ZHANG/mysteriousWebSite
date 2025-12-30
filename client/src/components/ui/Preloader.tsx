import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useTranslation } from 'react-i18next';

interface PreloaderProps { }

export function Preloader({ }: PreloaderProps) {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (!isLoading) return;

        // 1. Ambient Liquid Blobs Animation
        const blobs = containerRef.current?.querySelectorAll('.liquid-blob');
        if (blobs) {
            blobs.forEach((blob) => {
                const animate = () => {
                    gsap.to(blob, {
                        x: gsap.utils.random(-150, 150),
                        y: gsap.utils.random(-150, 150),
                        scale: gsap.utils.random(0.8, 1.5),
                        duration: gsap.utils.random(10, 20),
                        ease: "sine.inOut",
                        onComplete: animate
                    });
                };
                animate();
            });
        }

        // 2. Shimmer Effect on Text
        if (textRef.current) {
            gsap.to(textRef.current, {
                backgroundPosition: "200% center",
                duration: 4,
                repeat: -1,
                ease: "none"
            });
        }

        // 3. Exit Sequence
        const exitTimer = setTimeout(() => {
            const tl = gsap.timeline({
                onComplete: () => setIsLoading(false)
            });

            tl.to(".preloader-content", {
                opacity: 0,
                y: -20,
                duration: 0.8,
                ease: "power2.inOut"
            })
                .to(".preloader-bg", {
                    opacity: 0,
                    duration: 1.2,
                    ease: "power1.inOut"
                }, "-=0.4");
        }, 3000);

        return () => {
            clearTimeout(exitTimer);
            gsap.killTweensOf(".liquid-blob");
            if (textRef.current) gsap.killTweensOf(textRef.current);
        };
    }, [isLoading]);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden font-outfit bg-[--color-bg-base]`}
                >
                    {/* Ambient Liquid Background - using accent vars */}
                    <div ref={containerRef} className="preloader-bg absolute inset-0 overflow-hidden pointer-events-none">
                        <div className={`liquid-blob absolute top-[10%] left-[20%] w-[60vw] h-[60vw] blur-[120px] rounded-full bg-[--color-accent-primary] opacity-20`} />
                        <div className={`liquid-blob absolute bottom-[10%] right-[20%] w-[50vw] h-[50vw] blur-[100px] rounded-full bg-[--color-accent-cyan] opacity-20`} />
                        <div className={`liquid-blob absolute top-[40%] right-[10%] w-[40vw] h-[40vw] blur-[130px] rounded-full bg-[--color-accent-purple] opacity-15`} />
                        <div className={`liquid-blob absolute bottom-[30%] left-[5%] w-[45vw] h-[45vw] blur-[110px] rounded-full bg-[--color-accent-pink] opacity-15`} />
                    </div>

                    {/* Subtle Noise Texture */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                    {/* Minimalist Glass Content */}
                    <div className="preloader-content relative z-10 flex flex-col items-center">
                        {/* CZ Initials - Very subtle and floating */}
                        <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 0.15, y: 0 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`text-6xl font-black tracking-tighter mb-4 text-[--color-text-primary]`}
                        >
                            {t('preloader.welcome')}
                        </motion.span>

                        {/* LOADING text with Shimmer */}
                        <h2
                            ref={textRef}
                            className={`text-sm tracking-[1em] font-light uppercase select-none p-4 backdrop-blur-[2px]
                                bg-gradient-to-r from-transparent via-[--color-text-primary] to-transparent 
                                bg-[length:200%_auto] bg-clip-text text-transparent opacity-80
                            `}
                        >
                            {t('preloader.loading')}
                        </h2>

                        {/* Ultra-thin breathing line */}
                        <motion.div
                            animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.2, 0.4, 0.2] }}
                            transition={{ duration: 4, repeat: -1, ease: "easeInOut" }}
                            className={`mt-6 w-32 h-[1px] bg-gradient-to-r from-transparent to-transparent via-[--color-text-primary]`}
                        />
                    </div>

                    {/* Final Vignette Layer */}
                    <div className={`absolute inset-0 pointer-events-none 
                        bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-bg-base)_100%)]
                    `} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
