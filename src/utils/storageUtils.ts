import type { Player } from '../types';

export interface CachedRanking {
  rankings: Player[];
  gamesCount: number;
  calculatedAt: number;
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get item from localStorage with JSON parsing
 */
export function getFromStorage<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Set item to localStorage with JSON stringification
 */
export function setToStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeFromStorage(key: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}

/**
 * Clear all items matching a prefix
 */
export function clearStorageByPrefix(prefix: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error(`Error clearing localStorage by prefix (${prefix}):`, error);
  }
}

/**
 * Get cached monthly rankings
 */
export function getCachedMonthlyRankings(cacheKey: string): CachedRanking | null {
  return getFromStorage<CachedRanking>(cacheKey);
}

/**
 * Set cached monthly rankings
 */
export function setCachedMonthlyRankings(cacheKey: string, data: CachedRanking): boolean {
  return setToStorage(cacheKey, data);
}

/**
 * Invalidate all monthly rankings cache
 */
export function invalidateMonthlyRankingsCache(): void {
  clearStorageByPrefix('rankings:monthly:');
}
