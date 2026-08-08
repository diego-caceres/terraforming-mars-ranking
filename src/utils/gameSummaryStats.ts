import type { Game, Player } from '../types';

/**
 * Estadísticas derivadas de una partida (recién jugada o histórica) para el
 * modal de resultado.
 *
 * IMPORTANTE: la fuente de verdad para el rating/pico/racha de cada jugador
 * es `player.ratingHistory`, NUNCA `game.ratingChanges`. Cuando se borra una
 * partida, el servidor (api/games/[id].ts) recalcula correctamente a cada
 * jugador y reconstruye su `ratingHistory` desde cero, pero NO vuelve a
 * guardar los deltas recalculados en las partidas restantes — así que
 * `game.ratingChanges` puede quedar desactualizado para partidas que
 * "sobrevivieron" a un borrado anterior, mientras que `ratingHistory` del
 * jugador siempre está al día. Por eso reconstruimos todo a partir de la
 * línea de tiempo propia de cada jugador (su `ratingHistory`, ordenado por
 * fecha), cruzando con `placements` (nunca queda obsoleto) sólo para saber
 * quién ganó cada partida.
 */

/** Misma ventana de actividad que usa /api/rankings para el filtro de activos. */
const ACTIVE_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

/** Debe coincidir con STARTING_RATING de api/_lib/eloCalculator.ts. */
const STARTING_RATING = 1500;

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
  /** Victorias consecutivas hasta esta partida inclusive. */
  winStreak: number;
  /** Hito de partidas jugadas alcanzado justo en esta partida, si aplica. */
  milestone: number | null;
}

export interface GameSummaryStats {
  rows: PlayerGameSummary[];
  /** Posición cronológica de esta partida en la historia de la liga. */
  gameNumber: number;
  /** El ganador era el peor rankeado de la mesa antes de jugar. */
  isUpset: boolean;
}

interface BuildArgs {
  game: Game;
  /** Todos los jugadores de la liga — fuente autoritativa de rating/historial. */
  players: Record<string, Player>;
  /** Historial completo de partidas (para fecha, id y placements — no para ratingChanges). */
  games: Game[];
}

interface TimelineEntry {
  gameId: string;
  date: number;
  /** Rating del jugador inmediatamente después de esta partida (autoritativo). */
  rating: number;
  /** Cambio de rating en esta partida (autoritativo). */
  change: number;
  /** Snapshot acumulado hasta esta partida inclusive. */
  peak: number;
  gamesPlayed: number;
  wins: number;
  winStreak: number;
}

/** Línea de tiempo propia del jugador, ordenada por fecha (empate → orden original). */
function buildTimeline(player: Player, gamesById: Map<string, Game>): TimelineEntry[] {
  const sorted = player.ratingHistory
    .map((h, originalIndex) => ({ ...h, originalIndex }))
    .sort((a, b) => a.date - b.date || a.originalIndex - b.originalIndex);

  let peak = STARTING_RATING;
  let gamesPlayed = 0;
  let wins = 0;
  let streak = 0;

  return sorted.map((h) => {
    const g = gamesById.get(h.gameId);
    const isWin = g?.placements[0] === player.id;
    gamesPlayed += 1;
    peak = Math.max(peak, h.rating);
    wins += isWin ? 1 : 0;
    streak = isWin ? streak + 1 : 0;
    return { gameId: h.gameId, date: h.date, rating: h.rating, change: h.change, peak, gamesPlayed, wins, winStreak: streak };
  });
}

/** Última entrada de la línea de tiempo a esa fecha (o estrictamente antes). */
function lastEntryAsOf(timeline: TimelineEntry[], date: number, inclusive: boolean): TimelineEntry | null {
  let result: TimelineEntry | null = null;
  for (const entry of timeline) {
    const qualifies = inclusive ? entry.date <= date : entry.date < date;
    if (!qualifies) break; // ordenado ascendente: ninguna entrada posterior calificará
    result = entry;
  }
  return result;
}

