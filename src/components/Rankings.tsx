import { useState } from 'react';
import type { Player } from '../types';
import { hasLowConfidence } from '../services/eloCalculator';

interface RankingsProps {
  players: Player[];
  activeOnly: boolean;
  onPlayerClick: (playerId: string) => void;
}

export default function Rankings({ players, activeOnly, onPlayerClick }: RankingsProps) {
  const [sortBy, setSortBy] = useState<'rating' | 'games' | 'winRate'>('rating');

  const sortedPlayers = [...players].sort((a, b) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Clasificación {activeOnly && <span className="text-sm font-normal text-gray-500">(Jugadores Activos)</span>}
        </h2>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setSortBy('rating')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              sortBy === 'rating'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Por Rating
          </button>
          <button
            onClick={() => setSortBy('games')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              sortBy === 'games'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Por Partidas
          </button>
          <button
            onClick={() => setSortBy('winRate')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              sortBy === 'winRate'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Por % Victorias
          </button>
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          Aún no hay jugadores. ¡Agregá tu primer jugador para comenzar!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Posición
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jugador
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Partidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  % Victorias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Último Cambio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedPlayers.map((player, index) => {
                const ratingChange = getRatingChange(player);
                const winRate = getWinRate(player);
                const lowConfidence = hasLowConfidence(player);

                return (
                  <tr
                    key={player.id}
                    onClick={() => onPlayerClick(player.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {player.name}
                        </span>
                        {lowConfidence && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            Nuevo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {Math.round(player.currentRating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {player.gamesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {winRate.toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {ratingChange !== null && (
                        <span
                          className={
                            ratingChange > 0
                              ? 'text-green-600 dark:text-green-400'
                              : ratingChange < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
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
