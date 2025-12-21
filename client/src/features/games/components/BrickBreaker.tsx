import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../../hooks/useSound';
import { useBGM } from '../../../hooks/useBGM';
import { useBGMVolume } from '../../../hooks/useBGMVolume';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { FaQuestion, FaArrowLeft, FaExpand, FaCompress } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useFullScreen } from '../../../hooks/useFullScreen';
import { GradientHeading, ScoreDisplay } from '../../../components';
import ElasticSlider from '../../../components/ElasticSlider/ElasticSlider';

export default function BrickBreaker({ isDarkMode, onSubmitScore, personalBest, isAuthenticated }: { isDarkMode: boolean; onSubmitScore: (score: number) => void; personalBest?: { score: number } | null, isAuthenticated: boolean }) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);
    const { volume, setVolume } = useBGMVolume(0.4);
    const containerRef = useRef<HTMLDivElement>(null);
    const { isFullScreen, toggleFullScreen } = useFullScreen(containerRef);
    useBGM('https://cdn.pixabay.com/audio/2025/02/17/audio_f01b9210e8.mp3', !isMuted && gameState === 'playing', volume);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (score > 0 && (gameState === 'gameover' || gameState === 'won')) {
            onSubmitScore(score);
        }
    }, [gameState, score, isAuthenticated, onSubmitScore]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // --- GAME CONFIG & STATE ---
        const paddleHeight = 15;
        let paddleWidth = 140; // Slightly wider for better control
        let paddleX = (canvas.width - paddleWidth) / 2;

        interface Ball {
            x: number;
            y: number;
            dx: number;
            dy: number;
            radius: number;
            trail: { x: number, y: number }[];
        }

        interface PowerUp {
            x: number;
            y: number;
            dy: number;
            type: 'multi' | 'wide' | 'extra';
        }

        let balls: Ball[] = [{
            x: canvas.width / 2,
            y: canvas.height - 30,
            dx: 4,
            dy: -4,
            radius: 6, // Smaller balls for "Many Bricks" feel
            trail: []
        }];

        let powerUps: PowerUp[] = [];

        const brickRowCount = 8; // More rows
        const brickColumnCount = 12; // More columns
        const brickPadding = 6;
        const brickOffsetTop = 60;
        const brickOffsetLeft = 30;
        const brickWidth = (canvas.width - (brickOffsetLeft * 2) - (brickColumnCount * brickPadding)) / brickColumnCount;
        const brickHeight = 18;

        const bricks: { x: number; y: number; status: number; color: string }[][] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1,
                    color: `hsl(${c * (360 / brickColumnCount)}, 70%, 50%)`
                };
            }
        }

        const ballColor = isDarkMode ? '#22d3ee' : '#0891b2';
        const paddleColor = isDarkMode ? '#e879f9' : '#c026d3';

        // --- DRAWING FUNCTIONS ---
        const drawBall = (ball: Ball) => {
            if (!ctx) return;

            // Draw Trail
            ctx.beginPath();
            ball.trail.forEach((pos, i) => {
                const alpha = (i / ball.trail.length) * 0.3;
                ctx.fillStyle = isDarkMode ? `rgba(34, 211, 238, ${alpha})` : `rgba(8, 145, 178, ${alpha})`;
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, ball.radius * (i / ball.trail.length), 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ballColor;
            ctx.shadowBlur = 8;
            ctx.shadowColor = ballColor;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawPaddle = () => {
            if (!ctx) return;
            ctx.beginPath();
            ctx.roundRect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight, 8);
            ctx.fillStyle = paddleColor;
            ctx.shadowBlur = 15;
            ctx.shadowColor = paddleColor;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawBricks = () => {
            if (!ctx) return;
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    if (bricks[c][r].status === 1) {
                        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                        bricks[c][r].x = brickX;
                        bricks[c][r].y = brickY;
                        ctx.beginPath();
                        ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
                        ctx.fillStyle = bricks[c][r].color;
                        ctx.fill();
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
        };

        const drawPowerUps = () => {
            powerUps.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = p.type === 'multi' ? '#facc15' : p.type === 'wide' ? '#4ade80' : '#f87171';
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : p.type === 'wide' ? '+' : '!', p.x, p.y + 4);
                ctx.closePath();
            });
        };

        // --- GAME LOGIC ---
        const spawnPowerUp = (x: number, y: number) => {
            if (Math.random() < 0.15) { // 15% drop rate
                const types: ('multi' | 'wide' | 'extra')[] = ['multi', 'wide'];
                const type = types[Math.floor(Math.random() * types.length)];
                powerUps.push({ x, y, dy: 2, type });
            }
        };

        const handlePowerUp = (type: 'multi' | 'wide' | 'extra') => {
            if (type === 'multi') {
                // Triple current balls
                const currentBalls = [...balls];
                currentBalls.forEach(b => {
                    balls.push(
                        { ...b, dx: b.dx + (Math.random() - 0.5) * 2, dy: -Math.abs(b.dy) },
                        { ...b, dx: b.dx - (Math.random() - 0.5) * 2, dy: -Math.abs(b.dy) }
                    );
                });
                playSound('powerup');
            } else if (type === 'wide') {
                paddleWidth = Math.min(paddleWidth + 40, 250);
                setTimeout(() => { paddleWidth = 140; }, 8000);
                playSound('powerup');
            }
        };

        const draw = () => {
            if (!ctx) return;
            if (gameState !== 'playing') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawBricks();
                drawPaddle();
                balls.forEach(drawBall);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            balls.forEach(drawBall);
            drawPaddle();
            drawPowerUps();

            // Handle PowerUps
            powerUps = powerUps.filter(p => {
                p.y += p.dy;
                // Collision with paddle
                if (p.y + 10 > canvas.height - paddleHeight - 5 && p.x > paddleX && p.x < paddleX + paddleWidth) {
                    handlePowerUp(p.type);
                    return false;
                }
                return p.y < canvas.height;
            });

            // Handle Ball Movement & Collisions
            balls = balls.filter(ball => {
                // Update Trail
                ball.trail.push({ x: ball.x, y: ball.y });
                if (ball.trail.length > 5) ball.trail.shift();

                // Wall Collisions
                if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
                    ball.dx = -ball.dx;
                    playSound('hit');
                }
                if (ball.y + ball.dy < ball.radius) {
                    ball.dy = -ball.dy;
                    playSound('hit');
                } else if (ball.y + ball.dy > canvas.height - ball.radius - 5) {
                    // Paddle Collision
                    if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                        // ADVANCED PHYSICS: Change DX based on impact point
                        const impactPos = (ball.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                        ball.dx = impactPos * 7; // Max horizontal speed 7
                        ball.dy = -Math.abs(ball.dy);

                        // Slightly increase speed
                        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                        if (speed < 12) {
                            ball.dx *= 1.01;
                            ball.dy *= 1.01;
                        }
                        playSound('hit');
                    } else {
                        // Ball Lost
                        return false;
                    }
                }

                // Brick Collisions
                for (let c = 0; c < brickColumnCount; c++) {
                    for (let r = 0; r < brickRowCount; r++) {
                        const b = bricks[c][r];
                        if (b.status === 1) {
                            if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                                ball.dy = -ball.dy;
                                b.status = 0;
                                setScore(prev => prev + 10);
                                spawnPowerUp(b.x + brickWidth / 2, b.y + brickHeight / 2);
                                playSound('break');
                            }
                        }
                    }
                }

                ball.x += ball.dx;
                ball.y += ball.dy;
                return true;
            });

            // Win/Loss Condition
            if (balls.length === 0) {
                setGameState('gameover');
                playSound('gameover');
                return;
            }

            let activeBricks = 0;
            bricks.forEach(col => col.forEach(b => { if (b.status === 1) activeBricks++; }));
            if (activeBricks === 0) {
                setGameState('won');
                playSound('win');
                return;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const relativeX = (e.clientX - rect.left) * scaleX;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const relativeX = (touch.clientX - rect.left) * scaleX;
            if (relativeX > 0 && relativeX < canvas.width) {
                paddleX = relativeX - paddleWidth / 2;
            }
        };

        if (gameState === 'playing') {
            draw();
            document.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        } else {
            // Initial/Reset state
            balls = [{
                x: canvas.width / 2,
                y: canvas.height - 30,
                dx: 4,
                dy: -4,
                radius: 6,
                trail: []
            }];
            paddleWidth = 140;
            powerUps = [];
            drawBricks();
            drawPaddle();
            balls.forEach(drawBall);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, [gameState, isDarkMode, playSound]);

    return (
        <div ref={containerRef} className={`w-full h-full flex flex-col ${isFullScreen ? 'bg-slate-900 overflow-auto py-8' : ''}`} style={{ perspective: '1000px' }}>
            {/* EXTERNAL GLOBAL CONTROLS */}
            <div className="flex justify-end items-center gap-2 p-2 bg-black/40 backdrop-blur-md border-b border-white/10 z-[100] rounded-t-xl mx-4 mt-4">
                <div className="w-32 mr-2 flex items-center">
                    <ElasticSlider
                        defaultValue={volume * 100}
                        onChange={(v) => setVolume(v / 100)}
                        color="cyan"
                        isMuted={isMuted}
                        onToggleMute={toggleMute}
                    />
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title={isFullScreen ? "Quitter le plein écran" : "Plein écran"}
                >
                    {isFullScreen ? <FaCompress size={18} /> : <FaExpand size={18} />}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFlipped(prev => !prev); }}
                    className="text-cyan-400 p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
                    title="Aide / Règles"
                >
                    <FaQuestion size={18} />
                </button>
            </div>

            <motion.div
                className="flex-1 w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Front Face (Game) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center border border-white/20 rounded-xl backdrop-blur-md overflow-hidden transition-colors duration-500 ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="absolute top-4 left-6 text-xl font-bold font-mono z-20 flex gap-4">
                        <ScoreDisplay
                            score={score}
                            personalBest={personalBest}
                            color="cyan"
                        />
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        className="w-full h-full object-contain cursor-none touch-action-none"
                    />

                    <AnimatePresence>
                        {gameState !== 'playing' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-8 text-center"
                            >
                                {gameState === 'start' && (
                                    <>
                                        <GradientHeading gradient="cyan-purple" level={2} className="mb-4 md:mb-6">
                                            {t('game.brick_breaker')}
                                        </GradientHeading>
                                        <p className="text-white/80 mb-6 md:mb-8 font-serif text-base md:text-xl">{t('game.brick_breaker_desc')}</p>
                                        <button
                                            onClick={() => { setScore(0); setGameState('playing'); playSound('click'); }}
                                            className="px-8 py-3 bg-cyan-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                                        >
                                            {t('game.start_game')}
                                        </button>
                                    </>
                                )}
                                {gameState === 'gameover' && (
                                    <>
                                        <h2 className="text-4xl md:text-6xl font-black font-heading text-red-500 mb-4">{t('game.game_over')}</h2>
                                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">{t('game.final_score')}: {score}</p>
                                        <button
                                            onClick={() => { setScore(0); setGameState('playing'); playSound('click'); }}
                                            className="px-8 py-3 bg-red-500 text-white font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                                        >
                                            {t('game.try_again')}
                                        </button>
                                    </>
                                )}
                                {gameState === 'won' && (
                                    <>
                                        <h2 className="text-4xl md:text-6xl font-black font-heading text-green-400 mb-4">{t('game.you_win')}</h2>
                                        <p className="text-white/80 mb-6 md:mb-8 font-mono text-lg md:text-2xl">{t('game.final_score')}: {score}</p>
                                        <button
                                            onClick={() => { setScore(0); setGameState('playing'); playSound('click'); }}
                                            className="px-8 py-3 bg-green-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                                        >
                                            {t('game.play_again')}
                                        </button>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Back Face (Rules) */}
                <div
                    className={`absolute inset-0 w-full h-full flex flex-col p-8 border border-white/20 rounded-xl backdrop-blur-md overflow-hidden ${theme.bgCard}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <GradientHeading gradient="cyan-purple" level={2}>
                            {t('game.brick_breaker')} - {t('game.arcade_zone')}
                        </GradientHeading>
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <FaArrowLeft className="text-white text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent pr-2">
                        <section className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
                                <span className="bg-cyan-500/20 p-2 rounded-lg">🎯</span>
                                {t('game.objective')}
                            </h3>
                            <p className="text-white/80 leading-relaxed text-sm md:text-base">
                                {t('game.brick_breaker_rules')}
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">🎮</span>
                                    <h4 className="font-bold text-white">{t('game.controls')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_controls')}</p>
                            </div>
                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:border-yellow-500/30 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl bg-white/10 p-2 rounded-xl">⭐</span>
                                    <h4 className="font-bold text-white">{t('game.bonus')}</h4>
                                </div>
                                <p className="text-sm text-white/60 leading-relaxed">{t('game.brick_breaker_bonus')}</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-4 rounded-xl border-l-4 border-cyan-400">
                            <p className="text-xs md:text-sm text-cyan-200 italic">
                                💡 {t('game.match3_speed')}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
