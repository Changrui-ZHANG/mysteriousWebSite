import { GlassPanel } from '../../../components/ui/GlassPanel';

interface Experience {
    title: string;
    role: string;
    period: string;
    description: string[];
    tech: string[];
}

interface ExperienceCardProps {
    exp: Experience;
    isPaperTheme?: boolean;
}

export function ExperienceCard({ exp, isPaperTheme = false }: ExperienceCardProps) {
    // Paper theme: transparent card with leather-style border
    if (isPaperTheme) {
        return (
            <div
                className="w-full p-8 sm:p-10 rounded-[40px] flex flex-col h-[550px] sm:h-[500px] relative"
                style={{
                    border: '3px solid #8b6f47',
                    boxShadow: 'inset 0 2px 0 rgba(255,240,210,0.3), 0 6px 20px rgba(80,50,20,0.2)'
                }}
            >
                {/* Fixed Header */}
                <div className="flex-shrink-0 mb-6 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-letterpress-strong">{exp.title}</div>
                        <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 text-letterpress">{exp.period}</span>
                    </div>
                    <p className="font-bold text-base sm:text-lg uppercase tracking-wide text-letterpress">{exp.role}</p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-y-contain pr-2 space-y-4 custom-scrollbar scrollbar-paper">
                    <ul className="space-y-3">
                        {exp.description.map((desc, i) => (
                            <li key={i} className="text-sm sm:text-base leading-relaxed font-light text-letterpress">
                                {desc}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Fixed Footer (Tech Stack) */}
                <div className="flex-shrink-0 pt-6 mt-2 border-t border-amber-800/30">
                    <div className="flex flex-wrap gap-2">
                        {exp.tech.map((tech, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-letterpress"
                                style={{ border: '1px solid rgba(139, 111, 71, 0.3)' }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Scrollbar Styles */}
                <style>{`
                    .scrollbar-paper::-webkit-scrollbar {
                        width: 4px;
                    }
                    .scrollbar-paper::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .scrollbar-paper::-webkit-scrollbar-thumb {
                        background: rgba(139, 111, 71, 0.3);
                        border-radius: 20px;
                    }
                    .scrollbar-paper:hover::-webkit-scrollbar-thumb {
                        background: rgba(139, 111, 71, 0.5);
                    }
                `}</style>
            </div>
        );
    }

    return (
        <GlassPanel
            className="w-full p-8 sm:p-10 rounded-[40px] flex flex-col h-[550px] sm:h-[500px] relative overflow-hidden"
        >
            {/* Fixed Header */}
            <div className="flex-shrink-0 mb-6 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{exp.title}</div>
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 text-[--color-text-muted]">{exp.period}</span>
                </div>
                <p className="text-[--color-accent-primary] font-bold text-base sm:text-lg uppercase tracking-wide">{exp.role}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain pr-2 space-y-4 custom-scrollbar
            ">
                <ul className="space-y-3">
                    {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm sm:text-base leading-relaxed font-light text-[--color-text-secondary]">
                            {desc}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Fixed Footer (Tech Stack) */}
            <div className="flex-shrink-0 pt-6 mt-2 border-t border-[--color-border-muted]">
                <div className="flex flex-wrap gap-2">
                    {exp.tech.map((tech, i) => (
                        <span key={i} className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border 
                            bg-[--color-bg-muted] border-[--color-border-muted] text-[--color-text-secondary]">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </GlassPanel>
    );

}
