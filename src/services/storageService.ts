import type { Player, Game, AppData, GameResult, PlayerStats, HeadToHeadRecord } from '../types';
import { calculateEloChanges, applyRatingChanges, getStartingRating } from './eloCalculator';

const STORAGE_KEY = 'boardGameRankings';
const STORAGE_VERSION = 1;

/**
 * Initialize empty app data
 */
function getEmptyData(): AppData {
  return {
    players: {},
    games: [],
    version: STORAGE_VERSION,
  };
}

/**
 * Load data from localStorage
 */
export function loadData(): AppData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getEmptyData();

    const parsed = JSON.parse(data) as AppData;

    // Handle version migrations if needed
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Data version mismatch, using empty data');
      return getEmptyData();
    }

    return parsed;
  } catch (error) {
    console.error('Error loading data:', error);
    return getEmptyData();
  }
}

/**
 * Save data to localStorage
 */
export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error('Failed to save data');
  }
}

/**
 * Add a new player
 */
export function addPlayer(name: string): Player {
  const data = loadData();

  const player: Player = {
    id: generateId(),
    name,
    currentRating: getStartingRating(),
    gamesPlayed: 0,
    wins: 0,
    createdAt: Date.now(),
    ratingHistory: [],
  };

  data.players[player.id] = player;
  saveData(data);

  return player;
}

/**
 * Record a new game result
 */
export function recordGame(gameResult: GameResult, customDate?: number): Game {
  const data = loadData();

  // Create the game object
  const game: Game = {
    id: generateId(),
    date: customDate || Date.now(),
    placements: gameResult.placements,
    ratingChanges: {},
    expansions: gameResult.expansions,
    generations: gameResult.generations,
  };

  // Calculate Elo changes
  game.ratingChanges = calculateEloChanges(game.placements, data.players);

  // Apply rating changes to players
  data.players = applyRatingChanges(data.players, game);

  // Add game to history
  data.games.push(game);

  saveData(data);

  return game;
}

/**
 * Delete the last game and revert rating changes
 */
export function deleteLastGame(): boolean {
  const data = loadData();

  if (data.games.length === 0) {
    return false; // No games to delete
  }

  // Get the last game
  const lastGame = data.games[data.games.length - 1];

  // Revert rating changes for all players in the game
  lastGame.placements.forEach(playerId => {
    const player = data.players[playerId];
    if (!player) return;

    const ratingChange = lastGame.ratingChanges[playerId] || 0;

    // Remove the rating change
    const newRating = player.currentRating - ratingChange;

    // Check if this was a win (1st place)
    const wasWin = lastGame.placements[0] === playerId;

    // Remove the last entry from rating history
    const newRatingHistory = player.ratingHistory.filter(
      entry => entry.gameId !== lastGame.id
    );

    data.players[playerId] = {
      ...player,
      currentRating: newRating,
      gamesPlayed: player.gamesPlayed - 1,
      wins: player.wins - (wasWin ? 1 : 0),
      ratingHistory: newRatingHistory,
    };
  });

  // Remove the game from history
  data.games.pop();

  saveData(data);

  return true;
}

/**
 * Delete a specific game by ID and recalculate all ratings from scratch
 * This ensures rating consistency when deleting games from the middle of history
 */
export function deleteGameById(gameId: string): boolean {
  const data = loadData();

  // Find the game index
  const gameIndex = data.games.findIndex(g => g.id === gameId);
  if (gameIndex === -1) {
    return false; // Game not found
  }

  // Remove the game from the list
  data.games.splice(gameIndex, 1);

  // Reset all players to starting state
  Object.keys(data.players).forEach(playerId => {
    const player = data.players[playerId];
    data.players[playerId] = {
      ...player,
      currentRating: getStartingRating(),
      gamesPlayed: 0,
      wins: 0,
      ratingHistory: [],
    };
  });

  // Replay all remaining games in chronological order
  data.games.forEach(game => {
    // Recalculate Elo changes
    game.ratingChanges = calculateEloChanges(game.placements, data.players);

    // Apply rating changes
    data.players = applyRatingChanges(data.players, game);
  });

  saveData(data);

  return true;
}

