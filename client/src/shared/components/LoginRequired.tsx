import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface LoginRequiredProps {
    children: ReactNode;
    title?: string;
    description?: string;
    icon?: ReactNode;
}

export function LoginRequired({
    children,
    title,
    description,
    icon
}: LoginRequiredProps) {
    const { t } = useTranslation();
    const { isAuthenticated, openAuthModal } = useAuth();

    // Si l'utilisateur est connecté, afficher le contenu normal
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Sinon, afficher l'overlay de connexion
    return (
        <div className="relative">
            {/* Contenu en arrière-plan (flouté) */}
            <div className="blur-sm opacity-30 pointer-events-none select-none">
                {children}
            </div>

            {/* Overlay de connexion requise avec effet liquid glass */}
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Background avec effet de verre - adaptatif dark/light */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 dark:from-black/40 dark:via-black/20 dark:to-black/50 backdrop-blur-2xl" />

                {/* Particules flottantes d'arrière-plan - adaptatif */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent-primary/10 dark:bg-accent-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s', animationDuration: '4s' }} />
                    <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent-secondary/10 dark:bg-accent-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '6s' }} />
                    <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-accent-info/10 dark:bg-accent-info/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1],
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                    }}
                    className="relative max-w-lg mx-auto p-6"
                >
                    {/* Carte principale avec effet liquid glass adaptatif */}
                    <div className="relative rounded-[2rem] bg-white/[0.15] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
                        {/* Effets de brillance et reflets - adaptatif */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.15] dark:from-white/[0.08] via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-tl from-accent-primary/[0.05] dark:from-accent-primary/[0.03] via-transparent to-accent-secondary/[0.05] dark:to-accent-secondary/[0.03] pointer-events-none" />

                        {/* Bordure interne lumineuse - adaptatif */}
                        <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-gradient-to-b from-white/[0.1] dark:from-white/[0.05] to-transparent pointer-events-none" />

                        {/* Contenu principal */}
                        <div className="relative z-10 p-10 text-center">
                            {/* Icône avec effet glassmorphism adaptatif */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                                className="relative w-20 h-20 mx-auto mb-8"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/30 dark:from-accent-primary/20 to-accent-secondary/30 dark:to-accent-secondary/20 rounded-2xl backdrop-blur-xl border border-black/10 dark:border-white/10" />
                                <div className="absolute inset-[1px] bg-gradient-to-br from-white/20 dark:from-white/10 to-transparent rounded-[calc(1rem-1px)]" />
                                <div className="relative w-full h-full flex items-center justify-center text-gray-800 dark:text-white">
                                    {icon || (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    )}
                                </div>

                                {/* Effet de lueur autour de l'icône - adaptatif */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/40 dark:from-accent-primary/30 to-accent-secondary/40 dark:to-accent-secondary/30 rounded-2xl blur-xl opacity-50" />
                            </motion.div>

                            {/* Titre avec effet de texte adaptatif */}
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="text-2xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-white/90 dark:to-white/70"
                            >
                                {title || t('auth.login_required')}
                            </motion.h2>

                            {/* Description adaptatif */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                className="text-gray-700 dark:text-white/70 mb-8 leading-relaxed text-lg"
                            >
                                {description || t('auth.login_required_description')}
                            </motion.p>

                            {/* Bouton avec effet liquid glass adaptatif */}
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.4 }}
                                onClick={openAuthModal}
                                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary p-[1px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {/* Fond du bouton avec glassmorphism adaptatif */}
                                <div className="relative rounded-[calc(1rem-1px)] bg-gradient-to-r from-accent-primary/90 to-accent-secondary/90 backdrop-blur-xl px-8 py-4 transition-all duration-300 group-hover:from-accent-primary group-hover:to-accent-secondary">
                                    {/* Effet de brillance au survol adaptatif */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-white/20 via-white/20 dark:via-white/10 to-white/30 dark:to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                                    {/* Texte du bouton */}
                                    <span className="relative z-10 font-bold text-white text-lg tracking-wide">
                                        {t('auth.login')}
                                    </span>
                                </div>

                                {/* Effet de lueur externe */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent-primary to-accent-secondary opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30" />
                            </motion.button>
                        </div>

                        {/* Effets décoratifs flottants adaptatifs */}
                        <div className="absolute top-4 right-4 w-2 h-2 bg-gray-400/40 dark:bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                        <div className="absolute bottom-6 left-6 w-1 h-1 bg-accent-primary/60 dark:bg-accent-primary/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                        <div className="absolute top-1/3 left-4 w-1.5 h-1.5 bg-accent-secondary/50 dark:bg-accent-secondary/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}