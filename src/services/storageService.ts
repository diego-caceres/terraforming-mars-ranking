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
 * Get all games
 */
export function getAllGames(): Game[] {
  const data = loadData();
  return [...data.games].reverse(); // Most recent first
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
