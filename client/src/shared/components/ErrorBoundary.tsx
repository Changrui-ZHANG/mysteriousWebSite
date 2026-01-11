import React, { Component, ReactNode } from 'react';
import { AppError, logError, ERROR_CODES } from '../utils/errorHandling';

interface Props {
    children: ReactNode;
    fallback?: (error: Error, retry: () => void, t: (key: string) => string) => ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    context?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        const appError = new AppError(
            error.message,
            ERROR_CODES.UNKNOWN_ERROR,
            'Une erreur inattendue est survenue',
            error
        );

        logError(appError, {
            context: this.props.context || 'ErrorBoundary',
            componentStack: errorInfo.componentStack,
        });

        this.props.onError?.(error, errorInfo);
    }

    retry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError && this.state.error) {
            if (this.props.fallback) {
                return this.props.fallback(
                    this.state.error, 
                    this.retry,
                    (key: string) => key // Simple fallback translation
                );
            }

            return (
                <div className="error-boundary">
                    <div className="error-boundary__content">
                        <h2>Oops! Quelque chose s'est mal passé</h2>
                        <p>Une erreur inattendue est survenue. Vous pouvez essayer de recharger la page.</p>
                        <div className="error-boundary__actions">
                            <button 
                                onClick={this.retry}
                                className="btn btn-primary"
                            >
                                Réessayer
                            </button>
                            <button 
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary"
                            >
                                Recharger la page
                            </button>
                        </div>
                        {import.meta.env.DEV && (
                            <details className="error-boundary__details">
                                <summary>Détails de l'erreur (développement)</summary>
                                <pre>{this.state.error.stack}</pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

export default ErrorBoundary;