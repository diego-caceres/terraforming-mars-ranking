import { useState, useEffect } from 'react';
import type { Player, Game } from '../types';
import { hasLowConfidence } from '../services/eloCalculator';
import { getMonthlyRankings } from '../services/storageService';
import { getColorClasses } from '../utils/colorUtils';
import { getPodiumClasses } from '../utils/podiumUtils';
import { useRankings } from '../contexts/RankingsContext';
import { useI18n, pluralize } from '../i18n';
import MonthlyRankingSkeleton from './common/MonthlyRankingSkeleton';

interface RankingsProps {
  players: Player[];
  allPlayers: Player[];
  allGames: Game[];
  activeOnly: boolean;
  onPlayerClick: (playerId: string) => void;
  onToggleActiveFilter: () => void;
}

type ViewMode = 'allTime' | 'monthly' | 'monthlyIndependent';

export default function Rankings({ players, allPlayers, allGames, activeOnly, onPlayerClick, onToggleActiveFilter }: RankingsProps) {
  const { t, language } = useI18n();
  const { getMonthlyIndependentRankings: getMonthlyIndependentRankingsFromContext } = useRankings();
  const [sortBy, setSortBy] = useState<'rating' | 'peakRating' | 'games' | 'winRate'>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('allTime');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyPlayers, setMonthlyPlayers] = useState<Player[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyGamesCount, setMonthlyGamesCount] = useState(0);

  // State for last 3 months rankings
  const [last3MonthsData, setLast3MonthsData] = useState<Array<{
    year: number;
    month: number;
    rankings: Player[];
    gamesCount: number;
    loading: boolean;
  }>>([]);

  const displayPlayers = viewMode === 'allTime' ? players : monthlyPlayers;

  // Load last 3 months rankings on mount (only in allTime view)
  useEffect(() => {
    if (viewMode === 'allTime') {
      loadLast3MonthsRankings();
    }
  }, [viewMode]);

  // Load monthly rankings when month/year changes
  useEffect(() => {
    if (viewMode === 'monthly' || viewMode === 'monthlyIndependent') {
      loadMonthlyRankings();
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const loadLast3MonthsRankings = async () => {
    const now = new Date();
    const months = [];

    // Generate last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        rankings: [],
        gamesCount: 0,
        loading: true,
      });
    }

    setLast3MonthsData(months);

    // Load data for first 3 months (most recent) - using client-side calculation with cache
    for (let i = 0; i < 3; i++) {
      try {
        const data = await getMonthlyIndependentRankingsFromContext(months[i].year, months[i].month, allPlayers, allGames);
        setLast3MonthsData(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            rankings: data.rankings,
            gamesCount: data.gamesCount,
            loading: false,
          };
          return updated;
        });
      } catch (error) {
        console.error(`Error loading rankings for ${months[i].year}-${months[i].month}:`, error);
        setLast3MonthsData(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            loading: false,
          };
          return updated;
        });
      }
    }

    // Load data for next 3 months (older) after first 3 are loaded - using client-side calculation with cache
    for (let i = 3; i < 6; i++) {
      try {
        const data = await getMonthlyIndependentRankingsFromContext(months[i].year, months[i].month, allPlayers, allGames);
        setLast3MonthsData(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            rankings: data.rankings,
            gamesCount: data.gamesCount,
            loading: false,
          };
          return updated;
        });
      } catch (error) {
        console.error(`Error loading rankings for ${months[i].year}-${months[i].month}:`, error);
        setLast3MonthsData(prev => {
          const updated = [...prev];
          updated[i] = {
            ...updated[i],
            loading: false,
          };
          return updated;
        });
      }
    }
  };

  const loadMonthlyRankings = async () => {
    try {
      setMonthlyLoading(true);
      const data = viewMode === 'monthlyIndependent'
        ? await getMonthlyIndependentRankingsFromContext(selectedYear, selectedMonth, allPlayers, allGames)
        : await getMonthlyRankings(selectedYear, selectedMonth);
      setMonthlyPlayers(data.rankings);
      setMonthlyGamesCount(data.gamesCount);
    } catch (error) {
      console.error('Error loading monthly rankings:', error);
      setMonthlyPlayers([]);
      setMonthlyGamesCount(0);
    } finally {
      setMonthlyLoading(false);
    }
  };

  const sortedPlayers = [...displayPlayers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.currentRating - a.currentRating;
      case 'peakRating':
        return (b.peakRating || b.currentRating) - (a.peakRating || a.currentRating);
      case 'games':
        return b.gamesPlayed - a.gamesPlayed;
      case 'winRate':
        const winRateA = a.gamesPlayed > 0 ? (a.wins / a.gamesPlayed) * 100 : 0;
        const winRateB = b.gamesPlayed > 0 ? (b.wins / b.gamesPlayed) * 100 : 0;
        return winRateB - winRateA;
      default:
        return 0;
    }
  });

  const getWinRate = (player: Player): number => {
    return player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;
  };

  const getRatingChange = (player: Player): number | null => {
    if (player.ratingHistory.length === 0) return null;
    return player.ratingHistory[player.ratingHistory.length - 1].change;
  };

  const formatRatingChange = (change: number | null): string => {
    if (change === null) return '';
    if (change > 0) return `+${change}`;
    return `${change}`;
  };

  const getMonthName = (month: number): string => {
    const monthKeys = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ] as const;
    return t.rankings.months[monthKeys[month - 1]];
  };

  return (
    <div className="tm-card overflow-hidden">
      <div className="tm-card-header px-6 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="tm-card-subtitle">Clasificación Elo</p>
            <h2 className="text-2xl font-heading uppercase tracking-[0.35em] text-tm-oxide dark:text-tm-glow">
              Rankings
            </h2>
          </div>
          <button
            onClick={onToggleActiveFilter}
            className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all self-start sm:self-center ${
              activeOnly
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/80 text-tm-oxide dark:bg-tm-haze/80 dark:text-tm-sand hover:bg-white'
            }`}
          >
            {activeOnly ? t.rankings.showingActive : t.rankings.showOnlyActive}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSortBy('rating')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'rating'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            {t.rankings.sortByRating}
          </button>
          <button
            onClick={() => setSortBy('peakRating')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'peakRating'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            {t.rankings.sortByPeak}
          </button>
          <button
            onClick={() => setSortBy('games')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'games'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            {t.rankings.sortByGames}
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'winRate'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            {t.rankings.sortByWinRate}
          </button>
        </div>

        {/* View Mode and Month Selector */}
        <div className="mt-4 border-t border-tm-copper/20 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* View Mode Toggle */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setViewMode('allTime')}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  viewMode === 'allTime'
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                {t.rankings.allTimeView}
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  viewMode === 'monthly'
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                {t.rankings.monthlyAccumulatedView}
              </button>
              <button
                onClick={() => setViewMode('monthlyIndependent')}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  viewMode === 'monthlyIndependent'
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                {t.rankings.monthlyIndependentView}
              </button>
            </div>

            {/* Month/Year Selector (only show in monthly modes) */}
            {(viewMode === 'monthly' || viewMode === 'monthlyIndependent') && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-md border border-tm-copper/40 bg-white/90 px-3 py-1.5 text-sm text-tm-oxide dark:bg-tm-haze/90 dark:text-tm-sand"
                >
                  <option value={1}>{t.rankings.months.january}</option>
                  <option value={2}>{t.rankings.months.february}</option>
                  <option value={3}>{t.rankings.months.march}</option>
                  <option value={4}>{t.rankings.months.april}</option>
                  <option value={5}>{t.rankings.months.may}</option>
                  <option value={6}>{t.rankings.months.june}</option>
                  <option value={7}>{t.rankings.months.july}</option>
                  <option value={8}>{t.rankings.months.august}</option>
                  <option value={9}>{t.rankings.months.september}</option>
                  <option value={10}>{t.rankings.months.october}</option>
                  <option value={11}>{t.rankings.months.november}</option>
                  <option value={12}>{t.rankings.months.december}</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded-md border border-tm-copper/40 bg-white/90 px-3 py-1.5 text-sm text-tm-oxide dark:bg-tm-haze/90 dark:text-tm-sand"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <span className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                  ({monthlyGamesCount} {pluralize(monthlyGamesCount, language === 'es' ? 'partida' : 'game', language === 'es' ? 'partidas' : 'games')})
                </span>
              </div>
            )}
          </div>

          {/* Explanation text for monthly modes */}
          {viewMode === 'monthly' && (
            <div className="mt-3 text-xs text-tm-oxide/60 dark:text-tm-sand/60 bg-tm-copper/5 dark:bg-white/5 rounded-md px-3 py-2">
              {t.rankings.monthlyAccumulatedExplanation}
            </div>
          )}
          {viewMode === 'monthlyIndependent' && (
            <div className="mt-3 text-xs text-tm-oxide/60 dark:text-tm-sand/60 bg-tm-copper/5 dark:bg-white/5 rounded-md px-3 py-2">
              {t.rankings.monthlyIndependentExplanation}
            </div>
          )}
        </div>
      </div>

      {monthlyLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tm-copper"></div>
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className="px-6 py-12 text-center text-tm-oxide/70 dark:text-tm-sand/70">
          {t.rankings.noPlayersYet}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/60 dark:bg-transparent">
          <table className="w-full">
            <thead className="bg-tm-copper/10 dark:bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.position}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.player}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.rating}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.peak}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.games}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.winRate}
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  {t.rankings.lastChange}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tm-copper/20 dark:divide-white/10 bg-white/70 dark:bg-transparent">
              {sortedPlayers.map((player, index) => {
                const ratingChange = getRatingChange(player);
                const winRate = getWinRate(player);
                // Use different confidence threshold based on view mode
                const confidenceThreshold = viewMode === 'monthlyIndependent' ? 5 : 10;
                const lowConfidence = hasLowConfidence(player, confidenceThreshold);

                return (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player.id)}
                    className="cursor-pointer transition-colors hover:bg-tm-copper/10 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${getPodiumClasses(index + 1)}`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {player.color && (
                          <div
                            className={`w-3 h-3 rounded-full border-2 ${getColorClasses(player.color)}`}
                            title={player.color}
                          />
                        )}
                        <span className="text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                          {player.name}
                        </span>
                        {lowConfidence && (
                          <span className="tm-chip">
                            {t.common.new}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                      {Math.round(player.currentRating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tm-copper/80 dark:text-tm-glow/80">
                      {Math.round(player.peakRating || player.currentRating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tm-oxide/70 dark:text-tm-sand/70">
                      {player.gamesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-tm-oxide/70 dark:text-tm-sand/70">
                      {winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {ratingChange !== null && (
                        <span
                          className={
                            ratingChange > 0
                              ? 'text-tm-teal'
                              : ratingChange < 0
                              ? 'text-tm-copper-dark'
                              : 'text-tm-oxide/60 dark:text-tm-sand/60'
                          }
                        >
                          {formatRatingChange(ratingChange)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Last 6 Months Rankings - Only show in allTime view */}
      {viewMode === 'allTime' && last3MonthsData.length > 0 && (
        <div className="border-t border-tm-copper/20 dark:border-white/10 pt-6 px-6 pb-6">
          <div className="mb-4">
            <h3 className="text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
              {t.rankings.monthlyIndependentRankings}
            </h3>
            <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 mt-1">
              {t.rankings.monthlyRankingsDescription}
            </p>
          </div>
          <div className="space-y-4">
            {/* First 3 months */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {last3MonthsData.slice(0, 3).map((monthData, idx) => (
                monthData.loading ? (
                  <MonthlyRankingSkeleton key={idx} />
                ) : (
                  <div key={idx} className="rounded-lg border border-tm-copper/30 dark:border-white/10 overflow-hidden bg-white/60 dark:bg-tm-haze/40">
                    <div className="bg-tm-copper/10 dark:bg-white/5 px-4 py-3 border-b border-tm-copper/20 dark:border-white/10">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-tm-oxide dark:text-tm-sand">
                        {getMonthName(monthData.month)} {monthData.year}
                      </h4>
                      <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 mt-1">
                        {monthData.gamesCount} {pluralize(monthData.gamesCount, language === 'es' ? 'partida' : 'game', language === 'es' ? 'partidas' : 'games')}
                      </p>
                    </div>
                    {monthData.rankings.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                      {t.rankings.noGamesThisMonth}
                    </div>
                  ) : (
                    <div className="divide-y divide-tm-copper/10 dark:divide-white/5">
                      {monthData.rankings.slice(0, 5).map((player, playerIdx) => {
                        const winRate = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;
                        const lastChange = player.ratingHistory.length > 0 ? player.ratingHistory[player.ratingHistory.length - 1].change : null;
                        return (
                          <div
                            key={player.id}
                            onClick={() => onPlayerClick(player.id)}
                            className="px-4 py-2.5 hover:bg-tm-copper/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0 ${getPodiumClasses(playerIdx + 1)}`}>
                                {playerIdx + 1}
                              </div>
                              {player.color && (
                                <div
                                  className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${getColorClasses(player.color)}`}
                                  title={player.color}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-tm-oxide dark:text-tm-sand truncate">
                                  {player.name}
                                </div>
                              </div>
                              <div className="text-sm font-bold text-tm-oxide dark:text-tm-glow flex-shrink-0">
                                {Math.round(player.currentRating)}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-1.5 ml-9 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                              <span>{player.gamesPlayed} {pluralize(player.gamesPlayed, language === 'es' ? 'partida' : 'game', language === 'es' ? 'partidas' : 'games')}</span>
                              <span>•</span>
                              <span>{winRate.toFixed(1)}% victorias</span>
                              {lastChange !== null && (
                                <>
                                  <span>•</span>
                                  <span className={lastChange > 0 ? 'text-tm-teal' : lastChange < 0 ? 'text-tm-copper-dark' : ''}>
                                    {lastChange > 0 ? '+' : ''}{lastChange}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {monthData.rankings.length > 5 && (
                        <div className="px-4 py-2 text-center text-xs text-tm-oxide/50 dark:text-tm-sand/50">
                          +{monthData.rankings.length - 5} más
                        </div>
                      )}
                    </div>
                    )}
                  </div>
                )
              ))}
            </div>

            {/* Next 3 months */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {last3MonthsData.slice(3, 6).map((monthData, idx) => (
                monthData.loading ? (
                  <MonthlyRankingSkeleton key={idx + 3} />
                ) : (
                  <div key={idx + 3} className="rounded-lg border border-tm-copper/30 dark:border-white/10 overflow-hidden bg-white/60 dark:bg-tm-haze/40">
                    <div className="bg-tm-copper/10 dark:bg-white/5 px-4 py-3 border-b border-tm-copper/20 dark:border-white/10">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.25em] text-tm-oxide dark:text-tm-sand">
                        {getMonthName(monthData.month)} {monthData.year}
                      </h4>
                      <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 mt-1">
                        {monthData.gamesCount} {pluralize(monthData.gamesCount, language === 'es' ? 'partida' : 'game', language === 'es' ? 'partidas' : 'games')}
                      </p>
                    </div>
                    {monthData.rankings.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                    {t.rankings.noGamesThisMonth}
                  </div>
                ) : (
                  <div className="divide-y divide-tm-copper/10 dark:divide-white/5">
                    {monthData.rankings.slice(0, 5).map((player, playerIdx) => {
                      const winRate = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;
                      const lastChange = player.ratingHistory.length > 0 ? player.ratingHistory[player.ratingHistory.length - 1].change : null;
                      return (
                        <div
                          key={player.id}
                          onClick={() => onPlayerClick(player.id)}
                          className="px-4 py-2.5 hover:bg-tm-copper/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0 ${getPodiumClasses(playerIdx + 1)}`}>
                              {playerIdx + 1}
                            </div>
                            {player.color && (
                              <div
                                className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 ${getColorClasses(player.color)}`}
                                title={player.color}
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-tm-oxide dark:text-tm-sand truncate">
                                {player.name}
                              </div>
                            </div>
                            <div className="text-sm font-bold text-tm-oxide dark:text-tm-glow flex-shrink-0">
                              {Math.round(player.currentRating)}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5 ml-9 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                            <span>{player.gamesPlayed} {pluralize(player.gamesPlayed, language === 'es' ? 'partida' : 'game', language === 'es' ? 'partidas' : 'games')}</span>
                            <span>•</span>
                            <span>{winRate.toFixed(1)}% victorias</span>
                            {lastChange !== null && (
                              <>
                                <span>•</span>
                                <span className={lastChange > 0 ? 'text-tm-teal' : lastChange < 0 ? 'text-tm-copper-dark' : ''}>
                                  {lastChange > 0 ? '+' : ''}{lastChange}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {monthData.rankings.length > 5 && (
                      <div className="px-4 py-2 text-center text-xs text-tm-oxide/50 dark:text-tm-sand/50">
                        +{monthData.rankings.length - 5} más
                      </div>
                    )}
                    </div>
                    )}
                  </div>
                )
              ))}
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
