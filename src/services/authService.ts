// Simple authentication service that checks against an environment variable password
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'defaultpassword';
const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

const SESSION_KEY = 'auth:session';
const SESSION_DURATION_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const USER_NAME_KEY = 'user:displayName';

export const authenticate = (password: string): boolean => {
    if (USE_LOCAL_STORAGE) return true;
    return password === AUTH_PASSWORD;
};

export const isValidPassword = (): boolean => {
    if (USE_LOCAL_STORAGE) return true;
    return !!AUTH_PASSWORD && AUTH_PASSWORD !== 'defaultpassword';
};

export const requiresAuthentication = (): boolean => {
    return !USE_LOCAL_STORAGE;
};

export const saveSession = (): void => {
    localStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION_MS));
};

export const isSessionValid = (): boolean => {
    if (USE_LOCAL_STORAGE) return true;
    const expiry = localStorage.getItem(SESSION_KEY);
    return !!expiry && Date.now() < Number(expiry);
};

export const clearSession = (): void => {
    localStorage.removeItem(SESSION_KEY);
};

export const getUserName = (): string => {
    return localStorage.getItem(USER_NAME_KEY) || '';
};

export const saveUserName = (name: string): void => {
    if (name.trim()) {
        localStorage.setItem(USER_NAME_KEY, name.trim());
    } else {
        localStorage.removeItem(USER_NAME_KEY);
    }
};

export const clearUserName = (): void => {
    localStorage.removeItem(USER_NAME_KEY);
};