# I18n (Internationalization) System

A lightweight, type-safe internationalization solution for the Ranking app supporting Spanish and English.

## Architecture

### Files Structure

```
src/i18n/
├── types.ts              # TypeScript types and interfaces
├── translations/
│   ├── es.ts            # Spanish translations
│   ├── en.ts            # English translations
│   └── index.ts         # Translation exports and utilities
├── I18nContext.tsx      # React Context provider and hook
├── utils.ts             # Helper functions (dates, numbers, pluralization)
├── index.ts             # Main export file
└── README.md            # This file
```

## Usage Guide

### 1. Basic Translation Usage

```tsx
import { useI18n } from '../i18n';

function MyComponent() {
  const { t, language, setLanguage } = useI18n();

  return (
    <div>
      <button>{t.common.save}</button>
      <button onClick={() => setLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### 2. Date Formatting

```tsx
import { useI18n, formatDate } from '../i18n';

function DateDisplay({ timestamp }: { timestamp: number }) {
  const { language } = useI18n();
  const date = formatDate(new Date(timestamp), language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return <span>{date}</span>;
}
```

### 3. Number Formatting

```tsx
import { useI18n, formatNumber } from '../i18n';

function RatingDisplay({ rating }: { rating: number }) {
  const { language } = useI18n();
  const formatted = formatNumber(rating, language);

  return <span>{formatted}</span>;
}
```

### 4. Pluralization

```tsx
import { pluralize } from '../i18n';

// Spanish
const gamesText = pluralize(count, 'partida', 'partidas');

// English
const gamesText = pluralize(count, 'game', 'games');
```

### 5. String Interpolation

```tsx
import { interpolate } from '../i18n';

const message = interpolate(t.games.playerWon, {
  name: 'Diego',
  count: 5
});
// Spanish: "Diego ganó 5 partidas"
// English: "Diego won 5 games"
```

### 6. Relative Time

```tsx
import { useI18n, getRelativeTimeString } from '../i18n';

function LastPlayed({ timestamp }: { timestamp: number }) {
  const { language } = useI18n();
  const relativeTime = getRelativeTimeString(timestamp, language);

  return <span>{relativeTime}</span>;
  // Spanish: "Hoy", "Ayer", "Hace 3 días"
  // English: "Today", "Yesterday", "3 days ago"
}
```

## Adding New Translations

### Step 1: Define the Type

Add keys to `types.ts`:

```typescript
export interface Translations {
  common: {
    save: string;
    cancel: string;
  };
  rankings: {
    title: string;
    rating: string;
    gamesPlayed: string;
  };
  // Add your new section here
  addGame: {
    title: string;
    selectPlayers: string;
    submitButton: string;
  };
}
```

### Step 2: Add Spanish Translation

In `translations/es.ts`:

```typescript
export const es: Translations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
  },
  rankings: {
    title: 'Clasificación',
    rating: 'Rating',
    gamesPlayed: 'Partidas Jugadas',
  },
  addGame: {
    title: 'Registrar Partida',
    selectPlayers: 'Seleccionar Jugadores',
    submitButton: 'Agregar Partida',
  },
};
```

### Step 3: Add English Translation

In `translations/en.ts`:

```typescript
export const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
  },
  rankings: {
    title: 'Rankings',
    rating: 'Rating',
    gamesPlayed: 'Games Played',
  },
  addGame: {
    title: 'Record Game',
    selectPlayers: 'Select Players',
    submitButton: 'Add Game',
  },
};
```

### Step 4: Use in Component

```tsx
import { useI18n } from '../i18n';

function AddGame() {
  const { t } = useI18n();

  return (
    <div>
      <h2>{t.addGame.title}</h2>
      <label>{t.addGame.selectPlayers}</label>
      <button>{t.addGame.submitButton}</button>
    </div>
  );
}
```

## TypeScript Benefits

- **Autocomplete**: Your IDE will suggest all available translation keys
- **Type safety**: Typos in translation keys will be caught at compile time
- **Refactoring**: Renaming keys updates all usages
- **Missing translations**: TypeScript enforces that all languages have all keys

## Best Practices

### 1. Organize by Feature

```typescript
interface Translations {
  // Group related translations
  rankings: { /* ... */ };
  addGame: { /* ... */ };
  playerStats: { /* ... */ };
}
```

### 2. Use Placeholders for Dynamic Content

```typescript
// DON'T do this:
const text = `${playerName} has ${count} games`;

// DO this instead:
const text = interpolate(t.player.gamesCount, {
  name: playerName,
  count: count
});

// In translations:
es: { player: { gamesCount: '{name} tiene {count} partidas' } }
en: { player: { gamesCount: '{name} has {count} games' } }
```

### 3. Keep Keys Semantic

```typescript
// DON'T:
button1: 'Save'
button2: 'Cancel'

// DO:
save: 'Save'
cancel: 'Cancel'
```

### 4. Use Utility Functions

```typescript
// For dates, use formatDate instead of hardcoding locale
const formatted = formatDate(date, language);

// For numbers, use formatNumber
const rating = formatNumber(player.rating, language);
```

## Language Detection

The system automatically detects the user's preferred language in this order:

1. **Saved preference** in localStorage (`app:language`)
2. **Browser language** (from `navigator.language`)
3. **Default language** (Spanish - `es`)

## Persistence

The selected language is automatically saved to `localStorage` and persists across sessions.

## Accessibility

The system automatically updates the HTML `lang` attribute for screen readers and SEO:

```html
<html lang="es">  <!-- or lang="en" -->
```

## Migration Strategy

To migrate existing hardcoded Spanish text:

1. Keep the Spanish as default - no rush to change existing code
2. Gradually migrate components one at a time:
   - Extract hardcoded strings to translation files
   - Replace with `t.section.key`
   - Test both languages
3. Start with high-traffic areas (Rankings, AddGame)
4. Finish with less critical areas (Settings, About)

## Performance

- **Lightweight**: ~2KB added to bundle (minified + gzipped)
- **No external dependencies**: Pure React + TypeScript
- **Fast**: Context-based, no prop drilling
- **Lazy loading ready**: Can split translations by route if needed in the future

## Future Enhancements

Potential additions if needed:

- [ ] Add more languages (Portuguese, French, etc.)
- [ ] Lazy-load translations per route
- [ ] Add translation management UI
- [ ] Server-side language detection
- [ ] RTL support for Arabic/Hebrew
