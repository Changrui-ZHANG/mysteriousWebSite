import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { handleApiError, getUserErrorMessage, logError, AppError } from '../utils/errorHandling';

/**
 * Silent error handler hook that doesn't show automatic toasts
 * Used to prevent error message loops while still providing error processing
 */
export function useSilentErrorHandler() {
    const { t } = useTranslation();

    /**
     * Handle and process errors silently (no automatic UI feedback)
     */
    const handleError = useCallback((
        error: unknown, 
        context?: string,
        options?: {
            logError?: boolean;
            customMessage?: string;
        }
    ) => {
        const { 
            logError: shouldLog = true,
            customMessage 
        } = options || {};

        // Convert to AppError
        const appError = handleApiError(error, context);

        // Log error if enabled (but don't spam console in production)
        if (shouldLog && import.meta.env?.DEV) {
            logError(appError, { context });
        }

        // Get user-friendly message
        const userMessage = customMessage || getUserErrorMessage(appError, t);

        return {
            error: appError,
            userMessage,
        };
    }, [t]);

    /**
     * Wrapper for async operations with silent error handling
     */
    const withSilentErrorHandling = useCallback(<T>(
        operation: () => Promise<T>,
        context?: string,
        options?: {
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
     * Check if error should be retried
     */
    const shouldRetry = useCallback((error: AppError): boolean => {
        const nonRetryableCodes = [
            'AUTH_REQUIRED',
            'AUTH_INVALID',
            'PERMISSION_DENIED',
            'VALIDATION_ERROR',
            'INVALID_INPUT',
            'RESOURCE_NOT_FOUND'
        ];
        
        return !nonRetryableCodes.includes(error.code);
    }, []);

    /**
     * Get retry delay based on attempt count
     */
    const getRetryDelay = useCallback((attempt: number, baseDelay: number = 1000): number => {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        const maxDelay = 10000; // 10 seconds max
        const jitter = Math.random() * 0.25; // ±25% jitter
        
        return Math.min(delay * (1 + jitter), maxDelay);
    }, []);

    return {
        handleError,
        withSilentErrorHandling,
        shouldRetry,
        getRetryDelay,
    };
}