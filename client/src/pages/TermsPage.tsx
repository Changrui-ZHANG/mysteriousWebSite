import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function TermsPage() {
    const { t } = useTranslation();

    return (
        <div className="page-container pt-32 pb-12 px-8 font-body">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <h1 className="text-4xl font-bold mb-12 border-b pb-4 border-border-default/20">
                    {t('legal_page.terms.title')}
                </h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.presentation.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.presentation.content')}
                    </p>
                    <p className="text-secondary leading-relaxed whitespace-pre-line">
                        {t('legal_page.terms.sections.presentation.details')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.cgu.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.cgu.content_1')}
                    </p>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.cgu.content_2')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.services.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.services.content')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.intellectual.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.intellectual.content_1')}
                    </p>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.intellectual.content_2')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.liability.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.liability.content')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.terms.sections.data.title')}</h2>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.data.content_1')}
                    </p>
                    <p className="text-secondary leading-relaxed">
                        {t('legal_page.terms.sections.data.content_2')}
                    </p>
                </section>

                <div className="pt-12 text-center text-muted text-sm">
                    <p>{t('legal_page.updated')}</p>
                </div>
            </motion.div>
        </div>
    );
}
