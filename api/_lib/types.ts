export interface Player {
  id: string;
  name: string;
  currentRating: number;
  gamesPlayed: number;
  wins: number;
  createdAt: number;
  ratingHistory: RatingHistoryEntry[];
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
  placements: string[];
  ratingChanges: Record<string, number>;
  expansions?: string[];
  generations?: number;
}

export interface GameResult {
  playerIds: string[];
  placements: string[];
  expansions?: string[];
  generations?: number;
}
