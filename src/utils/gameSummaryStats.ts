import type { Game, Player } from '../types';

/**
 * Estadísticas derivadas de una partida (recién jugada o histórica) para el
 * modal de resultado. Todo se calcula en el cliente reproduciendo el
 * historial completo de partidas en orden cronológico — el mismo criterio
 * que usa el servidor al recalcular ratings tras un borrado (ver
 * api/games/[id].ts) — así que el resumen es correcto sin importar si la
 * partida se acaba de registrar o es de hace meses, y sin depender del
 * orden de `ratingHistory` (que puede no ser cronológico si se cargó una
 * partida con fecha retroactiva).
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
  /** Todos los jugadores de la liga (sólo se usa para nombre/color). */
  players: Record<string, Player>;
  /** Historial completo de partidas, en cualquier orden. */
  games: Game[];
}

interface ReplayState {
  rating: number;
  peak: number;
  gamesPlayed: number;
  wins: number;
  lastPlayed: number;
}

function createReplayState(): ReplayState {
  return { rating: STARTING_RATING, peak: STARTING_RATING, gamesPlayed: 0, wins: 0, lastPlayed: -Infinity };
}

/** Mapa playerId → posición (1-based), sólo entre jugadores activos a esa fecha. */
function rankSnapshot(
  snapshot: Map<string, ReplayState>,
  asOfDate: number,
  players: Record<string, Player>
): Map<string, number> {
  const active = [...snapshot.entries()].filter(
    ([, s]) => s.gamesPlayed > 0 && asOfDate - s.lastPlayed <= ACTIVE_WINDOW_MS
  );
  active.sort(([idA, a], [idB, b]) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return (players[idA]?.name ?? '').localeCompare(players[idB]?.name ?? '');
  });
  return new Map(active.map(([id], index) => [id, index + 1]));
}

export function buildGameSummaryStats({ game, players, games }: BuildArgs): GameSummaryStats {
  const isTwoPlayerGame = game.twoPlayerGame ?? game.placements.length === 2;

  // Puede que la partida recién registrada todavía no esté en `games`
  // (el estado del padre puede tardar un tick en propagarse).
  const allGames = games.some(g => g.id === game.id) ? games : [...games, game];
  const chronological = [...allGames].sort((a, b) => a.date - b.date || a.id.localeCompare(b.id));

  const state = new Map<string, ReplayState>();
  let before = new Map<string, ReplayState>();
  let after = new Map<string, ReplayState>();
  let streakAtTarget = new Map<string, number>();
  const streaks = new Map<string, number>();
  let gameNumber = 0;

  chronological.forEach((g, index) => {
    if (g.id === game.id) {
      before = new Map([...state.entries()].map(([id, s]) => [id, { ...s }]));
    }

    g.placements.forEach((playerId, placementIndex) => {
      let s = state.get(playerId);
      if (!s) {
        s = createReplayState();
        state.set(playerId, s);
      }
      const change = g.ratingChanges[playerId] ?? 0;
      s.rating += change;
      s.peak = Math.max(s.peak, s.rating);
      s.gamesPlayed += 1;
      s.lastPlayed = g.date;

      const isWin = placementIndex === 0;
      if (isWin) s.wins += 1;
      streaks.set(playerId, isWin ? (streaks.get(playerId) ?? 0) + 1 : 0);
    });

    if (g.id === game.id) {
      after = new Map([...state.entries()].map(([id, s]) => [id, { ...s }]));
      streakAtTarget = new Map(streaks);
      gameNumber = index + 1;
    }
  });

  const beforeRanks = rankSnapshot(before, game.date, players);
  const afterRanks = rankSnapshot(after, game.date, players);

  const rows: PlayerGameSummary[] = game.placements.map((playerId, index) => {
    const ratingChange = game.ratingChanges[playerId] ?? 0;
    const afterState = after.get(playerId);
    const rankBefore = beforeRanks.get(playerId) ?? null;
    const rankAfter = afterRanks.get(playerId) ?? null;
    const rankDelta = rankBefore !== null && rankAfter !== null ? rankBefore - rankAfter : 0;

    // A quiénes pasó: estaban arriba antes y quedaron abajo después.
    const passed =
      rankDelta > 0 && rankBefore !== null && rankAfter !== null
        ? [...beforeRanks.keys()]
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
      afterState !== undefined &&
      Math.round(afterState.rating) >= Math.round(afterState.peak);

    const gamesPlayed = afterState?.gamesPlayed ?? 0;

    return {
      playerId,
      placement: index + 1,
      ratingChange,
      newRating: Math.round(afterState?.rating ?? STARTING_RATING),
      rankBefore,
      rankAfter,
      rankDelta,
      passed,
      isNewPeak,
      wins: afterState?.wins ?? 0,
      gamesPlayed,
      winStreak: streakAtTarget.get(playerId) ?? 0,
      milestone: GAME_MILESTONES.includes(gamesPlayed) ? gamesPlayed : null,
    };
  });

  // Batacazo: el ganador era el de menor rating de la mesa antes de jugar.
  const winnerId = game.placements[0];
  const winnerBefore = before.get(winnerId)?.rating ?? STARTING_RATING;
  const isUpset =
    !isTwoPlayerGame &&
    game.placements.length >= 3 &&
    game.placements
      .filter(id => id !== winnerId)
      .every(id => (before.get(id)?.rating ?? STARTING_RATING) > winnerBefore);

  return { rows, gameNumber, isUpset };
}
