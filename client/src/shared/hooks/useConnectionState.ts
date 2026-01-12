import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

export enum ConnectionState {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error'
}

interface ConnectionError {
    message: string;
    timestamp: number;
    canRetry: boolean;
}

interface UseConnectionStateReturn {
    connectionState: ConnectionState;
    lastError: ConnectionError | null;
    isRetrying: boolean;
    retryCount: number;
    
    // Actions
    setConnected: () => void;
    setDisconnected: (error?: string, canRetry?: boolean) => void;
    setReconnecting: () => void;
    manualRetry: () => Promise<void>;
    clearError: () => void;
    
    // Helpers
    isConnected: boolean;
    canRetry: boolean;
    shouldShowRetryButton: boolean;
}

/**
 * Hook pour gérer l'état de connexion global et éviter les boucles d'erreur
 * Fournit un contrôle manuel des tentatives de reconnexion
 */
export function useConnectionState(
    onRetry?: () => Promise<void>,
    maxRetries: number = 3
): UseConnectionStateReturn {
    const { t } = useTranslation();
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CONNECTED);
    const [lastError, setLastError] = useState<ConnectionError | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Nettoyer les timeouts à la destruction
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);

    const setConnected = useCallback(() => {
        setConnectionState(ConnectionState.CONNECTED);
        setLastError(null);
        setRetryCount(0);
        setIsRetrying(false);
        
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
    }, []);

    const setDisconnected = useCallback((error?: string, canRetry: boolean = true) => {
        setConnectionState(ConnectionState.ERROR);
        setLastError({
            message: error || t('errors.connection.failed', 'Connection failed'),
            timestamp: Date.now(),
            canRetry
        });
        setIsRetrying(false);
    }, [t]);

    const setReconnecting = useCallback(() => {
        setConnectionState(ConnectionState.RECONNECTING);
        setIsRetrying(true);
    }, []);

    const clearError = useCallback(() => {
        setLastError(null);
        if (connectionState === ConnectionState.ERROR) {
            setConnectionState(ConnectionState.CONNECTED);
        }
    }, [connectionState]);

    const manualRetry = useCallback(async () => {
        if (!onRetry || isRetrying || retryCount >= maxRetries) {
            return;
        }

        try {
            setReconnecting();
            setRetryCount(prev => prev + 1);
            
            await onRetry();
            
            // Si pas d'erreur, considérer comme connecté
            setConnected();
        } catch (error) {
            const errorMessage = error instanceof Error 
                ? error.message 
                : t('errors.connection.retry_failed', 'Retry failed');
            
            setDisconnected(errorMessage, retryCount < maxRetries - 1);
        }
    }, [onRetry, isRetrying, retryCount, maxRetries, setReconnecting, setConnected, setDisconnected, t]);

    // Propriétés calculées
    const isConnected = connectionState === ConnectionState.CONNECTED;
    const canRetry = lastError?.canRetry === true && retryCount < maxRetries && !isRetrying;
    const shouldShowRetryButton = connectionState === ConnectionState.ERROR && canRetry;

    return {
        connectionState,
        lastError,
        isRetrying,
        retryCount,
        
        setConnected,
        setDisconnected,
        setReconnecting,
        manualRetry,
        clearError,
        
        isConnected,
        canRetry,
        shouldShowRetryButton
    };
}