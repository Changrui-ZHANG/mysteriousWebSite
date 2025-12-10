import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export function Navbar({ isDarkMode, toggleTheme }: NavbarProps) {
    const { t, i18n } = useTranslation();
    const location = useLocation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <nav className={`fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference text-white`}>
            <Link to="/" className="text-2xl font-bold font-heading tracking-tighter hover:opacity-80 transition-opacity">
                {location.pathname === '/cv' ? 'Curriculum vitæ' : t('navbar.title')}
            </Link>

            <div className="flex items-center gap-6 font-mono text-sm">
                <div className="flex gap-4 mr-4">
                    <Link to="/" className="hover:text-cyan-400 transition-colors">{t('nav.home')}</Link>
                    <Link to="/game" className="hover:text-cyan-400 transition-colors">{t('nav.game')}</Link>
                    <Link to="/cv" className="hover:text-cyan-400 transition-colors">{t('nav.cv')}</Link>
                </div>

                <div className="flex gap-2 opacity-70">
                    <button onClick={() => changeLanguage('en')} className={`hover:underline ${i18n.language === 'en' ? 'opacity-100 font-bold' : ''}`}>EN</button>
                    <button onClick={() => changeLanguage('fr')} className={`hover:underline ${i18n.language === 'fr' ? 'opacity-100 font-bold' : ''}`}>FR</button>
                    <button onClick={() => changeLanguage('zh')} className={`hover:underline ${i18n.language === 'zh' ? 'opacity-100 font-bold' : ''}`}>ZH</button>
                </div>

                <div className="w-[1px] h-[20px] bg-white opacity-20"></div>

                <button
                    onClick={toggleTheme}
                    className="uppercase tracking-widest hover:opacity-100 opacity-60 transition-opacity"
                >
                    {isDarkMode ? t('navbar.theme.light') : t('navbar.theme.dark')}
                </button>
            </div>
        </nav>
    );
}
