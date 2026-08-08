import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../_lib/kv';
import { calculateGameRatingChanges, applyRatingChanges, getStartingRating } from '../_lib/eloCalculator';
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
      const fetchedGames = await Promise.all(gameIds.map(gid => kv.get<Game>(KEYS.GAME(String(gid)))));
      const remainingGames = (fetchedGames.filter(Boolean) as Game[]).filter(g => g.id !== id);

      // Get all players and reset their stats
      const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
      const fetchedPlayers = await Promise.all(playerIds.map(pid => kv.get<Player>(KEYS.PLAYER(pid))));
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

      // Replay all remaining games, persisting each one's recalculated
      // ratingChanges so it never goes stale relative to the players'
      // ratingHistory (which this same loop also rebuilds from scratch).
      const updatedGames: Game[] = [];
      for (const g of remainingGames) {
        const isTwoPlayerGame = g.twoPlayerGame ?? g.placements.length === 2;
        const ratingChanges = calculateGameRatingChanges(g.placements, players, isTwoPlayerGame);
        const gameWithChanges: Game = { ...g, ratingChanges };
        const updatedPlayers = applyRatingChanges(players, gameWithChanges);

        // Update local copy
        Object.assign(players, updatedPlayers);
        updatedGames.push(gameWithChanges);
      }

      // Save all updated players, updated games, delete the game — all in parallel
      await Promise.all([
        ...Object.keys(players).map(pid => kv.set(KEYS.PLAYER(pid), players[pid])),
        ...updatedGames.map(g => kv.set(KEYS.GAME(g.id), g)),
        kv.del(KEYS.GAME(id)),
        kv.zrem(KEYS.GAMES_ALL, id),
      ]);

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
