# Board Game Rankings - Proyecto de Sistema Elo

## Descripción del Proyecto

Aplicación web para trackear rankings del juego de mesa "Terraforming Mars" usando un sistema Elo multijugador. Desarrollada con React + TypeScript + Vite, con almacenamiento en Upstash Redis. Diseñada específicamente para Terraforming Mars pero adaptable a cualquier juego de mesa.

**Usuario objetivo:** Jugadores uruguayos (interfaz en español con conjugación "vos")

## Stack Tecnológico

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v3 (dark mode con estrategia 'class')
- **Charts:** Recharts
- **Drag & Drop:** @hello-pangea/dnd
- **Backend:** Vercel Serverless Functions (Node.js)
- **Storage:** Upstash Redis

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
api/                            # Vercel Serverless Functions
├── _lib/
│   ├── kv.ts                  # Configuración de Vercel KV
│   ├── types.ts               # Tipos compartidos
│   └── eloCalculator.ts       # Lógica del sistema Elo (compartida)
├── players.ts                 # GET/POST jugadores
├── rankings.ts                # GET rankings
├── games.ts                   # GET/POST partidas
├── games/
│   ├── [id].ts                # GET/DELETE partida específica
│   └── last.ts                # DELETE última partida
└── players/
    └── [id]/
        └── stats.ts           # GET stats de jugador

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
│   ├── eloCalculator.ts       # Lógica del sistema Elo (cliente)
│   └── apiService.ts          # Llamadas a API (reemplaza storageService)
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

## API Endpoints

### Players
- `GET /api/players` - Obtener todos los jugadores
- `POST /api/players` - Crear nuevo jugador
- `GET /api/rankings?activeOnly=true` - Obtener rankings (con filtro opcional)
- `GET /api/players/[id]/stats` - Obtener estadísticas detalladas de un jugador

### Games
- `GET /api/games` - Obtener todas las partidas (ordenadas por fecha desc)
- `POST /api/games` - Registrar nueva partida
- `GET /api/games/[id]` - Obtener partida específica
- `DELETE /api/games/[id]` - Eliminar partida y recalcular todos los ratings
- `DELETE /api/games/last` - Deshacer última partida

## Funciones Importantes

### apiService.ts (Cliente)
- `getAllPlayers()`: Obtiene todos los jugadores desde la API
- `recordGame()`: Registra nueva partida vía API
- `deleteGameById()`: Elimina partida y recalcula ratings
- `deleteLastGame()`: Deshacer última partida registrada
- `getRankings(activeOnly)`: Rankings con filtro de jugadores activos
- `getPlayerStats(playerId)`: Obtiene estadísticas detalladas

### eloCalculator.ts (Servidor y Cliente)
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

1. **Arquitectura:** Single-user con Upstash Redis (sin autenticación de usuarios, solo password admin)
2. **Storage:** Upstash Redis con schema normalizado (players:all, players:{id}, games:all, games:{id})
3. **Eliminación de partidas:** Recalcula desde cero en lugar de "revertir" cambios para garantizar consistencia matemática
4. **Filtro de activos:** Jugadores activos = al menos 1 partida en últimos 30 días
5. **Ordenamiento de historial:** Por fecha de juego (no por fecha de ingreso al sistema)
6. **Validación de jugadores:** No permite nombres duplicados (case-insensitive)
7. **Undo temporal:** 10 segundos para deshacer última partida
8. **Conexión requerida:** La app requiere internet para funcionar (no hay fallback offline)

## Próximas Mejoras Potenciales

- [ ] Búsqueda/filtrado en historial de partidas
- [ ] Gráficos de tendencias a lo largo del tiempo
- [ ] Estadísticas por expansión (cuáles dan mejores resultados)
- [ ] Export a CSV además de JSON
- [ ] Comparación de 2+ jugadores lado a lado
- [ ] Multi-usuario con autenticación (Clerk, NextAuth)
- [ ] PWA para uso móvil offline
- [ ] Implementar import de datos (actualmente solo export funciona)

## Deployment en Vercel

### Setup Inicial

1. **Crear Database en Upstash:**
   - Ir a https://console.upstash.com/
   - Click "Create Database"
   - Elegir región (para Uruguay, recomendado: us-east-1 o Global)
   - Elegir plan (Free tier es suficiente para empezar)
   - Una vez creada, ir a "REST API" tab
   - Copiar `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`

2. **Configurar Variables de Entorno:**
   - En Vercel Dashboard → Settings → Environment Variables
   - Agregar:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `VITE_AUTH_PASSWORD` (para acciones admin)

3. **Deploy:**
   ```bash
   git push origin main  # Auto-deploy si conectado a Vercel
   # O manualmente: vercel --prod
   ```

### Desarrollo Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar `.env.local`:**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales de Upstash Redis
   ```

3. **Ejecutar en desarrollo:**
   ```bash
   vercel dev           # Frontend + API routes en http://localhost:3000
   ```

   **IMPORTANTE:** Usar `vercel dev` directamente, NO `npm run dev`

4. **Build para producción:**
   ```bash
   npm run build        # Build para producción
   npm run preview      # Preview del build
   ```

## Notas para Desarrollo

- **No usar bash para operaciones de archivos** - usar herramientas Read/Edit/Write
- **Usar `import type`** para todos los imports de tipos
- **Dark mode:** Usa estrategia 'class', componente DarkModeToggle maneja el toggle
- **Formato de fechas:** Usar locale de navegador del usuario
- **API calls:** Todas las operaciones de datos van a través de `/api` endpoints
- **Error handling:** Todos los handlers async tienen try/catch con mensajes en español

## Redis Schema (Upstash)

```typescript
// Keys en Upstash Redis
players:all              → Set<string>              // Set de player IDs
players:{id}             → Player                   // Player object
games:all                → SortedSet<string>        // Sorted set de game IDs (por fecha)
games:{id}               → Game                     // Game object
version                  → number                   // Schema version (1)
```

## Contexto del Usuario

Usuario juega Terraforming Mars regularmente con amigos uruguayos y quería un sistema simple para trackear rankings. La app ahora usa Upstash Redis para persistencia centralizada, permitiendo acceso desde múltiples dispositivos. Diseñada para ser intuitiva para usuarios no técnicos.
