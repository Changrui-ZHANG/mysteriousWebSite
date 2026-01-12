import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectionState } from '../../hooks/useConnectionState';

interface ConnectionStatusProps {
    connectionState: ConnectionState;
    lastError: { message: string; timestamp: number; canRetry: boolean } | null;
    isRetrying: boolean;
    retryCount: number;
    onRetry?: () => void;
    onDismiss?: () => void;
    className?: string;
}

/**
 * Composant pour afficher l'état de connexion avec bouton retry manuel
 * Évite les boucles d'erreur en donnant le contrôle à l'utilisateur
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    connectionState,
    lastError,
    isRetrying,
    retryCount,
    onRetry,
    onDismiss,
    className = ''
}) => {
    const { t } = useTranslation();

    // Ne rien afficher si connecté et pas d'erreur
    if (connectionState === ConnectionState.CONNECTED && !lastError) {
        return null;
    }

    const getStatusConfig = () => {
        switch (connectionState) {
            case ConnectionState.RECONNECTING:
                return {
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-400',
                    icon: (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ),
                    title: t('connection.reconnecting', 'Reconnecting...'),
                    showRetry: false
                };
            
            case ConnectionState.ERROR:
                return {
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-400',
                    icon: (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    ),
                    title: t('connection.error', 'Connection Error'),
                    showRetry: true
                };
            
            default:
                return {
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-800',
                    iconColor: 'text-gray-400',
                    icon: (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    ),
                    title: t('connection.unknown', 'Connection Status'),
                    showRetry: false
                };
        }
    };

    const config = getStatusConfig();
    const canRetry = lastError?.canRetry && onRetry && !isRetrying;

    return (
        <div className={`${config.bgColor} ${config.borderColor} border rounded-md p-4 ${className}`}>
            <div className="flex items-start">
                <div className="shrink-0">
                    <div className={config.iconColor}>
                        {config.icon}
                    </div>
                </div>
                
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${config.textColor}`}>
                        {config.title}
                    </h3>
                    
                    {lastError && (
                        <div className={`mt-2 text-sm ${config.textColor}`}>
                            <p>{lastError.message}</p>
                            
                            {retryCount > 0 && (
                                <p className="mt-1 text-xs opacity-75">
                                    {t('connection.retry_count', 'Attempt {{count}}', { count: retryCount })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {config.showRetry && canRetry && (
                            <button
                                onClick={onRetry}
                                disabled={isRetrying}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {t('connection.retry', 'Retry Connection')}
                            </button>
                        )}

                        {onDismiss && connectionState !== ConnectionState.RECONNECTING && (
                            <button
                                onClick={onDismiss}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                {t('common.dismiss', 'Dismiss')}
                            </button>
                        )}
                    </div>

                    {/* Message d'aide */}
                    {config.showRetry && !canRetry && !isRetrying && (
                        <p className="mt-2 text-xs text-gray-600">
                            {retryCount >= 3 
                                ? t('connection.max_retries', 'Maximum retry attempts reached. Please check your connection.')
                                : t('connection.retry_disabled', 'Retry is currently disabled.')
                            }
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};