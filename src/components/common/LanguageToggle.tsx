import { useI18n } from '../../i18n';
import type { Language } from '../../i18n';

/**
 * Language Toggle Component
 *
 * Allows users to switch between Spanish and English
 */
export default function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'es', label: 'Español', flag: '🇺🇾' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <div className="flex items-center gap-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`
            flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all
            ${
              language === lang.code
                ? 'bg-tm-copper text-white shadow-md'
                : 'bg-white/75 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60'
            }
          `}
          aria-label={`Switch to ${lang.label}`}
          aria-pressed={language === lang.code}
        >
          <span className="text-lg" role="img" aria-label={lang.label}>
            {lang.flag}
          </span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
