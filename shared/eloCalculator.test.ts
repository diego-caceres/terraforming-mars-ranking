import { describe, it, expect } from 'vitest';
import {
  calculateExpectedScore,
  calculateActualScore,
  calculateEloChanges,
  calculateGameRatingChanges,
  applyRatingChanges,
  getStartingRating,
  hasLowConfidence,
  getMonthlyKFactor,
  getMonthlyConfidenceThreshold,
} from './eloCalculator';
import type { EloPlayer, EloGame } from './eloCalculator';

// These fixtures only need the minimal EloPlayer/EloGame shape — the real
// Player/Game types from api/_lib/types.ts and src/types/index.ts both
// carry extra fields (name, createdAt, color, expansions, ...) that this
// module never touches, and structurally satisfy this shape either way.

const STARTING_RATING = 1500;

function makePlayer(overrides: Partial<EloPlayer> & { id: string }): EloPlayer {
  return {
    currentRating: STARTING_RATING,
    peakRating: STARTING_RATING,
    gamesPlayed: 0,
    wins: 0,
    ratingHistory: [],
    ...overrides,
  };
}

function makePlayers(ids: string[], rating = STARTING_RATING): Record<string, EloPlayer> {
  return Object.fromEntries(ids.map(id => [id, makePlayer({ id, currentRating: rating, peakRating: rating })]));
}

function makeGame(overrides: Partial<EloGame> & { placements: string[]; ratingChanges: Record<string, number> }): EloGame {
  return {
    id: 'game-1',
    date: 1000,
    ...overrides,
  };
}

describe('calculateExpectedScore', () => {
  it('returns 0.5 for equal ratings', () => {
    expect(calculateExpectedScore(1500, 1500)).toBeCloseTo(0.5, 10);
  });

  it('favors the higher-rated player', () => {
    expect(calculateExpectedScore(1600, 1500)).toBeGreaterThan(0.5);
    expect(calculateExpectedScore(1500, 1600)).toBeLessThan(0.5);
  });

  it('is symmetric: E(a,b) + E(b,a) === 1', () => {
    const a = calculateExpectedScore(1723, 1481);
    const b = calculateExpectedScore(1481, 1723);
    expect(a + b).toBeCloseTo(1, 10);
  });

  it('matches the classic Elo reference value for a 400-point gap', () => {
    // A 400-point rating gap corresponds to an expected score of ~0.909/0.091.
    expect(calculateExpectedScore(1900, 1500)).toBeCloseTo(0.90909, 4);
    expect(calculateExpectedScore(1500, 1900)).toBeCloseTo(0.09091, 4);
  });
});

describe('calculateActualScore', () => {
  it('gives 1.0 when the player placed better (lower index) than the opponent', () => {
    expect(calculateActualScore(0, 1)).toBe(1.0);
  });

  it('gives 0.0 when the player placed worse (higher index) than the opponent', () => {
    expect(calculateActualScore(2, 0)).toBe(0.0);
  });

  it('gives 0.5 for a tied placement', () => {
    expect(calculateActualScore(1, 1)).toBe(0.5);
  });
});

describe('calculateEloChanges', () => {
  it('splits +20/-20 for two equally-rated players (K=40)', () => {
    const players = makePlayers(['a', 'b'], 1500);
    const changes = calculateEloChanges(['a', 'b'], players);
    expect(changes).toEqual({ a: 20, b: -20 });
  });

  it('is zero-sum before rounding for a 2-player game', () => {
    const players = makePlayers(['a', 'b'], 1500);
    players.a.currentRating = 1650;
    const changes = calculateEloChanges(['a', 'b'], players);
    expect(changes.a + changes.b).toBe(0);
  });

  it('rewards the underdog more than the favorite for the same win', () => {
    const players = makePlayers(['favorite', 'underdog']);
    players.favorite.currentRating = 1800;
    players.underdog.currentRating = 1400;

    const underdogWins = calculateEloChanges(['underdog', 'favorite'], players);
    const favoriteWins = calculateEloChanges(['favorite', 'underdog'], players);

    expect(underdogWins.underdog).toBeGreaterThan(favoriteWins.favorite);
  });

  it('handles a multi-player free-for-all via pairwise round-robin comparisons', () => {
    const players = makePlayers(['first', 'second', 'third'], 1500);
    const changes = calculateEloChanges(['first', 'second', 'third'], players);

    // 1st beats both 2nd and 3rd; last place loses to both others.
    expect(changes.first).toBeGreaterThan(0);
    expect(changes.third).toBeLessThan(0);
    // Middle placement split one win (vs 3rd) and one loss (vs 1st) between
    // equally-rated players, so it should net out close to zero.
    expect(changes.second).toBeCloseTo(0, 0);
  });

  it('respects a custom kFactor', () => {
    const players = makePlayers(['a', 'b'], 1500);
    const defaultK = calculateEloChanges(['a', 'b'], players);
    const doubledK = calculateEloChanges(['a', 'b'], players, 80);
    expect(doubledK.a).toBe(defaultK.a * 2);
  });

  it('skips placements for players missing from the players map', () => {
    const players = makePlayers(['a'], 1500);
    const changes = calculateEloChanges(['a', 'ghost'], players);
    expect(changes.a).toBeDefined();
    expect(changes.ghost).toBeUndefined();
  });

  it('rounds each player\'s change to the nearest integer', () => {
    const players = makePlayers(['a', 'b', 'c'], 1500);
    const changes = calculateEloChanges(['a', 'b', 'c'], players);
    for (const change of Object.values(changes)) {
      expect(Number.isInteger(change)).toBe(true);
    }
  });
});

