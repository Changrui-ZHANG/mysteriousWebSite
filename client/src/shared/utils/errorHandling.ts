import { ApiError } from '../api/httpClient';

/**
 * Application-specific error class
 * Extends the base Error with additional context
 */
export class AppError extends Error {
    constructor(
        message: string,
        public code: string,
        public userMessage?: string,
        public originalError?: unknown
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Error codes for different types of errors
 */
export const ERROR_CODES = {
    // Network errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    API_ERROR: 'API_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    
    // Authentication errors
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    AUTH_INVALID: 'AUTH_INVALID',
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    
    // Validation errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    
    // Business logic errors
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    OPERATION_FAILED: 'OPERATION_FAILED',
    
    // Unknown errors
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * Convert various error types to AppError
 */
export function handleApiError(error: unknown, context?: string): AppError {
    // Handle ApiError from HTTP client
    if (error instanceof ApiError) {
        return new AppError(
            `API Error: ${error.message}`,
            ERROR_CODES.API_ERROR,
            error.message,
            error
        );
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
        return new AppError(
            'Network connection failed',
            ERROR_CODES.NETWORK_ERROR,
            'Connexion réseau échouée. Vérifiez votre connexion internet.',
            error
        );
    }
    
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
        return new AppError(
            'Request timeout',
            ERROR_CODES.TIMEOUT_ERROR,
            'La requête a pris trop de temps. Veuillez réessayer.',
            error
        );
    }
    
    // Handle standard Error objects
    if (error instanceof Error) {
        return new AppError(
            error.message,
            ERROR_CODES.UNKNOWN_ERROR,
            'Une erreur inattendue est survenue.',
            error
        );
    }
    
    // Handle unknown error types
    return new AppError(
        `Unknown error${context ? ` in ${context}` : ''}`,
        ERROR_CODES.UNKNOWN_ERROR,
        'Une erreur inattendue est survenue.',
        error
    );
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserErrorMessage(error: AppError, t: (key: string) => string): string {
    if (error.userMessage) {
        return error.userMessage;
    }
    
    switch (error.code) {
        case ERROR_CODES.NETWORK_ERROR:
            return t('errors.network_error');
        case ERROR_CODES.API_ERROR:
            return t('errors.api_error');
        case ERROR_CODES.TIMEOUT_ERROR:
            return t('errors.timeout_error');
        case ERROR_CODES.AUTH_REQUIRED:
            return t('errors.auth_required');
        case ERROR_CODES.AUTH_INVALID:
            return t('errors.auth_invalid');
        case ERROR_CODES.PERMISSION_DENIED:
            return t('errors.permission_denied');
        case ERROR_CODES.VALIDATION_ERROR:
            return t('errors.validation_error');
        case ERROR_CODES.INVALID_INPUT:
            return t('errors.invalid_input');
        case ERROR_CODES.RESOURCE_NOT_FOUND:
            return t('errors.resource_not_found');
        case ERROR_CODES.RESOURCE_CONFLICT:
            return t('errors.resource_conflict');
        case ERROR_CODES.OPERATION_FAILED:
            return t('errors.operation_failed');
        default:
            return t('errors.unknown_error');
    }
}

/**
 * Log error with context information
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
    console.group(`[${error.code}] ${error.message}`);
    console.error('Error:', error);
    console.error('Original Error:', error.originalError);
    if (context) {
        console.error('Context:', context);
    }
    console.error('Stack:', error.stack);
    console.groupEnd();
}

/**
 * Create error boundary fallback component props
 */
export interface ErrorFallbackProps {
    error: Error;
    resetError: () => void;
}

/**
 * Retry configuration for operations
 */
export interface RetryConfig {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
}

/**
 * Retry an async operation with error handling
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    config: RetryConfig = { maxAttempts: 3, delay: 1000 }
): Promise<T> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            if (attempt === config.maxAttempts) {
                break;
            }
            
            const delay = config.backoff === 'exponential' 
                ? config.delay * Math.pow(2, attempt - 1)
                : config.delay;
                
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    throw handleApiError(lastError, 'retry operation');
}