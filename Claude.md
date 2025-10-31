# Board Game Rankings - Proyecto de Sistema Elo

## Descripción del Proyecto

Aplicación web para trackear rankings del juego de mesa "Terraforming Mars" usando un sistema Elo multijugador. Desarrollada con React + TypeScript + Vite, con almacenamiento en localStorage. Diseñada específicamente para Terraforming Mars pero adaptable a cualquier juego de mesa.

**Usuario objetivo:** Jugadores uruguayos (interfaz en español con conjugación "vos")

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3 (dark mode con estrategia 'class')
- **Charts:** Recharts
- **Drag & Drop:** @hello-pangea/dnd
- **Storage:** localStorage (client-side)

## Características Principales

### Sistema Elo Multijugador
- **K-Factor:** 40
- **Rating Inicial:** 1500
- **Umbral de Confianza:** 10 partidas (jugadores con <10 partidas marcados como "Nuevo")
- **Algoritmo:** Cada jugador es comparado contra todos los demás en la partida
- **Fórmula:** Cambio = K × (Resultado Real - Resultado Esperado)

### Funcionalidades Implementadas

1. **Rankings** (`/src/components/Rankings.tsx`)
   - Tabla sorteable (por rating, partidas, % victorias)
   - Filtro de jugadores activos
   - Click en jugador abre modal de estadísticas

2. **Agregar Partida** (`/src/components/AddGame.tsx`)
   - Selector de fecha (respeta fecha ingresada, sin bugs de timezone)
   - Drag & drop para ordenar posiciones
   - Tracking de expansiones de Terraforming Mars (Venus, Turmoil, CEOs, Velocity, Ares)
   - Tracking de número de generaciones (1-16)
   - Botón "Deshacer" (10 segundos después de registrar)

3. **Gestión de Jugadores** (`/src/components/PlayerManagement.tsx`)
   - Agregar nuevos jugadores
   - Validación de nombres duplicados
   - Lista de todos los jugadores con stats básicos

4. **Historial de Partidas** (`/src/components/GameHistory.tsx`)
   - Lista de todas las partidas ordenadas por fecha descendente (más recientes primero)
   - Expandible para ver clasificación final
   - Botón eliminar (con confirmación, recalcula todos los ratings)
   - Muestra expansiones y generaciones

5. **Estadísticas del Jugador** (`/src/components/PlayerStats.tsx`)
   - Modal con stats detalladas
   - Gráfico de historial de rating
   - Tabla de récords cara a cara vs otros jugadores
   - Partidas recientes

6. **Resumen de Estadísticas** (`/src/components/common/StatsOverview.tsx`)
   - 4 cards: Total de Partidas, Última Partida, Mejor Rating, Más Activo
   - Formateo inteligente de fechas (Hoy, Ayer, Hace X días)

7. **Configuración** (Tab en App.tsx)
   - Export/Import de datos JSON
   - Explicación completa del sistema Elo en español
   - Dark mode toggle

## Estructura de Archivos

```
src/
├── components/
│   ├── Rankings.tsx           # Tabla principal de rankings
│   ├── AddGame.tsx            # Formulario para registrar partidas
│   ├── PlayerManagement.tsx   # Gestión de jugadores
│   ├── PlayerStats.tsx        # Modal de estadísticas detalladas
│   ├── GameHistory.tsx        # Historial de todas las partidas
│   └── common/
│       ├── DarkModeToggle.tsx
│       ├── ExportImport.tsx
│       └── StatsOverview.tsx  # Cards de stats en página principal
├── services/
│   ├── eloCalculator.ts       # Lógica del sistema Elo
│   └── storageService.ts      # Operaciones con localStorage
├── hooks/
│   └── useDarkMode.ts         # Hook para dark mode
├── types/
│   └── index.ts               # Definiciones TypeScript
└── App.tsx                    # Componente principal con tabs
```

## Tipos de Datos Clave

```typescript
interface Player {
  id: string;
  name: string;
  currentRating: number;
  gamesPlayed: number;
  wins: number;
  ratingHistory: RatingHistoryEntry[];
  createdAt: number;
  lastPlayedAt: number | null;
}

interface Game {
  id: string;
  date: number;                    // timestamp
  placements: string[];            // Array de player IDs (orden = clasificación)
  ratingChanges: Record<string, number>;
  expansions?: string[];           // Expansiones usadas
  generations?: number;            // Número de generaciones jugadas
}
```

## Funciones Importantes

### storageService.ts
- `getAllGames()`: Devuelve juegos ordenados por fecha descendente
- `recordGame()`: Registra nueva partida, calcula cambios Elo
- `deleteGameById()`: Elimina partida y recalcula TODOS los ratings desde cero
- `deleteLastGame()`: Deshacer última partida registrada
- `getRankings(activeOnly)`: Rankings con filtro de jugadores activos

### eloCalculator.ts
- `calculateEloChanges()`: Calcula cambios para todos los jugadores en una partida
- `calculateExpectedScore()`: Probabilidad esperada basada en diferencia de ratings
- `calculateActualScore()`: Resultado real (1.0/0.5/0.0 basado en posiciones)
- `hasLowConfidence()`: Determina si jugador tiene <10 partidas

## Bugs Resueltos

1. **Timezone bug en fechas:** Usar `Date(year, month-1, day, 12, 0, 0)` en lugar de `new Date(dateString)`
2. **Type imports:** Usar `import type` para imports de tipos con verbatimModuleSyntax
3. **Tailwind v4 incompatibilidad:** Downgrade a Tailwind v3 con PostCSS estándar

## Traducciones al Español

✅ Toda la interfaz está en español (dialecto uruguayo con "vos")
✅ Fechas, números y plurales manejados correctamente
✅ Mensajes de confirmación y alertas traducidos

## Decisiones de Diseño

1. **Eliminación de partidas:** Recalcula desde cero en lugar de "revertir" cambios para garantizar consistencia matemática
2. **Filtro de activos:** Jugadores activos = al menos 1 partida en últimos 30 días
3. **Ordenamiento de historial:** Por fecha de juego (no por fecha de ingreso al sistema)
4. **Validación de jugadores:** No permite nombres duplicados (case-insensitive)
5. **Undo temporal:** 10 segundos para deshacer última partida

## Próximas Mejoras Potenciales

- [ ] Búsqueda/filtrado en historial de partidas
- [ ] Gráficos de tendencias a lo largo del tiempo
- [ ] Estadísticas por expansión (cuáles dan mejores resultados)
- [ ] Export a CSV además de JSON
- [ ] Comparación de 2+ jugadores lado a lado
- [ ] Backend opcional (Firebase, Supabase) para sincronización multi-dispositivo
- [ ] PWA para uso móvil offline

## Comandos Útiles

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
```

## Notas para Desarrollo

- **No usar bash para operaciones de archivos** - usar herramientas Read/Edit/Write
- **Usar `import type`** para todos los imports de tipos
- **Dark mode:** Usa estrategia 'class', componente DarkModeToggle maneja el toggle
- **localStorage key:** `'boardGameRankings'`
- **Formato de fechas:** Usar locale de navegador del usuario

## Contexto del Usuario

Usuario juega Terraforming Mars regularmente con amigos uruguayos y quería un sistema simple para trackear rankings sin backend. La app debe funcionar completamente offline y ser intuitiva para usuarios no técnicos.
