import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../_lib/kv';
import { calculateEloChanges, applyRatingChanges, getStartingRating } from '../_lib/eloCalculator';
import type { Player, Game } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de partida inválido' });
    }

    if (req.method === 'GET') {
      // Get specific game
      const game = await kv.get<Game>(KEYS.GAME(id));
      if (!game) {
        return res.status(404).json({ error: 'Partida no encontrada' });
      }
      return res.status(200).json({ game });
    }

    if (req.method === 'PUT') {
      // Update game metadata (only expansions and generations, not player order)
      const game = await kv.get<Game>(KEYS.GAME(id));
      if (!game) {
        return res.status(404).json({ error: 'Partida no encontrada' });
      }

      const { expansions, generations } = req.body;

      // Validate generations if provided
      if (generations !== undefined) {
        if (typeof generations !== 'number' || generations < 1 || generations > 16) {
          return res.status(400).json({ error: 'Las generaciones deben ser un número entre 1 y 16' });
        }
      }

      // Validate expansions if provided
      if (expansions !== undefined) {
        if (!Array.isArray(expansions)) {
          return res.status(400).json({ error: 'Las expansiones deben ser un array' });
        }
      }

      // Update only metadata fields
      const updatedGame: Game = {
        ...game,
        ...(expansions !== undefined && { expansions }),
        ...(generations !== undefined && { generations }),
      };

      // Save updated game
      await kv.set(KEYS.GAME(id), updatedGame);

      return res.status(200).json({
        message: 'Partida actualizada',
        game: updatedGame
      });
    }

    if (req.method === 'DELETE') {
      // Delete game and recalculate all ratings
      const game = await kv.get<Game>(KEYS.GAME(id));
      if (!game) {
        return res.status(404).json({ error: 'Partida no encontrada' });
      }

      // Get all games sorted by date (ascending)
      const gameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1) as string[]) || [];
      const allGames: Game[] = [];

      for (const gameId of gameIds) {
        const g = await kv.get<Game>(KEYS.GAME(String(gameId)));
        if (g) {
          allGames.push(g);
        }
      }

      // Filter out the deleted game
      const remainingGames = allGames.filter(g => g.id !== id);

      // Get all players and reset their stats
      const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
      const players: Record<string, Player> = {};

      for (const playerId of playerIds) {
        const player = await kv.get<Player>(KEYS.PLAYER(playerId));
        if (player) {
          // Reset to initial state
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

        // Update local copy
        Object.assign(players, updatedPlayers);
      }

      // Save all updated players
      for (const playerId in players) {
        await kv.set(KEYS.PLAYER(playerId), players[playerId]);
      }

      // Delete the game
      await kv.del(KEYS.GAME(id));
      await kv.zrem(KEYS.GAMES_ALL, id);

      return res.status(200).json({
        message: 'Partida eliminada y ratings recalculados',
        players
      });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in /api/games/[id]:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
