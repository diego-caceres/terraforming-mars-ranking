// Simple authentication service that checks against an environment variable password
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD || 'defaultpassword';

export const authenticate = (password: string): boolean => {
    return password === AUTH_PASSWORD;
};

export const isValidPassword = (): boolean => {
    return !!AUTH_PASSWORD && AUTH_PASSWORD !== 'defaultpassword';
};