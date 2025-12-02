import type { Player, Game, GameResult, PlayerColor } from '../types';
import { calculateEloChanges } from './eloCalculator';

const STORAGE_KEYS = {
  PLAYERS: 'tm_rankings_players',
  GAMES: 'tm_rankings_games',
  VERSION: 'tm_rankings_version',
} as const;

const SCHEMA_VERSION = 1;

// Helper to generate IDs
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Initialize storage if needed
function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.VERSION)) {
    localStorage.setItem(STORAGE_KEYS.VERSION, SCHEMA_VERSION.toString());
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify({}));
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify([]));
  }
}

// Get all players
export function getAllPlayers(): Player[] {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};
  return Object.values(playersMap);
}

// Get single player
export function getPlayer(id: string): Player | null {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};
  return playersMap[id] || null;
}

// Add new player
export function addPlayer(name: string, color?: PlayerColor): Player {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};

  // Check for duplicate names
  const existingPlayer = Object.values(playersMap).find(
    (p) => p.name.toLowerCase() === name.toLowerCase()
  );
  if (existingPlayer) {
    throw new Error(`Ya existe un jugador con el nombre "${name}"`);
  }

  const newPlayer: Player = {
    id: generateId(),
    name,
    currentRating: 1500,
    peakRating: 1500,
    gamesPlayed: 0,
    wins: 0,
    ratingHistory: [{ rating: 1500, date: Date.now(), change: 0, gameId: 'initial' }],
    createdAt: Date.now(),
    color,
  };

  playersMap[newPlayer.id] = newPlayer;
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(playersMap));

  return newPlayer;
}

// Update player
export function updatePlayer(
  playerId: string,
  updates: { name?: string; color?: PlayerColor }
): Player {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};

  const player = playersMap[playerId];
  if (!player) {
    throw new Error('Jugador no encontrado');
  }

  // Check for duplicate names if name is being updated
  if (updates.name && updates.name !== player.name) {
    const existingPlayer = Object.values(playersMap).find(
      (p) => p.id !== playerId && p.name.toLowerCase() === updates.name!.toLowerCase()
    );
    if (existingPlayer) {
      throw new Error(`Ya existe un jugador con el nombre "${updates.name}"`);
    }
    player.name = updates.name;
  }

  if (updates.color !== undefined) {
    player.color = updates.color;
  }

  playersMap[playerId] = player;
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(playersMap));

  return player;
}

// Get all games
export function getAllGames(): Game[] {
  initializeStorage();
  const gamesData = localStorage.getItem(STORAGE_KEYS.GAMES);
  return gamesData ? JSON.parse(gamesData) : [];
}

// Get single game
export function getGame(id: string): Game | null {
  const games = getAllGames();
  return games.find((g) => g.id === id) || null;
}

// Record new game
export function recordGame(
  gameResult: GameResult,
  customDate?: number
): { game: Game; players: Record<string, Player> } {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};

  // Calculate Elo changes
  const ratingChanges = calculateEloChanges(gameResult.placements, playersMap);

  // Create game object
  const game: Game = {
    id: generateId(),
    date: customDate || Date.now(),
    placements: gameResult.placements,
    ratingChanges,
    expansions: gameResult.expansions,
    generations: gameResult.generations,
  };

  // Update players
  gameResult.placements.forEach((playerId, index) => {
    const player = playersMap[playerId];
    if (!player) return;

    const ratingChange = ratingChanges[playerId];
    const newRating = player.currentRating + ratingChange;

    player.currentRating = newRating;
    player.peakRating = Math.max(player.peakRating, newRating);
    player.gamesPlayed += 1;
    if (index === 0) {
      player.wins += 1;
    }

    player.ratingHistory.push({
      rating: newRating,
      date: game.date,
      change: ratingChange,
      gameId: game.id,
    });
  });

  // Save players
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(playersMap));

  // Save game
  const games = getAllGames();
  games.push(game);
  games.sort((a, b) => b.date - a.date);
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

  return { game, players: playersMap };
}

// Delete game and recalculate
export function deleteGame(gameId: string): Record<string, Player> {
  initializeStorage();
  const games = getAllGames();
  const gameIndex = games.findIndex((g) => g.id === gameId);

  if (gameIndex === -1) {
    throw new Error('Partida no encontrada');
  }

  // Remove the game
  games.splice(gameIndex, 1);
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

  // Recalculate all ratings from scratch
  return recalculateAllRatings();
}

// Delete last game
export function deleteLastGame(): { deletedGame: Game; players: Record<string, Player> } {
  const games = getAllGames();
  if (games.length === 0) {
    throw new Error('No hay partidas para eliminar');
  }

  // Games are already sorted by date descending
  const lastGame = games[0];
  const players = deleteGame(lastGame.id);

  return { deletedGame: lastGame, players };
}

// Update game metadata
export function updateGameMetadata(
  gameId: string,
  updates: { expansions?: string[]; generations?: number }
): Game {
  const games = getAllGames();
  const gameIndex = games.findIndex((g) => g.id === gameId);

  if (gameIndex === -1) {
    throw new Error('Partida no encontrada');
  }

  const game = games[gameIndex];
  if (updates.expansions !== undefined) {
    game.expansions = updates.expansions;
  }
  if (updates.generations !== undefined) {
    game.generations = updates.generations;
  }

  games[gameIndex] = game;
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

  return game;
}

