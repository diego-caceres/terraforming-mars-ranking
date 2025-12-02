/**
 * I18n (Internationalization) System
 *
 * This module provides a lightweight, type-safe internationalization solution
 * for the ranking app supporting Spanish and English.
 *
 * ## Usage
 *
 * ### 1. Wrap your app with I18nProvider
 *
 * ```tsx
 * import { I18nProvider } from './i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <YourApp />
 *     </I18nProvider>
 *   );
 * }
 * ```
 *
 * ### 2. Use translations in components
 *
 * ```tsx
 * import { useI18n } from './i18n';
 *
 * function MyComponent() {
 *   const { t, language, setLanguage } = useI18n();
 *
 *   return (
 *     <div>
 *       <button>{t.common.save}</button>
 *       <button onClick={() => setLanguage('en')}>Switch to English</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * ### 3. Use utility functions
 *
 * ```tsx
 * import { useI18n, formatDate, pluralize, interpolate } from './i18n';
 *
 * function MyComponent() {
 *   const { language } = useI18n();
 *   const date = formatDate(new Date(), language);
 *   const text = interpolate(t.games.played, { count: 5 });
 *
 *   return <div>{text} - {date}</div>;
 * }
 * ```
 *
 * ## Adding New Translations
 *
 * 1. Add keys to `types.ts` Translations interface
 * 2. Add Spanish text to `translations/es.ts`
 * 3. Add English text to `translations/en.ts`
 * 4. Use in components with `t.section.key`
 *
 * ## File Structure
 *
 * - `types.ts` - TypeScript types and interfaces
 * - `translations/` - Translation files by language
 * - `I18nContext.tsx` - Context provider and hook
 * - `utils.ts` - Helper functions (dates, numbers, pluralization)
 * - `index.ts` - Main export file (this file)
 */

// Core exports
export { I18nProvider, useI18n } from './I18nContext';
export type { Language, Translations } from './types';

// Utility exports
export {
  formatDate,
  formatNumber,
  pluralize,
  interpolate,
  getRelativeTimeString,
} from './utils';

// Translation constants
export { DEFAULT_LANGUAGE, getBrowserLanguage } from './translations';
