import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import { useTranslation } from 'react-i18next'
import { useThemeManager } from '../../../shared/hooks/useThemeManager'

interface GravityPlaygroundProps {
    // isDarkMode prop removed
}

export function GravityPlayground({ }: GravityPlaygroundProps) {
    const { t, i18n } = useTranslation();
    const { isDarkMode } = useThemeManager();
    const sceneRef = useRef<HTMLDivElement>(null)
    const engineRef = useRef<Matter.Engine | null>(null)

    useEffect(() => {
        if (!sceneRef.current) return

        const Engine = Matter.Engine,
            Render = Matter.Render,
            Runner = Matter.Runner,
            Bodies = Matter.Bodies,
            Composite = Matter.Composite,
            Mouse = Matter.Mouse,
            MouseConstraint = Matter.MouseConstraint;

        const engine = Engine.create();
        engineRef.current = engine;

        const width = sceneRef.current.clientWidth;
        const height = sceneRef.current.clientHeight;

        const render = Render.create({
            element: sceneRef.current,
            engine: engine,
            options: {
                width,
                height,
                background: 'transparent',
                wireframes: false
            }
        });

        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }
        };

        const ground = Bodies.rectangle(width / 2, height + 30, width, 60, wallOptions);
        const leftWall = Bodies.rectangle(-30, height / 2, 60, height, wallOptions);
        const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height, wallOptions);

        const keywordsData = t('gravity.keywords', { returnObjects: true });
        const keywords: string[] = Array.isArray(keywordsData) ? (keywordsData as string[]) : ["GRAVITY", "CODE", "PHYSICS"];

        const bodies = keywords.map((word) => {
            const x = Math.random() * (width - 100) + 50;
            const y = -Math.random() * 500 - 50;

            const isMobile = width < 768;
            const scaleFactor = isMobile ? 0.6 : 1;

            const w = (word.length * 15 + 60) * scaleFactor;
            const h = 60 * scaleFactor;

            return Bodies.rectangle(x, y, w, h, {
                restitution: 0.8,
                chamfer: { radius: 10 },
                render: {
                    fillStyle: isDarkMode ? '#fff' : '#000',
                    text: {
                        content: word,
                        color: isDarkMode ? '#000' : '#fff',
                        size: 18 * scaleFactor,
                        family: 'Outfit, sans-serif'
                    }
                }
            });
        });

        Composite.add(engine.world, [ground, leftWall, rightWall, ...bodies]);

        const mouse = Mouse.create(render.canvas);
        const mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Composite.add(engine.world, mouseConstraint);
        render.mouse = mouse;

        Matter.Events.on(render, "afterRender", function () {
            const context = render.context;
            const isMobile = render.canvas.width < 768;
            const fontSize = isMobile ? 12 : 18;
            context.font = `bold ${fontSize}px 'Outfit', sans-serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";

            bodies.forEach(body => {
                const { x, y } = body.position;
                const angle = body.angle;
                const content = body.render.text?.content;
                const textColor = body.render.text?.color;

                if (content && textColor) {
                    context.save();
                    context.translate(x, y);
                    context.rotate(angle);
                    context.fillStyle = typeof textColor === 'string' ? textColor : '#000';
                    context.fillText(content, 0, 0);
                    context.restore();
                }
            });
        });

        Render.run(render);
        const runner = Runner.create();
        Runner.run(runner, engine);

        const handleResize = () => {
            if (!sceneRef.current) return;
            const w = sceneRef.current.clientWidth;
            const h = sceneRef.current.clientHeight;

            render.canvas.width = w;
            render.canvas.height = h;

            Matter.Body.setPosition(ground, { x: w / 2, y: h + 30 });
            Matter.Body.setPosition(rightWall, { x: w + 30, y: h / 2 });
        };
        window.addEventListener('resize', handleResize);

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            window.removeEventListener('resize', handleResize);
            Composite.clear(engine.world, false, true);
            Engine.clear(engine);
            render.canvas.remove();
        }
    }, [isDarkMode, i18n.language]);

    return (
        <div className="w-full h-[80vh] min-h-[600px] relative overflow-hidden rounded-3xl border border-white/10 my-16 bg-inset backdrop-blur-sm shadow-inner touch-action-none" ref={sceneRef}>
            <div className={`absolute top-4 left-0 w-full text-center text-sm tracking-widest opacity-50 pointer-events-none font-mono text-primary`}>
                {t('gravity.instruction')}
            </div>
        </div>
    )
}
