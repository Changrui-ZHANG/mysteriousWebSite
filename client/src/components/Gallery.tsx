import { useRef } from 'react';

interface GalleryProps {
    isDarkMode: boolean;
}

export function Gallery({ isDarkMode }: GalleryProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = 500; // Approx card width + gap
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const artworks = [
        {
            id: 1,
            title: "NEBULA ONE",
            gradient: "linear-gradient(135deg, #FF0080, #7928CA)",
            description: "Digital Void"
        },
        {
            id: 2,
            title: "CYBER DREAMS",
            gradient: "linear-gradient(45deg, #4158D0, #C850C0, #FFCC70)",
            description: "Synthesized Memory"
        },
        {
            id: 3,
            title: "DEEP DIVE",
            gradient: "linear-gradient(180deg, #0093E9, #80D0C7)",
            description: "Oceanic Data"
        },
        {
            id: 4,
            title: "AURORA",
            gradient: "linear-gradient(to right, #D4145A, #FBB03B)",
            description: "Solar Wind"
        },
        {
            id: 5,
            title: "HORIZON",
            gradient: "linear-gradient(to top, #00c6fb 0%, #005bea 100%)",
            description: "Infinite Loop"
        }
    ];

    return (
        <div className="relative w-full">
            {/* Scroll Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
                <button
                    onClick={() => scroll('left')}
                    className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
                    aria-label="Scroll Left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>

            <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20">
                <button
                    onClick={() => scroll('right')}
                    className={`p-4 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
                    aria-label="Scroll Right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

            {/* Gallery Container */}
            <div
                ref={scrollRef}
                className="w-full overflow-x-auto pb-12 pt-4 px-16 flex gap-8 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Hide scrollbar specifically
            >
                <style>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>

                {artworks.map((art) => (
                    <div key={art.id} className="relative group shrink-0 snap-center">
                        {/* Art Container */}
                        <div
                            className={`w-[450px] h-[600px] rounded-2xl overflow-hidden transition-transform duration-500 group-hover:scale-[1.02] ${isDarkMode ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)]' : 'shadow-2xl'}`}
                            style={{
                                background: art.gradient,
                            }}
                        >
                            {/* Noise Overlay */}
                            <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyBAMAAADsEZWCAAAAGFBMVEUAAAAAAAACAgIBAQEAAAAAAAD///8AAAB3Rl2sAAAACHRSTlMA/////////wDuncYAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAwSURBVDjLY2AYBaNgKL2BAQcwa6CBAAcw66CBAQcw66CBAQcw66CBAQcw66CBAQcAdxj01PO6c/cAAAAASUVORK5CYII=')]"></div>

                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Title Overlay */}
                            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <h3 className="text-3xl text-white font-heading font-bold">{art.title}</h3>
                                <p className="text-white/70 font-serif italic mt-2">{art.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
