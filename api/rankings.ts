import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from './_lib/kv';
import type { Player } from './_lib/types';

const DAYS_45_MS = 45 * 24 * 60 * 60 * 1000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const activeOnly = req.query.activeOnly === 'true';
    const now = Date.now();

    // Get all players
    const playerIds = (await kv.smembers(KEYS.PLAYERS_ALL) as string[]) || [];
    const players: Player[] = [];

    for (const id of playerIds) {
      const player = await kv.get<Player>(KEYS.PLAYER(id));
      if (player) {
        players.push(player);
      }
    }

    // Filter out players with no games
    let filteredPlayers = players.filter(player => player.gamesPlayed > 0);

    // Filter active players if requested
    if (activeOnly) {
      filteredPlayers = filteredPlayers.filter((player) => {
        if (player.ratingHistory.length === 0) return false;
        const lastGameDate = player.ratingHistory[player.ratingHistory.length - 1]?.date || 0;
        return now - lastGameDate <= DAYS_45_MS;
      });
    }

    // Sort by rating (descending)
    const rankings = filteredPlayers.sort((a, b) => b.currentRating - a.currentRating);

    return res.status(200).json({ rankings });
  } catch (error) {
    console.error('Error in /api/rankings:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
