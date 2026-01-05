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
            <div className="paper-theme w-full p-8 sm:p-10 rounded-[40px] flex flex-col min-h-[400px] max-h-[75vh] h-full relative paper-card">
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
            className="w-full p-8 sm:p-10 rounded-[40px] flex flex-col min-h-[400px] max-h-[70vh] h-full relative overflow-hidden transition-all duration-500 border border-white/10 bg-white/5 backdrop-blur-xl hover:shadow-[0_0_50px_rgba(56,189,248,0.4)] hover:border-cyan-400/60 hover:bg-cyan-900/20 group"
        >
            {/* Fixed Header */}
            <div className="shrink-0 mb-6 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-primary transition-colors duration-500 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]">{exp.title}</div>
                    <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 text-muted">{exp.period}</span>
                </div>
                <p className="font-bold text-base sm:text-lg uppercase tracking-wide text-accent-primary transition-colors duration-500 group-hover:text-cyan-400">{exp.role}</p>
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
                        <span key={i} className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border bg-inset border-subtle text-secondary transition-all duration-300 hover:border-cyan-400 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)] hover:scale-105 cursor-default">
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </GlassPanel>
    );
}
