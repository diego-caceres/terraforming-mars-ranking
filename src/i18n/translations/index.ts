import type { Language, Translations } from '../types';
import { es } from './es';
import { en } from './en';

/**
 * All translations organized by language
 */
export const translations: Record<Language, Translations> = {
  es,
  en,
};

/**
 * Default language
 */
export const DEFAULT_LANGUAGE: Language = 'es';

/**
 * Get browser's preferred language, fallback to default
 */
export function getBrowserLanguage(): Language {
  const browserLang = navigator.language.split('-')[0].toLowerCase();

  if (browserLang === 'es' || browserLang === 'en') {
    return browserLang;
  }

  return DEFAULT_LANGUAGE;
}
