// Identity tokens: attaches "Authorization: Bearer <token>" to every /api request.
// Logged-in users use the token stored with the user; everyone else uses a guest token.
import { STORAGE_KEYS } from '../constants/authStorage';
import { STORAGE_KEYS as CONFIG_STORAGE_KEYS } from '../constants/config';

/** Fired when the stored user session is no longer valid (AuthContext logs out). */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

const GUEST_ID_KEY = CONFIG_STORAGE_KEYS.USER_ID;

let nativeFetch: typeof fetch = (...args) => window.fetch(...args);
let guestPromise: Promise<string> | null = null;
let guestRefreshed = false;

function readUserToken(): string | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        return stored ? (JSON.parse(stored)?.token ?? null) : null;
    } catch {
        return null;
    }
}

/** Token to send: the logged-in user's, else the guest's. */
export function getAuthToken(): string | null {
    return readUserToken() ?? localStorage.getItem(STORAGE_KEYS.GUEST_TOKEN);
}

/** Headers object for raw XMLHttpRequest calls. */
export function authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Resolve the guest identity, requesting a guest token from the server if none is stored.
 * The existing local guest id is sent so past guest messages stay owned by this browser.
 */
export function ensureGuestSession(): Promise<string> {
    const storedId = localStorage.getItem(GUEST_ID_KEY);
    if (storedId && localStorage.getItem(STORAGE_KEYS.GUEST_TOKEN)) {
        return Promise.resolve(storedId);
    }
    if (!guestPromise) {
        guestPromise = nativeFetch('/api/auth/guest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestId: storedId }),
        })
            .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
            .then(json => {
                const { userId, token } = json.data as { userId: string; token: string };
                localStorage.setItem(GUEST_ID_KEY, userId);
                localStorage.setItem(STORAGE_KEYS.GUEST_TOKEN, token);
                return userId;
            })
            .catch(error => {
                console.error('Failed to obtain guest token:', error);
                return storedId ?? '';
            })
            .finally(() => { guestPromise = null; });
    }
    return guestPromise;
}

function handleUnauthorized(sentToken: string | null) {
    const userToken = readUserToken();
    if (sentToken && sentToken === userToken) {
        // Expired/invalid user session: log out, user must log in again
        localStorage.removeItem(STORAGE_KEYS.USER);
        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    } else if (!userToken && !guestRefreshed) {
        // Guest token missing/invalid: request a new one, once per page load (no loops)
        guestRefreshed = true;
        localStorage.removeItem(STORAGE_KEYS.GUEST_TOKEN);
        ensureGuestSession();
    }
}

function isApiUrl(url: string): boolean {
    return url.startsWith('/api') || url.startsWith(`${window.location.origin}/api`);
}

/**
 * Install the fetch wrapper and bootstrap the session. Call once before rendering.
 */
export function installAuth() {
    // Sessions from before identity tokens: log out cleanly so the user logs in again
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.USER);
        if (stored && !JSON.parse(stored)?.token) {
            localStorage.removeItem(STORAGE_KEYS.USER);
        }
    } catch {
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    const original = window.fetch.bind(window);
    nativeFetch = original;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (!isApiUrl(url)) {
            return original(input, init);
        }
        // Let a pending guest bootstrap finish so the request carries its token
        if (guestPromise && !url.includes('/api/auth/')) {
            await guestPromise;
        }
        const token = getAuthToken();
        const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
        if (token && !headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        const response = await original(input, { ...init, headers });
        if (response.status === 401) {
            handleUnauthorized(token);
        }
        return response;
    };

    if (!readUserToken()) {
        ensureGuestSession();
    }
}