// Recalculate all ratings from scratch
function recalculateAllRatings(): Record<string, Player> {
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const playersMap: Record<string, Player> = playersData ? JSON.parse(playersData) : {};
  const games = getAllGames();

  // Reset all players to initial state
  Object.values(playersMap).forEach((player) => {
    player.currentRating = 1500;
    player.peakRating = 1500;
    player.gamesPlayed = 0;
    player.wins = 0;
    player.ratingHistory = [
      { rating: 1500, date: player.createdAt, change: 0, gameId: 'initial' },
    ];
  });

  // Sort games by date ascending for recalculation
  const sortedGames = [...games].sort((a, b) => a.date - b.date);

  // Replay all games
  sortedGames.forEach((game) => {
    const ratingChanges = calculateEloChanges(game.placements, playersMap);

    game.placements.forEach((playerId, index) => {
      const player = playersMap[playerId];
      if (!player) return;

      const ratingChange = ratingChanges[playerId];
      const newRating = player.currentRating + ratingChange;

      player.currentRating = newRating;
      player.peakRating = Math.max(player.peakRating, newRating);
      player.gamesPlayed += 1;
      if (index === 0) {
        player.wins += 1;
      }

      player.ratingHistory.push({
        rating: newRating,
        date: game.date,
        change: ratingChange,
        gameId: game.id,
      });
    });

    // Update the game's rating changes
    game.ratingChanges = ratingChanges;
  });

  // Save updated players
  localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(playersMap));

  // Save updated games with recalculated rating changes
  localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(games));

  return playersMap;
}

// Get rankings
export function getRankings(activeOnly = false): Player[] {
  const players = getAllPlayers();

  if (activeOnly) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return players.filter((player) => {
      const lastGame = player.ratingHistory[player.ratingHistory.length - 1];
      return lastGame && lastGame.date >= thirtyDaysAgo;
    });
  }

  return players;
}

// Get player stats
export function getPlayerStats(playerId: string) {
  const player = getPlayer(playerId);
  if (!player) {
    throw new Error('Jugador no encontrado');
  }

  const games = getAllGames();
  const allPlayers = getAllPlayers();

  // Filter games where this player participated
  const playerGames = games.filter((game) => game.placements.includes(playerId));

  // Calculate stats
  const winRate = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;

  let totalPlacement = 0;
  playerGames.forEach((game) => {
    const placement = game.placements.indexOf(playerId) + 1;
    totalPlacement += placement;
  });
  const averagePlacement = playerGames.length > 0 ? totalPlacement / playerGames.length : 0;

  const lastGameDate = playerGames.length > 0 ? playerGames[0].date : null;

  // Get recent games (last 10)
  const recentGames = playerGames.slice(0, 10);

  // Calculate head-to-head records
  const headToHead: Record<string, { wins: number; losses: number; ties: number; gamesPlayed: number }> = {};

  playerGames.forEach((game) => {
    const playerIndex = game.placements.indexOf(playerId);
    game.placements.forEach((opponentId) => {
      if (opponentId === playerId) return;

      if (!headToHead[opponentId]) {
        headToHead[opponentId] = { wins: 0, losses: 0, ties: 0, gamesPlayed: 0 };
      }

      const opponentIndex = game.placements.indexOf(opponentId);
      headToHead[opponentId].gamesPlayed += 1;

      if (playerIndex < opponentIndex) {
        headToHead[opponentId].wins += 1;
      } else if (playerIndex > opponentIndex) {
        headToHead[opponentId].losses += 1;
      } else {
        headToHead[opponentId].ties += 1;
      }
    });
  });

  // Convert to array format
  const headToHeadArray = Object.entries(headToHead).map(([opponentId, record]) => {
    const opponent = allPlayers.find((p) => p.id === opponentId);
    return {
      opponentId,
      opponentName: opponent?.name || 'Desconocido',
      ...record,
    };
  });

  // Create player names map
  const playerNames: Record<string, string> = {};
  allPlayers.forEach((p) => {
    playerNames[p.id] = p.name;
  });

  return {
    player,
    winRate,
    averagePlacement,
    lastGameDate,
    recentGames,
    headToHead: headToHeadArray,
    playerNames,
  };
}

// Export data
export function exportData(): string {
  initializeStorage();
  const playersData = localStorage.getItem(STORAGE_KEYS.PLAYERS);
  const gamesData = localStorage.getItem(STORAGE_KEYS.GAMES);

  const data = {
    players: playersData ? JSON.parse(playersData) : {},
    games: gamesData ? JSON.parse(gamesData) : [],
    version: SCHEMA_VERSION,
  };

  return JSON.stringify(data, null, 2);
}

// Import data
export function importData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString);

    if (!data.players || !data.games) {
      throw new Error('Formato de datos inválido');
    }

    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(data.players));
    localStorage.setItem(STORAGE_KEYS.GAMES, JSON.stringify(data.games));
    localStorage.setItem(STORAGE_KEYS.VERSION, (data.version || SCHEMA_VERSION).toString());
  } catch (error) {
    throw new Error('Error al importar datos: ' + (error as Error).message);
  }
}
