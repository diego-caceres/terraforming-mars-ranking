import { useState } from 'react';
import type { Game, Player } from '../types';
import { useI18n, formatDate as formatDateI18n } from '../i18n';

interface GameHistoryProps {
  games: Game[];
  players: Record<string, Player>;
  onDeleteGame: (gameId: string) => void;
  onUpdateGame: (gameId: string, updates: { expansions?: string[]; generations?: number }) => void;
}

const AVAILABLE_EXPANSIONS = ['Venus', 'Turmoil', 'CEOs', 'Velocity', 'Ares'];

export default function GameHistory({ games, players, onDeleteGame, onUpdateGame }: GameHistoryProps) {
  const { t, language } = useI18n();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editingGame, setEditingGame] = useState<string | null>(null);
  const [editExpansions, setEditExpansions] = useState<string[]>([]);
  const [editGenerations, setEditGenerations] = useState<string>('');

  const formatDate = (timestamp: number) => {
    return formatDateI18n(new Date(timestamp), language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPlayerName = (playerId: string) => {
    return players[playerId]?.name || t.gameHistory.unknown;
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(selectedGame?.id === game.id ? null : game);
  };

  const handleDeleteGame = (gameId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the game from expanding/collapsing

    const game = games.find(g => g.id === gameId);
    if (!game) return;

    const playerNames = game.placements
      .map(id => players[id]?.name || t.gameHistory.unknown)
      .join(', ');

    const confirmed = window.confirm(
      `${t.gameHistory.confirmDeleteTitle}\n\n` +
      `${t.gameHistory.confirmDeleteDate}: ${formatDate(game.date)}\n` +
      `${t.gameHistory.confirmDeletePlayers}: ${playerNames}\n\n` +
      `${t.gameHistory.confirmDeleteWarning}`
    );

    if (confirmed) {
      onDeleteGame(gameId);
      if (selectedGame?.id === gameId) {
        setSelectedGame(null);
      }
    }
  };

  const handleStartEdit = (game: Game, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingGame(game.id);
    setEditExpansions(game.expansions || []);
    setEditGenerations(game.generations?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
    setEditExpansions([]);
    setEditGenerations('');
  };

  const handleSaveEdit = (gameId: string) => {
    const generationsNum = editGenerations ? parseInt(editGenerations, 10) : undefined;

    // Validate generations
    if (editGenerations && (isNaN(generationsNum!) || generationsNum! < 1 || generationsNum! > 16)) {
      alert(t.gameHistory.generationsInvalid);
      return;
    }

    onUpdateGame(gameId, {
      expansions: editExpansions,
      generations: generationsNum,
    });

    setEditingGame(null);
    setEditExpansions([]);
    setEditGenerations('');
  };

  const toggleEditExpansion = (expansion: string) => {
    setEditExpansions(prev =>
      prev.includes(expansion)
        ? prev.filter(e => e !== expansion)
        : [...prev, expansion]
    );
  };

  return (
    <div className="tm-card overflow-hidden">
      <div className="tm-card-header px-6 py-5">
        <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
          {t.gameHistory.title}
        </h2>
        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-tm-oxide/60 dark:text-tm-sand/60">
          {games.length} {games.length === 1 ? t.gameHistory.gameRecorded : t.gameHistory.gamesRecorded}
        </p>
      </div>

      {games.length === 0 ? (
        <div className="px-6 py-12 text-center text-tm-oxide/70 dark:text-tm-sand/70">
          {t.gameHistory.noGamesYet} {t.gameHistory.recordFirstGame}
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
                          {game.placements.length} {game.placements.length === 1 ? t.gameHistory.player : t.gameHistory.players}
                        </span>
                        {game.twoPlayerGame && (
                          <span className="rounded-full border border-tm-copper/40 bg-tm-copper/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-tm-copper-dark dark:bg-tm-copper/25 dark:text-tm-glow">
                            {t.gameHistory.noElo}
                          </span>
                        )}
                        {game.generations && (
                          <span className="tm-chip">
                            {game.generations} {t.gameHistory.gen}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-tm-oxide/80 dark:text-tm-sand/80">
                        {t.gameHistory.winner}:{' '}
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
                        onClick={(e) => handleStartEdit(game, e)}
                        className="rounded-full border border-transparent p-2 text-tm-oxide hover:border-tm-oxide/40 hover:bg-tm-oxide/10 dark:text-tm-sand dark:hover:bg-white/10"
                        title={t.gameHistory.editGame}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteGame(game.id, e)}
                        className="rounded-full border border-transparent p-2 text-tm-copper hover:border-tm-copper/40 hover:bg-tm-copper/10 dark:text-tm-glow dark:hover:bg-white/10"
                        title={t.gameHistory.deleteGame}
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
                      {t.gameHistory.finalStandings}
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
                                  {player?.name || t.gameHistory.unknown}
                                </div>
                                <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                                  {t.gameHistory.ratingAfterGame}: {Math.round((player?.currentRating || 0))}
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

                    {/* Edit Form */}
                    {editingGame === game.id ? (
                      <div className="mt-5 border-t border-tm-copper/20 pt-4 dark:border-white/10">
                        <h3 className="mb-4 text-sm font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                          {t.gameHistory.editGameTitle}
                        </h3>

                        <div className="space-y-4">
                          {/* Generations */}
                          <div>
                            <label className="mb-2 block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                              {t.gameHistory.generationsLabel}
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="16"
                              value={editGenerations}
                              onChange={(e) => setEditGenerations(e.target.value)}
                              placeholder={t.gameHistory.generationsPlaceholder}
                              className="w-full rounded-lg border border-tm-copper/30 bg-white px-4 py-2 text-tm-oxide transition focus:border-tm-copper focus:outline-none focus:ring-2 focus:ring-tm-copper/20 dark:border-white/20 dark:bg-tm-haze dark:text-tm-sand dark:focus:border-tm-glow dark:focus:ring-tm-glow/20"
                            />
                          </div>

                          {/* Expansions */}
                          <div>
                            <label className="mb-3 block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
                              {t.gameHistory.expansionsLabel}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {AVAILABLE_EXPANSIONS.map(expansion => (
                                <button
                                  key={expansion}
                                  type="button"
                                  onClick={() => toggleEditExpansion(expansion)}
                                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                                    editExpansions.includes(expansion)
                                      ? 'bg-tm-copper text-white shadow-md dark:bg-tm-glow dark:text-tm-oxide'
                                      : 'border border-tm-copper/40 bg-transparent text-tm-oxide hover:bg-tm-copper/10 dark:border-white/20 dark:text-tm-sand dark:hover:bg-white/10'
                                  }`}
                                >
                                  {expansion}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => handleSaveEdit(game.id)}
                              className="flex-1 rounded-lg bg-tm-teal px-6 py-2.5 font-semibold text-white shadow-md transition hover:bg-tm-teal/90 dark:bg-tm-glow dark:text-tm-oxide dark:hover:bg-tm-glow/90"
                            >
                              {t.gameHistory.saveChanges}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 rounded-lg border border-tm-copper/40 bg-transparent px-6 py-2.5 font-semibold text-tm-oxide transition hover:bg-tm-copper/10 dark:border-white/20 dark:text-tm-sand dark:hover:bg-white/10"
                            >
                              {t.gameHistory.cancel}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Game Details */
                      <div className="mt-5 border-t border-tm-copper/20 pt-4 dark:border-white/10">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                              {t.gameHistory.gameId}:
                            </span>
                            <span className="ml-2 font-mono text-xs text-tm-oxide dark:text-tm-sand">
                              {game.id}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                              {t.gameHistory.playersLabel}:
                            </span>
                            <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                              {game.placements.map(id => getPlayerName(id)).join(', ')}
                            </span>
                          </div>
                          {game.generations && (
                            <div>
                              <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                                {t.gameHistory.generationsInfo}:
                              </span>
                              <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                                {game.generations}
                              </span>
                            </div>
                          )}
                          {game.expansions && game.expansions.length > 0 && (
                            <div>
                              <span className="text-xs uppercase tracking-[0.3em] text-tm-oxide/60 dark:text-tm-sand/60">
                                {t.gameHistory.expansionsInfo}:
                              </span>
                              <span className="ml-2 text-tm-oxide dark:text-tm-sand">
                                {game.expansions.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
