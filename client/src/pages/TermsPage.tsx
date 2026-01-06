import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaGavel } from 'react-icons/fa';

export function TermsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const sections = [
        { key: 'presentation', hasDetails: true },
        { key: 'cgu', contentKeys: ['content_1', 'content_2'] },
        { key: 'services' },
        { key: 'intellectual', contentKeys: ['content_1', 'content_2'] },
        { key: 'liability' },
        { key: 'data', contentKeys: ['content_1', 'content_2'] },
    ];

    return (
        <div className="page-container min-h-screen pt-24 pb-12 px-4 md:px-8">
            {/* Close Button - Fixed Top Right */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => navigate(-1)}
                className="fixed top-24 right-6 z-50 w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all shadow-2xl group"
                aria-label={t('common.close')}
            >
                <FaTimes className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            {/* Main Content Container - Liquid Glass */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto"
            >
                {/* Glass Card */}
                <div className="relative rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] overflow-hidden after:absolute after:inset-0 after:rounded-[2rem] after:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] after:pointer-events-none">

                    {/* Header with Icon */}
                    <div className="relative p-8 md:p-12 border-b border-white/5">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center shadow-lg shadow-accent-primary/20">
                                <FaGavel className="text-2xl text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                    {t('legal_page.terms.title')}
                                </h1>
                                <p className="text-sm text-white/40 mt-1">{t('legal_page.updated')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="p-8 md:p-12 space-y-10">
                        {sections.map((section, index) => (
                            <motion.section
                                key={section.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className="space-y-4"
                            >
                                <h2 className="text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-accent-primary to-accent-secondary">
                                    {t(`legal_page.terms.sections.${section.key}.title`)}
                                </h2>

                                {section.hasDetails ? (
                                    <>
                                        <p className="text-white/70 leading-relaxed">
                                            {t(`legal_page.terms.sections.${section.key}.content`)}
                                        </p>
                                        <p className="text-white/70 leading-relaxed whitespace-pre-line">
                                            {t(`legal_page.terms.sections.${section.key}.details`)}
                                        </p>
                                    </>
                                ) : section.contentKeys ? (
                                    section.contentKeys.map((contentKey) => (
                                        <p key={contentKey} className="text-white/70 leading-relaxed">
                                            {t(`legal_page.terms.sections.${section.key}.${contentKey}`)}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-white/70 leading-relaxed">
                                        {t(`legal_page.terms.sections.${section.key}.content`)}
                                    </p>
                                )}
                            </motion.section>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-8 md:p-12 border-t border-white/5 text-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-bold transition-all"
                        >
                            {t('common.close')}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
