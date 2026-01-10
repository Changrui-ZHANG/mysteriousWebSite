import { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components
 * Prevents full app crashes by displaying a fallback UI with glassmorphism design
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.group('[ErrorBoundary] Error Details');
        console.error('Error:', error);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Component Stack:', errorInfo.componentStack);
        console.groupEnd();
        
        // Log spécifique pour "Component is not a function"
        if (error.message.includes('not a function')) {
            console.warn('[ErrorBoundary] This looks like an import/export issue. Check your component imports.');
        }
        
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Background overlay avec effet glassmorphism */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 dark:from-black/40 dark:via-black/20 dark:to-black/50 backdrop-blur-2xl" />

                    {/* Particules flottantes d'arrière-plan */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            className="absolute w-32 h-32 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl"
                            animate={{
                                x: [0, 100, -50, 0],
                                y: [0, -50, 100, 0],
                                scale: [1, 1.2, 0.8, 1],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ top: '20%', left: '10%' }}
                        />
                        <motion.div
                            className="absolute w-24 h-24 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-3xl"
                            animate={{
                                x: [0, -80, 60, 0],
                                y: [0, 80, -40, 0],
                                scale: [0.8, 1.3, 0.9, 0.8],
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            style={{ bottom: '30%', right: '15%' }}
                        />
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
                        className="relative max-w-lg mx-auto"
                    >
                        {/* Carte principale avec effet liquid glass */}
                        <div className="relative rounded-3xl bg-white/15 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] overflow-hidden">
                            {/* Effets de brillance et reflets */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/15 dark:from-white/8 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-tl from-red-500/5 dark:from-red-500/3 via-transparent to-orange-500/5 dark:to-orange-500/3 pointer-events-none" />

                            {/* Bordure interne lumineuse */}
                            <div className="absolute inset-px rounded-[calc(1.5rem-1px)] bg-gradient-to-b from-white/10 dark:from-white/5 to-transparent pointer-events-none" />

                            {/* Contenu principal */}
                            <div className="relative z-10 p-8 text-center">
                                {/* Icône d'erreur avec glassmorphism */}
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                                    className="relative w-20 h-20 mx-auto mb-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 dark:from-red-500/20 to-orange-500/30 dark:to-orange-500/20 rounded-2xl backdrop-blur-xl border border-black/10 dark:border-white/10" />
                                    <div className="absolute inset-px bg-gradient-to-br from-white/20 dark:from-white/10 to-transparent rounded-[calc(1rem-1px)]" />
                                    <div className="relative w-full h-full flex items-center justify-center text-red-600 dark:text-red-400">
                                        <motion.div
                                            animate={{ 
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-3xl"
                                        >
                                            ⚠️
                                        </motion.div>
                                    </div>
                                    {/* Effet de lueur autour de l'icône */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/40 dark:from-red-500/30 to-orange-500/40 dark:to-orange-500/30 rounded-2xl blur-xl opacity-50" />
                                </motion.div>

                                {/* Titre avec effet de texte */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.4 }}
                                    className="text-2xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-white/90 dark:to-white/70 font-heading"
                                >
                                    Oups, quelque chose s'est mal passé
                                </motion.h2>

                                {/* Message d'erreur */}
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.4 }}
                                    className="text-gray-700 dark:text-white/70 mb-6 leading-relaxed"
                                >
                                    {this.state.error?.message || 'Une erreur inattendue s\'est produite'}
                                </motion.p>

                                {/* Détails techniques en développement */}
                                {import.meta.env.DEV && this.state.error && (
                                    <motion.details
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5, duration: 0.4 }}
                                        className="mb-6 text-left"
                                    >
                                        <summary className="cursor-pointer text-xs text-gray-600 dark:text-white/60 hover:text-gray-800 dark:hover:text-white/80 mb-2 font-mono">
                                            🔍 Détails techniques
                                        </summary>
                                        <div className="mt-2 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 backdrop-blur-sm">
                                            <pre className="text-xs text-gray-600 dark:text-white/60 overflow-auto max-h-32 font-mono">
                                                {this.state.error.stack}
                                            </pre>
                                        </div>
                                    </motion.details>
                                )}

                                {/* Boutons d'action avec glassmorphism */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.4 }}
                                    className="flex flex-col sm:flex-row gap-3 justify-center"
                                >
                                    {/* Bouton Try Again */}
                                    <button
                                        onClick={this.handleRetry}
                                        className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-px transition-all duration-300 hover:scale-105 active:scale-95"
                                    >
                                        <div className="relative rounded-[calc(0.75rem-1px)] bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl px-6 py-3 transition-all duration-300 group-hover:from-blue-500 group-hover:to-purple-500">
                                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-white/20 via-white/20 dark:via-white/10 to-white/30 dark:to-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                            <span className="relative z-10 font-bold text-white tracking-wide">
                                                🔄 Réessayer
                                            </span>
                                        </div>
                                    </button>

                                    {/* Bouton Reload Page */}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="group relative overflow-hidden rounded-xl bg-white/10 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-xl px-6 py-3 transition-all duration-300 hover:bg-white/20 dark:hover:bg-white/10 hover:scale-105 active:scale-95"
                                    >
                                        <span className="relative z-10 font-bold text-gray-800 dark:text-white/90 tracking-wide">
                                            🔃 Recharger la page
                                        </span>
                                    </button>
                                </motion.div>
                            </div>

                            {/* Effets décoratifs flottants */}
                            <div className="absolute top-4 right-4 w-2 h-2 bg-gray-400/40 dark:bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
                            <div className="absolute bottom-6 left-6 w-1 h-1 bg-red-500/60 dark:bg-red-500/40 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                            <div className="absolute top-1/3 left-4 w-1.5 h-1.5 bg-orange-500/50 dark:bg-orange-500/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                        </div>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
