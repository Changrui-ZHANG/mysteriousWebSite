/**
 * LanguageButton - Language selector button with flag
 */

interface LanguageButtonProps {
    lang: string;
    label: string;
    flagCode: string;
    currentLang: string;
    onClick: (lang: string) => void;
}

export function LanguageButton({ lang, label, flagCode, currentLang, onClick }: LanguageButtonProps) {
    return (
        <button
            onClick={() => onClick(lang)}
            className={`flex items-center gap-2 transition-all ${currentLang === lang ? 'opacity-100 font-bold scale-105' : 'opacity-60 hover:opacity-100'}`}
            title={label}
        >
            <img
                src={`https://flagcdn.com/w40/${flagCode}.png`}
                srcSet={`https://flagcdn.com/w80/${flagCode}.png 2x`}
                alt={label}
                className="w-5 h-auto rounded-[2px] shadow-sm"
            />
            <span className="hover:underline">{label}</span>
        </button>
    );
}
