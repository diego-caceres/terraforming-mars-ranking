import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { PlayerStats as PlayerStatsType, HeadToHeadRecord, Player } from '../types';
import { getPlayerStats, getAllHeadToHeads, getAllPlayers } from '../services/storageService';

interface PlayerStatsProps {
  playerId: string;
  onClose: () => void;
}

export default function PlayerStats({ playerId, onClose }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStatsType | null>(null);
  const [headToHeads, setHeadToHeads] = useState<HeadToHeadRecord[]>([]);
  const [allPlayers, setAllPlayers] = useState<Record<string, Player>>({});

  useEffect(() => {
    const playerStats = getPlayerStats(playerId);
    const h2h = getAllHeadToHeads(playerId);
    const players = getAllPlayers();

    setStats(playerStats);
    setHeadToHeads(h2h);
    setAllPlayers(players);
  }, [playerId]);

  if (!stats) {
    return null;
  }

  const chartData = stats.player.ratingHistory.map((entry, index) => ({
    game: index + 1,
    rating: entry.rating,
    date: new Date(entry.date).toLocaleDateString(),
  }));

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stats.player.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Miembro desde {formatDate(stats.player.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {Math.round(stats.player.currentRating)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Rating Actual</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.player.gamesPlayed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Partidas Jugadas</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">% de Victorias</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {stats.averagePlacement.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Posición Promedio</div>
            </div>
          </div>

          {/* Rating History Chart */}
          {chartData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Historial de Rating
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="game"
                      label={{ value: 'Número de Partida', position: 'insideBottom', offset: -5 }}
                      stroke="#9CA3AF"
                    />
                    <YAxis
                      label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                      stroke="#9CA3AF"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: '#F3F4F6',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Head-to-Head Records */}
          {headToHeads.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Récords Cara a Cara
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Oponente
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Partidas
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Victorias
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Derrotas
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Empates
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        % Victorias
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {headToHeads.map(record => {
                      const opponent = allPlayers[record.opponentId];
                      const winPercentage = record.gamesPlayed > 0
                        ? (record.wins / record.gamesPlayed) * 100
                        : 0;

                      return (
                        <tr key={record.opponentId}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                            {opponent?.name || 'Desconocido'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                            {record.gamesPlayed}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-green-600 dark:text-green-400 font-medium">
                            {record.wins}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-red-600 dark:text-red-400 font-medium">
                            {record.losses}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-600 dark:text-gray-400">
                            {record.ties}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-gray-100">
                            {winPercentage.toFixed(0)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Games */}
          {stats.recentGames.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Partidas Recientes
              </h3>
              <div className="space-y-2">
                {stats.recentGames.map(game => {
                  const placement = game.placements.indexOf(playerId);
                  const ratingChange = game.ratingChanges[playerId];

                  return (
                    <div
                      key={game.id}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Posición #{placement + 1} de {game.placements.length}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold ${
                              ratingChange > 0
                                ? 'text-green-600 dark:text-green-400'
                                : ratingChange < 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {ratingChange > 0 ? '+' : ''}{ratingChange}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(game.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Jugadores: {game.placements.map(id => allPlayers[id]?.name || 'Desconocido').join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
