import type { Game, Player } from '../../types';
import { getColorClasses } from '../../utils/colorUtils';

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
      return date.toLocaleDateString('es-UY', {
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
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {/* Total Games */}
      <div className="rounded-lg border border-tm-copper/25 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Total de Partidas
            </p>
            <p className="mt-3 text-3xl font-bold text-tm-copper dark:text-tm-glow">
              {totalGames}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-tm-copper/30 bg-tm-copper/20 text-tm-copper">
            <svg
              className="h-6 w-6"
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
      <div className="rounded-lg border border-tm-copper/25 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Última Partida
            </p>
            {lastGame ? (
              <div className="mt-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-bold text-tm-oxide dark:text-tm-sand">
                    {lastGameWinner?.name || 'Desconocido'}
                  </p>
                  {lastGameWinner?.color && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full"
                      title={`Color: ${lastGameWinner.color}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full border-2 ${getColorClasses(lastGameWinner.color)}`}
                        aria-hidden="true"
                      />
                      
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                  {lastGameDate && formatDate(lastGameDate)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-lg font-medium text-tm-oxide/60 dark:text-tm-sand/60">
                Aún no hay partidas
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tm-copper/30 bg-tm-glow/20 text-tm-copper-dark">
            <svg
              className="h-6 w-6"
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
      <div className="rounded-lg border border-tm-copper/25 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Mejor Rating
            </p>
            {topPlayer ? (
              <div className="mt-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-bold text-tm-oxide dark:text-tm-sand">
                    {topPlayer.name}
                  </p>
                  {topPlayer.color && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full"
                      title={`Color: ${topPlayer.color}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full border-2 ${getColorClasses(topPlayer.color)}`}
                        aria-hidden="true"
                      />
                     
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                  {Math.round(topPlayer.currentRating)} puntos
                </p>
              </div>
            ) : (
              <p className="mt-3 text-lg font-medium text-tm-oxide/60 dark:text-tm-sand/60">
                Sin jugadores
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tm-copper/30 bg-tm-teal/20 text-tm-teal">
            <svg
              className="h-6 w-6"
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
      <div className="rounded-lg border border-tm-copper/25 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Más Activo
            </p>
            {mostActivePlayer ? (
              <div className="mt-3">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-lg font-bold text-tm-oxide dark:text-tm-sand">
                    {mostActivePlayer.name}
                  </p>
                  {mostActivePlayer.color && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full"
                      title={`Color: ${mostActivePlayer.color}`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full border-2 ${getColorClasses(mostActivePlayer.color)}`}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                  {mostActivePlayer.gamesPlayed} {mostActivePlayer.gamesPlayed === 1 ? 'partida' : 'partidas'}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-lg font-medium text-tm-oxide/60 dark:text-tm-sand/60">
                Sin jugadores
              </p>
            )}
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tm-copper/30 bg-tm-copper/20 text-tm-copper-dark">
            <svg
              className="h-6 w-6"
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

      {/* Espectadora Premium */}
      <div className="rounded-lg border border-tm-copper/25 bg-white/85 p-6 shadow-sm dark:border-white/10 dark:bg-tm-haze/80">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
              Espectadora Premium
            </p>
            <div className="mt-3 space-y-1">
              <p className="truncate text-lg font-bold text-tm-oxide dark:text-tm-sand">
                Anto
              </p>
              <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                Animando desde las gradas
              </p>
              
            </div>
          </div>
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-tm-copper/30 bg-tm-copper/15 text-tm-copper">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A6.002 6.002 0 0112 14c1.657 0 3.156.672 4.243 1.757M15 11a3 3 0 10-6 0 3 3 0 006 0zM19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2M19 8h-2m-1-3v2a2 2 0 002 2h2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
