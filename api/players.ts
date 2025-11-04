import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from './_lib/kv';
import { getStartingRating } from './_lib/eloCalculator';
import type { Player } from './_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Get all players
      const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
      const players: Player[] = [];

      for (const id of playerIds) {
        const player = await kv.get<Player>(KEYS.PLAYER(id));
        if (player) {
          players.push(player);
        }
      }

      return res.status(200).json({ players });
    }

    if (req.method === 'POST') {
      // Create new player
      const { name, color } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'El nombre del jugador es requerido' });
      }

      // Check for duplicate names (case-insensitive)
      const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
      for (const id of playerIds) {
        const existingPlayer = await kv.get<Player>(KEYS.PLAYER(id));
        if (existingPlayer && existingPlayer.name.toLowerCase() === name.trim().toLowerCase()) {
          return res.status(400).json({ error: 'Ya existe un jugador con ese nombre' });
        }
      }

      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        currentRating: getStartingRating(),
        gamesPlayed: 0,
        wins: 0,
        createdAt: Date.now(),
        ratingHistory: [],
        color: color || undefined,
      };

      // Save player
      await kv.set(KEYS.PLAYER(newPlayer.id), newPlayer);
      await kv.sadd(KEYS.PLAYERS_ALL, newPlayer.id);

      return res.status(201).json({ player: newPlayer });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in /api/players:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
