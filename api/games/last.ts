import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../_lib/kv';
import { calculateEloChanges, applyRatingChanges, getStartingRating } from '../_lib/eloCalculator';
import type { Player, Game } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'DELETE') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    // Get the most recent game
    const gameIds = (await kv.zrange(KEYS.GAMES_ALL, -1, -1, { rev: true }) as string[]) || [];
    if (gameIds.length === 0) {
      return res.status(404).json({ error: 'No hay partidas para eliminar' });
    }

    const lastGameId = String(gameIds[0]);
    const lastGame = await kv.get<Game>(KEYS.GAME(lastGameId));

    if (!lastGame) {
      return res.status(404).json({ error: 'Última partida no encontrada' });
    }

    // Fetch all games and all players in parallel
    const [allGameIds, playerIds] = await Promise.all([
      kv.zrange(KEYS.GAMES_ALL, 0, -1) as Promise<string[]>,
      kv.smembers(KEYS.PLAYERS_ALL) as Promise<string[]>,
    ]);

    const [fetchedGames, fetchedPlayers] = await Promise.all([
      Promise.all((allGameIds || []).map(gid => kv.get<Game>(KEYS.GAME(String(gid))))),
      Promise.all((playerIds || []).map(pid => kv.get<Player>(KEYS.PLAYER(pid)))),
    ]);

    const remainingGames = (fetchedGames.filter(Boolean) as Game[]).filter(g => g.id !== lastGameId);

    const players: Record<string, Player> = {};
    const startingRating = getStartingRating();
    for (const player of fetchedPlayers) {
      if (player) {
        players[player.id] = {
          ...player,
          currentRating: startingRating,
          peakRating: startingRating,
          gamesPlayed: 0,
          wins: 0,
          ratingHistory: [],
        };
      }
    }

    // Replay all remaining games (must be sequential — each depends on prior ratings)
    for (const g of remainingGames) {
      const ratingChanges = calculateEloChanges(g.placements, players);
      const gameWithChanges = { ...g, ratingChanges };
      const updatedPlayers = applyRatingChanges(players, gameWithChanges);
      Object.assign(players, updatedPlayers);
    }

    // Save all updated players and delete the game — all in parallel
    await Promise.all([
      ...Object.keys(players).map(pid => kv.set(KEYS.PLAYER(pid), players[pid])),
      kv.del(KEYS.GAME(lastGameId)),
      kv.zrem(KEYS.GAMES_ALL, lastGameId),
    ]);

    return res.status(200).json({
      message: 'Última partida eliminada',
      deletedGame: lastGame,
      players
    });
  } catch (error) {
    console.error('Error in /api/games/last:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
