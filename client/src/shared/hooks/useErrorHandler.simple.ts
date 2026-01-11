import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { handleApiError, getUserErrorMessage, logError, AppError } from '../utils/errorHandling';

/**
 * Simplified error handler hook without Toast dependencies
 * Fallback version for debugging
 */
export function useErrorHandler() {
    const { t } = useTranslation();

    /**
     * Handle and process errors with logging and console feedback
     */
    const handleError = useCallback((
        error: unknown, 
        context?: string,
        options?: {
            showToUser?: boolean;
            logError?: boolean;
            customMessage?: string;
        }
    ) => {
        const { 
            showToUser = true, 
            logError: shouldLog = true,
            customMessage 
        } = options || {};

        // Convert to AppError
        const appError = handleApiError(error, context);

        // Log error if enabled
        if (shouldLog) {
            logError(appError, { context });
        }

        // Get user-friendly message
        const userMessage = customMessage || getUserErrorMessage(appError, t);

        // Show to user via console for now (fallback)
        if (showToUser) {
            console.error('User Error:', userMessage);
            // Could show alert in development
            if (import.meta.env?.DEV) {
                // alert(userMessage); // Uncomment for debugging
            }
        }

        return {
            error: appError,
            userMessage,
        };
    }, [t]);

    /**
     * Wrapper for async operations with error handling
     */
    const withErrorHandling = useCallback(<T>(
        operation: () => Promise<T>,
        context?: string,
        options?: {
            showToUser?: boolean;
            logError?: boolean;
            customMessage?: string;
            onError?: (error: AppError) => void;
        }
    ) => {
        return async (): Promise<T | null> => {
            try {
                return await operation();
            } catch (error) {
                const result = handleError(error, context, options);
                options?.onError?.(result.error);
                return null;
            }
        };
    }, [handleError]);

    /**
     * Create error boundary error handler
     */
    const createErrorBoundaryHandler = useCallback((context: string) => {
        return (error: Error, errorInfo: { componentStack: string }) => {
            const appError = handleApiError(error, context);
            logError(appError, { 
                context, 
                componentStack: errorInfo.componentStack 
            });
        };
    }, []);

    return {
        handleError,
        withErrorHandling,
        createErrorBoundaryHandler,
    };
}