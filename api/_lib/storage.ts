import type { Player, Game } from './types';

// Storage interface that both localStorage and Redis will implement
export interface IStorage {
  // Player operations
  getAllPlayerIds(): Promise<string[]>;
  getPlayer(id: string): Promise<Player | null>;
  setPlayer(id: string, player: Player): Promise<void>;
  addPlayerId(id: string): Promise<void>;

  // Game operations
  getAllGameIds(): Promise<string[]>;
  getGame(id: string): Promise<Game | null>;
  setGame(id: string, game: Game): Promise<void>;
  addGameId(id: string, timestamp: number): Promise<void>;
  removeGameId(id: string): Promise<void>;

  // Utility
  getVersion(): Promise<number | null>;
  setVersion(version: number): Promise<void>;
}

// Factory function to get the appropriate storage implementation
export function getStorage(): IStorage {
  // Check if we should use localStorage (for test/dev environments)
  const useLocalStorage = process.env.USE_LOCAL_STORAGE === 'true';

  if (useLocalStorage) {
    // Return localStorage implementation
    // This will be a simple in-memory storage for serverless functions
    // since they don't have access to browser localStorage
    throw new Error('Local storage mode not supported in serverless functions. Use client-side only mode.');
  } else {
    // Return Redis implementation
    const { RedisStorage } = require('./redisStorage');
    return new RedisStorage();
  }
}
