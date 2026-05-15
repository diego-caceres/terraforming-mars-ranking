import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import type { Language } from '../../i18n';
import { requiresAuthentication } from '../../services/authService';
import { getColorClasses } from '../../utils/colorUtils';
import type { Player } from '../../types';

const SPECIAL_NAMES: Record<string, string> = {
  gero: 'Gero el Dormilon',
  gambo: 'Gambo el Don de los Gatos',
  bruno: 'Bruno, como skater un gran músico',
  dado: 'Dado el programador',
  paula: 'Pau Rap La Rul',
  leo: 'Leo el doc de nuestros corazones',
  saant: 'Saant, diva de la noche y el día',
  moui: 'Moui, el que ronca durante las partidas',
  anto: 'Anto, siempre en una aventura distinta',
};

interface UserMenuProps {
  userName: string;
  players: Record<string, Player>;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function UserMenu({ userName, players, darkMode, onToggleDarkMode, isAuthenticated, onLogin, onLogout }: UserMenuProps) {
  const { t, language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOnOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    document.addEventListener('keydown', closeOnEsc);
    return () => {
      document.removeEventListener('mousedown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEsc);
    };
  }, []);

  const languages: { code: Language; flag: string; label: string }[] = [
    { code: 'es', flag: '🇺🇾', label: 'Español' },
    { code: 'en', flag: '🇺🇸', label: 'English' },
  ];

  const needsAuth = requiresAuthentication();

  const matchedPlayer = userName
    ? Object.values(players).find(p => p.name.toLowerCase() === userName.toLowerCase())
    : undefined;

  const displayName = userName
    ? (SPECIAL_NAMES[userName.toLowerCase()] ?? userName)
    : '';

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/25"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {userName ? (
          <span className="flex items-center gap-2">
            {matchedPlayer?.color && (
              <span
                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full border-2 ${getColorClasses(matchedPlayer.color)}`}
                aria-hidden="true"
              />
            )}
            <span>
              {t.app.greeting}, {displayName}
            </span>
          </span>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
        <svg
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-tm-copper/20 bg-white shadow-xl dark:border-white/10 dark:bg-tm-haze">

          {/* Language section */}
          <div className="border-b border-tm-copper/10 px-4 py-3 dark:border-white/10">
            <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-tm-oxide/50 dark:text-tm-sand/50">
              {t.app.languageLabel}
            </p>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    language === lang.code
                      ? 'bg-tm-copper text-white shadow'
                      : 'border border-tm-copper/20 text-tm-oxide hover:bg-tm-copper/10 dark:border-white/10 dark:text-tm-sand dark:hover:bg-white/10'
                  }`}
                  aria-pressed={language === lang.code}
                >
                  <span role="img" aria-label={lang.label}>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={() => { onToggleDarkMode(); setOpen(false); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-tm-oxide transition hover:bg-tm-copper/5 dark:text-tm-sand dark:hover:bg-white/5"
          >
            {darkMode ? (
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span>{darkMode ? t.app.lightMode : t.app.darkMode}</span>
          </button>

          {/* Login / logout — only relevant in Redis mode */}
          {needsAuth && (
            <div className="border-t border-tm-copper/10 dark:border-white/10">
              {isAuthenticated ? (
                <button
                  onClick={() => { setOpen(false); onLogout(); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-tm-copper-dark transition hover:bg-tm-copper/5 dark:text-tm-glow dark:hover:bg-white/5"
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t.app.logout}</span>
                </button>
              ) : (
                <button
                  onClick={() => { setOpen(false); onLogin(); }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-tm-oxide transition hover:bg-tm-copper/5 dark:text-tm-sand dark:hover:bg-white/5"
                >
                  <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>{t.app.login}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
