/**
 * Migration script to calculate historic peak ratings for all players
 *
 * This script analyzes each player's rating history and updates their peakRating
 * field to reflect the highest rating they've ever achieved.
 *
 * Usage:
 *   npm run migrate:peak-ratings
 *
 * Requirements:
 *   - UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set in .env file
 */

import { Redis } from '@upstash/redis';

// Environment variables
const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN) {
  console.error('❌ Error: Missing required environment variables');
  console.error('   Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env file');
  process.exit(1);
}

// Create Redis client
const kv = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

// Keys
const KEYS = {
  PLAYERS_ALL: 'players:all',
  PLAYER: (id: string) => `players:${id}`,
};

// Types
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
  peakRating?: number;
  gamesPlayed: number;
  wins: number;
  createdAt: number;
  ratingHistory: RatingHistoryEntry[];
  color?: string;
}

async function migratePeakRatings() {
  console.log('🚀 Starting peak rating migration...\n');

  try {
    // Get all player IDs
    const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
    console.log(`📊 Found ${playerIds.length} players to process\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const playerId of playerIds) {
      const player = await kv.get<Player>(KEYS.PLAYER(playerId));

      if (!player) {
        console.log(`⚠️  Player ${playerId} not found, skipping...`);
        skippedCount++;
        continue;
      }

      // Calculate peak rating from history
      let peakRating = player.currentRating;

      // Check all ratings in history
      if (player.ratingHistory && player.ratingHistory.length > 0) {
        for (const entry of player.ratingHistory) {
          if (entry.rating > peakRating) {
            peakRating = entry.rating;
          }
        }
      }

      // Also check starting rating (1500) if player hasn't played much
      const startingRating = 1500;
      if (player.gamesPlayed === 0 || peakRating < startingRating) {
        peakRating = Math.max(peakRating, startingRating);
      }

      // Update player if peak rating changed or wasn't set
      if (player.peakRating !== peakRating) {
        const updatedPlayer: Player = {
          ...player,
          peakRating,
        };

        await kv.set(KEYS.PLAYER(playerId), updatedPlayer);

        console.log(`✅ ${player.name.padEnd(20)} | Current: ${Math.round(player.currentRating).toString().padStart(4)} | Peak: ${Math.round(peakRating).toString().padStart(4)} ${player.peakRating ? `(was: ${Math.round(player.peakRating)})` : '(new)'}`);
        updatedCount++;
      } else {
        console.log(`⏭️  ${player.name.padEnd(20)} | Peak already correct: ${Math.round(peakRating)}`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration complete!');
    console.log(`   Updated: ${updatedCount} players`);
    console.log(`   Skipped: ${skippedCount} players (already correct)`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migratePeakRatings();
