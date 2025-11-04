import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client
export const kv = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Key prefixes for data organization
export const KEYS = {
  PLAYERS_ALL: 'players:all',
  PLAYER: (id: string) => `players:${id}`,
  GAMES_ALL: 'games:all',
  GAME: (id: string) => `games:${id}`,
  VERSION: 'version',
} as const;

// Schema version
export const SCHEMA_VERSION = 1;