export function buildGameSummaryStats({ game, players, games }: BuildArgs): GameSummaryStats {
  const isTwoPlayerGame = game.twoPlayerGame ?? game.placements.length === 2;

  const gamesById = new Map(games.map(g => [g.id, g]));
  if (!gamesById.has(game.id)) gamesById.set(game.id, game);

  const allPlayerIds = Object.keys(players);
  const timelineCache = new Map<string, TimelineEntry[]>();
  const getTimeline = (playerId: string): TimelineEntry[] => {
    let timeline = timelineCache.get(playerId);
    if (timeline) return timeline;
    const player = players[playerId];
    timeline = player ? buildTimeline(player, gamesById) : [];
    timelineCache.set(playerId, timeline);
    return timeline;
  };

  const rankSnapshot = (asOfDate: number, inclusive: boolean): Map<string, number> => {
    const active: Array<[string, number]> = [];
    for (const id of allPlayerIds) {
      const entry = lastEntryAsOf(getTimeline(id), asOfDate, inclusive);
      if (!entry || asOfDate - entry.date > ACTIVE_WINDOW_MS) continue;
      active.push([id, entry.rating]);
    }
    active.sort(([idA, ratingA], [idB, ratingB]) => {
      if (ratingB !== ratingA) return ratingB - ratingA;
      return (players[idA]?.name ?? '').localeCompare(players[idB]?.name ?? '');
    });
    return new Map(active.map(([id], index) => [id, index + 1]));
  };

  // "Antes" = estrictamente antes de este día; "después" = incluye esta partida.
  const beforeRanks = rankSnapshot(game.date, false);
  const afterRanks = rankSnapshot(game.date, true);

  const rows: PlayerGameSummary[] = game.placements.map((playerId, index) => {
    const timeline = getTimeline(playerId);
    const entry = timeline.find(e => e.gameId === game.id) ?? null;

    // El fallback sólo debería activarse si `players` todavía no incluye el
    // ratingHistory de esta partida recién registrada (carrera de props).
    const ratingChange = entry?.change ?? game.ratingChanges[playerId] ?? 0;
    const newRating = Math.round(entry?.rating ?? players[playerId]?.currentRating ?? STARTING_RATING);

    const rankBefore = beforeRanks.get(playerId) ?? null;
    const rankAfter = afterRanks.get(playerId) ?? null;
    const rankDelta = rankBefore !== null && rankAfter !== null ? rankBefore - rankAfter : 0;

    // A quiénes pasó: estaban arriba antes y quedaron abajo después.
    const passed =
      rankDelta > 0 && rankBefore !== null && rankAfter !== null
        ? allPlayerIds
            .filter(otherId => {
              if (otherId === playerId) return false;
              const otherBefore = beforeRanks.get(otherId);
              const otherAfter = afterRanks.get(otherId);
              if (otherBefore === undefined || otherAfter === undefined) return false;
              return otherBefore < rankBefore && otherAfter > rankAfter;
            })
            .map(otherId => players[otherId]?.name ?? '')
            .filter(Boolean)
        : [];

    const isNewPeak =
      !isTwoPlayerGame &&
      ratingChange > 0 &&
      entry !== null &&
      Math.round(entry.rating) >= Math.round(entry.peak);

    const gamesPlayed = entry?.gamesPlayed ?? 0;

    return {
      playerId,
      placement: index + 1,
      ratingChange,
      newRating,
      rankBefore,
      rankAfter,
      rankDelta,
      passed,
      isNewPeak,
      wins: entry?.wins ?? 0,
      gamesPlayed,
      winStreak: entry?.winStreak ?? 0,
      milestone: GAME_MILESTONES.includes(gamesPlayed) ? gamesPlayed : null,
    };
  });

  // Batacazo: el ganador era el de menor rating de la mesa antes de jugar.
  const winnerId = game.placements[0];
  const winnerBefore = lastEntryAsOf(getTimeline(winnerId), game.date, false)?.rating ?? STARTING_RATING;
  const isUpset =
    !isTwoPlayerGame &&
    game.placements.length >= 3 &&
    game.placements
      .filter(id => id !== winnerId)
      .every(id => (lastEntryAsOf(getTimeline(id), game.date, false)?.rating ?? STARTING_RATING) > winnerBefore);

  // Posición cronológica en la historia de la liga: `date`/`id` nunca quedan
  // obsoletos (a diferencia de `ratingChanges`), así que esto sigue siendo
  // seguro de derivar directamente de `games`.
  const chronological = [...gamesById.values()].sort((a, b) => a.date - b.date || a.id.localeCompare(b.id));
  const gameNumber = chronological.findIndex(g => g.id === game.id) + 1;

  return { rows, gameNumber, isUpset };
}
