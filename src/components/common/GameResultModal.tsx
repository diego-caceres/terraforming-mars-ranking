import type { Game, Player } from '../../types';
import { getColorClasses } from '../../utils/colorUtils';
import { getPodiumClasses } from '../../utils/podiumUtils';
import { useI18n, interpolate } from '../../i18n';
import { buildGameSummaryStats } from '../../utils/gameSummaryStats';

interface GameResultModalProps {
  game: Game;
  /** Todos los jugadores de la liga (para nombre/color y para reconstruir el historial). */
  players: Record<string, Player>;
  /** Historial completo de partidas, en cualquier orden. */
  games: Game[];
  onClose: () => void;
}

export default function GameResultModal({ game, players, games, onClose }: GameResultModalProps) {
  const { t } = useI18n();
  const isTwoPlayerGame = game.twoPlayerGame ?? game.placements.length === 2;
  const summaryStats = buildGameSummaryStats({ game, players, games });

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="tm-card w-full max-w-md p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-lg font-heading uppercase tracking-[0.25em] text-tm-oxide dark:text-tm-glow text-center">
            {t.gameResultModal.title}
          </h2>

          <div className="space-y-2">
            {summaryStats.rows.map((row) => {
              const player = players[row.playerId];
              const isPositive = row.ratingChange > 0;
              const movedUp = row.rankDelta > 0;
              return (
                <div
                  key={row.playerId}
                  className="rounded-lg bg-white/60 dark:bg-tm-haze/60 px-3 py-2.5 space-y-1.5"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getPodiumClasses(row.placement)}`}>
                      {row.placement}
                    </div>
                    {player?.color && (
                      <div className={`w-3 h-3 shrink-0 rounded-full border-2 ${getColorClasses(player.color)}`} />
                    )}
                    <span className="flex-1 font-semibold text-sm text-tm-oxide dark:text-tm-sand truncate">
                      {player?.name ?? t.addGame.unknown}
                    </span>
                    {!isTwoPlayerGame && (
                      <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : row.ratingChange < 0 ? 'text-red-500 dark:text-red-400' : 'text-tm-oxide/50 dark:text-tm-sand/50'}`}>
                        {isPositive ? '+' : ''}{Math.round(row.ratingChange)}
                      </span>
                    )}
                    <span className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 tabular-nums min-w-[3rem] text-right">
                      {row.newRating}
                    </span>
                  </div>

                  {/* Posición en la tabla, récords y rachas */}
                  <div className="flex flex-wrap items-center gap-1.5 pl-10 text-[0.7rem]">
                    {!isTwoPlayerGame && row.rankAfter !== null && (
                      <span className="inline-flex items-center gap-1 rounded bg-tm-oxide/10 px-1.5 py-0.5 font-semibold tabular-nums text-tm-oxide dark:bg-tm-sand/10 dark:text-tm-sand">
                        #{row.rankAfter}
                        {row.rankDelta !== 0 && (
                          <span className={movedUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}>
                            {movedUp ? '▲' : '▼'}{Math.abs(row.rankDelta)}
                          </span>
                        )}
                      </span>
                    )}
                    {row.isNewPeak && (
                      <span className="rounded bg-amber-400/20 px-1.5 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                        🏔️ {t.gameResultModal.newPeak}
                      </span>
                    )}
                    {row.winStreak > 1 && (
                      <span className="rounded bg-orange-500/15 px-1.5 py-0.5 font-semibold text-orange-700 dark:text-orange-300">
                        🔥 {interpolate(t.gameResultModal.winStreak, { count: row.winStreak })}
                      </span>
                    )}
                    {row.milestone !== null && (
                      <span className="rounded bg-tm-teal/20 px-1.5 py-0.5 font-semibold text-tm-teal dark:text-tm-glow">
                        🎉 {interpolate(t.gameResultModal.milestone, { games: row.milestone })}
                      </span>
                    )}
                    <span className="text-tm-oxide/55 dark:text-tm-sand/55">
                      {interpolate(t.gameResultModal.record, { wins: row.wins, games: row.gamesPlayed })}
                    </span>
                  </div>

                  {row.passed.length > 0 && (
                    <p className="pl-10 text-[0.7rem] font-medium text-emerald-700 dark:text-emerald-400">
                      {interpolate(t.gameResultModal.passed, { names: row.passed.join(', ') })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen de la partida */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-tm-copper/20 pt-3 text-[0.7rem] text-tm-oxide/60 dark:text-tm-sand/60">
            <span className="font-semibold text-tm-oxide/80 dark:text-tm-sand/80">
              {interpolate(t.gameResultModal.gameNumber, { number: summaryStats.gameNumber })}
            </span>
            {game.generations !== undefined && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {interpolate(t.gameResultModal.generationsCount, { count: game.generations })}
                </span>
              </>
            )}
            {summaryStats.isUpset && (
              <span className="rounded bg-fuchsia-500/15 px-1.5 py-0.5 font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                ⚡ {t.gameResultModal.upset}
              </span>
            )}
            {game.expansions && game.expansions.length > 0 && (
              <div className="flex w-full flex-wrap justify-center gap-1 pt-1">
                {game.expansions.map((exp) => (
                  <span
                    key={exp}
                    className="rounded bg-tm-copper/20 px-1.5 py-0.5 text-tm-copper-dark dark:bg-tm-glow/20 dark:text-tm-glow"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isTwoPlayerGame && (
            <p className="text-xs text-center text-tm-oxide/60 dark:text-tm-sand/60">
              {t.gameResultModal.twoPlayerNote}
            </p>
          )}

          <button
            onClick={onClose}
            className="tm-button-primary w-full justify-center"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}
