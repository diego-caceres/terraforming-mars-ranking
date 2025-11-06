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

    // Get all games sorted by date (ascending)
    const allGameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1) as string[]) || [];
    const allGames: Game[] = [];

    for (const gameId of allGameIds) {
      const g = await kv.get<Game>(KEYS.GAME(String(gameId)));
      if (g) {
        allGames.push(g);
      }
    }

    // Filter out the last game
    const remainingGames = allGames.filter(g => g.id !== lastGameId);

    // Get all players and reset their stats
    const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
    const players: Record<string, Player> = {};

    for (const playerId of playerIds) {
      const player = await kv.get<Player>(KEYS.PLAYER(playerId));
      if (player) {
        const startingRating = getStartingRating();
        players[playerId] = {
          ...player,
          currentRating: startingRating,
          peakRating: startingRating,
          gamesPlayed: 0,
          wins: 0,
          ratingHistory: [],
        };
      }
    }

    // Replay all remaining games
    for (const g of remainingGames) {
      const ratingChanges = calculateEloChanges(g.placements, players);
      const gameWithChanges = { ...g, ratingChanges };
      const updatedPlayers = applyRatingChanges(players, gameWithChanges);
      Object.assign(players, updatedPlayers);
    }

    // Save all updated players
    for (const playerId in players) {
      await kv.set(KEYS.PLAYER(playerId), players[playerId]);
    }

    // Delete the last game
    await kv.del(KEYS.GAME(lastGameId));
    await kv.zrem(KEYS.GAMES_ALL, lastGameId);

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
