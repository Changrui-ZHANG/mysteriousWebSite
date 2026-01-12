import { useState, useCallback, useRef } from 'react';
import { circuitBreakerRegistry, CircuitState } from '../utils/circuitBreaker';
import { handleApiError, AppError, ERROR_CODES } from '../utils/errorHandling';

export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
    jitter: boolean;
}

export interface RequestState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    attemptCount: number;
    canRetry: boolean;
    circuitState: CircuitState;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true
};

/**
 * Hook for retryable requests with circuit breaker protection
 * Prevents infinite request loops and provides intelligent retry logic
 */
export function useRetryableRequest<T>(
    requestKey: string,
    retryConfig: Partial<RetryConfig> = {}
) {
    const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
    const [state, setState] = useState<RequestState<T>>({
        data: null,
        isLoading: false,
        error: null,
        attemptCount: 0,
        canRetry: true,
        circuitState: CircuitState.CLOSED
    });
    
    const abortControllerRef = useRef<AbortController | null>(null);
    const circuitBreaker = circuitBreakerRegistry.getBreaker(requestKey);

    /**
     * Calculate delay with exponential backoff and jitter
     */
    const calculateDelay = useCallback((attempt: number): number => {
        let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
        delay = Math.min(delay, config.maxDelay);
        
        if (config.jitter) {
            // Add random jitter (±25%)
            const jitterRange = delay * 0.25;
            delay += (Math.random() - 0.5) * 2 * jitterRange;
        }
        
        return Math.max(delay, 100); // Minimum 100ms delay
    }, [config]);

    /**
     * Execute request with retry logic and circuit breaker
     */
    const executeRequest = useCallback(async <TResult = T>(
        requestFn: (signal: AbortSignal) => Promise<TResult>,
        options: {
            skipCircuitBreaker?: boolean;
            onRetry?: (attempt: number, error: AppError) => void;
            onSuccess?: (data: TResult) => void;
            onFailure?: (error: AppError) => void;
        } = {}
    ): Promise<TResult> => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
            attemptCount: 0,
            circuitState: circuitBreaker.getState()
        }));

        let lastError: AppError;
        
        for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
            if (signal.aborted) {
                throw new AppError('Request cancelled', ERROR_CODES.OPERATION_FAILED);
            }

            setState(prev => ({
                ...prev,
                attemptCount: attempt,
                circuitState: circuitBreaker.getState()
            }));

            try {
                const executeWithCircuitBreaker = async () => {
                    if (options.skipCircuitBreaker) {
                        return await requestFn(signal);
                    }
                    return await circuitBreaker.execute(() => requestFn(signal));
                };

                const result = await executeWithCircuitBreaker();
                
                setState(prev => ({
                    ...prev,
                    data: result as T,
                    isLoading: false,
                    error: null,
                    canRetry: true,
                    circuitState: circuitBreaker.getState()
                }));

                options.onSuccess?.(result);
                return result;

            } catch (error) {
                lastError = handleApiError(error, `${requestKey} attempt ${attempt}`);
                
                // Check if circuit breaker is blocking requests
                if (lastError.message.includes('Circuit breaker')) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: 'Service temporarily unavailable. Please try again later.',
                        canRetry: false,
                        circuitState: circuitBreaker.getState()
                    }));
                    
                    options.onFailure?.(lastError);
                    throw lastError;
                }

                // Don't retry on certain error types
                if (shouldNotRetry(lastError)) {
                    setState(prev => ({
                        ...prev,
                        isLoading: false,
                        error: lastError.userMessage || lastError.message,
                        canRetry: false,
                        circuitState: circuitBreaker.getState()
                    }));
                    
                    options.onFailure?.(lastError);
                    throw lastError;
                }

                // If this is the last attempt, don't wait
                if (attempt === config.maxAttempts) {
                    break;
                }

                // Wait before retry
                const delay = calculateDelay(attempt);
                options.onRetry?.(attempt, lastError);
                
                await new Promise(resolve => {
                    const timeoutId = setTimeout(resolve, delay);
                    
                    // Cancel delay if request is aborted
                    signal.addEventListener('abort', () => {
                        clearTimeout(timeoutId);
                        resolve(undefined);
                    });
                });
            }
        }

        // All attempts failed
        setState(prev => ({
            ...prev,
            isLoading: false,
            error: lastError.userMessage || lastError.message,
            canRetry: !shouldNotRetry(lastError),
            circuitState: circuitBreaker.getState()
        }));

        options.onFailure?.(lastError);
        throw lastError;
    }, [requestKey, config, calculateDelay, circuitBreaker]);

    /**
     * Retry the last failed request
     */
    const retry = useCallback(async <TResult = T>(
        requestFn: (signal: AbortSignal) => Promise<TResult>,
        options?: Parameters<typeof executeRequest>[1]
    ): Promise<TResult> => {
        if (!state.canRetry) {
            throw new AppError(
                'Cannot retry this request',
                ERROR_CODES.OPERATION_FAILED,
                'Cette requête ne peut pas être relancée'
            );
        }

        return executeRequest(requestFn, options);
    }, [state.canRetry, executeRequest]);

    /**
     * Cancel ongoing request
     */
    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        
        setState(prev => ({
            ...prev,
            isLoading: false
        }));
    }, []);

    /**
     * Reset state
     */
    const reset = useCallback(() => {
        cancel();
        setState({
            data: null,
            isLoading: false,
            error: null,
            attemptCount: 0,
            canRetry: true,
            circuitState: circuitBreaker.getState()
        });
    }, [cancel, circuitBreaker]);

    /**
     * Get circuit breaker statistics
     */
    const getCircuitStats = useCallback(() => {
        return circuitBreaker.getStats();
    }, [circuitBreaker]);

    return {
        ...state,
        executeRequest,
        retry,
        cancel,
        reset,
        getCircuitStats
    };
}

/**
 * Determine if an error should not be retried
 */
function shouldNotRetry(error: AppError): boolean {
    const nonRetryableCodes = [
        ERROR_CODES.AUTH_REQUIRED,
        ERROR_CODES.AUTH_INVALID,
        ERROR_CODES.PERMISSION_DENIED,
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_CODES.INVALID_INPUT,
        ERROR_CODES.RESOURCE_NOT_FOUND
    ];
    
    return nonRetryableCodes.includes(error.code as any);
}