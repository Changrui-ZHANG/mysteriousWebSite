import { useState, useEffect } from 'react';
import { fetchJson, ApiError } from '../utils/api';

interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: ApiError | null;
    refetch: () => void;
}

/**
 * Generic hook for fetching data from an API
 * Handles loading, error states, and provides refetch capability
 */
export function useApi<T>(
    url: string | null,
    options?: RequestInit
): UseApiResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        if (!url) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        setLoading(true);
        setError(null);

        fetchJson<T>(url, options)
            .then(result => {
                if (!cancelled) {
                    setData(result);
                    setError(null);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err instanceof ApiError ? err : new ApiError(0, err.message));
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [url, refetchTrigger, JSON.stringify(options)]);

    const refetch = () => setRefetchTrigger(prev => prev + 1);

    return { data, loading, error, refetch };
}

/**
 * Hook for lazy data fetching (only fetch when explicitly called)
 */
export function useLazyApi<T>(
    url: string,
    options?: RequestInit
): [() => Promise<T>, UseApiResult<T>] {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<ApiError | null>(null);

    const execute = async (): Promise<T> => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchJson<T>(url, options);
            setData(result);
            return result;
        } catch (err) {
            const apiError = err instanceof ApiError ? err : new ApiError(0, err.message);
            setError(apiError);
            throw apiError;
        } finally {
            setLoading(false);
        }
    };

    return [
        execute,
        { data, loading, error, refetch: execute }
    ];
}
