import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSound } from '../../../hooks/useSound';
import { useTheme } from '../../../hooks/useTheme';
import { useMute } from '../../../hooks/useMute';
import { FaQuestion, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GradientHeading, IconButton, MuteButton, ScoreDisplay } from '../../../components';

export default function BrickBreaker({ isDarkMode, onSubmitScore, personalBest, isAuthenticated }: { isDarkMode: boolean; onSubmitScore: (score: number) => void; personalBest?: { score: number } | null, isAuthenticated: boolean }) {
    const { t } = useTranslation();
    const theme = useTheme(isDarkMode);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);
    const { isMuted, toggleMute } = useMute();
    const { playSound } = useSound(!isMuted);

    // Flip state
    const [isFlipped, setIsFlipped] = useState(false);



    useEffect(() => {
        if ((gameState === 'gameover' || gameState === 'won') && score > 0) {
            onSubmitScore(score);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, score]);

    // Resubmit score when user logs in
    useEffect(() => {
        if (isAuthenticated && score > 0 && (gameState === 'gameover' || gameState === 'won')) {
            onSubmitScore(score);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        // Game Variables
        const paddleHeight = 15;
        const paddleWidth = 120;
        let paddleX = (canvas.width - paddleWidth) / 2;

        const ballRadius = 8;
        let x = canvas.width / 2;
        let y = canvas.height - 30;
        let dx = 4;
        let dy = -4;

        // Bricks
        const brickRowCount = 5;
        const brickColumnCount = 9;
        const brickPadding = 10;
        const brickOffsetTop = 50;
        const brickOffsetLeft = 35;
        const brickWidth = 75;
        const brickHeight = 20;

        const bricks: { x: number; y: number; status: number }[][] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        // Colors
        const ballColor = isDarkMode ? '#22d3ee' : '#0891b2'; // Cyan
        const paddleColor = isDarkMode ? '#e879f9' : '#c026d3'; // Fuchsia

        const drawBall = () => {
            if (!ctx) return;
            ctx.beginPath();
            ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = ballColor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ballColor;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;
        };

        const drawPaddle = () => {
            if (!ctx) return;
            ctx.beginPath();
            ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
            ctx.fillStyle = paddleColor;
            ctx.shadowBlur = 10;
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
                        ctx.rect(brickX, brickY, brickWidth, brickHeight);
                        ctx.fillStyle = `hsl(${c * 40}, 70 %, 50 %)`; // Rainbow rainbow rows
                        ctx.fill();
                        ctx.closePath();
                    }
                }
            }
        };

        const collisionDetection = () => {
            let hitBrick = false;
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                            dy = -dy;
                            b.status = 0;
                            setScore(prev => prev + 10);
                            hitBrick = true; // Mark hit but don't play sound yet

                            // Check win condition
                            let activeBricks = 0;
                            for (let i = 0; i < brickColumnCount; i++) {
                                for (let j = 0; j < brickRowCount; j++) {
                                    if (bricks[i][j].status === 1) activeBricks++;
                                }
                            }
                            if (activeBricks === 0) {
                                setGameState('won');
                                playSound('win');
                                return; // Exit immediately on win
                            }
                        }
                    }
                }
            }
            if (hitBrick) {
                playSound('break');
            }
        };

        const draw = () => {
            if (!ctx || gameState !== 'playing') {
                // Draw static frame if not playing
                if (gameState !== 'playing') {
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        drawBricks();
                        drawPaddle();
                        drawBall();
                    }
                    return;
                }
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBricks();
            drawBall();
            drawPaddle();
            collisionDetection();

            // Wall collisions
            if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
                dx = -dx;
                playSound('hit');
            }
            if (y + dy < ballRadius) {
                dy = -dy;
                playSound('hit');
            } else if (y + dy > canvas.height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                    // Speed up slightly on hit
                    dx = dx * 1.05;
                    dy = dy * 1.05;
                    playSound('hit');
                } else {
                    setGameState('gameover');
                    playSound('gameover');
                    return;
                }
            }

            x += dx;
            y += dy;

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
            e.preventDefault(); // Prevent scrolling while playing
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
            // Initial draw for start screen
            drawBall();
            drawPaddle();
            drawBricks();
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
            document.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
        };
    }, [gameState, isDarkMode]);


    return (
        <div className="w-full h-full" style={{ perspective: '1000px' }}>
            <motion.div
                className="w-full h-full relative"
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
                        <IconButton
                            icon={<FaQuestion />}
                            onClick={() => setIsFlipped(true)}
                            color="cyan"
                            title="Rules"
                        />
                        <MuteButton
                            isMuted={isMuted}
                            onToggle={toggleMute}
                        />
                    </div>

                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={500}
                        className="w-full h-full object-contain cursor-none touch-action-none"
                    />

                    {gameState !== 'playing' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10 p-8 text-center">
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
                        </div>
                    )}
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

                    <div className="flex-1 overflow-y-auto space-y-6 text-left">
                        <section>
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">🎯 {t('game.brick_breaker')}</h3>
                            <p className="text-white/80 leading-relaxed">
                                {t('game.brick_breaker_rules')}
                            </p>
                        </section>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">🎮</span>
                                <h4 className="font-bold text-white mb-1">{t('game.controls')}</h4>
                                <p className="text-sm text-white/60">{t('game.brick_breaker_controls')}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg">
                                <span className="block text-2xl mb-2">⭐</span>
                                <h4 className="font-bold text-white mb-1">{t('game.bonus')}</h4>
                                <p className="text-sm text-white/60">{t('game.brick_breaker_bonus')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
