import { fetchJson, postJson, putJson, deleteJson } from '../api/httpClient';

/**
 * Base service class providing common CRUD operations
 * All domain services should extend this class for consistency
 */
export abstract class BaseService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    protected constructor(protected readonly baseUrl: string) {}

    /**
     * Fetch all items
     */
    async findAll(): Promise<T[]> {
        return fetchJson<T[]>(this.baseUrl);
    }

    /**
     * Fetch item by ID
     */
    async findById(id: string): Promise<T> {
        return fetchJson<T>(`${this.baseUrl}/${id}`);
    }

    /**
     * Create new item
     */
    async create(data: TCreate): Promise<T> {
        return postJson<T>(this.baseUrl, data);
    }

    /**
     * Update existing item
     */
    async update(id: string, data: TUpdate): Promise<T> {
        return putJson<T>(`${this.baseUrl}/${id}`, data);
    }

    /**
     * Delete item
     */
    async delete(id: string): Promise<void> {
        return deleteJson<void>(`${this.baseUrl}/${id}`);
    }

    /**
     * Build URL with query parameters
     */
    protected buildUrl(path: string, params?: Record<string, string | number>): string {
        const url = `${this.baseUrl}${path}`;
        if (!params) return url;

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            searchParams.append(key, String(value));
        });

        return `${url}?${searchParams.toString()}`;
    }
}