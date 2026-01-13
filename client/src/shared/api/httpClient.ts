// API Utility Functions for Standardized Fetch Operations
import type { ApiResponse } from '../types/api';

export class ApiError extends Error {
    constructor(public status: number, message: string, public data?: unknown) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Checks if response is an ApiResponse wrapper from backend
 */
function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
    return (
        response !== null &&
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
 * Get authentication headers for API requests
 */
function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    
    // Try to get user from localStorage
    try {
        const storedUser = localStorage.getItem('messageWall_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            if (user?.userId) {
                headers['X-Requester-Id'] = user.userId;
            }
        }
    } catch (error) {
        console.warn('Failed to get user from localStorage for auth headers:', error);
    }
    
    return headers;
}

/**
 * Generic fetch wrapper with error handling and ApiResponse unwrapping
 */
export async function fetchJson<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    try {
        // Merge auth headers with existing headers
        const authHeaders = getAuthHeaders();
        const existingHeaders = options?.headers || {};
        
        // Convert Headers object to plain object if needed
        let headersObj: Record<string, string> = {};
        if (existingHeaders instanceof Headers) {
            existingHeaders.forEach((value, key) => {
                headersObj[key] = value;
            });
        } else if (Array.isArray(existingHeaders)) {
            // Handle array format [['key', 'value'], ...]
            existingHeaders.forEach(([key, value]) => {
                headersObj[key] = value;
            });
        } else {
            headersObj = { ...existingHeaders };
        }
        
        const headers = {
            ...authHeaders,
            ...headersObj,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

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
    data: unknown
): Promise<T> {
    const authHeaders = getAuthHeaders();
    return fetchJson<T>(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            ...authHeaders
        },
        body: JSON.stringify(data)
    });
}

/**
 * PUT request with JSON body
 */
export async function putJson<T>(
    url: string,
    data: unknown
): Promise<T> {
    const authHeaders = getAuthHeaders();
    return fetchJson<T>(url, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            ...authHeaders
        },
        body: JSON.stringify(data)
    });
}

/**
 * DELETE request
 */
export async function deleteJson<T>(url: string): Promise<T> {
    const authHeaders = getAuthHeaders();
    return fetchJson<T>(url, {
        method: 'DELETE',
        headers: authHeaders
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
