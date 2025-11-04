import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv, KEYS } from '../../_lib/kv';
import type { Player, Game } from '../../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'ID de jugador inválido' });
    }

    // Get player
    const player = await kv.get<Player>(KEYS.PLAYER(id));
    if (!player) {
      return res.status(404).json({ error: 'Jugador no encontrado' });
    }

    // Get all games for this player
    const gameIds = (await kv.zrange(KEYS.GAMES_ALL, 0, -1, { rev: true }) as string[]) || [];
    const playerGames: Game[] = [];

    for (const gameId of gameIds) {
      const game = await kv.get<Game>(KEYS.GAME(String(gameId)));
      if (game && game.placements.includes(id)) {
        playerGames.push(game);
      }
    }

    // Calculate stats
    let totalPlacement = 0;
    playerGames.forEach((game) => {
      const placement = game.placements.indexOf(id);
      totalPlacement += placement + 1; // +1 because 0-indexed
    });

    const averagePlacement = playerGames.length > 0 ? totalPlacement / playerGames.length : 0;
    const winRate = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed) * 100 : 0;
    const lastGameDate = playerGames.length > 0 ? playerGames[0].date : null;

    // Get recent games (last 10)
    const recentGames = playerGames.slice(0, 10);

    // Get all unique player IDs from player's games
    const allPlayerIds = new Set<string>();
    playerGames.forEach(game => {
      game.placements.forEach(playerId => allPlayerIds.add(playerId));
    });

    // Fetch player names
    const playerNames: Record<string, string> = {};
    for (const playerId of allPlayerIds) {
      const p = await kv.get<Player>(KEYS.PLAYER(playerId));
      if (p) {
        playerNames[playerId] = p.name;
      }
    }

    // Calculate head-to-head records
    const headToHead: Record<string, { wins: number; losses: number; ties: number; gamesPlayed: number }> = {};

    for (const game of playerGames) {
      const playerIndex = game.placements.indexOf(id);

      for (const opponentId of game.placements) {
        if (opponentId === id) continue;

        if (!headToHead[opponentId]) {
          headToHead[opponentId] = { wins: 0, losses: 0, ties: 0, gamesPlayed: 0 };
        }

        const opponentIndex = game.placements.indexOf(opponentId);

        if (playerIndex < opponentIndex) {
          headToHead[opponentId].wins++;
        } else if (playerIndex > opponentIndex) {
          headToHead[opponentId].losses++;
        } else {
          headToHead[opponentId].ties++;
        }

        headToHead[opponentId].gamesPlayed++;
      }
    }

    // Get opponent names
    const headToHeadWithNames = await Promise.all(
      Object.entries(headToHead).map(async ([opponentId, record]) => {
        const opponent = await kv.get<Player>(KEYS.PLAYER(opponentId));
        return {
          opponentId,
          opponentName: opponent?.name || 'Desconocido',
          ...record,
        };
      })
    );

    return res.status(200).json({
      player,
      winRate,
      averagePlacement,
      lastGameDate,
      recentGames,
      headToHead: headToHeadWithNames,
      playerNames,
    });
  } catch (error) {
    console.error('Error in /api/players/[id]/stats:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
