// API Utility Functions for Standardized Fetch Operations
import type { ApiResponse } from '../types/api';

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: any) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Checks if response is an ApiResponse wrapper from backend
 */
function isApiResponse<T>(response: any): response is ApiResponse<T> {
    return (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        'data' in response &&
        'timestamp' in response
    );
}

/**
 * Unwraps ApiResponse from backend, extracting the data field
 */
function unwrapApiResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
        throw new ApiError(
            400,
            response.message || 'API request failed',
            response
        );
    }

    // For void responses (DELETE, etc.), data might be null
    // Return empty object for type compatibility
    if (response.data === null || response.data === undefined) {
        return {} as T;
    }

    return response.data;
}

/**
 * Generic fetch wrapper with error handling and ApiResponse unwrapping
 */
export async function fetchJson<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = {};
            }

            // Check if error response is ApiResponse format
            if (isApiResponse(errorData)) {
                throw new ApiError(
                    response.status,
                    errorData.message || `HTTP ${response.status}`,
                    errorData
                );
            }

            throw new ApiError(
                response.status,
                errorData.error || errorData.message || `HTTP ${response.status}`,
                errorData
            );
        }

        const jsonData = await response.json();

        // Auto-unwrap if it's an ApiResponse
        if (isApiResponse<T>(jsonData)) {
            return unwrapApiResponse(jsonData);
        }

        // Otherwise return directly (backward compatibility)
        return jsonData;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(0, 'Network error or invalid JSON');
    }
}

/**
 * POST request with JSON body
 */
export async function postJson<T>(
    url: string,
    data: any
): Promise<T> {
    return fetchJson<T>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

/**
 * PUT request with JSON body
 */
export async function putJson<T>(
    url: string,
    data: any
): Promise<T> {
    return fetchJson<T>(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request
 */
export async function deleteJson<T>(url: string): Promise<T> {
    return fetchJson<T>(url, {
        method: 'DELETE'
    });
}

/**
 * Helper to handle query parameters
 */
export function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
    if (!params) return base;

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        query.append(key, String(value));
    });

    const queryString = query.toString();
    return queryString ? `${base}?${queryString}` : base;
}
