/**
 * useBrickBreakerEngine - Game engine hook for brick breaker
 * Handles canvas rendering, physics, and game loop
 */

import { useEffect, useRef, MutableRefObject } from 'react';
import { useThemeManager } from '../../../shared/hooks/useThemeManager';
import {
    BALL_CONFIG,
    PADDLE_CONFIG,
    BRICK_CONFIG,
    POWERUP_CONFIG,
    VISUAL_CONFIG,
    AUDIO_CONFIG,
    type GameState,
    type SoundType,
} from '../components/brickbreaker/constants';
import { generateMap } from '../utils/brickBreakerMaps';

interface PowerUp { x: number; y: number; dy: number; type: 'multi' | 'wide'; }

interface UseBrickBreakerEngineProps {
    canvasRef: MutableRefObject<HTMLCanvasElement | null>;
    containerRef: MutableRefObject<HTMLDivElement | null>;
    paddleWidthRef: MutableRefObject<number>;
    paddleWidthTimeoutRef: MutableRefObject<number | null>;
    gameState: GameState;
    setGameState: (state: GameState) => void;
    setPoints: React.Dispatch<React.SetStateAction<number>>;
    selectedMap: number;
    randomMapData: number[][] | null;
    playSound: (sound: SoundType) => void;
}

export function useBrickBreakerEngine({
    canvasRef, containerRef, paddleWidthRef, paddleWidthTimeoutRef,
    gameState, setGameState, setPoints, selectedMap, randomMapData, playSound,
}: UseBrickBreakerEngineProps) {
    const { isDarkMode } = useThemeManager();
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const updateCanvasSize = () => {
            // Use client dimensions which are more reliable for canvas buffers
            // Fallback to min-height/width if client dimensions are zero
            const width = Math.min(container.clientWidth || 400, window.innerWidth);
            const height = container.clientHeight || 400;

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        };
        updateCanvasSize();

        // Debounce resize slightly for performance
        let resizeTimer: number;
        const handleResize = () => {
            window.clearTimeout(resizeTimer);
            resizeTimer = window.setTimeout(updateCanvasSize, 100);
        };
        window.addEventListener('resize', handleResize);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        if (gameState !== 'playing') {
            paddleWidthRef.current = PADDLE_CONFIG.DEFAULT_WIDTH;
            setPoints(0);
            if (paddleWidthTimeoutRef.current !== null) { clearTimeout(paddleWidthTimeoutRef.current); paddleWidthTimeoutRef.current = null; }
        }

        const paddleHeight = PADDLE_CONFIG.HEIGHT;
        let paddleX = (canvas.width - paddleWidthRef.current) / 2;

        // Ball arrays
        const ballsX = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsY = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsDX = new Float32Array(BALL_CONFIG.MAX_BALLS);
        const ballsDY = new Float32Array(BALL_CONFIG.MAX_BALLS);
        let activeBallCount = 0;

        const addBall = (x: number, y: number, dx: number, dy: number) => {
            if (activeBallCount < BALL_CONFIG.MAX_BALLS) {
                ballsX[activeBallCount] = x; ballsY[activeBallCount] = y;
                ballsDX[activeBallCount] = dx; ballsDY[activeBallCount] = dy;
                activeBallCount++;
            }
        };

        addBall(canvas.width / 2, canvas.height - BALL_CONFIG.SPAWN_OFFSET_Y, BALL_CONFIG.INITIAL_SPEED_X, BALL_CONFIG.INITIAL_SPEED_Y);
        const ballRadius = BALL_CONFIG.RADIUS;
        let powerUps: PowerUp[] = [];

        // Brick grid setup
        const brickPadding = BRICK_CONFIG.PADDING;
        const brickOffsetLeft = BRICK_CONFIG.OFFSET_LEFT;
        const availableWidth = canvas.width - (brickOffsetLeft * 2);

        let brickColumnCount = Math.floor(availableWidth / (BRICK_CONFIG.TARGET_SIZE + brickPadding));
        if (selectedMap === 15 && randomMapData?.[0]) brickColumnCount = randomMapData[0].length;

        const brickWidth = (availableWidth - (brickColumnCount * brickPadding)) / brickColumnCount;
        const brickHeight = brickWidth;
        const currentHeightCoverage = selectedMap === 15 ? 0.35 : BRICK_CONFIG.HEIGHT_COVERAGE;

        let brickRowCount = Math.floor((canvas.height * currentHeightCoverage) / (brickHeight + brickPadding));
        if (selectedMap === 15 && randomMapData) brickRowCount = randomMapData.length;
        const brickOffsetTop = BRICK_CONFIG.OFFSET_TOP;

        const bricks: Uint8Array[] = [];
        const brickColors: string[] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            brickColors[c] = `hsl(${c * (360 / brickColumnCount)}, ${VISUAL_CONFIG.BRICK_SATURATION}%, ${VISUAL_CONFIG.BRICK_LIGHTNESS}%)`;
            bricks[c] = new Uint8Array(brickRowCount).fill(0);
        }
        generateMap(bricks, brickColumnCount, brickRowCount, selectedMap, randomMapData);

        const colors = isDarkMode ? VISUAL_CONFIG.COLORS.DARK : VISUAL_CONFIG.COLORS.LIGHT;
        let lastSoundTime = 0;
        const playSoundThrottled = (type: SoundType) => { const now = Date.now(); if (now - lastSoundTime > AUDIO_CONFIG.THROTTLE_MS) { playSound(type); lastSoundTime = now; } };

        const drawBricks = () => {
            for (let c = 0; c < brickColumnCount; c++) {
                ctx.fillStyle = brickColors[c]; ctx.beginPath();
                for (let r = 0; r < brickRowCount; r++) if (bricks[c][r] === 1) ctx.rect(c * (brickWidth + brickPadding) + brickOffsetLeft, r * (brickHeight + brickPadding) + brickOffsetTop, brickWidth, brickHeight);
                ctx.fill(); ctx.beginPath();
                for (let r = 0; r < brickRowCount; r++) if (bricks[c][r] === 2) ctx.rect(c * (brickWidth + brickPadding) + brickOffsetLeft, r * (brickHeight + brickPadding) + brickOffsetTop, brickWidth, brickHeight);
                ctx.fillStyle = colors.WALL; ctx.fill();
            }
        };

        const drawPaddle = () => {
            const pw = paddleWidthRef.current, h = paddleHeight, y = canvas.height - h - 5;
            const segW = pw / 7;
            const segmentColors = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#eab308', '#f97316', '#ef4444'];
            ctx.save(); ctx.beginPath(); ctx.roundRect(paddleX, y, pw, h, 8); ctx.clip();
            for (let i = 0; i < 7; i++) { ctx.fillStyle = segmentColors[i]; ctx.fillRect(paddleX + i * segW, y, segW, h); }
            const gradient = ctx.createLinearGradient(paddleX, y, paddleX, y + h);
            gradient.addColorStop(0, 'rgba(255,255,255,0.3)'); gradient.addColorStop(0.5, 'rgba(255,255,255,0)'); gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
            ctx.fillStyle = gradient; ctx.fillRect(paddleX, y, pw, h); ctx.restore();
        };

        const drawPowerUps = () => {
            powerUps.forEach(p => {
                ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = p.type === 'multi' ? '#facc15' : '#4ade80'; ctx.fill();
                ctx.fillStyle = '#000'; ctx.font = 'bold 12px Arial'; ctx.textAlign = 'center';
                ctx.fillText(p.type === 'multi' ? '3' : '+', p.x, p.y + 4);
            });
        };

        const handlePowerUp = (type: string) => {
            if (type === 'multi') {
                if (activeBallCount > POWERUP_CONFIG.MULTI_SOFT_CAP) return;
                const limit = Math.min(activeBallCount, POWERUP_CONFIG.MULTI_LIMIT);
                for (let i = 0; i < limit && activeBallCount + 2 < BALL_CONFIG.MAX_BALLS; i++) {
                    addBall(ballsX[i], ballsY[i], ballsDX[i] + (Math.random() - 0.5) * POWERUP_CONFIG.VELOCITY_VARIATION, -Math.abs(ballsDY[i]));
                    addBall(ballsX[i], ballsY[i], ballsDX[i] - (Math.random() - 0.5) * POWERUP_CONFIG.VELOCITY_VARIATION, -Math.abs(ballsDY[i]));
                }
                playSoundThrottled('powerup');
            } else if (type === 'wide') {
                if (paddleWidthTimeoutRef.current !== null) clearTimeout(paddleWidthTimeoutRef.current);
                paddleWidthRef.current = Math.min(paddleWidthRef.current + PADDLE_CONFIG.WIDTH_INCREASE, PADDLE_CONFIG.MAX_WIDTH);
                paddleWidthTimeoutRef.current = window.setTimeout(() => { paddleWidthRef.current = PADDLE_CONFIG.DEFAULT_WIDTH; paddleWidthTimeoutRef.current = null; }, PADDLE_CONFIG.WIDE_POWERUP_DURATION);
                playSoundThrottled('powerup');
            }
        };

        const draw = () => {
            ctx.fillStyle = colors.BACKGROUND; ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawBricks(); drawPaddle();
            if (gameState !== 'playing') {
                ctx.fillStyle = colors.BALL;
                for (let i = 0; i < activeBallCount; i++) { ctx.beginPath(); ctx.arc(ballsX[i], ballsY[i], ballRadius, 0, Math.PI * 2); ctx.fill(); }
                return;
            }
            drawPowerUps();

            powerUps = powerUps.filter(p => {
                p.y += 3;
                if (p.y + 10 > canvas.height - paddleHeight - 5 && p.x > paddleX && p.x < paddleX + paddleWidthRef.current) { handlePowerUp(p.type); return false; }
                return p.y < canvas.height;
            });

            ctx.fillStyle = colors.BALL; ctx.beginPath();
            let aliveBalls = 0;

            for (let i = 0; i < activeBallCount; i++) {
                let bx = ballsX[i], by = ballsY[i], bdx = ballsDX[i], bdy = ballsDY[i], deleted = false;

                if (bx + bdx > canvas.width - ballRadius || bx + bdx < ballRadius) { bdx = -bdx; playSoundThrottled('hit'); }
                if (by + bdy < ballRadius) { bdy = -bdy; playSoundThrottled('hit'); }
                else if (by + bdy > canvas.height - ballRadius - 5) {
                    if (bdy > 0 && bx + ballRadius >= paddleX && bx - ballRadius <= paddleX + paddleWidthRef.current) {
                        const pw = paddleWidthRef.current, relativePos = (bx - (paddleX + pw / 2)) / (pw / 2);
                        bdx = Math.pow(Math.abs(relativePos), 1.5) * (relativePos < 0 ? -1 : 1) * 6;
                        bdy = -Math.abs(bdy);
                        const totalSpeed = BALL_CONFIG.SPEED, minVert = totalSpeed * 0.4;
                        let mag = Math.sqrt(bdx * bdx + bdy * bdy);
                        bdx = (bdx / mag) * totalSpeed; bdy = (bdy / mag) * totalSpeed;
                        if (Math.abs(bdy) < minVert) { bdy = -minVert; bdx = Math.sign(bdx) * Math.sqrt(totalSpeed * totalSpeed - bdy * bdy); }
                        playSoundThrottled('hit');
                    } else if (by + bdy > canvas.height + ballRadius) deleted = true;
                }

                // Brick collisions
                if (!deleted && by < brickOffsetTop + (brickRowCount * (brickHeight + brickPadding))) {
                    const ballLeft = bx - ballRadius, ballRight = bx + ballRadius, ballTop = by - ballRadius, ballBottom = by + ballRadius;
                    const minGx = Math.max(0, Math.floor((ballLeft - brickOffsetLeft) / (brickWidth + brickPadding)));
                    const maxGx = Math.min(brickColumnCount - 1, Math.floor((ballRight - brickOffsetLeft) / (brickWidth + brickPadding)));
                    const minGy = Math.max(0, Math.floor((ballTop - brickOffsetTop) / (brickHeight + brickPadding)));
                    const maxGy = Math.min(brickRowCount - 1, Math.floor((ballBottom - brickOffsetTop) / (brickHeight + brickPadding)));

                    outer: for (let gx = minGx; gx <= maxGx; gx++) {
                        for (let gy = minGy; gy <= maxGy; gy++) {
                            const cell = bricks[gx][gy];
                            if (cell > 0) {
                                const brickX = gx * (brickWidth + brickPadding) + brickOffsetLeft;
                                const brickY = gy * (brickHeight + brickPadding) + brickOffsetTop;
                                if (ballRight > brickX && ballLeft < brickX + brickWidth && ballBottom > brickY && ballTop < brickY + brickHeight) {
                                    if (cell === 1) {
                                        bricks[gx][gy] = 0; setPoints(s => s + 10);
                                        if (Math.random() < POWERUP_CONFIG.DROP_CHANCE) powerUps.push({ x: brickX + brickWidth / 2, y: brickY + brickHeight / 2, dy: POWERUP_CONFIG.FALL_SPEED, type: Math.random() < POWERUP_CONFIG.MULTI_CHANCE ? 'multi' : 'wide' });
                                        playSoundThrottled('break');
                                    } else playSoundThrottled('hit');
                                    const cx = brickX + brickWidth / 2, cy = brickY + brickHeight / 2, dx = bx - cx, dy = by - cy;
                                    const ox = (brickWidth / 2 + ballRadius) - Math.abs(dx), oy = (brickHeight / 2 + ballRadius) - Math.abs(dy);
                                    if (ox < oy) { bdx = dx > 0 ? Math.abs(bdx) : -Math.abs(bdx); bx = cx + (dx > 0 ? 1 : -1) * (brickWidth / 2 + ballRadius); }
                                    else { bdy = dy > 0 ? Math.abs(bdy) : -Math.abs(bdy); by = cy + (dy > 0 ? 1 : -1) * (brickHeight / 2 + ballRadius); }
                                    bdx += (Math.random() - 0.5) * 0.05; bdy += (Math.random() - 0.5) * 0.05;
                                    const m = Math.sqrt(bdx * bdx + bdy * bdy); bdx = (bdx / m) * BALL_CONFIG.SPEED; bdy = (bdy / m) * BALL_CONFIG.SPEED;
                                    break outer;
                                }
                            }
                        }
                    }
                }

                if (!deleted) {
                    bx += bdx; by += bdy;
                    ballsX[aliveBalls] = bx; ballsY[aliveBalls] = by; ballsDX[aliveBalls] = bdx; ballsDY[aliveBalls] = bdy;
                    aliveBalls++; ctx.moveTo(bx + ballRadius, by); ctx.arc(bx, by, ballRadius, 0, Math.PI * 2);
                }
            }
            ctx.fill(); activeBallCount = aliveBalls;

            if (activeBallCount === 0) { setGameState('gameover'); playSound('gameover'); return; }
            let activeBricks = 0;
            for (let c = 0; c < brickColumnCount; c++) for (let r = 0; r < brickRowCount; r++) if (bricks[c][r] === 1) activeBricks++;
            if (activeBricks === 0) { setGameState('won'); playSound('win'); return; }
            animationFrameRef.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => { const rect = canvas.getBoundingClientRect(); paddleX = (e.clientX - rect.left) * (canvas.width / rect.width) - paddleWidthRef.current / 2; };
        const handleTouchMove = (e: TouchEvent) => { e.preventDefault(); const rect = canvas.getBoundingClientRect(); paddleX = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width) - paddleWidthRef.current / 2; };

        if (gameState === 'playing') {
            document.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
            draw();
        } else {
            ctx.fillStyle = colors.BACKGROUND; ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawBricks(); drawPaddle();
            ctx.fillStyle = colors.BALL;
            for (let i = 0; i < activeBallCount; i++) { ctx.beginPath(); ctx.arc(ballsX[i], ballsY[i], ballRadius, 0, Math.PI * 2); ctx.fill(); }
        }

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            document.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [gameState, isDarkMode, playSound, selectedMap, randomMapData, canvasRef, containerRef, paddleWidthRef, paddleWidthTimeoutRef, setGameState, setPoints]);
}
