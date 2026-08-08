import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from './_lib/kv';
import { calculateGameRatingChanges, applyRatingChanges } from './_lib/eloCalculator';
import type { Player, Game, GameResult } from './_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Get all games sorted by date (descending)
      const gameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1, { rev: true }) as string[]) || [];
      const fetched = await Promise.all(gameIds.map(id => kv.get<Game>(KEYS.GAME(String(id)))));
      const games = fetched.filter(Boolean) as Game[];

      return res.status(200).json({ games });
    }

    if (req.method === 'POST') {
      // Record new game
      const { placements, expansions, generations, customDate } = req.body as GameResult & { customDate?: number };

      if (!placements || !Array.isArray(placements) || placements.length < 2) {
        return res.status(400).json({ error: 'Se requieren al menos 2 jugadores' });
      }

      // Validate all players exist and fetch them
      const fetchedPlayers = await Promise.all(placements.map(id => kv.get<Player>(KEYS.PLAYER(id))));
      const players: Record<string, Player> = {};
      for (let i = 0; i < placements.length; i++) {
        if (!fetchedPlayers[i]) {
          return res.status(400).json({ error: `Jugador no encontrado: ${placements[i]}` });
        }
        players[placements[i]] = fetchedPlayers[i]!;
      }

      // Check if this is a 2-player game
      const isTwoPlayerGame = placements.length === 2;

      // Calculate Elo changes (will be zero for 2-player games)
      const ratingChanges = calculateGameRatingChanges(placements, players, isTwoPlayerGame);

      // Create game object
      const newGame: Game = {
        id: crypto.randomUUID(),
        date: customDate || Date.now(),
        placements,
        ratingChanges,
        expansions,
        generations,
        twoPlayerGame: isTwoPlayerGame,
      };

      // Apply rating changes to players (skips for 2-player games)
      const updatedPlayers = applyRatingChanges(players, newGame);

      // Save game (using sorted set for date ordering)
      await kv.set(KEYS.GAME(newGame.id), newGame);
      await kv.zadd(KEYS.GAMES_ALL, { score: newGame.date, member: newGame.id });

      // Save updated players
      await Promise.all(placements.map(id => kv.set(KEYS.PLAYER(id), updatedPlayers[id])));

      return res.status(201).json({ game: newGame, players: updatedPlayers });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in /api/games:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
