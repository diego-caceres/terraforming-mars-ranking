# Board Game Ranking Tracker

A modern web application for tracking board game rankings using a multiplayer Elo rating system. Built with React, TypeScript, and Tailwind CSS.

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

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
# Install dependencies
npm install

# Run the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

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
│   ├── eloCalculator.ts # Elo rating calculations
│   └── storageService.ts # localStorage management
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
- **Storage**: Browser localStorage

## Data Storage

All data is stored locally in your browser using localStorage. No data is sent to any server. The data structure includes:

- **Players**: ID, name, current rating, games played, wins, rating history
- **Games**: ID, date, player placements, rating changes

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

- Data is stored locally (not synced across devices)
- No multiplayer/collaborative editing
- No game history editing or deletion (by design, to maintain rating integrity)

Enjoy tracking your board game rankings!
