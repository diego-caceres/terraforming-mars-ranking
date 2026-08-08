/**
 * Migration script to fix stale `ratingChanges` on Game records, and to
 * correct any 2-player games whose Elo was mistakenly recalculated as
 * non-zero.
 *
 * Root cause (both bugs lived in the DELETE /api/games/[id] handler):
 *   1. When a game was deleted, the handler recalculated every remaining
 *      player correctly (currentRating, peakRating, ratingHistory) but
 *      never re-saved the recalculated `ratingChanges` onto the surviving
 *      Game records — so those records went stale relative to the players'
 *      (correct) ratingHistory.
 *   2. The recalculation loop didn't skip Elo for 2-player games (unlike
 *      the "record a new game" endpoint, which always zeroes their
 *      ratingChanges), so a 2-player game caught up in a recalculation
 *      could end up with a real, non-zero Elo effect baked into both the
 *      game record AND the participants' currentRating.
 *
 * Both are now fixed in api/games.ts and api/games/[id].ts (see
 * calculateGameRatingChanges in shared/eloCalculator.ts). This script
 * heals the damage already sitting in the database: it fully replays the
 * league's entire game history from scratch, in date order, with the
 * corrected logic, and persists the recomputed players and games.
 *
 * Usage:
 *   npm run migrate:fix-rating-changes           # apply the fix
 *   npm run migrate:fix-rating-changes -- --dry-run   # report only, no writes
 *
 * Requirements:
 *   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env
 *
 * Safety:
 *   - Idempotent: running it again after a successful run reports zero changes.
 *   - Only ever changes ratingChanges/currentRating/peakRating/gamesPlayed/
 *     wins/ratingHistory. Never touches placements, dates, expansions, or
 *     generations — only the Elo bookkeeping is recomputed.
 */

import { Redis } from '@upstash/redis';

// Reimplemented inline rather than imported from shared/eloCalculator —
// same approach as scripts/migrate-peak-ratings.ts — to avoid tsx/Node's
// relative cross-directory TS resolution quirks in this project. Keep this
// in sync with calculateGameRatingChanges/applyRatingChanges/
// getStartingRating in shared/eloCalculator.ts if that file ever changes.

const K_FACTOR = 40;
const STARTING_RATING = 1500;

interface RatingHistoryEntry {
  gameId: string;
  rating: number;
  change: number;
  date: number;
}

interface Player {
  id: string;
  name: string;
  currentRating: number;
  peakRating: number;
  gamesPlayed: number;
  wins: number;
  createdAt: number;
  ratingHistory: RatingHistoryEntry[];
  color?: string;
}

interface Game {
  id: string;
  date: number;
  placements: string[];
  ratingChanges: Record<string, number>;
  expansions?: string[];
  generations?: number;
  twoPlayerGame?: boolean;
}

function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

function calculateActualScore(playerPlacement: number, opponentPlacement: number): number {
  if (playerPlacement < opponentPlacement) return 1.0;
  if (playerPlacement === opponentPlacement) return 0.5;
  return 0.0;
}

function calculateEloChanges(
  placements: string[],
  players: Record<string, Player>,
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
      const expectedScore = calculateExpectedScore(player.currentRating, opponent.currentRating);
      const actualScore = calculateActualScore(playerIndex, opponentIndex);
      totalChange += kFactor * (actualScore - expectedScore);
    });
    ratingChanges[playerId] = Math.round(totalChange);
  });
  return ratingChanges;
}

function calculateGameRatingChanges(
  placements: string[],
  players: Record<string, Player>,
  isTwoPlayerGame: boolean,
  kFactor: number = K_FACTOR
): Record<string, number> {
  if (isTwoPlayerGame) {
    return Object.fromEntries(placements.map(id => [id, 0]));
  }
  return calculateEloChanges(placements, players, kFactor);
}

function applyRatingChanges(players: Record<string, Player>, game: Game): Record<string, Player> {
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
        { gameId: game.id, rating: newRating, change: ratingChange, date: game.date },
      ],
    };
  });
  return updatedPlayers;
}

function getStartingRating(): number {
  return STARTING_RATING;
}

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env file');
  process.exit(1);
}

const kv = new Redis({ url: UPSTASH_REDIS_REST_URL, token: UPSTASH_REDIS_REST_TOKEN });

const KEYS = {
  PLAYERS_ALL: 'players:all',
  PLAYER: (id: string) => `players:${id}`,
  GAMES_ALL: 'games:all',
  GAME: (id: string) => `games:${id}`,
};

const dryRun = process.argv.includes('--dry-run');

function ratingChangesEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of keys) {
    if ((a[key] ?? 0) !== (b[key] ?? 0)) return false;
  }
  return true;
}

