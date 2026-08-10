/**
 * Single source of truth for the Elo rating system, used by both the
 * Vercel serverless functions (this file) and the client-side app
 * (src/services/eloCalculator.ts re-exports from here) — localStorage mode
 * and the monthly-rankings recalculation both run this same logic in the
 * browser.
 *
 * This file lives under api/_lib rather than a neutral top-level shared/
 * directory deliberately: Vercel's Node function bundler compiles files
 * inside api/ to CommonJS, but a file living outside api/ that gets pulled
 * in via file-tracing gets compiled as an ES module instead — and CJS
 * require() can't load an ESM module, so a top-level shared/ file crashed
 * every api/ function that imported it in production with
 * `ERR_REQUIRE_ESM` (this reproduces only in a real `vercel build`/
 * deployment, not in `vercel dev`, which is why it wasn't caught locally).
 * Keeping the canonical file inside api/_lib avoids that entirely — Vite
 * has no such constraint bundling api/_lib into the client build.
 *
 * Two real bugs slipped through specifically because this used to be two
 * separate copies that drifted apart (see git history around
 * calculateGameRatingChanges): a fix landed in one and not the other.
 * Keeping one implementation makes that class of bug structurally
 * impossible — don't reintroduce a second copy in src/services.
 *
 * Types here are intentionally minimal and structural (EloPlayer/EloGame)
 * rather than importing this file's own types.ts or src/types/index.ts —
 * the real Player/Game types from both sides already satisfy these shapes,
 * and keeping this module's public surface decoupled from either type
 * module avoids a different kind of coupling.
 */

const K_FACTOR = 40;
const STARTING_RATING = 1500;

// Constantes para ranking mensual independiente
const MONTHLY_K_FACTOR = 32;
const MONTHLY_CONFIDENCE_THRESHOLD = 5;

export interface RatingHistoryEntry {
  gameId: string;
  rating: number;
  change: number;
  date: number;
}

export interface EloPlayer {
  id: string;
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  ratingHistory: RatingHistoryEntry[];
}

export interface EloGame {
  id: string;
  date: number;
  placements: string[]; // Ordered array of player IDs (1st place, 2nd place, etc.)
  ratingChanges: Record<string, number>; // playerId -> rating change
  twoPlayerGame?: boolean; // True if this is a 2-player game (doesn't affect Elo)
}

/**
 * Calculate expected score for a player against an opponent
 * E = 1 / (1 + 10^((opponent_rating - player_rating) / 400))
 */
export function calculateExpectedScore(
  playerRating: number,
  opponentRating: number
): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate actual score based on placement comparison
 * 1.0 if player placed higher (better) than opponent
 * 0.5 if tied
 * 0.0 if player placed lower (worse) than opponent
 */
export function calculateActualScore(
  playerPlacement: number,
  opponentPlacement: number
): number {
  if (playerPlacement < opponentPlacement) return 1.0; // Lower index = better placement
  if (playerPlacement === opponentPlacement) return 0.5;
  return 0.0;
}

/**
 * Calculate Elo rating changes for all players in a game
 * Returns a map of playerId -> rating change
 */
export function calculateEloChanges<P extends EloPlayer>(
  placements: string[],
  players: Record<string, P>,
  kFactor: number = K_FACTOR
): Record<string, number> {
  const ratingChanges: Record<string, number> = {};

  placements.forEach((playerId, playerIndex) => {
    const player = players[playerId];
    if (!player) return;

    let totalChange = 0;

    placements.forEach((opponentId, opponentIndex) => {
      if (playerId === opponentId) return;

      const opponent = players[opponentId];
      if (!opponent) return;

      const expectedScore = calculateExpectedScore(
        player.currentRating,
        opponent.currentRating
      );
      const actualScore = calculateActualScore(playerIndex, opponentIndex);

      totalChange += kFactor * (actualScore - expectedScore);
    });

    ratingChanges[playerId] = Math.round(totalChange);
  });

  return ratingChanges;
}

/**
 * Calculate rating changes for a game, respecting the rule that 2-player
 * games never affect Elo (only activity/wins are tracked). Every caller
 * that recomputes ratingChanges — recording a new game, recalculating
 * after a deletion, computing monthly rankings — goes through this so they
 * can't drift out of sync with each other again.
 */
export function calculateGameRatingChanges<P extends EloPlayer>(
  placements: string[],
  players: Record<string, P>,
  isTwoPlayerGame: boolean,
  kFactor: number = K_FACTOR
): Record<string, number> {
  if (isTwoPlayerGame) {
    return Object.fromEntries(placements.map(id => [id, 0]));
  }
  return calculateEloChanges(placements, players, kFactor);
}

/**
 * Apply rating changes to players and update their stats.
 * For 2-player games (ratingChanges all zero), only activity is tracked.
 */
export function applyRatingChanges<P extends EloPlayer>(
  players: Record<string, P>,
  game: EloGame
): Record<string, P> {
  const updatedPlayers = { ...players };

  game.placements.forEach((playerId, index) => {
    const player = updatedPlayers[playerId];
    if (!player) return;

    const ratingChange = game.ratingChanges[playerId] || 0;
    const newRating = player.currentRating + ratingChange;

    const isWin = index === 0;
    const peakRating = Math.max(player.peakRating || STARTING_RATING, newRating);

    updatedPlayers[playerId] = {
      ...player,
      currentRating: newRating,
      peakRating,
      gamesPlayed: player.gamesPlayed + 1,
      wins: player.wins + (isWin ? 1 : 0),
      ratingHistory: [
        ...player.ratingHistory,
        {
          gameId: game.id,
          rating: newRating,
          change: ratingChange,
          date: game.date,
        },
      ],
    };
  });

  return updatedPlayers;
}

/**
 * Get the starting rating for new players
 */
export function getStartingRating(): number {
  return STARTING_RATING;
}

/**
 * Determine if a player should show a confidence indicator
 */
export function hasLowConfidence(player: Pick<EloPlayer, 'gamesPlayed'>, threshold: number = 10): boolean {
  return player.gamesPlayed < threshold;
}

/**
 * Get K-factor for monthly independent rankings
 */
export function getMonthlyKFactor(): number {
  return MONTHLY_K_FACTOR;
}

/**
 * Get confidence threshold for monthly independent rankings
 */
export function getMonthlyConfidenceThreshold(): number {
  return MONTHLY_CONFIDENCE_THRESHOLD;
}
