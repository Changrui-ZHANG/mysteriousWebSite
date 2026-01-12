import React from 'react';
import { CircuitState } from '../../utils/circuitBreaker';

interface ErrorDisplayProps {
    error: string;
    onRetry?: () => void;
    onRetryWithBackoff?: () => void;
    canRetry?: boolean;
    circuitState?: CircuitState;
    className?: string;
    showDetails?: boolean;
}

/**
 * Reusable error display component with retry options
 * Prevents error message loops by providing manual retry buttons
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
    error,
    onRetry,
    onRetryWithBackoff,
    canRetry = true,
    circuitState,
    className = '',
    showDetails = false
}) => {
    const getCircuitStateInfo = () => {
        switch (circuitState) {
            case CircuitState.OPEN:
                return {
                    color: 'red',
                    text: 'Service temporarily unavailable',
                    description: 'Too many failures detected. Please wait before retrying.'
                };
            case CircuitState.HALF_OPEN:
                return {
                    color: 'yellow',
                    text: 'Service recovery in progress',
                    description: 'Testing service availability. Limited retries allowed.'
                };
            case CircuitState.CLOSED:
            default:
                return {
                    color: 'blue',
                    text: 'Service available',
                    description: 'Normal operation mode.'
                };
        }
    };

    const circuitInfo = circuitState ? getCircuitStateInfo() : null;
    const isCircuitOpen = circuitState === CircuitState.OPEN;

    return (
        <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                        Error occurred
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                    </div>

                    {/* Circuit Breaker Status */}
                    {circuitInfo && showDetails && (
                        <div className="mt-3 p-2 bg-gray-50 rounded border">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 bg-${circuitInfo.color}-500`}></div>
                                <span className="text-xs font-medium text-gray-700">
                                    {circuitInfo.text}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {circuitInfo.description}
                            </p>
                        </div>
                    )}

                    {/* Retry Buttons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {onRetry && !isCircuitOpen && (
                            <button
                                onClick={onRetry}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Try Again
                            </button>
                        )}

                        {onRetryWithBackoff && canRetry && !isCircuitOpen && (
                            <button
                                onClick={onRetryWithBackoff}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Smart Retry
                            </button>
                        )}

                        {isCircuitOpen && (
                            <div className="inline-flex items-center px-3 py-1.5 text-xs text-gray-500 bg-gray-100 rounded">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Retry blocked - please wait
                            </div>
                        )}
                    </div>

                    {/* Help Text */}
                    {canRetry && !isCircuitOpen && (
                        <p className="mt-2 text-xs text-gray-600">
                            Use "Try Again" for immediate retry or "Smart Retry" for intelligent backoff.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};