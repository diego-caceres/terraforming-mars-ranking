import type { Player, Game } from './types';
import type { IStorage } from './storage';
import { kv, KEYS } from './kv';

export class RedisStorage implements IStorage {
  async getAllPlayerIds(): Promise<string[]> {
    const playerIds = await kv.smembers(KEYS.PLAYERS_ALL);
    return playerIds as string[];
  }

  async getPlayer(id: string): Promise<Player | null> {
    const player = await kv.get<Player>(KEYS.PLAYER(id));
    return player;
  }

  async setPlayer(id: string, player: Player): Promise<void> {
    await kv.set(KEYS.PLAYER(id), player);
  }

  async addPlayerId(id: string): Promise<void> {
    await kv.sadd(KEYS.PLAYERS_ALL, id);
  }

  async getAllGameIds(): Promise<string[]> {
    // Games are stored in a sorted set by timestamp
    const gameIds = await kv.zrange(KEYS.GAMES_ALL, 0, -1);
    return gameIds as string[];
  }

  async getGame(id: string): Promise<Game | null> {
    const game = await kv.get<Game>(KEYS.GAME(id));
    return game;
  }

  async setGame(id: string, game: Game): Promise<void> {
    await kv.set(KEYS.GAME(id), game);
  }

  async addGameId(id: string, timestamp: number): Promise<void> {
    await kv.zadd(KEYS.GAMES_ALL, { score: timestamp, member: id });
  }

  async removeGameId(id: string): Promise<void> {
    await kv.zrem(KEYS.GAMES_ALL, id);
  }

  async getVersion(): Promise<number | null> {
    const version = await kv.get<number>(KEYS.VERSION);
    return version;
  }

  async setVersion(version: number): Promise<void> {
    await kv.set(KEYS.VERSION, version);
  }
}
