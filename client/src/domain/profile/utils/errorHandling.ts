/**
 * Profile-specific error handling utilities
 * Provides user-friendly error messages for common profile API errors
 */

import { ApiError } from '../../../shared/api/httpClient';

export interface ProfileErrorInfo {
    title: string;
    message: string;
    canRetry: boolean;
    isAuthError: boolean;
    showDetails: boolean;
}

/**
 * Convert API errors to user-friendly profile error information
 */
export function handleProfileError(error: unknown): ProfileErrorInfo {
    // Handle ApiError instances
    if (error instanceof ApiError) {
        switch (error.status) {
            case 401:
                return {
                    title: 'Authentication Required',
                    message: 'Please log in to view this profile.',
                    canRetry: false,
                    isAuthError: true,
                    showDetails: false,
                };
                
            case 403:
                return {
                    title: 'Access Denied',
                    message: 'You don\'t have permission to view this profile. It may be private or you may not be authorized.',
                    canRetry: false,
                    isAuthError: true,
                    showDetails: false,
                };
                
            case 404:
                return {
                    title: 'Profile Not Found',
                    message: 'The requested profile could not be found. It may have been deleted or the link is incorrect.',
                    canRetry: false,
                    isAuthError: false,
                    showDetails: false,
                };
                
            case 429:
                return {
                    title: 'Too Many Requests',
                    message: 'You\'re making too many requests. Please wait a moment and try again.',
                    canRetry: true,
                    isAuthError: false,
                    showDetails: false,
                };
                
            case 500:
                return {
                    title: 'Server Error',
                    message: 'Something went wrong on our end. Please try again in a few moments.',
                    canRetry: true,
                    isAuthError: false,
                    showDetails: true,
                };
                
            case 503:
                return {
                    title: 'Service Unavailable',
                    message: 'The profile service is temporarily unavailable. Please try again later.',
                    canRetry: true,
                    isAuthError: false,
                    showDetails: false,
                };
                
            default:
                return {
                    title: 'Request Failed',
                    message: error.message || `Request failed with status ${error.status}`,
                    canRetry: error.status >= 500,
                    isAuthError: false,
                    showDetails: true,
                };
        }
    }
    
    // Handle network errors
    if (error instanceof Error) {
        if (error.message.includes('Network error') || error.message.includes('fetch')) {
            return {
                title: 'Connection Error',
                message: 'Unable to connect to the server. Please check your internet connection and try again.',
                canRetry: true,
                isAuthError: false,
                showDetails: false,
            };
        }
        
        return {
            title: 'Unexpected Error',
            message: error.message,
            canRetry: true,
            isAuthError: false,
            showDetails: true,
        };
    }
    
    // Fallback for unknown errors
    return {
        title: 'Unknown Error',
        message: 'An unexpected error occurred. Please try again.',
        canRetry: true,
        isAuthError: false,
        showDetails: true,
    };
}

/**
 * Check if an error is a permission/authentication error
 */
export function isAuthError(error: unknown): boolean {
    if (error instanceof ApiError) {
        return error.status === 401 || error.status === 403;
    }
    return false;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
        // Don't retry auth errors or client errors (4xx except 429)
        if (error.status >= 400 && error.status < 500 && error.status !== 429) {
            return false;
        }
        // Retry server errors (5xx) and rate limiting (429)
        return error.status >= 500 || error.status === 429;
    }
    
    // Retry network errors
    if (error instanceof Error && error.message.includes('Network error')) {
        return true;
    }
    
    return true; // Default to retryable for unknown errors
}

/**
 * Get appropriate retry delay based on error type
 */
export function getRetryDelay(error: unknown, attemptIndex: number): number {
    if (error instanceof ApiError) {
        switch (error.status) {
            case 429: // Rate limiting - longer delay
                return Math.min(5000 * 2 ** attemptIndex, 60000); // 5s, 10s, 20s, 40s, 60s max
            case 503: // Service unavailable - medium delay
                return Math.min(2000 * 2 ** attemptIndex, 30000); // 2s, 4s, 8s, 16s, 30s max
            default: // Other server errors - standard delay
                return Math.min(1000 * 2 ** attemptIndex, 15000); // 1s, 2s, 4s, 8s, 15s max
        }
    }
    
    // Standard exponential backoff for other errors
    return Math.min(1000 * 2 ** attemptIndex, 10000);
}

/**
 * Profile-specific error messages for mutations
 */
export function handleProfileMutationError(error: unknown, operation: 'create' | 'update' | 'delete'): ProfileErrorInfo {
    const baseError = handleProfileError(error);
    
    // Customize messages based on operation
    switch (operation) {
        case 'create':
            if (error instanceof ApiError && error.status === 409) {
                return {
                    ...baseError,
                    title: 'Profile Already Exists',
                    message: 'A profile with this information already exists.',
                    canRetry: false,
                };
            }
            return {
                ...baseError,
                title: baseError.title.replace('Request Failed', 'Profile Creation Failed'),
                message: baseError.message.replace('Request failed', 'Failed to create profile'),
            };
            
        case 'update':
            if (error instanceof ApiError && error.status === 409) {
                return {
                    ...baseError,
                    title: 'Conflict',
                    message: 'The profile has been modified by someone else. Please refresh and try again.',
                    canRetry: false,
                };
            }
            return {
                ...baseError,
                title: baseError.title.replace('Request Failed', 'Profile Update Failed'),
                message: baseError.message.replace('Request failed', 'Failed to update profile'),
            };
            
        case 'delete':
            return {
                ...baseError,
                title: baseError.title.replace('Request Failed', 'Profile Deletion Failed'),
                message: baseError.message.replace('Request failed', 'Failed to delete profile'),
            };
            
        default:
            return baseError;
    }
}