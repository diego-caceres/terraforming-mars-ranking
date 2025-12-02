// Simple authentication service that checks against an environment variable password
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'defaultpassword';
const USE_LOCAL_STORAGE = import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';

export const authenticate = (password: string): boolean => {
    // No authentication needed when using localStorage
    if (USE_LOCAL_STORAGE) {
        return true;
    }
    return password === AUTH_PASSWORD;
};

export const isValidPassword = (): boolean => {
    // No password validation needed when using localStorage
    if (USE_LOCAL_STORAGE) {
        return true;
    }
    return !!AUTH_PASSWORD && AUTH_PASSWORD !== 'defaultpassword';
};

export const requiresAuthentication = (): boolean => {
    // Authentication is not required when using localStorage
    return !USE_LOCAL_STORAGE;
};