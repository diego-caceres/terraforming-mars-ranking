import type { Game, Player } from '../../types';

interface StatsOverviewProps {
  games: Game[];
  players: Record<string, Player>;
}

export default function StatsOverview({ games, players }: StatsOverviewProps) {
  const totalGames = games.length;

  // Get last game info
  const lastGame = games.length > 0 ? games[0] : null; // Games are in reverse chronological order
  const lastGameWinner = lastGame ? players[lastGame.placements[0]] : null;
  const lastGameDate = lastGame ? new Date(lastGame.date) : null;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Calculate most active player
  const mostActivePlayer = Object.values(players).reduce((max, player) => {
    return player.gamesPlayed > (max?.gamesPlayed || 0) ? player : max;
  }, null as Player | null);

  // Calculate highest rated player
  const topPlayer = Object.values(players).reduce((max, player) => {
    return player.currentRating > (max?.currentRating || 0) ? player : max;
  }, null as Player | null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Games */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Partidas
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
              {totalGames}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Last Game */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Última Partida
            </p>
            {lastGame ? (
              <div className="mt-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {lastGameWinner?.name || 'Desconocido'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {lastGameDate && formatDate(lastGameDate)}
                </p>
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-400 dark:text-gray-500 mt-2">
                Aún no hay partidas
              </p>
            )}
          </div>
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex-shrink-0 ml-4">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Top Rated Player */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Mejor Rating
            </p>
            {topPlayer ? (
              <div className="mt-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {topPlayer.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round(topPlayer.currentRating)} puntos
                </p>
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-400 dark:text-gray-500 mt-2">
                Sin jugadores
              </p>
            )}
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex-shrink-0 ml-4">
            <svg
              className="w-8 h-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Most Active Player */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Más Activo
            </p>
            {mostActivePlayer ? (
              <div className="mt-2">
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                  {mostActivePlayer.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {mostActivePlayer.gamesPlayed} {mostActivePlayer.gamesPlayed === 1 ? 'partida' : 'partidas'}
                </p>
              </div>
            ) : (
              <p className="text-lg font-medium text-gray-400 dark:text-gray-500 mt-2">
                Sin jugadores
              </p>
            )}
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0 ml-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
