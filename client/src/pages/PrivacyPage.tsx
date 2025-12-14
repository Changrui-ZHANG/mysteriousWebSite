import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function PrivacyPage({ isDarkMode }: { isDarkMode: boolean }) {
    const { t } = useTranslation();

    return (
        <div className={`min-h-screen pt-32 pb-12 px-8 font-body transition-colors duration-500 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-gray-900'}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                <h1 className="text-4xl font-bold mb-12 border-b pb-4 border-gray-700">
                    {t('legal_page.privacy.title')}
                </h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.collection.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.collection.content_1')}
                    </p>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.collection.content_2')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.usage.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.usage.content')}
                    </p>
                    <ul className="list-disc pl-6 space-y-2 opacity-80 leading-relaxed">
                        {(t('legal_page.privacy.sections.usage.list', { returnObjects: true }) as string[]).map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.ecommerce.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.ecommerce.content')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.disclosure.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.disclosure.content')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.security.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.security.content')}
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold text-pink-500">{t('legal_page.privacy.sections.consent.title')}</h2>
                    <p className="opacity-80 leading-relaxed">
                        {t('legal_page.privacy.sections.consent.content')}
                    </p>
                </section>

                <div className="pt-12 text-center opacity-50 text-sm">
                    <p>{t('legal_page.updated')}</p>
                </div>
            </motion.div>
        </div>
    );
}
