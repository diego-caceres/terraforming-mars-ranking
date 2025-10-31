import { useState, useEffect } from 'react';
import Rankings from './components/Rankings';
import AddGame from './components/AddGame';
import PlayerManagement from './components/PlayerManagement';
import PlayerStats from './components/PlayerStats';
import GameHistory from './components/GameHistory';
import DarkModeToggle from './components/common/DarkModeToggle';
import ExportImport from './components/common/ExportImport';
import StatsOverview from './components/common/StatsOverview';
import { useDarkMode } from './hooks/useDarkMode';
import { getRankings, getAllPlayers, addPlayer, recordGame, getAllGames, deleteLastGame, deleteGameById } from './services/storageService';
import type { Player, Game } from './types';

type Tab = 'rankings' | 'addGame' | 'players' | 'history' | 'settings';

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [activeTab, setActiveTab] = useState<Tab>('rankings');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [rankings, setRankings] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  const loadData = () => {
    const allPlayers = getAllPlayers();
    const rankedPlayers = getRankings(activeOnly);
    const allGames = getAllGames();
    setPlayers(allPlayers);
    setRankings(rankedPlayers);
    setGames(allGames);
  };

  useEffect(() => {
    loadData();
  }, [activeOnly]);

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
    loadData();
  };

  const handleRecordGame = (placements: string[], gameDate: number) => {
    recordGame({ playerIds: placements, placements }, gameDate);
    loadData();
  };

  const handleUndoLastGame = () => {
    const success = deleteLastGame();
    if (success) {
      loadData();
    }
  };

  const handleDeleteGame = (gameId: string) => {
    const success = deleteGameById(gameId);
    if (success) {
      loadData();
    }
  };

  const handlePlayerClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleClosePlayerStats = () => {
    setSelectedPlayerId(null);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleImportSuccess = () => {
    loadData();
  };

  const handleToggleActiveFilter = () => {
    setActiveOnly(!activeOnly);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Board Game Rankings
            </h1>
            <DarkModeToggle darkMode={darkMode} onToggle={handleToggleDarkMode} />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rankings')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'rankings'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Rankings
            </button>
            <button
              onClick={() => setActiveTab('addGame')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'addGame'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Add Game
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'players'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            <StatsOverview games={games} players={players} />
            <div className="flex justify-end">
              <button
                onClick={handleToggleActiveFilter}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeOnly
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {activeOnly ? 'Showing Active Players' : 'Show Active Only'}
              </button>
            </div>
            <Rankings
              players={rankings}
              activeOnly={activeOnly}
              onPlayerClick={handlePlayerClick}
            />
          </div>
        )}

        {activeTab === 'addGame' && (
          <AddGame players={players} onSubmit={handleRecordGame} onUndo={handleUndoLastGame} />
        )}

        {activeTab === 'players' && (
          <PlayerManagement
            players={players}
            onAddPlayer={handleAddPlayer}
            onPlayerClick={handlePlayerClick}
          />
        )}

        {activeTab === 'history' && (
          <GameHistory games={games} players={players} onDeleteGame={handleDeleteGame} />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <ExportImport onImportSuccess={handleImportSuccess} />

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                About the Elo System
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>K-Factor:</strong> 40 (determines how much ratings change per game)
                </p>
                <p>
                  <strong>Starting Rating:</strong> 1500 for all new players
                </p>
                <p>
                  <strong>Calculation:</strong> Each player is compared against every other player in the game
                </p>
                <p>
                  <strong>Confidence:</strong> Players with fewer than 10 games are marked as "New"
                </p>
                <p className="mt-4">
                  This multiplayer Elo system calculates rating changes by comparing each player's
                  placement against all other players in the game. Players who place higher gain more
                  points, especially when beating higher-rated opponents.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Player Stats Modal */}
      {selectedPlayerId && (
        <PlayerStats playerId={selectedPlayerId} onClose={handleClosePlayerStats} />
      )}
    </div>
  );
}

export default App;
