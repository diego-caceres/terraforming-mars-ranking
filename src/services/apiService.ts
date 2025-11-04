import type { Player, Game, GameResult } from '../types';

const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Player operations
export async function getAllPlayers(): Promise<Player[]> {
  const data = await apiCall<{ players: Player[] }>('/players');
  return data.players;
}

export async function addPlayer(name: string, color?: string): Promise<Player> {
  const data = await apiCall<{ player: Player }>('/players', {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  });
  return data.player;
}

export async function updatePlayer(playerId: string, updates: { name?: string; color?: string }): Promise<Player> {
  const data = await apiCall<{ player: Player }>(`/players/${playerId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return data.player;
}

export async function getRankings(activeOnly = false): Promise<Player[]> {
  const data = await apiCall<{ rankings: Player[] }>(
    `/rankings?activeOnly=${activeOnly}`
  );
  return data.rankings;
}

export async function getMonthlyRankings(year: number, month: number): Promise<{
  rankings: Player[];
  year: number;
  month: number;
  gamesCount: number;
}> {
  return apiCall(`/rankings/monthly?year=${year}&month=${month}`);
}

// Game operations
export async function getAllGames(): Promise<Game[]> {
  const data = await apiCall<{ games: Game[] }>('/games');
  return data.games;
}

export async function recordGame(
  gameResult: GameResult,
  customDate?: number
): Promise<{ game: Game; players: Record<string, Player> }> {
  const data = await apiCall<{ game: Game; players: Record<string, Player> }>('/games', {
    method: 'POST',
    body: JSON.stringify({ ...gameResult, customDate }),
  });
  return data;
}

export async function deleteGameById(gameId: string): Promise<Record<string, Player>> {
  const data = await apiCall<{ players: Record<string, Player> }>(`/games/${gameId}`, {
    method: 'DELETE',
  });
  return data.players;
}

export async function deleteLastGame(): Promise<{
  deletedGame: Game;
  players: Record<string, Player>
}> {
  const data = await apiCall<{
    deletedGame: Game;
    players: Record<string, Player>
  }>('/games/last', {
    method: 'DELETE',
  });
  return data;
}

// Player stats
export async function getPlayerStats(playerId: string): Promise<{
  player: Player;
  winRate: number;
  averagePlacement: number;
  lastGameDate: number | null;
  recentGames: Game[];
  headToHead: Array<{
    opponentId: string;
    opponentName: string;
    wins: number;
    losses: number;
    ties: number;
    gamesPlayed: number;
  }>;
  playerNames: Record<string, string>;
}> {
  return apiCall(`/players/${playerId}/stats`);
}

// Export/Import functionality
export async function exportData(): Promise<string> {
  const [players, games] = await Promise.all([
    getAllPlayers(),
    getAllGames(),
  ]);

  const playersRecord: Record<string, Player> = {};
  players.forEach(player => {
    playersRecord[player.id] = player;
  });

  const data = {
    players: playersRecord,
    games,
    version: 1,
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(_jsonString: string): Promise<void> {
  // Note: Import functionality would need a dedicated API endpoint
  // For now, this is a placeholder
  throw new Error('Import functionality not yet implemented. Please contact administrator.');
}
