import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { handleApiError, getUserErrorMessage, logError, AppError } from '../utils/errorHandling';
import { useToastContext } from '../contexts/ToastContext';

/**
 * Hook for standardized error handling across the application
 * Provides consistent error logging, user notifications, and error recovery
 */
export function useErrorHandler() {
    const { t } = useTranslation();
    const toast = useToastContext();

    /**
     * Handle and process errors with logging and user feedback
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

        // Show to user if enabled
        if (showToUser) {
            toast.error(userMessage, {
                title: t('errors.error_occurred'),
                duration: 6000,
            });
        }

        return {
            error: appError,
            userMessage,
        };
    }, [t, toast]);

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