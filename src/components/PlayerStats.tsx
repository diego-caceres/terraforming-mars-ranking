import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Player, Game } from '../types';
import { getPlayerStats } from '../services/storageService';
import { getColorClasses } from '../utils/colorUtils';
import { useI18n, formatDate } from '../i18n';

interface PlayerStatsProps {
  playerId: string;
  onClose: () => void;
}

interface GameWithNames extends Game {
  playerNames?: Record<string, string>;
}

interface StatsData {
  player: Player;
  winRate: number;
  averagePlacement: number;
  lastGameDate: number | null;
  recentGames: GameWithNames[];
  headToHead: Array<{
    opponentId: string;
    opponentName: string;
    wins: number;
    losses: number;
    ties: number;
    gamesPlayed: number;
  }>;
  playerNames: Record<string, string>;
}

export default function PlayerStats({ playerId, onClose }: PlayerStatsProps) {
  const { t, language } = useI18n();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPlayerStats(playerId);
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.playerStats.loadingError);
        console.error('Error loading player stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [playerId]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="tm-card p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tm-copper"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
        <div className="tm-card p-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || t.playerStats.statsNotFound}</p>
          <button onClick={onClose} className="tm-button-primary">
            {t.playerStats.close}
          </button>
        </div>
      </div>
    );
  }

  const chartData = stats.player.ratingHistory.map((entry, index) => ({
    game: index + 1,
    rating: entry.rating,
    date: new Date(entry.date).toLocaleDateString(),
  }));

  // Calculate Y-axis domain with padding for better zoom
  const ratings = chartData.map(d => d.rating);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);
  const padding = (maxRating - minRating) * 0.1 || 50; // 10% padding or 50 points minimum
  const yAxisMin = Math.floor(minRating - padding);
  const yAxisMax = Math.ceil(maxRating + padding);

  const formatDateHelper = (timestamp: number | null) => {
    if (!timestamp) return t.playerStats.never;
    return formatDate(new Date(timestamp), language);
  };

  // Get the earliest date between createdAt and first game
  const getMemberSinceDate = () => {
    const createdAt = stats.player.createdAt;
    const firstGameDate = stats.player.ratingHistory.length > 0
      ? stats.player.ratingHistory[0].date
      : null;

    if (!firstGameDate) return createdAt;
    return Math.min(createdAt, firstGameDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="tm-card relative w-full max-h-[90vh] max-w-4xl overflow-y-auto">
        {/* Header */}
        <div className="tm-card-header sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 bg-tm-sand/95 dark:bg-tm-haze/95 backdrop-blur-sm">
          <div>
            <p className="tm-card-subtitle">{t.playerStats.pilotRecord}</p>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-heading uppercase tracking-[0.35em] text-tm-oxide dark:text-tm-glow">
                {stats.player.name}
              </h2>
              {stats.player.color && (
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-tm-copper/30 bg-white/80 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-tm-oxide dark:border-white/20 dark:bg-tm-haze/70 dark:text-tm-sand"
                  title={`${t.playerStats.color}: ${stats.player.color}`}
                >
                  {t.playerStats.color}
                  <span
                    className={`h-2.5 w-2.5 rounded-full border-2 ${getColorClasses(stats.player.color)}`}
                    aria-hidden="true"
                  />
                </span>
              )}
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              {t.playerStats.memberSince} {formatDateHelper(getMemberSinceDate())}
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerStats.currentRating}
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-copper dark:text-tm-glow">
                {Math.round(stats.player.currentRating)}
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerStats.peakRating}
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-copper/80 dark:text-tm-glow/80">
                {Math.round(stats.player.peakRating || stats.player.currentRating)}
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerStats.gamesPlayed}
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-oxide dark:text-tm-sand">
                {stats.player.gamesPlayed}
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerStats.winRate}
              </div>
              <div className="mt-2 text-3xl font-bold text-tm-teal">
                {stats.winRate.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-tm-copper/30 bg-white/85 p-4 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
              <div className="text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerStats.averagePlacement}
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
                {t.playerStats.ratingHistory}
              </h3>
              <div className="rounded-lg border border-tm-copper/20 bg-white/85 p-4 dark:border-white/10 dark:bg-tm-haze/80">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(216,108,41,0.25)" />
                    <XAxis
                      dataKey="game"
                      label={{ value: t.playerStats.gameNumber, position: 'insideBottom', offset: -5 }}
                      stroke="#8c6b4f"
                    />
                    <YAxis
                      label={{ value: 'Rating', angle: -90, position: 'insideLeft' }}
                      stroke="#8c6b4f"
                      domain={[yAxisMin, yAxisMax]}
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
          {stats.headToHead.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                {t.playerStats.headToHeadRecords}
              </h3>
              <div className="overflow-hidden rounded-lg border border-tm-copper/20 bg-white/85 dark:border-white/10 dark:bg-tm-haze/80">
                <table className="w-full">
                  <thead className="bg-tm-copper/10 text-[0.65rem] uppercase tracking-[0.3em] text-tm-oxide/70 dark:bg-white/5 dark:text-tm-sand/70">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        {t.playerStats.opponent}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t.playerStats.games}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t.playerStats.wins}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t.playerStats.losses}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t.playerStats.ties}
                      </th>
                      <th className="px-4 py-3 text-center">
                        {t.playerStats.winRate}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tm-copper/15 dark:divide-white/10">
                    {stats.headToHead.map(record => {
                      const winPercentage = record.gamesPlayed > 0
                        ? (record.wins / record.gamesPlayed) * 100
                        : 0;

                      return (
                        <tr key={record.opponentId}>
                          <td className="px-4 py-3 text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                            {record.opponentName}
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
                {t.playerStats.recentGames}
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                            {t.playerStats.position} #{placement + 1} {t.playerStats.positionOf} {game.placements.length}
                          </span>
                          {game.twoPlayerGame && (
                            <span className="text-[0.6rem] rounded-full border border-tm-copper/40 bg-tm-copper/15 px-1.5 py-0.5 font-semibold uppercase tracking-wide text-tm-copper-dark dark:bg-tm-copper/25 dark:text-tm-glow">
                              {t.playerStats.noElo}
                            </span>
                          )}
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
                            {game.twoPlayerGame ? '±0' : `${ratingChange > 0 ? '+' : ''}${ratingChange}`}
                          </span>
                          <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                            {formatDateHelper(game.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-tm-oxide/70 dark:text-tm-sand/70">
                        {t.playerStats.players}: {game.placements.map(id => stats.playerNames[id] || t.playerStats.unknown).join(', ')}
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
