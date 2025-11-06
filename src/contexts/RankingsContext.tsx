import { createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Player, Game } from '../types';
import {
  calculateMonthlyIndependentRankings,
  getCurrentYearMonth,
  getMonthlyRankingsCacheKey,
} from '../services/rankingsService';
import {
  getCachedMonthlyRankings,
  setCachedMonthlyRankings,
  invalidateMonthlyRankingsCache,
} from '../utils/storageUtils';

interface RankingsContextType {
  getMonthlyIndependentRankings: (
    year: number,
    month: number,
    allPlayers: Player[],
    allGames: Game[]
  ) => Promise<{
    rankings: Player[];
    year: number;
    month: number;
    gamesCount: number;
  }>;
  invalidateCache: () => void;
}

const RankingsContext = createContext<RankingsContextType | null>(null);

interface RankingsProviderProps {
  children: ReactNode;
}

export function RankingsProvider({ children }: RankingsProviderProps) {
  /**
   * Get monthly independent rankings with intelligent caching
   * Strategy:
   * - Current month: Always recalculate client-side (data changes frequently)
   * - Past months: Use cache if available, otherwise calculate client-side and cache
   * - After mutations: Cache is invalidated, so it will recalculate
   */
  const getMonthlyIndependentRankings = useCallback(
    async (
      year: number,
      month: number,
      allPlayers: Player[],
      allGames: Game[]
    ): Promise<{
      rankings: Player[];
      year: number;
      month: number;
      gamesCount: number;
    }> => {
      const { year: currentYear, month: currentMonth } = getCurrentYearMonth();
      const isCurrentMonth = year === currentYear && month === currentMonth;

      // Current month: always recalculate (don't use cache)
      if (isCurrentMonth) {
        const result = calculateMonthlyIndependentRankings(allPlayers, allGames, year, month);
        return {
          ...result,
          year,
          month,
        };
      }

      // Past months: try cache first
      const cacheKey = getMonthlyRankingsCacheKey(year, month, 'independent');
      const cached = getCachedMonthlyRankings(cacheKey);

      if (cached) {
        // Cache hit!
        return {
          rankings: cached.rankings,
          year,
          month,
          gamesCount: cached.gamesCount,
        };
      }

      // Cache miss: calculate client-side
      const result = calculateMonthlyIndependentRankings(allPlayers, allGames, year, month);

      // Cache the result for future use
      setCachedMonthlyRankings(cacheKey, {
        rankings: result.rankings,
        gamesCount: result.gamesCount,
        calculatedAt: Date.now(),
      });

      return {
        ...result,
        year,
        month,
      };
    },
    []
  );

  /**
   * Invalidate all cached rankings
   * Call this after mutations (add/delete games)
   */
  const invalidateCache = useCallback(() => {
    invalidateMonthlyRankingsCache();
  }, []);

  const value: RankingsContextType = {
    getMonthlyIndependentRankings,
    invalidateCache,
  };

  return <RankingsContext.Provider value={value}>{children}</RankingsContext.Provider>;
}

export function useRankings() {
  const context = useContext(RankingsContext);
  if (!context) {
    throw new Error('useRankings must be used within a RankingsProvider');
  }
  return context;
}
