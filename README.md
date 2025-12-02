# Board Game Ranking Tracker

A modern web application for tracking board game rankings using a multiplayer Elo rating system. Built with React, TypeScript, Tailwind CSS, and Upstash Redis for data persistence.

## Features

### Core Functionality
- **Multiplayer Elo Rating System**: Each player is compared against every other player in a game
- **Player Management**: Add players, view detailed statistics, and track performance
- **Game Recording**: Easy-to-use drag-and-drop interface for recording game results
- **Rankings Dashboard**: Sortable rankings table with filtering options

### Advanced Features
- **Rating History Charts**: Visual representation of rating changes over time
- **Head-to-Head Records**: Compare performance between any two players
- **Active Player Filter**: Show only players who've played in the last 30 days
- **Dark Mode**: Toggle between light and dark themes
- **Export/Import**: Backup and restore your data in JSON format
- **Confidence Indicators**: Players with fewer than 10 games are marked as "New"

## Getting Started

This app supports two storage modes:
1. **localStorage Mode**: No backend needed, data stored in browser (perfect for testing/personal use)
2. **Redis Mode**: Full backend with Upstash Redis (for production/shared data)

### Prerequisites
- Node.js (v18 or higher)
- npm
- Upstash account (only for Redis mode - free tier available)

### Installation & Setup

#### 1. Clone and Install

```bash
# Install dependencies
npm install
```

#### 2. Choose Your Storage Mode

##### Option A: localStorage Mode (Simpler, No Backend)

Perfect for testing, development, or personal use where you don't need to share data across devices.

1. Create `.env.local` file:

```bash
cp .env.example .env.local
```

2. Configure for localStorage:

```env
VITE_USE_LOCAL_STORAGE=true
```

3. Run Development Server:

```bash
# Run frontend only
npm run dev
```

The app will be available at `http://localhost:5173`

**Limitations:**
- Data is NOT shared between devices/browsers
- Data cleared if browser cache is cleared
- No authentication required
- Monthly rankings feature unavailable

##### Option B: Redis Mode (Production Setup)

For production deployments with shared data across users.

1. Create a Redis database in Upstash:
   - Go to https://console.upstash.com/
   - Sign up or log in (free tier available)
   - Click "Create Database"
   - Choose a name for your database
   - Select region (Global or closest to your users)
   - Click "Create"
   - Navigate to "REST API" tab
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

2. Create `.env.local` file:

```bash
cp .env.example .env.local
```

3. Add your configuration to `.env.local`:

```env
VITE_USE_LOCAL_STORAGE=false
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token_here
VITE_AUTH_PASSWORD=your_admin_password_here
```

4. Run Development Server:

```bash
# Run with Vercel Dev (compiles API routes + runs frontend)
vercel dev
```

The app will be available at `http://localhost:3000`

**Note:** Use `vercel dev` directly, NOT `npm run dev`

#### 3. Deploy to Production

##### Deploy localStorage Mode:
Simply build and deploy the frontend. Set `VITE_USE_LOCAL_STORAGE=true` in your deployment environment.

##### Deploy Redis Mode:

```bash
# Push to connected Git repo (auto-deploys)
git push origin main

# Or manually deploy
vercel --prod
```

Make sure to add environment variables in Vercel Dashboard → Settings → Environment Variables:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `VITE_AUTH_PASSWORD`

## How It Works

### Elo Rating System

- **K-Factor**: 40 (determines how much ratings change per game)
- **Starting Rating**: 1500 for all new players
- **Calculation Method**: Each player is compared against every other player in the game

#### Rating Change Formula

For each player in a game:

1. **Expected Score** against each opponent:
   ```
   E = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
   ```

2. **Actual Score** based on placement:
   - 1.0 if placed higher than opponent
   - 0.5 if tied with opponent
   - 0.0 if placed lower than opponent

3. **Rating Change**:
   ```
   ΔRating = K × Σ(actual_score - expected_score)
   ```
   (summed across all opponents in the game)

### Usage Guide

#### 1. Add Players
- Navigate to the "Players" tab
- Enter player names and click "Add Player"
- All players start with a rating of 1500

#### 2. Record Game Results
- Go to the "Add Game" tab
- Select the players who participated
- Drag and drop to arrange them by placement (1st place at top)
- Click "Record Game" to calculate and apply rating changes

#### 3. View Rankings
- The "Rankings" tab shows all players sorted by rating
- Sort by Rating, Games Played, or Win Rate
- Toggle "Show Active Only" to filter recent players

#### 4. Player Statistics
- Click any player to view detailed statistics:
  - Current rating and games played
  - Win rate and average placement
  - Rating history chart
  - Head-to-head records against other players
  - Recent game results

#### 5. Backup Your Data
- Visit the "Settings" tab
- Click "Export Data" to download a JSON backup
- Use "Import Data" to restore from a backup

## Project Structure

```
api/                     # Vercel Serverless Functions
├── _lib/
│   ├── kv.ts           # Vercel KV configuration
│   ├── types.ts        # Shared types
│   └── eloCalculator.ts # Elo calculations (server)
├── players.ts          # GET/POST players
├── rankings.ts         # GET rankings
├── games.ts            # GET/POST games
├── games/
│   ├── [id].ts        # GET/DELETE specific game
│   └── last.ts        # DELETE last game (undo)
└── players/
    └── [id]/
        └── stats.ts   # GET player stats

src/
├── components/          # React components
│   ├── Rankings.tsx     # Rankings table
│   ├── AddGame.tsx      # Game recording form
│   ├── PlayerManagement.tsx
│   ├── PlayerStats.tsx  # Player details modal
│   └── common/          # Shared components
│       ├── DarkModeToggle.tsx
│       └── ExportImport.tsx
├── services/            # Core logic
│   ├── eloCalculator.ts # Elo rating calculations (client)
│   └── apiService.ts    # API client (replaced storageService)
├── types/               # TypeScript interfaces
│   └── index.ts
├── hooks/               # Custom React hooks
│   └── useDarkMode.ts
└── App.tsx              # Main application component
```

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Build Tool**: Vite
- **Backend**: Vercel Serverless Functions (Node.js)
- **Storage**: Upstash Redis

## Data Storage

All data is stored in Upstash Redis with the following schema:

- `players:all` → Set of player IDs
- `players:{id}` → Player object (JSON)
- `games:all` → Sorted set of game IDs (ordered by date)
- `games:{id}` → Game object (JSON)

**Data Structure:**
- **Players**: ID, name, current rating, games played, wins, rating history
- **Games**: ID, date, player placements, rating changes, expansions, generations

## Mobile Responsive

The application is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile phones

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

This is a personal project, but feel free to fork and modify for your own use!

## Tips for Best Results

- Record games consistently to maintain accurate ratings
- Need at least 2 players per game
- Players need ~10 games for stable ratings (confidence threshold)
- Export your data regularly as a backup
- Ratings become more accurate with more games played

## Known Limitations

- Requires internet connection (no offline mode)
- Single-user system (no multi-user authentication)
- Import functionality not yet implemented (export works)
- Game deletion recalculates all ratings (can be slow with many games)

## API Endpoints

### Players
- `GET /api/players` - Get all players
- `POST /api/players` - Create new player
- `GET /api/rankings?activeOnly=true` - Get rankings with optional filter
- `GET /api/players/[id]/stats` - Get player statistics

### Games
- `GET /api/games` - Get all games
- `POST /api/games` - Record new game
- `DELETE /api/games/[id]` - Delete game and recalculate ratings
- `DELETE /api/games/last` - Undo last game

Enjoy tracking your board game rankings!
