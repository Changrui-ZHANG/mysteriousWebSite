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
            <div className="paper-theme w-full p-8 sm:p-10 rounded-[40px] flex flex-col h-[550px] sm:h-[500px] relative paper-card">
                {/* Fixed Header */}
                <div className="shrink-0 mb-6 space-y-2">
                    <div className="flex justify-between items-start">
                        <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-letterpress-strong">{exp.title}</div>
                        <span className="text-[12px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 text-letterpress">{exp.period}</span>
                    </div>
                    <p className="text-base sm:text-lg text-letterpress-subtle">
                        {exp.role}
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-y-contain pr-2 space-y-4 custom-scrollbar scrollbar-paper">
                    <ul className="space-y-3">
                        {exp.description.map((desc, i) => (
                            <li key={i} className="text-sm sm:text-base leading-relaxed text-letterpress">
                                {desc}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Fixed Footer (Tech Stack) */}
                <div className="shrink-0 pt-6 mt-2 border-t border-amber-800/30">
                    <div className="flex flex-wrap gap-2">
                        {exp.tech.map((tech, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase text-letterpress paper-border-subtle"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GlassPanel
            className="w-full p-8 sm:p-10 rounded-[40px] flex flex-col h-[550px] sm:h-[500px] relative overflow-hidden"
        >
            {/* Fixed Header */}
            <div className="shrink-0 mb-6 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-primary">{exp.title}</div>
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 text-muted">{exp.period}</span>
                </div>
                <p className="font-bold text-base sm:text-lg uppercase tracking-wide text-accent-primary">{exp.role}</p>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-y-contain pr-2 space-y-4 custom-scrollbar">
                <ul className="space-y-3">
                    {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm sm:text-base leading-relaxed font-light text-secondary">
                            {desc}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Fixed Footer (Tech Stack) */}
            <div className="shrink-0 pt-6 mt-2 border-t border-strong">
                <div className="flex flex-wrap gap-2">
                    {exp.tech.map((tech, i) => (
                        <span key={i} className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border bg-inset border-subtle text-secondary hover:border-accent-primary transition-colors">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </GlassPanel>
    );
}
