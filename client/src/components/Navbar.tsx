import { useTranslation } from 'react-i18next';

interface NavbarProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export function Navbar({ isDarkMode, toggleTheme }: NavbarProps) {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className={`flex justify-between items-center px-8 py-4 absolute top-0 left-0 w-full z-50 border-b backdrop-blur-md transition-colors duration-300 ${isDarkMode
                ? 'text-white bg-black/20 border-white/10'
                : 'text-black bg-white/20 border-black/10'
            }`}>
            <div className="text-2xl font-bold">
                {t('navbar.title')}
            </div>

            <div className="flex gap-4 items-center">
                {/* Simple Language Switcher */}
                <select
                    onChange={(e) => changeLanguage(e.target.value)}
                    defaultValue={i18n.language}
                    className={`bg-transparent inherit border p-1 rounded cursor-pointer ${isDarkMode ? 'border-white/30' : 'border-black/30'
                        }`}
                >
                    <option value="en" className="text-black">EN</option>
                    <option value="fr" className="text-black">FR</option>
                    <option value="zh" className="text-black">中文</option>
                </select>

                <button
                    onClick={toggleTheme}
                    className={`bg-transparent border px-4 py-2 rounded-full cursor-pointer text-sm transition-all duration-300 ${isDarkMode ? 'border-white/30' : 'border-black/30'
                        }`}
                >
                    {isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}
                </button>
            </div>
        </nav>
    );
}