describe('calculateGameRatingChanges', () => {
  it('zeroes every placement for a 2-player game, regardless of rating gap', () => {
    const players = makePlayers(['a', 'b']);
    players.a.currentRating = 2000;
    players.b.currentRating = 1000;

    const changes = calculateGameRatingChanges(['a', 'b'], players, true);
    expect(changes).toEqual({ a: 0, b: 0 });
  });

  it('never calls into the Elo formula for a 2-player game', () => {
    // Guards specifically against the regression this fix addressed: a
    // 2-player game caught up in a rating recalculation must never end up
    // with a non-zero change, no matter what the "real" Elo math would say.
    const players = makePlayers(['a', 'b'], 1500);
    const twoPlayerChanges = calculateGameRatingChanges(['a', 'b'], players, true);
    const wouldBeEloChanges = calculateEloChanges(['a', 'b'], players);

    expect(Object.values(twoPlayerChanges).every(c => c === 0)).toBe(true);
    expect(wouldBeEloChanges.a).not.toBe(0); // sanity: the Elo math itself is non-zero here
  });

  it('delegates to calculateEloChanges for games with 3+ players', () => {
    const players = makePlayers(['a', 'b', 'c'], 1500);
    const viaWrapper = calculateGameRatingChanges(['a', 'b', 'c'], players, false);
    const direct = calculateEloChanges(['a', 'b', 'c'], players);
    expect(viaWrapper).toEqual(direct);
  });

  it('passes a custom kFactor through to the underlying Elo calculation', () => {
    const players = makePlayers(['a', 'b'], 1500);
    const changes = calculateGameRatingChanges(['a', 'b'], players, false, 80);
    expect(changes.a).toBe(40); // K=80, equal ratings -> 80 * 0.5 = 40
  });
});