/**
 * Get all players sorted by rating
 */
export function getRankings(activeOnly: boolean = false): Player[] {
  const data = loadData();
  const players = Object.values(data.players);

  let filtered = players;

  if (activeOnly) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    filtered = players.filter(player => {
      const lastGame = player.ratingHistory[player.ratingHistory.length - 1];
      return lastGame && lastGame.date >= thirtyDaysAgo;
    });
  }

  return filtered.sort((a, b) => b.currentRating - a.currentRating);
}

/**
 * Get all players
 */
export function getAllPlayers(): Record<string, Player> {
  const data = loadData();
  return data.players;
}

/**
 * Get a single player by ID
 */
export function getPlayer(playerId: string): Player | null {
  const data = loadData();
  return data.players[playerId] || null;
}

/**
 * Get player statistics
 */
export function getPlayerStats(playerId: string): PlayerStats | null {
  const data = loadData();
  const player = data.players[playerId];

  if (!player) return null;

  const playerGames = data.games.filter(game =>
    game.placements.includes(playerId)
  );

  const winRate = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;

  let totalPlacement = 0;
  playerGames.forEach(game => {
    const placement = game.placements.indexOf(playerId);
    totalPlacement += placement + 1; // +1 because index 0 = 1st place
  });

  const averagePlacement = playerGames.length > 0 ? totalPlacement / playerGames.length : 0;

  const lastGameDate = player.ratingHistory.length > 0
    ? player.ratingHistory[player.ratingHistory.length - 1].date
    : null;

  // Get recent games (last 10)
  const recentGames = playerGames.slice(-10).reverse();

  return {
    player,
    winRate,
    averagePlacement,
    lastGameDate,
    recentGames,
  };
}

/**
 * Get head-to-head record between two players
 */
export function getHeadToHead(playerId: string, opponentId: string): HeadToHeadRecord {
  const data = loadData();

  const record: HeadToHeadRecord = {
    playerId,
    opponentId,
    wins: 0,
    losses: 0,
    ties: 0,
    gamesPlayed: 0,
  };

  data.games.forEach(game => {
    const playerIndex = game.placements.indexOf(playerId);
    const opponentIndex = game.placements.indexOf(opponentId);

    // Both players must be in the game
    if (playerIndex === -1 || opponentIndex === -1) return;

    record.gamesPlayed++;

    if (playerIndex < opponentIndex) {
      record.wins++;
    } else if (playerIndex > opponentIndex) {
      record.losses++;
    } else {
      record.ties++;
    }
  });

  return record;
}

/**
 * Get all head-to-head records for a player
 */
export function getAllHeadToHeads(playerId: string): HeadToHeadRecord[] {
  const data = loadData();
  const records: HeadToHeadRecord[] = [];

  Object.keys(data.players).forEach(opponentId => {
    if (opponentId === playerId) return;

    const record = getHeadToHead(playerId, opponentId);
    if (record.gamesPlayed > 0) {
      records.push(record);
    }
  });

  return records.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
}

/**
 * Export data as JSON
 */
export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON
 */
export function importData(jsonString: string): void {
  try {
    const data = JSON.parse(jsonString) as AppData;

    // Basic validation
    if (!data.players || !data.games || typeof data.version !== 'number') {
      throw new Error('Invalid data format');
    }

    saveData(data);
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data. Please check the file format.');
  }
}

/**
 * Clear all data
 */
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get all games (sorted by date descending - most recent first)
 */
export function getAllGames(): Game[] {
  const data = loadData();
  return [...data.games].sort((a, b) => b.date - a.date); // Sort by date, most recent first
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
