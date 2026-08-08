import { describe, it, expect } from 'vitest';
import { calculateMonthlyIndependentRankings, calculateMonthlyAccumulatedRankings } from './rankingsService';
import type { Player, Game } from '../types';

// calculateMonthlyIndependentRankings backs the "Mensual Independiente" tab
// and runs 100% client-side regardless of storage backend (see
// RankingsContext.tsx) — unlike the all-time view, it recomputes Elo from
// scratch on every render, so a bug here is live for every user immediately,
// not just something that could corrupt stored data.

const STARTING_RATING = 1500;
const JAN_2026 = Date.UTC(2026, 0, 15); // safely inside January 2026
const JAN_2026_LATER = Date.UTC(2026, 0, 20);

function makePlayer(id: string): Player {
  return {
    id,
    name: id,
    currentRating: STARTING_RATING,
    peakRating: STARTING_RATING,
    gamesPlayed: 0,
    wins: 0,
    createdAt: 0,
    ratingHistory: [],
  };
}

function makeGame(overrides: Partial<Game> & { placements: string[] }): Game {
  return {
    id: 'g1',
    date: JAN_2026,
    ratingChanges: {},
    ...overrides,
  };
}

describe('calculateMonthlyIndependentRankings', () => {
  it('leaves ratings at the 1500 starting point after only a 2-player game this month', () => {
    const players = [makePlayer('a'), makePlayer('b')];
    const games = [makeGame({ placements: ['a', 'b'], twoPlayerGame: true })];

    const { rankings } = calculateMonthlyIndependentRankings(players, games, 2026, 1);

    for (const player of rankings) {
      expect(player.currentRating).toBe(STARTING_RATING);
    }
  });

  it('still counts a 2-player game as a played game (activity), just not for rating', () => {
    const players = [makePlayer('a'), makePlayer('b')];
    const games = [makeGame({ placements: ['a', 'b'], twoPlayerGame: true })];

    const { rankings } = calculateMonthlyIndependentRankings(players, games, 2026, 1);
    const a = rankings.find(p => p.id === 'a')!;

    expect(a.gamesPlayed).toBe(1);
    expect(a.wins).toBe(1); // 1st placement still counts as a win for streaks/records
  });

  it('does apply real Elo changes for a 3+ player game in the same month', () => {
    const players = [makePlayer('a'), makePlayer('b'), makePlayer('c')];
    const games = [makeGame({ id: 'g2', placements: ['a', 'b', 'c'] })];

    const { rankings } = calculateMonthlyIndependentRankings(players, games, 2026, 1);
    const a = rankings.find(p => p.id === 'a')!;

    expect(a.currentRating).not.toBe(STARTING_RATING);
  });

  it('a 2-player game does not distort standings when mixed with a real game in the same month', () => {
    // Regression case for the actual bug: before the fix, this 2-player
    // game between b and c would have pulled real Elo points off of
    // whichever of them "lost" the placement order, corrupting the month's
    // standings even though 2-player games are supposed to be neutral.
    const players = [makePlayer('a'), makePlayer('b'), makePlayer('c')];
    const games = [
      makeGame({ id: 'g1', date: JAN_2026, placements: ['a', 'b', 'c'] }),
      makeGame({ id: 'g2', date: JAN_2026_LATER, placements: ['b', 'c'], twoPlayerGame: true }),
    ];

    const withTwoPlayerGame = calculateMonthlyIndependentRankings(players, games, 2026, 1);
    const withoutTwoPlayerGame = calculateMonthlyIndependentRankings(players, [games[0]], 2026, 1);

    const bWith = withTwoPlayerGame.rankings.find(p => p.id === 'b')!;
    const cWith = withTwoPlayerGame.rankings.find(p => p.id === 'c')!;
    const bWithout = withoutTwoPlayerGame.rankings.find(p => p.id === 'b')!;
    const cWithout = withoutTwoPlayerGame.rankings.find(p => p.id === 'c')!;

    expect(bWith.currentRating).toBe(bWithout.currentRating);
    expect(cWith.currentRating).toBe(cWithout.currentRating);
  });
});

describe('calculateMonthlyAccumulatedRankings', () => {
  it('leaves ratings unchanged after a 2-player game with no prior ratingChanges stored', () => {
    const players = [makePlayer('a'), makePlayer('b')];
    const games = [makeGame({ placements: ['a', 'b'], twoPlayerGame: true, ratingChanges: {} })];

    const { rankings } = calculateMonthlyAccumulatedRankings(players, games, 2026, 1);

    for (const player of rankings) {
      expect(player.currentRating).toBe(STARTING_RATING);
    }
  });
});
