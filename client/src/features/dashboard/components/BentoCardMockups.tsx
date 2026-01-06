/**
 * BentoCardMockups - Visual preview mockups for Bento Grid cards
 * Each mockup provides a hint of the content users will find on the linked page
 */

export function CvMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-105 pointer-events-none">
            <div className="w-full max-w-[280px] aspect-[1/1.414] bg-white/5 border border-white/10 rounded-xl shadow-2xl p-6 flex flex-col gap-4 overflow-hidden relative">
                {/* Header */}
                <div className="flex gap-4 items-center border-b border-white/10 pb-4">
                    <div className="w-12 h-12 rounded-lg bg-accent-primary/20 border border-accent-primary/30 shrink-0" />
                    <div className="space-y-2 flex-grow">
                        <div className="h-3 w-3/4 bg-white/30 rounded-full" />
                        <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                    </div>
                </div>
                {/* Section 1 */}
                <div className="space-y-3">
                    <div className="h-2 w-1/4 bg-accent-primary/40 rounded-full mb-4" />
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full" />
                        <div className="h-1.5 w-full bg-white/5 rounded-full" />
                        <div className="h-1.5 w-2/3 bg-white/5 rounded-full" />
                    </div>
                </div>
                {/* Section 2 */}
                <div className="space-y-3 mt-2">
                    <div className="h-2 w-1/3 bg-accent-primary/40 rounded-full mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-4 bg-white/5 rounded-lg border border-white/5" />
                        <div className="h-4 bg-white/5 rounded-lg border border-white/5" />
                        <div className="h-4 bg-white/5 rounded-lg border border-white/5" />
                        <div className="h-4 bg-white/5 rounded-lg border border-white/5" />
                    </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-primary/10 blur-2xl rounded-full" />
            </div>
        </div>
    );
}

export function MessagesMockup() {
    return (
        <div className="absolute inset-0 flex flex-col justify-center px-12 gap-4 opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-110 pointer-events-none">
            <div className="flex justify-end">
                <div className="px-4 py-2 rounded-2xl rounded-tr-sm bg-accent-primary/20 border border-accent-primary/10 text-xs text-accent-primary w-fit shadow-lg">
                    Hey! 👋
                </div>
            </div>
            <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl rounded-tl-sm bg-white/10 border border-white/5 text-xs text-secondary w-fit shadow-lg">
                    Welcome!
                </div>
            </div>
            <div className="flex justify-end scale-90 opacity-50">
                <div className="px-4 py-2 rounded-2xl rounded-tr-sm bg-accent-primary/20 border border-accent-primary/10 text-xs text-accent-primary w-fit shadow-lg">
                    Cool design
                </div>
            </div>
        </div>
    );
}

export function SuggestionsMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110 pointer-events-none">
            <div className="relative w-full px-6 flex flex-col gap-3">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-center shadow-xl rotate-[-2deg]">
                    <div className="w-1.5 h-10 rounded-full bg-yellow-400/50" />
                    <div className="space-y-2 flex-grow">
                        <div className="w-2/3 h-2 bg-white/20 rounded-full" />
                        <div className="w-1/2 h-1.5 bg-white/10 rounded-full" />
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex gap-3 items-center shadow-xl translate-x-4 rotate-[1deg]">
                    <div className="w-1.5 h-10 rounded-full bg-green-400/50" />
                    <div className="space-y-2 flex-grow">
                        <div className="w-3/4 h-2 bg-white/20 rounded-full" />
                        <div className="w-2/3 h-1.5 bg-white/10 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function GameMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-all duration-500 group-hover:scale-110 pointer-events-none">
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center bg-white/2">
                    <div className="w-4 h-4 bg-white/20 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-white/5 flex items-center justify-center translate-y-8 bg-white/2">
                    <div className="w-4 h-4 bg-white/20 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
                </div>
            </div>
        </div>
    );
}

export function CalendarMockup() {
    return (
        <div className="absolute inset-0 flex items-center justify-center p-8 opacity-30 group-hover:opacity-50 transition-all duration-500 group-hover:scale-110 pointer-events-none">
            <div className="grid grid-cols-4 gap-2 w-full">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className={`aspect-square rounded-xl border border-white/10 ${i === 6 ? 'bg-accent-primary/40' : 'bg-white/5'} flex items-center justify-center shadow-lg`}>
                        {i === 6 && <div className="w-3 h-3 bg-white rounded-full shadow-glow" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
