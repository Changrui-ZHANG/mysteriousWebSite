/**
 * HomeFooter - Floating glass-style footer for HomePage
 * Horizontal layout with full width - Brand left, Socials center, Legal right
 */

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { SOCIAL_LINKS } from '../../../constants/urls';

export function HomeFooter() {
    const { t } = useTranslation();

    return (
        <footer className="mt-16 mb-8 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl px-8 py-6 relative overflow-hidden after:absolute after:inset-0 after:rounded-2xl after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none">
                {/* Decorative Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    {/* Brand - Left */}
                    <div className="flex items-center">
                        <h4 className="text-lg font-heading font-bold">{t('brand.author_name')}</h4>
                    </div>

                    {/* Social Icons - Center */}
                    <div className="flex items-center gap-3">
                        <a
                            href={SOCIAL_LINKS.GITHUB}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                            aria-label="GitHub"
                        >
                            <FaGithub className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </a>
                        <a
                            href={SOCIAL_LINKS.LINKEDIN}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity text-[#0077b5]" />
                        </a>
                    </div>

                    {/* Legal + Copyright - Right */}
                    <div className="flex items-center gap-4 text-xs text-secondary">
                        <Link to="/privacy" className="hover:text-primary transition-colors">
                            {t('footer_section.privacy')}
                        </Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">
                            {t('footer_section.terms')}
                        </Link>
                        <span className="opacity-30">|</span>
                        <span className="text-muted opacity-50">{t('brand.copyright')}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
