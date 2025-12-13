import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function BrickBreaker({ isDarkMode, onSubmitScore, personalBest, isAuthenticated }: { isDarkMode: boolean; onSubmitScore: (score: number) => void; personalBest?: { score: number } | null, isAuthenticated: boolean }) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'won'>('start');
    const [score, setScore] = useState(0);

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
            for (let c = 0; c < brickColumnCount; c++) {
                for (let r = 0; r < brickRowCount; r++) {
                    const b = bricks[c][r];
                    if (b.status === 1) {
                        if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                            dy = -dy;
                            b.status = 0;
                            setScore(prev => prev + 10);

                            // Check win condition
                            let activeBricks = 0;
                            for (let i = 0; i < brickColumnCount; i++) {
                                for (let j = 0; j < brickRowCount; j++) {
                                    if (bricks[i][j].status === 1) activeBricks++;
                                }
                            }
                            if (activeBricks === 0) setGameState('won');
                        }
                    }
                }
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
            }
            if (y + dy < ballRadius) {
                dy = -dy;
            } else if (y + dy > canvas.height - ballRadius) {
                if (x > paddleX && x < paddleX + paddleWidth) {
                    dy = -dy;
                    // Speed up slightly on hit
                    dx = dx * 1.05;
                    dy = dy * 1.05;
                } else {
                    setGameState('gameover');
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
        <div className={`relative w - full h - full flex flex - col items - center justify - center border border - white / 20 rounded - xl backdrop - blur - md overflow - hidden transition - colors duration - 500 ${isDarkMode ? 'bg-black/80' : 'bg-white/80'} `}>
            <div className="absolute top-4 left-6 text-xl font-bold font-mono z-10 flex gap-4">
                <span className="text-cyan-400">
                    {t('game.score')}: {score}
                    {personalBest && personalBest.score !== undefined && (
                        <span className="ml-3 text-lg text-purple-400 opacity-80">
                            ({t('game.best')}: {Math.max(score, personalBest.score)})
                        </span>
                    )}
                </span>
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
                            <h2 className="text-3xl md:text-5xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4 md:mb-6">
                                {t('game.brick_breaker')}
                            </h2>
                            <p className="text-white/80 mb-6 md:mb-8 font-serif text-base md:text-xl">{t('game.brick_breaker_desc')}</p>
                            <button
                                onClick={() => { setScore(0); setGameState('playing'); }}
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
                                onClick={() => { setScore(0); setGameState('playing'); }}
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
                                onClick={() => { setScore(0); setGameState('playing'); }}
                                className="px-8 py-3 bg-green-500 text-black font-bold text-xl rounded-full hover:scale-110 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.6)]"
                            >
                                {t('game.play_again')}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
