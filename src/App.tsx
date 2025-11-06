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
import { RankingsProvider } from './contexts/RankingsContext';
import { useDarkMode } from './hooks/useDarkMode';
import { getRankings, getAllPlayers, addPlayer, updatePlayer, recordGame, getAllGames, deleteLastGame, deleteGameById, updateGameMetadata } from './services/apiService';
import { invalidateMonthlyRankingsCache } from './utils/storageUtils';
import type { Player, Game, PlayerColor } from './types';

type Tab = 'rankings' | 'addGame' | 'players' | 'history' | 'settings';

function App() {
  const [darkMode, setDarkMode] = useDarkMode();
  const [activeTab, setActiveTab] = useState<Tab>('rankings');
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [rankings, setRankings] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [activeOnly, setActiveOnly] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const loadData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
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
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [activeOnly]);

  const handleAddPlayer = async (name: string, color?: PlayerColor) => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await addPlayer(name, color);
          await loadData();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al agregar jugador');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await addPlayer(name, color);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar jugador');
    }
  };

  const handleUpdatePlayer = async (playerId: string, updates: { name?: string; color?: PlayerColor }) => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await updatePlayer(playerId, updates);
          await loadData();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al actualizar jugador');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await updatePlayer(playerId, updates);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar jugador');
    }
  };

  const handleRecordGame = async (placements: string[], gameDate: number, expansions: string[], generations: number | undefined) => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await recordGame({ playerIds: placements, placements, expansions, generations }, gameDate);
          invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
          await loadData(true); // Silent reload
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al registrar partida');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await recordGame({ playerIds: placements, placements, expansions, generations }, gameDate);
      invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
      await loadData(true); // Silent reload
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al registrar partida');
    }
  };

  const handleUndoLastGame = async () => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await deleteLastGame();
          invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
          await loadData();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al deshacer última partida');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await deleteLastGame();
      invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al deshacer última partida');
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await deleteGameById(gameId);
          invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
          await loadData();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al eliminar partida');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await deleteGameById(gameId);
      invalidateMonthlyRankingsCache(); // Invalidate cache after mutation
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar partida');
    }
  };

  const handleUpdateGame = async (gameId: string, updates: { expansions?: string[]; generations?: number }) => {
    if (!isAuthenticated) {
      setPendingAction(() => async () => {
        try {
          await updateGameMetadata(gameId, updates);
          await loadData();
        } catch (err) {
          alert(err instanceof Error ? err.message : 'Error al actualizar partida');
        }
      });
      setShowLoginModal(true);
      return;
    }
    try {
      await updateGameMetadata(gameId, updates);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar partida');
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

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <RankingsProvider>
      <div className="min-h-screen bg-white/70 dark:bg-tm-haze/80 backdrop-blur-xl">
      {/* Header */}
      <header className="bg-gradient-to-r from-tm-copper via-tm-copper-dark to-tm-oxide text-white shadow-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-3 sm:py-4 md:py-5">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4">
            <div>
              <p className="tm-card-subtitle text-white/70">Liga Los del Cuadrito</p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading tracking-[0.3em] md:tracking-[0.4em] uppercase">
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
        <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4">
          <div className="flex justify-end py-3 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="main-navigation"
              className="inline-flex items-center gap-2 rounded-md border border-tm-copper/30 bg-white/60 px-3 py-2 text-xs font-heading uppercase tracking-[0.25em] text-tm-oxide/80 transition hover:bg-white/80 dark:border-white/20 dark:bg-tm-haze/70 dark:text-tm-sand/70 dark:hover:bg-tm-haze"
            >
              <span>Menú</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <g>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </g>
                )}
              </svg>
            </button>
          </div>
          <div
            id="main-navigation"
            className={`${isMobileMenuOpen ? 'flex' : 'hidden'} flex-col gap-2 pb-3 md:flex md:flex-row md:items-center md:gap-4 md:pb-0`}
          >
            <button
              onClick={() => handleTabChange('rankings')}
              className={`relative w-full md:w-auto px-3 py-3 text-left md:text-center text-xs sm:text-sm font-heading uppercase tracking-[0.25em] md:tracking-[0.35em] transition-all ${
                activeTab === 'rankings'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Rankings
            </button>
            <button
              onClick={() => handleTabChange('addGame')}
              className={`relative w-full md:w-auto px-3 py-3 text-left md:text-center text-xs sm:text-sm font-heading uppercase tracking-[0.25em] md:tracking-[0.35em] transition-all ${
                activeTab === 'addGame'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Registrar partida
            </button>
            <button
              onClick={() => handleTabChange('players')}
              className={`relative w-full md:w-auto px-3 py-3 text-left md:text-center text-xs sm:text-sm font-heading uppercase tracking-[0.25em] md:tracking-[0.35em] transition-all ${
                activeTab === 'players'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Jugadores
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`relative w-full md:w-auto px-3 py-3 text-left md:text-center text-xs sm:text-sm font-heading uppercase tracking-[0.25em] md:tracking-[0.35em] transition-all ${
                activeTab === 'history'
                  ? 'border-b-3 border-tm-copper text-tm-copper dark:text-tm-glow'
                  : 'border-transparent text-tm-oxide/70 dark:text-tm-sand/60 hover:text-tm-copper dark:hover:text-tm-glow'
              }`}
            >
              Historial
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`relative w-full md:w-auto px-3 py-3 text-left md:text-center text-xs sm:text-sm font-heading uppercase tracking-[0.25em] md:tracking-[0.35em] transition-all ${
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
      <main className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-10 space-y-8">
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
              onClick={() => loadData()}
              className="mt-4 tm-button-primary"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && activeTab === 'rankings' && (
          <div className="space-y-6">
            <StatsOverview games={games} players={players} />
            <Rankings
              players={rankings}
              allPlayers={Object.values(players)}
              allGames={games}
              activeOnly={activeOnly}
              onPlayerClick={handlePlayerClick}
              onToggleActiveFilter={handleToggleActiveFilter}
            />
          </div>
        )}

        {!loading && !error && activeTab === 'addGame' && (
          <AddGame players={players} games={games} onSubmit={handleRecordGame} onUndo={handleUndoLastGame} />
        )}

        {!loading && !error && activeTab === 'players' && (
          <PlayerManagement
            players={players}
            onAddPlayer={handleAddPlayer}
            onPlayerClick={handlePlayerClick}
            onUpdatePlayer={handleUpdatePlayer}
          />
        )}

        {!loading && !error && activeTab === 'history' && (
          <GameHistory games={games} players={players} onDeleteGame={handleDeleteGame} onUpdateGame={handleUpdateGame} />
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
        onLogin={async () => {
          setIsAuthenticated(true);
          setShowLoginModal(false);
          if (pendingAction) {
            await pendingAction();
            setPendingAction(null);
          }
        }}
        onClose={() => {
          setShowLoginModal(false);
          setPendingAction(null);
        }}
      />
      </div>
    </RankingsProvider>
  );
}

export default App;