async function run() {
  console.log(`🚀 Starting rating-changes repair${dryRun ? ' (dry run — no writes)' : ''}...\n`);

  const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
  const fetchedPlayers = await Promise.all(playerIds.map(pid => kv.get<Player>(KEYS.PLAYER(pid))));
  const originalPlayers: Record<string, Player> = {};
  for (const player of fetchedPlayers) {
    if (player) originalPlayers[player.id] = player;
  }

  const gameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1) as string[]) || []; // ascending by date
  const fetchedGames = await Promise.all(gameIds.map(gid => kv.get<Game>(KEYS.GAME(String(gid)))));
  const orderedGames = fetchedGames.filter(Boolean) as Game[];

  console.log(`📊 Found ${Object.keys(originalPlayers).length} players and ${orderedGames.length} games\n`);

  // Replay the entire history from scratch with the corrected logic.
  const startingRating = getStartingRating();
  const players: Record<string, Player> = {};
  for (const player of Object.values(originalPlayers)) {
    players[player.id] = {
      ...player,
      currentRating: startingRating,
      peakRating: startingRating,
      gamesPlayed: 0,
      wins: 0,
      ratingHistory: [],
    };
  }

  const correctedGames: Game[] = [];
  const gameDiffs: Array<{ game: Game; before: Record<string, number>; after: Record<string, number> }> = [];

  for (const g of orderedGames) {
    const isTwoPlayerGame = g.twoPlayerGame ?? g.placements.length === 2;
    const ratingChanges = calculateGameRatingChanges(g.placements, players, isTwoPlayerGame);
    const gameWithChanges: Game = { ...g, ratingChanges };

    if (!ratingChangesEqual(g.ratingChanges, ratingChanges)) {
      gameDiffs.push({ game: g, before: g.ratingChanges, after: ratingChanges });
    }

    Object.assign(players, applyRatingChanges(players, gameWithChanges));
    correctedGames.push(gameWithChanges);
  }

  // Report per-game corrections.
  if (gameDiffs.length === 0) {
    console.log('✅ No stale ratingChanges found on any game.\n');
  } else {
    console.log(`⚠️  ${gameDiffs.length} game(s) had stale or incorrect ratingChanges:\n`);
    for (const { game, before, after } of gameDiffs) {
      const dateStr = new Date(game.date).toISOString().slice(0, 10);
      const names = game.placements.map(id => originalPlayers[id]?.name ?? id.slice(0, 8));
      console.log(`  ${dateStr}  ${names.join(' vs ')}`);
      for (const pid of game.placements) {
        const b = before[pid] ?? 0;
        const a = after[pid] ?? 0;
        if (b !== a) {
          const name = (originalPlayers[pid]?.name ?? pid.slice(0, 8)).padEnd(12);
          console.log(`      ${name} ${b >= 0 ? '+' : ''}${b}  →  ${a >= 0 ? '+' : ''}${a}`);
        }
      }
    }
    console.log('');
  }

  // Report per-player corrections.
  let playerDiffCount = 0;
  console.log('Player totals:\n');
  for (const id of Object.keys(originalPlayers)) {
    const before = originalPlayers[id];
    const after = players[id];
    const changed =
      before.currentRating !== after.currentRating ||
      before.peakRating !== after.peakRating ||
      before.gamesPlayed !== after.gamesPlayed ||
      before.wins !== after.wins;
    if (changed) {
      playerDiffCount++;
      console.log(
        `  ⚠️  ${before.name.padEnd(12)} rating ${before.currentRating} → ${after.currentRating}` +
        (before.peakRating !== after.peakRating ? `  | peak ${before.peakRating} → ${after.peakRating}` : '') +
        (before.gamesPlayed !== after.gamesPlayed ? `  | games ${before.gamesPlayed} → ${after.gamesPlayed}` : '') +
        (before.wins !== after.wins ? `  | wins ${before.wins} → ${after.wins}` : '')
      );
    } else {
      console.log(`  ✅ ${before.name.padEnd(12)} unchanged (${before.currentRating})`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✨ ${dryRun ? 'Dry run complete' : 'Repair complete'}!`);
  console.log(`   Games corrected:   ${gameDiffs.length} / ${orderedGames.length}`);
  console.log(`   Players corrected: ${playerDiffCount} / ${Object.keys(originalPlayers).length}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nDry run — no writes performed. Re-run without --dry-run to apply.');
    return;
  }

  if (gameDiffs.length === 0 && playerDiffCount === 0) {
    console.log('\nNothing to write — database already consistent.');
    return;
  }

  await Promise.all([
    ...Object.keys(players).map(pid => kv.set(KEYS.PLAYER(pid), players[pid])),
    ...correctedGames.map(g => kv.set(KEYS.GAME(g.id), g)),
  ]);
  console.log('\n💾 Saved corrected players and games.');
}

run().catch((error) => {
  console.error('\n❌ Error during migration:', error);
  process.exit(1);
});
