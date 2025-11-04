import { useState, useEffect, useRef } from 'react';
import { authenticate, isValidPassword } from '../../services/authService';

interface LoginModalProps {
    isOpen: boolean;
    onLogin: () => void | Promise<void>;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onLogin, onClose }: LoginModalProps) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const passwordInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && passwordInputRef.current) {
            passwordInputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isValidPassword()) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <div className="tm-card w-full max-w-md space-y-4 p-6 text-center">
                    <h2 className="text-xl font-heading uppercase tracking-[0.3em] text-tm-copper-dark dark:text-tm-glow">
                        Configuration Error
                    </h2>
                    <p className="text-sm text-tm-oxide/80 dark:text-tm-sand/80">
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={handleBackdropClick}>
            <div className="tm-card relative w-full max-w-md p-6">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full border border-tm-copper/30 p-2 text-tm-oxide hover:bg-tm-copper/10 hover:text-tm-copper-dark dark:border-white/20 dark:text-tm-sand dark:hover:bg-white/10"
                    aria-label="Cerrar"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="mb-4 text-xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">Iniciar sesión</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="password" className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            ref={passwordInputRef}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 block w-full rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide shadow-inner focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
                        />
                    </div>
                    {error && (
                        <p className="text-sm font-semibold uppercase tracking-wide text-tm-copper-dark dark:text-tm-glow">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="tm-button-primary w-full justify-center"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
}
