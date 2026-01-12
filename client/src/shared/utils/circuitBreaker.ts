/**
 * Circuit Breaker Pattern Implementation
 * Prevents infinite request loops by temporarily blocking requests after failures
 */

export interface CircuitBreakerConfig {
    failureThreshold: number;    // Number of failures before opening circuit
    resetTimeout: number;        // Time in ms before attempting to reset
    monitoringPeriod: number;    // Time window for failure counting
    halfOpenMaxCalls: number;    // Max calls allowed in half-open state
}

export enum CircuitState {
    CLOSED = 'CLOSED',       // Normal operation
    OPEN = 'OPEN',           // Blocking requests
    HALF_OPEN = 'HALF_OPEN'  // Testing if service recovered
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failureCount = 0;
    private lastFailureTime = 0;
    private halfOpenCalls = 0;
    private readonly failures: number[] = [];

    constructor(private config: CircuitBreakerConfig) {}

    /**
     * Execute operation with circuit breaker protection
     */
    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (this.shouldAttemptReset()) {
                this.state = CircuitState.HALF_OPEN;
                this.halfOpenCalls = 0;
            } else {
                throw new Error('Circuit breaker is OPEN - requests blocked');
            }
        }

        if (this.state === CircuitState.HALF_OPEN) {
            if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
                throw new Error('Circuit breaker HALF_OPEN - max calls exceeded');
            }
            this.halfOpenCalls++;
        }

        try {
            const result = await operation();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    /**
     * Get current circuit state
     */
    getState(): CircuitState {
        return this.state;
    }

    /**
     * Get failure statistics
     */
    getStats() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            recentFailures: this.getRecentFailures(),
            lastFailureTime: this.lastFailureTime,
            nextRetryTime: this.lastFailureTime + this.config.resetTimeout
        };
    }

    /**
     * Manually reset circuit breaker
     */
    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.halfOpenCalls = 0;
        this.failures.length = 0;
    }

    private onSuccess(): void {
        if (this.state === CircuitState.HALF_OPEN) {
            this.reset();
        }
        // Don't reset failure count on success in CLOSED state
        // This allows for gradual recovery tracking
    }

    private onFailure(): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        this.failures.push(this.lastFailureTime);
        
        // Clean old failures outside monitoring period
        this.cleanOldFailures();

        if (this.state === CircuitState.HALF_OPEN) {
            this.state = CircuitState.OPEN;
        } else if (this.getRecentFailures() >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
        }
    }

    private shouldAttemptReset(): boolean {
        return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
    }

    private getRecentFailures(): number {
        this.cleanOldFailures();
        return this.failures.length;
    }

    private cleanOldFailures(): void {
        const cutoff = Date.now() - this.config.monitoringPeriod;
        while (this.failures.length > 0 && this.failures[0] < cutoff) {
            this.failures.shift();
        }
    }
}

/**
 * Circuit breaker registry for managing multiple breakers
 */
class CircuitBreakerRegistry {
    private breakers = new Map<string, CircuitBreaker>();
    
    getBreaker(key: string, config?: CircuitBreakerConfig): CircuitBreaker {
        if (!this.breakers.has(key)) {
            const defaultConfig: CircuitBreakerConfig = {
                failureThreshold: 5,
                resetTimeout: 60000,      // 1 minute
                monitoringPeriod: 300000, // 5 minutes
                halfOpenMaxCalls: 3
            };
            
            this.breakers.set(key, new CircuitBreaker(config || defaultConfig));
        }
        
        return this.breakers.get(key)!;
    }
    
    getAllBreakers(): Map<string, CircuitBreaker> {
        return new Map(this.breakers);
    }
    
    resetAll(): void {
        this.breakers.forEach(breaker => breaker.reset());
    }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();