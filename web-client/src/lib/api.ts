import axios from 'axios';

/**
 * Resolve the API base URL. Priority:
 *   1. A value the user saved at runtime (localStorage) — lets the same static
 *      build point at any backend without rebuilding.
 *   2. The build-time VITE_API_URL.
 *   3. localhost for local development.
 */
const RUNTIME_KEY = 'pet.apiUrl';

export function getApiBaseUrl(): string {
    const runtime = typeof localStorage !== 'undefined' ? localStorage.getItem(RUNTIME_KEY) : null;
    const base = runtime || import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/api`;
}

export function setApiBaseUrl(url: string) {
    if (url) localStorage.setItem(RUNTIME_KEY, url.replace(/\/$/, ''));
    else localStorage.removeItem(RUNTIME_KEY);
    api.defaults.baseURL = getApiBaseUrl();
}

export const api = axios.create({
    baseURL: getApiBaseUrl(),
});

const TOKEN_KEY = 'pet.token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

// Attach the bearer token to every request.
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Normalise error messages and handle expired sessions globally.
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const message =
            error.response?.data?.error ||
            error.response?.data?.message ||
            (error.code === 'ERR_NETWORK' ? 'Cannot reach the API. Check the API URL.' : 'Something went wrong.');

        if (error.response?.status === 401 && getToken()) {
            setToken(null);
            // Let the app react (redirect to login) on the next render.
            window.dispatchEvent(new Event('pet:unauthorized'));
        }
        return Promise.reject(new Error(message));
    }
);
