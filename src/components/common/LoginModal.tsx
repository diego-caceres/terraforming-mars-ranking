import { useState } from 'react';
import { authenticate, isValidPassword } from '../../services/authService';

interface LoginModalProps {
    isOpen: boolean;
    onLogin: () => void;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onLogin, onClose }: LoginModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isValidPassword()) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Configuration Error</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        The authentication password has not been properly configured. 
                        Please set the VITE_AUTH_PASSWORD environment variable.
                    </p>
                </div>
            </div>
        );
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (authenticate(password)) {
            onLogin();
            setPassword('');
            setError('');
        } else {
            setError('Contraseña incorrecta');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    aria-label="Cerrar"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Iniciar sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 
                                     shadow-sm focus:border-blue-500 focus:ring-blue-500 
                                     dark:bg-gray-700 dark:text-white sm:text-sm"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent 
                                 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 
                                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                 focus:ring-blue-500"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}