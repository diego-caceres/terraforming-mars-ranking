import type { Player, Game } from '../types';
import {
  calculateEloChanges,
  applyRatingChanges,
  getStartingRating,
  getMonthlyKFactor,
} from './eloCalculator';

/**
 * Calculate monthly independent rankings for a specific month
 * All players start at 1500 and only games from that month are considered
 */
export function calculateMonthlyIndependentRankings(
  allPlayers: Player[],
  allGames: Game[],
  year: number,
  month: number
): {
  rankings: Player[];
  gamesCount: number;
} {
  // Calculate month boundaries in UTC to avoid timezone issues
  const monthStart = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
  const monthEnd = Date.UTC(year, month, 1, 0, 0, 0, 0);

  // Filter games for the specified month
  const monthlyGames = allGames.filter(
    game => game.date >= monthStart && game.date < monthEnd
  );

  if (monthlyGames.length === 0) {
    return { rankings: [], gamesCount: 0 };
  }

  // Sort games by date (ascending) - chronological order is critical
  const sortedGames = [...monthlyGames].sort((a, b) => a.date - b.date);

  // Get all players who played in this month
  const playerIdsSet = new Set<string>();
  sortedGames.forEach(game => {
    game.placements.forEach(playerId => playerIdsSet.add(playerId));
  });

  // Initialize ALL players with the same starting rating (1500)
  const players: Record<string, Player> = {};
  const monthlyKFactor = getMonthlyKFactor();

  allPlayers.forEach(playerData => {
    if (playerIdsSet.has(playerData.id)) {
      players[playerData.id] = {
        ...playerData,
        currentRating: getStartingRating(),
        gamesPlayed: 0,
        wins: 0,
        ratingHistory: [],
      };
    }
  });

  // Calculate ELO for the month using monthly K-factor
  for (const game of sortedGames) {
    // Always recalculate with monthly K-factor
    const ratingChanges = calculateEloChanges(game.placements, players, monthlyKFactor);
    const gameWithChanges = { ...game, ratingChanges };
    const updatedPlayers = applyRatingChanges(players, gameWithChanges);
    Object.assign(players, updatedPlayers);
  }

  // Convert to array and sort by rating
  const rankings = Object.values(players).sort((a, b) => b.currentRating - a.currentRating);

  return {
    rankings,
    gamesCount: sortedGames.length,
  };
}

/**
 * Calculate monthly accumulated rankings for a specific month
 * Players start with their accumulated rating at the beginning of the month
 */
export function calculateMonthlyAccumulatedRankings(
  allPlayers: Player[],
  allGames: Game[],
  year: number,
  month: number
): {
  rankings: Player[];
  gamesCount: number;
} {
  // Calculate month boundaries in UTC
  const monthStart = Date.UTC(year, month - 1, 1, 0, 0, 0, 0);
  const monthEnd = Date.UTC(year, month, 1, 0, 0, 0, 0);

  // Filter games for the specified month
  const monthlyGames = allGames.filter(
    game => game.date >= monthStart && game.date < monthEnd
  );

  if (monthlyGames.length === 0) {
    return { rankings: [], gamesCount: 0 };
  }

  // Sort games by date (ascending)
  const sortedGames = [...monthlyGames].sort((a, b) => a.date - b.date);

  // Get all players who played in this month
  const playerIdsSet = new Set<string>();
  sortedGames.forEach(game => {
    game.placements.forEach(playerId => playerIdsSet.add(playerId));
  });

  // Initialize players with rating at the start of the month
  const players: Record<string, Player> = {};

  allPlayers.forEach(playerData => {
    if (playerIdsSet.has(playerData.id)) {
      const sortedHistory = [...playerData.ratingHistory].sort((a, b) => a.date - b.date);
      let lastBeforeMonth = sortedHistory.find(entry => entry.date < monthStart);
      let firstInMonth = sortedHistory.find(
        entry => entry.date >= monthStart && entry.date < monthEnd
      );

      let startingRating = getStartingRating();
      if (lastBeforeMonth) {
        startingRating = lastBeforeMonth.rating;
      } else if (firstInMonth) {
        startingRating = firstInMonth.rating - firstInMonth.change;
      }

      players[playerData.id] = {
        ...playerData,
        currentRating: startingRating,
        gamesPlayed: 0,
        wins: 0,
        ratingHistory: [],
      };
    }
  });

  // Recalculate ELO for the month
  for (const game of sortedGames) {
    const ratingChanges =
      game.ratingChanges && Object.keys(game.ratingChanges).length > 0
        ? game.ratingChanges
        : calculateEloChanges(game.placements, players);
    const gameWithChanges = { ...game, ratingChanges };
    const updatedPlayers = applyRatingChanges(players, gameWithChanges);
    Object.assign(players, updatedPlayers);
  }

  // Convert to array and sort by rating
  const rankings = Object.values(players).sort((a, b) => b.currentRating - a.currentRating);

  return {
    rankings,
    gamesCount: sortedGames.length,
  };
}

/**
 * Get current year and month
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  };
}

/**
 * Generate a cache key for monthly rankings
 */
export function getMonthlyRankingsCacheKey(year: number, month: number, type: 'independent' | 'accumulated'): string {
  return `rankings:monthly:${type}:${year}-${String(month).padStart(2, '0')}`;
}
