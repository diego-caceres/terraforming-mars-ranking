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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="tm-card relative w-full max-h-[90vh] max-w-4xl overflow-y-auto">
        {/* Header */}
        <div className="tm-card-header sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5">
          <div>
            <p className="tm-card-subtitle">Expediente de Piloto</p>
            <h2 className="text-2xl font-heading uppercase tracking-[0.35em] text-tm-oxide dark:text-tm-glow">
              {stats.player.name}
            </h2>
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Miembro desde {formatDate(stats.player.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-tm-copper/30 p-2 text-tm-oxide transition-colors hover:bg-tm-copper/10 hover:text-tm-copper-dark dark:border-white/20 dark:text-tm-sand dark:hover:bg-white/10"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                Rating Actual
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-copper dark:text-tm-glow">
                {Math.round(stats.player.currentRating)}
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                Partidas Jugadas
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-oxide dark:text-tm-sand">
                {stats.player.gamesPlayed}
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                % de Victorias
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-teal">
                {stats.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                Posición Promedio
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-copper-dark">
                {stats.averagePlacement.toFixed(1)}
              </div>
            </div>
          </div>

          {/* Rating History Chart */}
          {chartData.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                Historial de Rating
              </h3>
              <div className="rounded-lg border border-tm-copper/20 bg-white/85 p-4 dark:border-white/10 dark:bg-tm-haze/80">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,108,41,0.25)" />
                    <XAxis
                      dataKey="game"
                      label={{ value: 'Número de Partida', position: 'insideBottom', offset: -5 }}
                      stroke="#8c6b4f"
                    />
                    <YAxis
                      label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                      stroke="#8c6b4f"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#201c29',
                        border: 'none',
                        borderRadius: '0.375rem',
                        color: '#f5e0c3',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="#d86c29"
                      strokeWidth={2}
                      dot={{ fill: '#d86c29', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Head-to-Head Records */}
          {headToHeads.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                Récords Cara a Cara
              </h3>
              <div className="overflow-hidden rounded-lg border border-tm-copper/20 bg-white/85 dark:border-white/10 dark:bg-tm-haze/80">
                <table className="w-full">
                  <thead className="bg-tm-copper/10 text-[0.65rem] uppercase tracking-[0.3em] text-tm-oxide/70 dark:bg-white/5 dark:text-tm-sand/70">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Oponente
                      </th>
                      <th className="px-4 py-3 text-center">
                        Partidas
                      </th>
                      <th className="px-4 py-3 text-center">
                        Victorias
                      </th>
                      <th className="px-4 py-3 text-center">
                        Derrotas
                      </th>
                      <th className="px-4 py-3 text-center">
                        Empates
                      </th>
                      <th className="px-4 py-3 text-center">
                        % Victorias
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tm-copper/15 dark:divide-white/10">
                    {headToHeads.map(record => {
                      const opponent = allPlayers[record.opponentId];
                      const winPercentage = record.gamesPlayed > 0
                        ? (record.wins / record.gamesPlayed) * 100
                        : 0;

                      return (
                        <tr key={record.opponentId}>
                          <td className="px-4 py-3 text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                            {opponent?.name || 'Desconocido'}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-tm-oxide/70 dark:text-tm-sand/70">
                            {record.gamesPlayed}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-tm-teal">
                            {record.wins}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-tm-copper-dark">
                            {record.losses}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-tm-oxide/70 dark:text-tm-sand/70">
                            {record.ties}
                          </td>
                          <td className="px-4 py-3 text-sm text-center font-semibold text-tm-oxide dark:text-tm-sand">
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
              <h3 className="mb-3 text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                Partidas Recientes
              </h3>
              <div className="space-y-2">
                {stats.recentGames.map(game => {
                  const placement = game.placements.indexOf(playerId);
                  const ratingChange = game.ratingChanges[playerId];

                  return (
                    <div
                      key={game.id}
                      className="rounded-lg border border-tm-copper/20 bg-white/85 p-4 dark:border-white/10 dark:bg-tm-haze/80"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                            Posición #{placement + 1} de {game.placements.length}
                          </span>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold ${
                              ratingChange > 0
                                ? 'text-tm-teal'
                                : ratingChange < 0
                                ? 'text-tm-copper-dark'
                                : 'text-tm-oxide/60 dark:text-tm-sand/60'
                            }`}
                          >
                            {ratingChange > 0 ? '+' : ''}{ratingChange}
                          </span>
                          <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                            {formatDate(game.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-tm-oxide/70 dark:text-tm-sand/70">
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