describe('applyRatingChanges', () => {
  it('applies the rating change, increments gamesPlayed, and records a win for 1st place only', () => {
    const players = makePlayers(['winner', 'loser'], 1500);
    const game = makeGame({ placements: ['winner', 'loser'], ratingChanges: { winner: 20, loser: -20 } });

    const updated = applyRatingChanges(players, game);

    expect(updated.winner.currentRating).toBe(1520);
    expect(updated.winner.gamesPlayed).toBe(1);
    expect(updated.winner.wins).toBe(1);

    expect(updated.loser.currentRating).toBe(1480);
    expect(updated.loser.gamesPlayed).toBe(1);
    expect(updated.loser.wins).toBe(0);
  });

  it('records a ratingHistory entry matching the game id, resulting rating, change, and date', () => {
    const players = makePlayers(['a'], 1500);
    const game = makeGame({ id: 'g-42', date: 999, placements: ['a'], ratingChanges: { a: 15 } });

    const updated = applyRatingChanges(players, game);

    expect(updated.a.ratingHistory).toEqual([{ gameId: 'g-42', rating: 1515, change: 15, date: 999 }]);
  });

  it('tracks peak rating as the max ever reached, and never lowers it on a loss', () => {
    const player = makePlayer({ id: 'a', currentRating: 1600, peakRating: 1600 });
    const players = { a: player };
    const game = makeGame({ placements: ['a', 'b'], ratingChanges: { a: -50 } });

    const updated = applyRatingChanges(players, game);

    expect(updated.a.currentRating).toBe(1550);
    expect(updated.a.peakRating).toBe(1600); // unchanged, since 1550 < previous peak
  });

  it('raises peak rating when a new high is reached', () => {
    const players = makePlayers(['a'], 1500);
    const game = makeGame({ placements: ['a'], ratingChanges: { a: 30 } });

    const updated = applyRatingChanges(players, game);

    expect(updated.a.currentRating).toBe(1530);
    expect(updated.a.peakRating).toBe(1530);
  });

  it('leaves currentRating unchanged for a zero-change (e.g. 2-player) game, but still counts activity', () => {
    const players = makePlayers(['a', 'b'], 1500);
    const game = makeGame({ placements: ['a', 'b'], ratingChanges: { a: 0, b: 0 }, twoPlayerGame: true });

    const updated = applyRatingChanges(players, game);

    expect(updated.a.currentRating).toBe(1500);
    expect(updated.b.currentRating).toBe(1500);
    expect(updated.a.gamesPlayed).toBe(1);
    expect(updated.b.gamesPlayed).toBe(1);
    expect(updated.a.wins).toBe(1); // still counts as a "win" for activity/streak purposes
  });

  it('skips placements for players missing from the players map without throwing', () => {
    const players = makePlayers(['a'], 1500);
    const game = makeGame({ placements: ['a', 'ghost'], ratingChanges: { a: 10, ghost: -10 } });

    expect(() => applyRatingChanges(players, game)).not.toThrow();
    const updated = applyRatingChanges(players, game);
    expect(updated.ghost).toBeUndefined();
  });

  it('does not mutate the input players object', () => {
    const players = makePlayers(['a'], 1500);
    const originalRating = players.a.currentRating;
    const game = makeGame({ placements: ['a'], ratingChanges: { a: 25 } });

    applyRatingChanges(players, game);

    expect(players.a.currentRating).toBe(originalRating);
  });

  it('replaying the same game history sequentially matches a fresh recalculation (regression: no double-counting)', () => {
    // This mirrors what the delete-recalculation and migration scripts do:
    // replay every game from scratch and confirm the final state is exactly
    // what applying each game once, in order, produces — no game's effect
    // should ever be counted twice or dropped.
    let players = makePlayers(['a', 'b', 'c'], 1500);
    const games: Game[] = [
      makeGame({ id: 'g1', date: 1, placements: ['a', 'b', 'c'], ratingChanges: calculateEloChanges(['a', 'b', 'c'], players) }),
    ];
    players = applyRatingChanges(players, games[0]);

    games.push(makeGame({ id: 'g2', date: 2, placements: ['b', 'c', 'a'], ratingChanges: calculateEloChanges(['b', 'c', 'a'], players) }));
    players = applyRatingChanges(players, games[1]);

    // Fresh replay from scratch using the already-recorded ratingChanges.
    let replay = makePlayers(['a', 'b', 'c'], 1500);
    for (const g of games) {
      replay = applyRatingChanges(replay, g);
    }

    expect(replay.a.currentRating).toBe(players.a.currentRating);
    expect(replay.b.currentRating).toBe(players.b.currentRating);
    expect(replay.c.currentRating).toBe(players.c.currentRating);
  });
});

describe('getStartingRating', () => {
  it('returns 1500', () => {
    expect(getStartingRating()).toBe(1500);
  });
});

describe('hasLowConfidence', () => {
  it('is true below the default threshold of 10 games', () => {
    expect(hasLowConfidence(makePlayer({ id: 'a', gamesPlayed: 9 }))).toBe(true);
  });

  it('is false at or above the default threshold of 10 games', () => {
    expect(hasLowConfidence(makePlayer({ id: 'a', gamesPlayed: 10 }))).toBe(false);
  });

  it('respects a custom threshold', () => {
    expect(hasLowConfidence(makePlayer({ id: 'a', gamesPlayed: 4 }), 5)).toBe(true);
    expect(hasLowConfidence(makePlayer({ id: 'a', gamesPlayed: 5 }), 5)).toBe(false);
  });
});

describe('monthly ranking constants', () => {
  it('getMonthlyKFactor returns 32', () => {
    expect(getMonthlyKFactor()).toBe(32);
  });

  it('getMonthlyConfidenceThreshold returns 5', () => {
    expect(getMonthlyConfidenceThreshold()).toBe(5);
  });
});
