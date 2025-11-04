import { useState } from 'react';
import type { Game, Player } from '../types';

interface GameHistoryProps {
  games: Game[];
  players: Record<string, Player>;
  onDeleteGame: (gameId: string) => void;
}

export default function GameHistory({ games, players, onDeleteGame }: GameHistoryProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlayerName = (playerId: string) => {
    return players[playerId]?.name || 'Jugador Desconocido';
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(selectedGame?.id === game.id ? null : game);
  };

  const handleDeleteGame = (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the game from expanding/collapsing

    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const playerNames = game.placements
      .map(id => players[id]?.name || 'Desconocido')
      .join(', ');

    const confirmed = window.confirm(
      `¿Estás seguro de que querés eliminar esta partida?\n\n` +
      `Fecha: ${formatDate(game.date)}\n` +
      `Jugadores: ${playerNames}\n\n` +
      `Esto recalculará todos los ratings desde cero. Esta acción no se puede deshacer.`
    );

    if (confirmed) {
      onDeleteGame(gameId);
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
    }
  };

  return (
    <div className="tm-card overflow-hidden">
      <div className="tm-card-header px-6 py-5">
        <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
          Historial de Partidas
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
          {games.length} {games.length === 1 ? 'partida registrada' : 'partidas registradas'}
        </p>
      </div>

      {games.length === 0 ? (
        <div className="px-6 py-12 text-center text-tm-oxide/70 dark:text-tm-sand/70">
          Aún no hay partidas registradas. ¡Registrá tu primera partida para verla acá!
        </div>
      ) : (
        <div className="divide-y divide-tm-copper/20 dark:divide-white/10">
          {games.map((game) => {
            const isExpanded = selectedGame?.id === game.id;
            const winner = players[game.placements[0]];

            return (
              <div key={game.id}>
                <div
                  onClick={() => handleGameClick(game)}
                  className="px-6 py-5 transition-colors hover:bg-tm-copper/10 dark:hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-tm-oxide dark:text-tm-sand">
                          {formatDate(game.date)}
                        </span>
                        <span className="tm-chip">
                          {game.placements.length} {game.placements.length === 1 ? 'jugador' : 'jugadores'}
                        </span>
                        {game.twoPlayerGame && (
                          <span className="rounded-full border border-tm-copper/40 bg-tm-copper/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-tm-copper-dark dark:bg-tm-copper/25 dark:text-tm-glow">
                            Sin ELO
                          </span>
                        )}
                        {game.generations && (
                          <span className="tm-chip">
                            {game.generations} gen
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-tm-oxide/80 dark:text-tm-sand/80">
                        Ganador:{' '}
                        <span className="font-semibold text-tm-oxide dark:text-tm-glow">
                          {winner?.name}
                        </span>
                      </div>
                      {game.expansions && game.expansions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {game.expansions.map(expansion => (
                            <span
                              key={expansion}
                              className="tm-chip"
                            >
                              {expansion}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeleteGame(game.id, e)}
                        className="rounded-full border border-transparent p-2 text-tm-copper hover:border-tm-copper/40 hover:bg-tm-copper/10 dark:text-tm-glow dark:hover:bg-white/10"
                        title="Eliminar partida"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                      <div className="text-tm-oxide/40 dark:text-tm-sand/40">
                        <svg
                          className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-white/70 px-6 py-5 dark:bg-tm-haze/70">
                    <h3 className="mb-3 text-sm font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                      Clasificación Final
                    </h3>
                    <div className="space-y-3">
                      {game.placements.map((playerId, index) => {
                        const player = players[playerId];
                        const ratingChange = game.ratingChanges[playerId] || 0;

                        return (
                          <div
                            key={playerId}
                            className="flex items-center justify-between rounded-lg border border-tm-copper/25 bg-white/90 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-tm-haze/80"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow ${
                                  index === 0
                                    ? 'bg-gradient-to-br from-tm-copper to-tm-copper-dark'
                                    : index === 1
                                    ? 'bg-gradient-to-br from-tm-sand-deep to-tm-oxide'
                                    : index === 2
                                    ? 'bg-gradient-to-br from-tm-teal to-tm-teal/70'
                                    : 'bg-tm-oxide/20 text-tm-oxide'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-semibold text-tm-oxide dark:text-tm-sand">
                                  {player?.name || 'Desconocido'}
                                </div>
                                <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                                  Rating después de la partida: {Math.round((player?.currentRating || 0))}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-bold ${
                                ratingChange > 0
                                  ? 'text-tm-teal'
                                  : ratingChange < 0
                                  ? 'text-tm-copper-dark'
                                  : 'text-tm-oxide/60 dark:text-tm-sand/60'
                              }`}
                            >
                              {ratingChange > 0 ? '+' : ''}
                              {ratingChange}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Game Details */}
                    <div className="mt-5 border-t border-tm-copper/20 pt-4 dark:border-white/10">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                            ID de Partida:
                          </span>
                          <span className="ml-2 font-mono text-xs text-tm-oxide dark:text-tm-sand">
                            {game.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                            Jugadores:
                          </span>
                          <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                            {game.placements.map(id => getPlayerName(id)).join(', ')}
                          </span>
                        </div>
                        {game.generations && (
                          <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                              Generaciones:
                            </span>
                            <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                              {game.generations}
                            </span>
                          </div>
                        )}
                        {game.expansions && game.expansions.length > 0 && (
                          <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                              Expansiones:
                            </span>
                            <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                              {game.expansions.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
