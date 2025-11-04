import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../_lib/kv';
import { calculateEloChanges, applyRatingChanges, getStartingRating } from '../_lib/eloCalculator';
import type { Player, Game, RatingHistoryEntry } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'Se requieren parámetros year y month' });
    }

    const yearNum = parseInt(year as string);
    const monthNum = parseInt(month as string);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: 'Año o mes inválido' });
    }

    // Calculate month boundaries in UTC to avoid timezone issues
    const monthStart = Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0);
    const monthEnd = Date.UTC(yearNum, monthNum, 1, 0, 0, 0, 0);

    // Get all games
    const gameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1) as string[]) || [];
    const allGames: Game[] = [];

    for (const id of gameIds) {
      const game = await kv.get<Game>(KEYS.GAME(String(id)));
      if (game) {
        allGames.push(game);
      }
    }

    // Filter games for the specified month (inclusive of month start, exclusive of next month)
    const monthlyGames = allGames.filter(game => game.date >= monthStart && game.date < monthEnd);

    if (monthlyGames.length === 0) {
      return res.status(200).json({ rankings: [], year: yearNum, month: monthNum, gamesCount: 0 });
    }

    // Sort games by date (ascending)
    monthlyGames.sort((a, b) => a.date - b.date);

    // Get all players who played in this month
    const playerIdsSet = new Set<string>();
    monthlyGames.forEach(game => {
      game.placements.forEach(playerId => playerIdsSet.add(playerId));
    });

    // Initialize players with rating at the start of the month
    const players: Record<string, Player> = {};
    for (const playerId of playerIdsSet) {
      const playerData = await kv.get<Player>(KEYS.PLAYER(playerId));
      if (playerData) {
        const sortedHistory = [...playerData.ratingHistory].sort((a, b) => a.date - b.date);
        let lastBeforeMonth: RatingHistoryEntry | undefined;
        let firstInMonth: RatingHistoryEntry | undefined;

        for (const entry of sortedHistory) {
          if (entry.date < monthStart) {
            lastBeforeMonth = entry;
            continue;
          }

          if (entry.date >= monthStart && entry.date < monthEnd) {
            firstInMonth = entry;
            break;
          }

          if (entry.date >= monthEnd) {
            break;
          }
        }

        let startingRating = getStartingRating();
        if (lastBeforeMonth) {
          startingRating = lastBeforeMonth.rating;
        } else if (firstInMonth) {
          startingRating = firstInMonth.rating - firstInMonth.change;
        }

        players[playerId] = {
          ...playerData,
          currentRating: startingRating,
          gamesPlayed: 0,
          wins: 0,
          ratingHistory: [],
        };
      }
    }

    // Recalculate ELO for the month
    for (const game of monthlyGames) {
      const ratingChanges =
        game.ratingChanges && Object.keys(game.ratingChanges).length > 0
          ? game.ratingChanges
          : calculateEloChanges(game.placements, players);
      const gameWithChanges = { ...game, ratingChanges };
      const updatedPlayers = applyRatingChanges(players, gameWithChanges);
      Object.assign(players, updatedPlayers);
    }

    // Convert to array and sort by rating
    const rankings = Object.values(players).sort((a, b) => b.currentRating - a.currentRating);

    return res.status(200).json({
      rankings,
      year: yearNum,
      month: monthNum,
      gamesCount: monthlyGames.length,
    });
  } catch (error) {
    console.error('Error in /api/rankings/monthly:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
