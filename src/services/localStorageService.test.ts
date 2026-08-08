import { describe, it, expect, beforeEach } from 'vitest';

// localStorageService reads/writes the global `localStorage` (getItem/
// setItem only). Rather than pull in a full DOM environment for this one
// file, provide a minimal in-memory Storage implementation.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() { return this.store.size; }
  clear() { this.store.clear(); }
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  key(index: number) { return [...this.store.keys()][index] ?? null; }
  removeItem(key: string) { this.store.delete(key); }
  setItem(key: string, value: string) { this.store.set(key, value); }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();
});

import { addPlayer, recordGame, deleteGame, getAllPlayers } from './localStorageService';

function seedTwoPlayers(): [string, string] {
  const a = addPlayer('Ana');
  const b = addPlayer('Beto');
  return [a.id, b.id];
}

describe('localStorageService: 2-player games stay Elo-neutral', () => {
  it('recordGame stores a zero ratingChange and the twoPlayerGame flag for a 2-player game', () => {
    const [aId, bId] = seedTwoPlayers();

    const { game } = recordGame({ playerIds: [aId, bId], placements: [aId, bId] });

    expect(game.twoPlayerGame).toBe(true);
    expect(game.ratingChanges).toEqual({ [aId]: 0, [bId]: 0 });
  });

  it('recordGame still counts a 2-player game as activity (gamesPlayed/wins), just not rating', () => {
    const [aId, bId] = seedTwoPlayers();

    const { players } = recordGame({ playerIds: [aId, bId], placements: [aId, bId] });

    expect(players[aId].currentRating).toBe(1500);
    expect(players[aId].gamesPlayed).toBe(1);
    expect(players[aId].wins).toBe(1);
    expect(players[bId].gamesPlayed).toBe(1);
    expect(players[bId].wins).toBe(0);
  });

  it('a 2-player game stays Elo-neutral even after a later deletion triggers a full recalculation', () => {
    // Regression case matching the server-side bug: recalculateAllRatings
    // must keep re-deriving "is this a 2-player game" from the stored game
    // (via placements.length, since twoPlayerGame may be absent on legacy
    // data) rather than ever recomputing real Elo for it.
    const [aId, bId] = seedTwoPlayers();
    const third = addPlayer('Caro');

    recordGame({ playerIds: [aId, bId], placements: [aId, bId] }); // 2-player, neutral
    const { game: threePlayerGame } = recordGame({ playerIds: [aId, bId, third.id], placements: [aId, bId, third.id] });

    // Deleting the 3-player game forces recalculateAllRatings to replay
    // everything from scratch, including the surviving 2-player game.
    deleteGame(threePlayerGame.id);

    const players = getAllPlayers();
    const a = players.find(p => p.id === aId)!;
    const b = players.find(p => p.id === bId)!;

    expect(a.currentRating).toBe(1500);
    expect(b.currentRating).toBe(1500);
  });
});
