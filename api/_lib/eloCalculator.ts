import type { Player, Game } from './types';

const K_FACTOR = 40;
const STARTING_RATING = 1500;

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
  if (playerPlacement < opponentPlacement) return 1.0;
  if (playerPlacement === opponentPlacement) return 0.5;
  return 0.0;
}

/**
 * Calculate Elo rating changes for all players in a game
 * Returns a map of playerId -> rating change
 */
export function calculateEloChanges(
  placements: string[],
  players: Record<string, Player>
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

      totalChange += K_FACTOR * (actualScore - expectedScore);
    });

    ratingChanges[playerId] = Math.round(totalChange);
  });

  return ratingChanges;
}

/**
 * Apply rating changes to players and update their stats
 * For 2-player games, only track activity (games played, wins) but don't change rating
 */
export function applyRatingChanges(
  players: Record<string, Player>,
  game: Game
): Record<string, Player> {
  const updatedPlayers = { ...players };

  game.placements.forEach((playerId, index) => {
    const player = updatedPlayers[playerId];
    if (!player) return;

    const ratingChange = game.ratingChanges[playerId] || 0;
    const newRating = player.currentRating + ratingChange;

    const isWin = index === 0;

    updatedPlayers[playerId] = {
      ...player,
      currentRating: newRating,
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
export function hasLowConfidence(player: Player): boolean {
  return player.gamesPlayed < 10;
}
