import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../_lib/kv';
import type { Player } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de jugador inválido' });
    }

    if (req.method === 'GET') {
      // Get player by ID
      const player = await kv.get<Player>(KEYS.PLAYER(id));

      if (!player) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
      }

      return res.status(200).json({ player });
    }

    if (req.method === 'PATCH') {
      // Update player
      const player = await kv.get<Player>(KEYS.PLAYER(id));

      if (!player) {
        return res.status(404).json({ error: 'Jugador no encontrado' });
      }

      const { name, color } = req.body;

      // If name is being changed, check for duplicates
      if (name && name !== player.name) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'El nombre del jugador es requerido' });
        }

        const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
        for (const otherId of playerIds) {
          if (otherId === id) continue;
          const existingPlayer = await kv.get<Player>(KEYS.PLAYER(otherId));
          if (existingPlayer && existingPlayer.name.toLowerCase() === name.trim().toLowerCase()) {
            return res.status(400).json({ error: 'Ya existe un jugador con ese nombre' });
          }
        }
      }

      const updatedPlayer: Player = {
        ...player,
        name: name ? name.trim() : player.name,
        color: color !== undefined ? (color || undefined) : player.color,
      };

      await kv.set(KEYS.PLAYER(id), updatedPlayer);

      return res.status(200).json({ player: updatedPlayer });
    }

    return res.status(405).json({ error: 'Método no permitido' });
  } catch (error) {
    console.error('Error in /api/players/[id]:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
