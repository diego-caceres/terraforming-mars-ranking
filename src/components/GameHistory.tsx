import { useState } from 'react';
import type { Game, Player } from '../types';

interface GameHistoryProps {
  games: Game[];
  players: Record<string, Player>;
}

export default function GameHistory({ games, players }: GameHistoryProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlayerName = (playerId: string) => {
    return players[playerId]?.name || 'Unknown Player';
  };

  const handleGameClick = (game: Game) => {
    setSelectedGame(selectedGame?.id === game.id ? null : game);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Game History
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {games.length} game{games.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {games.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
          No games recorded yet. Record your first game to see it here!
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {games.map((game) => {
            const isExpanded = selectedGame?.id === game.id;
            const winner = players[game.placements[0]];

            return (
              <div key={game.id}>
                <div
                  onClick={() => handleGameClick(game)}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(game.date)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(game.date)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {game.placements.length} players
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Winner: <span className="font-semibold text-gray-900 dark:text-gray-100">{winner?.name}</span>
                      </div>
                    </div>
                    <div className="text-gray-400 dark:text-gray-500">
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                      Final Standings
                    </h3>
                    <div className="space-y-2">
                      {game.placements.map((playerId, index) => {
                        const player = players[playerId];
                        const ratingChange = game.ratingChanges[playerId] || 0;

                        return (
                          <div
                            key={playerId}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                  index === 0
                                    ? 'bg-yellow-500 text-white'
                                    : index === 1
                                    ? 'bg-gray-400 text-white'
                                    : index === 2
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {player?.name || 'Unknown'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Rating after game: {Math.round((player?.currentRating || 0))}
                                </div>
                              </div>
                            </div>
                            <div
                              className={`text-sm font-bold ${
                                ratingChange > 0
                                  ? 'text-green-600 dark:text-green-400'
                                  : ratingChange < 0
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {ratingChange > 0 ? '+' : ''}
                              {ratingChange}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Game Details */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Game ID:</span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100 font-mono text-xs">
                            {game.id}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Players:</span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {game.placements.map(id => getPlayerName(id)).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
