import type { Game, Player } from '../types';

/**
 * Estadísticas derivadas de una partida recién registrada, para mostrar en el
 * modal de resultado. Todo se calcula en el cliente a partir de datos que ya
 * tenemos: no hace falta tocar la API.
 */

/** Misma ventana de actividad que usa /api/rankings para el filtro de activos. */
const ACTIVE_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

const GAME_MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500];

export interface PlayerGameSummary {
  playerId: string;
  placement: number; // 1 = ganador
  ratingChange: number;
  newRating: number;
  rankBefore: number | null;
  rankAfter: number | null;
  /** Positivo = subió posiciones en la tabla. */
  rankDelta: number;
  /** Nombres de los jugadores que pasó en la tabla con esta partida. */
  passed: string[];
  isNewPeak: boolean;
  wins: number;
  gamesPlayed: number;
  /** Victorias consecutivas actuales (ignora partidas que no jugó). */
  winStreak: number;
  /** Hito de partidas jugadas alcanzado justo ahora, si aplica. */
  milestone: number | null;
}

export interface GameSummaryStats {
  rows: PlayerGameSummary[];
  /** Cantidad total de partidas de la liga, contando esta. */
  gameNumber: number;
  /** El ganador era el peor rankeado de la mesa antes de jugar. */
  isUpset: boolean;
}

interface BuildArgs {
  game: Game;
  /** Jugadores de la partida, ya actualizados (respuesta de la API). */
  summaryPlayers: Record<string, Player>;
  /** Todos los jugadores de la liga. */
  allPlayers: Record<string, Player>;
  /** Historial de partidas (puede o no incluir todavía la nueva). */
  games: Game[];
}

/** Victorias consecutivas más recientes, salteando partidas que no jugó. */
function currentWinStreak(playerId: string, newestFirst: Game[]): number {
  let streak = 0;
  for (const game of newestFirst) {
    if (!game.placements.includes(playerId)) continue;
    if (game.placements[0] !== playerId) break;
    streak++;
  }
  return streak;
}

/** Mapa playerId → posición (1-based) ordenando por rating descendente. */
function rankByRating(players: Player[], getRating: (player: Player) => number): Map<string, number> {
  const sorted = [...players].sort(
    (a, b) => getRating(b) - getRating(a) || a.name.localeCompare(b.name)
  );
  return new Map(sorted.map((player, index) => [player.id, index + 1]));
}

export function buildGameSummaryStats({
  game,
  summaryPlayers,
  allPlayers,
  games,
}: BuildArgs): GameSummaryStats {
  // Los jugadores de la partida vienen de la API y son la fuente autoritativa
  // del estado post-partida; el resto de la liga sale del estado de la app.
  const after: Record<string, Player> = { ...allPlayers, ...summaryPlayers };

  const isTwoPlayerGame = game.placements.length === 2;

  const history = games.some(g => g.id === game.id) ? games : [game, ...games];
  const newestFirst = [...history].sort((a, b) => b.date - a.date);

  // Rating previo: sólo cambió el de quienes jugaron esta partida.
  const ratingBefore = (player: Player) =>
    player.currentRating - (game.ratingChanges[player.id] ?? 0);

  // Misma cohorte en ambas fotos (activos con partidas jugadas), así el delta
  // refleja movimiento real de rating y no cambios en quién entra a la tabla.
  const now = Date.now();
  const cohort = Object.values(after).filter(player => {
    if (player.gamesPlayed <= 0) return false;
    const lastGame = player.ratingHistory[player.ratingHistory.length - 1]?.date ?? 0;
    return now - lastGame <= ACTIVE_WINDOW_MS;
  });

  const ranksBefore = rankByRating(cohort, ratingBefore);
  const ranksAfter = rankByRating(cohort, player => player.currentRating);
  const byId = new Map(cohort.map(player => [player.id, player]));

  const rows: PlayerGameSummary[] = game.placements.map((playerId, index) => {
    const player = after[playerId];
    const ratingChange = game.ratingChanges[playerId] ?? 0;
    const rankBefore = ranksBefore.get(playerId) ?? null;
    const rankAfter = ranksAfter.get(playerId) ?? null;
    const rankDelta = rankBefore !== null && rankAfter !== null ? rankBefore - rankAfter : 0;

    // A quiénes pasó: estaban arriba antes y quedaron abajo después.
    const passed =
      rankDelta > 0 && rankBefore !== null && rankAfter !== null
        ? cohort
            .filter(other => {
              if (other.id === playerId) return false;
              const otherBefore = ranksBefore.get(other.id);
              const otherAfter = ranksAfter.get(other.id);
              if (otherBefore === undefined || otherAfter === undefined) return false;
              return otherBefore < rankBefore && otherAfter > rankAfter;
            })
            .map(other => other.name)
        : [];

    // applyRatingChanges deja peakRating = max(peak, nuevoRating), así que un
    // récord nuevo implica que el rating actual quedó igual al pico.
    const isNewPeak =
      !isTwoPlayerGame &&
      ratingChange > 0 &&
      player !== undefined &&
      Math.round(player.currentRating) >= Math.round(player.peakRating);

    return {
      playerId,
      placement: index + 1,
      ratingChange,
      newRating: Math.round(player?.currentRating ?? 0),
      rankBefore,
      rankAfter,
      rankDelta,
      passed,
      isNewPeak,
      wins: player?.wins ?? 0,
      gamesPlayed: player?.gamesPlayed ?? 0,
      winStreak: currentWinStreak(playerId, newestFirst),
      milestone: player && GAME_MILESTONES.includes(player.gamesPlayed) ? player.gamesPlayed : null,
    };
  });

  // Batacazo: el ganador era el de menor rating de la mesa antes de jugar.
  const participants = game.placements
    .map(id => byId.get(id) ?? after[id])
    .filter((player): player is Player => Boolean(player));
  const winnerId = game.placements[0];
  const winner = after[winnerId];
  const isUpset =
    !isTwoPlayerGame &&
    game.placements.length >= 3 &&
    participants.length === game.placements.length &&
    winner !== undefined &&
    participants.every(
      player => player.id === winnerId || ratingBefore(player) > ratingBefore(winner)
    );

  return { rows, gameNumber: history.length, isUpset };
}
