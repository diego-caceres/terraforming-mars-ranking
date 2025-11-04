import { useState, useEffect } from 'react';
import type { Player } from '../types';
import { hasLowConfidence } from '../services/eloCalculator';
import { getMonthlyRankings } from '../services/apiService';

interface RankingsProps {
  players: Player[];
  activeOnly: boolean;
  onPlayerClick: (playerId: string) => void;
  onToggleActiveFilter: () => void;
}

type ViewMode = 'allTime' | 'monthly';

export default function Rankings({ players, activeOnly, onPlayerClick, onToggleActiveFilter }: RankingsProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'games' | 'winRate'>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('allTime');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyPlayers, setMonthlyPlayers] = useState<Player[]>([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyGamesCount, setMonthlyGamesCount] = useState(0);

  const displayPlayers = viewMode === 'allTime' ? players : monthlyPlayers;

  // Load monthly rankings when month/year changes
  useEffect(() => {
    if (viewMode === 'monthly') {
      loadMonthlyRankings();
    }
  }, [viewMode, selectedYear, selectedMonth]);

  const loadMonthlyRankings = async () => {
    try {
      setMonthlyLoading(true);
      const data = await getMonthlyRankings(selectedYear, selectedMonth);
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
            {activeOnly ? 'Mostrando Activos' : 'Mostrar Solo Activos'}
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
            Por Rating
          </button>
          <button
            onClick={() => setSortBy('games')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'games'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            Por Partidas
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all ${
              sortBy === 'winRate'
                ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
            }`}
          >
            Por % Victorias
          </button>
        </div>

        {/* View Mode and Month Selector */}
        <div className="mt-4 border-t border-tm-copper/20 pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('allTime')}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  viewMode === 'allTime'
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                Histórico
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-all ${
                  viewMode === 'monthly'
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/70 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                Mensual
              </button>
            </div>

            {/* Month/Year Selector (only show in monthly mode) */}
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded-md border border-tm-copper/40 bg-white/90 px-3 py-1.5 text-sm text-tm-oxide dark:bg-tm-haze/90 dark:text-tm-sand"
                >
                  <option value={1}>Enero</option>
                  <option value={2}>Febrero</option>
                  <option value={3}>Marzo</option>
                  <option value={4}>Abril</option>
                  <option value={5}>Mayo</option>
                  <option value={6}>Junio</option>
                  <option value={7}>Julio</option>
                  <option value={8}>Agosto</option>
                  <option value={9}>Septiembre</option>
                  <option value={10}>Octubre</option>
                  <option value={11}>Noviembre</option>
                  <option value={12}>Diciembre</option>
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
                  ({monthlyGamesCount} {monthlyGamesCount === 1 ? 'partida' : 'partidas'})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {monthlyLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tm-copper"></div>
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className="px-6 py-12 text-center text-tm-oxide/70 dark:text-tm-sand/70">
          Aún no hay jugadores. ¡Agregá tu primer jugador para comenzar!
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/60 dark:bg-transparent">
          <table className="w-full">
            <thead className="bg-tm-copper/10 dark:bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  Jugador
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  Partidas
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  % Victorias
                </th>
                <th className="px-6 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                  Último Cambio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tm-copper/20 dark:divide-white/10 bg-white/70 dark:bg-transparent">
              {sortedPlayers.map((player, index) => {
                const ratingChange = getRatingChange(player);
                const winRate = getWinRate(player);
                const lowConfidence = hasLowConfidence(player);

                return (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player.id)}
                    className="cursor-pointer transition-colors hover:bg-tm-copper/10 dark:hover:bg-white/5"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-tm-oxide dark:text-tm-sand">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                          {player.name}
                        </span>
                        {lowConfidence && (
                          <span className="tm-chip">
                            Nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                      {Math.round(player.currentRating)}
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
    </div>
  );
}
