export type PlayerColor = 'Yellow' | 'Red' | 'Green' | 'Purple' | 'Blue' | 'Pink' | 'Orange';

export interface Player {
  id: string;
  name: string;
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  createdAt: number;
  ratingHistory: RatingHistoryEntry[];
  color?: PlayerColor;
}

export interface RatingHistoryEntry {
  gameId: string;
  rating: number;
  change: number;
  date: number;
}

export interface Game {
  id: string;
  date: number;
  placements: string[]; // Array of player IDs in order of placement (1st, 2nd, 3rd, etc.)
  ratingChanges: Record<string, number>; // playerId -> rating change
  expansions?: string[]; // Optional: expansions used in the game
  generations?: number; // Optional: number of generations played (1-16)
  twoPlayerGame?: boolean; // True if this is a 2-player game (doesn't affect ELO)
}

export interface GameResult {
  playerIds: string[];
  placements: string[]; // Ordered array of player IDs
  expansions?: string[];
  generations?: number;
}

export interface PlayerStats {
  player: Player;
  winRate: number;
  averagePlacement: number;
  lastGameDate: number | null;
  recentGames: Game[];
}

export interface HeadToHeadRecord {
  playerId: string;
  opponentId: string;
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
}

export interface AppData {
  players: Record<string, Player>;
  games: Game[];
  version: number;
}
