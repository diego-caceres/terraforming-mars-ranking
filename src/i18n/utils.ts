import type { Language } from './types';

/**
 * Format a date according to the current language
 */
export function formatDate(date: Date, language: Language, options?: Intl.DateTimeFormatOptions): string {
  const locale = language === 'es' ? 'es-UY' : 'en-US';
  return date.toLocaleDateString(locale, options);
}

/**
 * Format a number according to the current language
 */
export function formatNumber(num: number, language: Language, options?: Intl.NumberFormatOptions): string {
  const locale = language === 'es' ? 'es-UY' : 'en-US';
  return num.toLocaleString(locale, options);
}

/**
 * Simple pluralization helper
 *
 * @example
 * pluralize(1, 'partida', 'partidas') // "partida"
 * pluralize(5, 'partida', 'partidas') // "partidas"
 * pluralize(0, 'game', 'games') // "games"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

/**
 * Interpolate variables into a translation string
 *
 * @example
 * interpolate("Hello {name}!", { name: "Diego" }) // "Hello Diego!"
 * interpolate("{count} games played", { count: 5 }) // "5 games played"
 */
export function interpolate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return String(variables[key] ?? `{${key}}`);
  });
}

/**
 * Get relative time string (Today, Yesterday, X days ago)
 */
export function getRelativeTimeString(timestamp: number, language: Language): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return language === 'es' ? 'Hoy' : 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return language === 'es' ? 'Ayer' : 'Yesterday';
  }

  const daysAgo = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysAgo < 7) {
    return language === 'es'
      ? `Hace ${daysAgo} ${pluralize(daysAgo, 'día', 'días')}`
      : `${daysAgo} ${pluralize(daysAgo, 'day', 'days')} ago`;
  }

  // For older dates, return formatted date
  return formatDate(date, language, { day: 'numeric', month: 'short' });
}
