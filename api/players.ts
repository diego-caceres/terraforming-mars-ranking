import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from './_lib/kv';
import { getStartingRating } from './_lib/eloCalculator';
import type { Player } from './_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Get all players
      const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
      const fetched = await Promise.all(playerIds.map(id => kv.get<Player>(KEYS.PLAYER(id))));
      const players = fetched.filter(Boolean) as Player[];

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
      const existingPlayers = await Promise.all(playerIds.map(id => kv.get<Player>(KEYS.PLAYER(id))));
      const duplicate = existingPlayers.some(p => p && p.name.toLowerCase() === name.trim().toLowerCase());
      if (duplicate) {
        return res.status(400).json({ error: 'Ya existe un jugador con ese nombre' });
      }

      const startingRating = getStartingRating();
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        currentRating: startingRating,
        peakRating: startingRating,
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
