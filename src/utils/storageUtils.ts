import type { Player } from '../types';

/**
 * Cache version - increment this when cache structure or logic changes
 * This will automatically invalidate all old caches for users on previous versions
 */
const CACHE_VERSION = 2;
const CACHE_VERSION_KEY = 'cache:version';

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

/**
 * Invalidate monthly rankings cache for a specific month
 */
export function invalidateMonthlyRankingsCacheForMonth(year: number, month: number): void {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  clearStorageByPrefix(`rankings:monthly:independent:${monthStr}`);
  clearStorageByPrefix(`rankings:monthly:accumulated:${monthStr}`);
}

/**
 * Check if cache version has changed and invalidate all caches if needed
 * Call this on app initialization
 */
export function checkAndMigrateCacheVersion(): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const currentVersion = CACHE_VERSION.toString();

    if (storedVersion !== currentVersion) {
      // Version mismatch or first time - clear all ranking caches
      console.log(`Cache version changed (${storedVersion || 'none'} → ${currentVersion}). Invalidating all caches.`);
      invalidateMonthlyRankingsCache();

      // Update stored version
      localStorage.setItem(CACHE_VERSION_KEY, currentVersion);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking cache version:', error);
    return false;
  }
}
