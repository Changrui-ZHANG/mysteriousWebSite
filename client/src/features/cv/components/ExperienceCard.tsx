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
    isDarkMode: boolean;
}

export function ExperienceCard({ exp, isDarkMode }: ExperienceCardProps) {
    return (
        <GlassPanel
            isDarkMode={isDarkMode}
            className="w-full p-8 sm:p-10 rounded-[40px] flex flex-col h-[550px] sm:h-[500px] relative overflow-hidden"
        >
            {/* Fixed Header */}
            <div className="flex-shrink-0 mb-6 space-y-2">
                <div className="flex justify-between items-start">
                    <div className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{exp.title}</div>
                    <span className={`text-[10px] sm:text-xs font-mono uppercase tracking-widest whitespace-nowrap ml-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{exp.period}</span>
                </div>
                <p className="text-[#0071e3] font-bold text-base sm:text-lg uppercase tracking-wide">{exp.role}</p>
            </div>

            {/* Scrollable Content */}
            <div className={`flex-1 overflow-y-auto overscroll-y-contain pr-2 space-y-4 custom-scrollbar ${isDarkMode ? 'scrollbar-dark' : 'scrollbar-light'}`}>
                <ul className="space-y-3">
                    {exp.description.map((desc, i) => (
                        <li key={i} className={`text-sm sm:text-base leading-relaxed font-light ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            {desc}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Fixed Footer (Tech Stack) */}
            <div className="flex-shrink-0 pt-6 mt-2 border-t border-white/5">
                <div className="flex flex-wrap gap-2">
                    {exp.tech.map((tech, i) => (
                        <span key={i} className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-full border ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
                            }`}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>

            {/* Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.1)'};
                    border-radius: 20px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
                }
            `}</style>
        </GlassPanel>
    );
}
