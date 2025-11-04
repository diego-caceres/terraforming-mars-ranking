import { useState, useEffect } from 'react';
import Rankings from './components/Rankings';
import AddGame from './components/AddGame';
import PlayerManagement from './components/PlayerManagement';
import PlayerStats from './components/PlayerStats';
import GameHistory from './components/GameHistory';
import DarkModeToggle from './components/common/DarkModeToggle';
import ExportImport from './components/common/ExportImport';
import LoginModal from './components/common/LoginModal';
import StatsOverview from './components/common/StatsOverview';
import { useDarkMode } from './hooks/useDarkMode';
import { getRankings, getAllPlayers, addPlayer, recordGame, getAllGames, deleteLastGame, deleteGameById } from './services/apiService';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allPlayers, rankedPlayers, allGames] = await Promise.all([
        getAllPlayers(),
        getRankings(activeOnly),
        getAllGames(),
      ]);

      const playersRecord: Record<string, Player> = {};
      allPlayers.forEach(player => {
        playersRecord[player.id] = player;
      });

      setPlayers(playersRecord);
      setRankings(rankedPlayers);
      setGames(allGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOnly]);

  const handleAddPlayer = async (name: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await addPlayer(name);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar jugador');
    }
  };

  const handleRecordGame = async (placements: string[], gameDate: number, expansions: string[], generations: number | undefined) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await recordGame({ playerIds: placements, placements, expansions, generations }, gameDate);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al registrar partida');
    }
  };

  const handleUndoLastGame = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await deleteLastGame();
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al deshacer última partida');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    try {
      await deleteGameById(gameId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar partida');
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
    <div className="min-h-screen bg-white/70 dark:bg-tm-haze/80 backdrop-blur-xl">
      {/* Header */}
      <header className="bg-gradient-to-r from-tm-copper via-tm-copper-dark to-tm-oxide text-white shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <p className="tm-card-subtitle text-white/70">Liga Los del Cuadrito</p>
              <h1 className="text-3xl md:text-4xl font-heading tracking-[0.4em] uppercase">
              Terraforming Mars
            </h1>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="tm-button-secondary border-white/40 bg-white/10 hover:bg-white/20"
                >
                  Cerrar sesión
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="tm-button-secondary border-white/30 bg-white/15 hover:bg-white/25"
                >
                  Iniciar sesión
                </button>
              )}
              <DarkModeToggle darkMode={darkMode} onToggle={handleToggleDarkMode} />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-tm-copper/30 bg-white/85 dark:bg-tm-haze/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab('rankings')}
              className={`relative px-4 py-4 text-xs sm:text-sm font-heading uppercase tracking-[0.35em] transition-all ${
                activeTab === 'rankings'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Rankings
            </button>
            <button
              onClick={() => setActiveTab('addGame')}
              className={`relative px-4 py-4 text-xs sm:text-sm font-heading uppercase tracking-[0.35em] transition-all ${
                activeTab === 'addGame'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Registrar partida
            </button>
            <button
              onClick={() => setActiveTab('players')}
              className={`relative px-4 py-4 text-xs sm:text-sm font-heading uppercase tracking-[0.35em] transition-all ${
                activeTab === 'players'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Jugadores
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`relative px-4 py-4 text-xs sm:text-sm font-heading uppercase tracking-[0.35em] transition-all ${
                activeTab === 'history'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Historial
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`relative px-4 py-4 text-xs sm:text-sm font-heading uppercase tracking-[0.35em] transition-all ${
                activeTab === 'settings'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Configuración
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tm-copper"></div>
          </div>
        )}

        {error && (
          <div className="tm-card p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <p className="text-red-800 dark:text-red-200">
              <strong>Error:</strong> {error}
            </p>
            <button
              onClick={loadData}
              className="mt-4 tm-button-primary"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && activeTab === 'rankings' && (
          <div className="space-y-6">
            <StatsOverview games={games} players={players} />
            <div className="flex justify-end">
              <button
                onClick={handleToggleActiveFilter}
                className={`rounded-md px-5 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-200 ${
                  activeOnly
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/80 text-tm-oxide dark:bg-tm-haze/80 dark:text-tm-sand hover:bg-white'
                }`}
              >
                {activeOnly ? 'Mostrando Jugadores Activos' : 'Mostrar Solo Activos'}
              </button>
            </div>
            <Rankings
              players={rankings}
              activeOnly={activeOnly}
              onPlayerClick={handlePlayerClick}
            />
          </div>
        )}

        {!loading && !error && activeTab === 'addGame' && (
          <AddGame players={players} onSubmit={handleRecordGame} onUndo={handleUndoLastGame} />
        )}

        {!loading && !error && activeTab === 'players' && (
          <PlayerManagement
            players={players}
            onAddPlayer={handleAddPlayer}
            onPlayerClick={handlePlayerClick}
          />
        )}

        {!loading && !error && activeTab === 'history' && (
          <GameHistory games={games} players={players} onDeleteGame={handleDeleteGame} />
        )}

        {!loading && !error && activeTab === 'settings' && (
          <div className="space-y-6">
            <ExportImport 
              onImportSuccess={handleImportSuccess}
              isAuthenticated={isAuthenticated}
              onAuthenticationRequired={() => setShowLoginModal(true)}
            />

            <div className="tm-card p-6 space-y-4">
              <h3 className="text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
                Acerca del Sistema Elo
              </h3>
              <div className="space-y-3 text-sm text-tm-oxide/80 dark:text-tm-sand/80">
                <div>
                  <h4 className="font-semibold text-tm-oxide dark:text-tm-sand mb-2">Características principales:</h4>
                  <ul className="ml-4 space-y-1 marker:text-tm-copper list-disc">
                    <li><strong>K-Factor: 40</strong> - Determina qué tan rápido cambian los ratings después de cada partida</li>
                    <li><strong>Rating Inicial: 1500</strong> - Todos los jugadores nuevos empiezan con este puntaje</li>
                    <li><strong>Umbral de Confianza: 10 partidas</strong> - Los jugadores con menos de 10 partidas se marcan como "Nuevo"</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-tm-oxide dark:text-tm-sand mb-2">Cómo funciona:</h4>
                  <p className="mb-2">
                    En este sistema multijugador, cada jugador es comparado contra <strong>todos los demás jugadores</strong> en la partida.
                    Para cada par de jugadores:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Se calcula la <strong>probabilidad esperada</strong> de ganar basada en la diferencia de ratings</li>
                    <li>Se determina el <strong>resultado real</strong>: 1.0 = victoria, 0.5 = empate, 0.0 = derrota</li>
                    <li>El cambio de rating se calcula como: <code className="rounded bg-tm-copper/20 px-1 text-xs font-mono uppercase tracking-wide dark:bg-tm-haze/80">Cambio = K × (Resultado Real - Resultado Esperado)</code></li>
                    <li>Se suman todos los cambios de cada comparación para obtener el cambio total del jugador</li>
                  </ol>
                </div>

                <div className="rounded-md border border-tm-copper/30 bg-tm-copper/10 p-4 text-sm text-tm-oxide dark:border-white/10 dark:bg-tm-haze/70 dark:text-tm-sand">
                  <p className="font-semibold text-tm-oxide dark:text-tm-sand">
                    <strong>Ejemplo:</strong> Si terminás 1° en una partida de 4 jugadores, tu rating aumenta más si venciste
                    a jugadores con rating alto que si venciste a jugadores con rating bajo. El sistema recompensa ganarle a
                    oponentes fuertes y penaliza perder contra oponentes débiles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Player Stats Modal */}
      {selectedPlayerId && (
        <PlayerStats playerId={selectedPlayerId} onClose={handleClosePlayerStats} />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={() => {
          setIsAuthenticated(true);
          setShowLoginModal(false);
        }}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default App;
