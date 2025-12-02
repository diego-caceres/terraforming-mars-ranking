// This service acts as a router between API calls and localStorage
// depending on the environment configuration

import type { Player, Game, GameResult, PlayerColor } from '../types';
import * as apiService from './apiService';
import * as localStorageService from './localStorageService';

// Check if we should use local storage
export function useLocalStorage(): boolean {
  return import.meta.env.VITE_USE_LOCAL_STORAGE === 'true';
}

// Player operations
export async function getAllPlayers(): Promise<Player[]> {
  if (useLocalStorage()) {
    return localStorageService.getAllPlayers();
  }
  return apiService.getAllPlayers();
}

export async function addPlayer(name: string, color?: PlayerColor): Promise<Player> {
  if (useLocalStorage()) {
    return localStorageService.addPlayer(name, color);
  }
  return apiService.addPlayer(name, color);
}

export async function updatePlayer(
  playerId: string,
  updates: { name?: string; color?: PlayerColor }
): Promise<Player> {
  if (useLocalStorage()) {
    return localStorageService.updatePlayer(playerId, updates);
  }
  return apiService.updatePlayer(playerId, updates);
}

export async function getRankings(activeOnly = false): Promise<Player[]> {
  if (useLocalStorage()) {
    return localStorageService.getRankings(activeOnly);
  }
  return apiService.getRankings(activeOnly);
}

// Game operations
export async function getAllGames(): Promise<Game[]> {
  if (useLocalStorage()) {
    return localStorageService.getAllGames();
  }
  return apiService.getAllGames();
}

export async function recordGame(
  gameResult: GameResult,
  customDate?: number
): Promise<{ game: Game; players: Record<string, Player> }> {
  if (useLocalStorage()) {
    return localStorageService.recordGame(gameResult, customDate);
  }
  return apiService.recordGame(gameResult, customDate);
}

export async function deleteGameById(gameId: string): Promise<Record<string, Player>> {
  if (useLocalStorage()) {
    return localStorageService.deleteGame(gameId);
  }
  return apiService.deleteGameById(gameId);
}

export async function deleteLastGame(): Promise<{
  deletedGame: Game;
  players: Record<string, Player>;
}> {
  if (useLocalStorage()) {
    return localStorageService.deleteLastGame();
  }
  return apiService.deleteLastGame();
}

export async function updateGameMetadata(
  gameId: string,
  updates: { expansions?: string[]; generations?: number }
): Promise<Game> {
  if (useLocalStorage()) {
    return localStorageService.updateGameMetadata(gameId, updates);
  }
  return apiService.updateGameMetadata(gameId, updates);
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
  if (useLocalStorage()) {
    return localStorageService.getPlayerStats(playerId);
  }
  return apiService.getPlayerStats(playerId);
}

// Export/Import functionality
export async function exportData(): Promise<string> {
  if (useLocalStorage()) {
    return localStorageService.exportData();
  }
  return apiService.exportData();
}

export async function importData(jsonString: string): Promise<void> {
  if (useLocalStorage()) {
    return localStorageService.importData(jsonString);
  }
  return apiService.importData(jsonString);
}

// Monthly rankings - only available with API
export async function getMonthlyRankings(
  year: number,
  month: number
): Promise<{
  rankings: Player[];
  year: number;
  month: number;
  gamesCount: number;
}> {
  if (useLocalStorage()) {
    throw new Error('Los rankings mensuales no están disponibles en modo local');
  }
  return apiService.getMonthlyRankings(year, month);
}

export async function getMonthlyIndependentRankings(
  year: number,
  month: number
): Promise<{
  rankings: Player[];
  year: number;
  month: number;
  gamesCount: number;
}> {
  if (useLocalStorage()) {
    throw new Error('Los rankings mensuales independientes no están disponibles en modo local');
  }
  return apiService.getMonthlyIndependentRankings(year, month);
}
