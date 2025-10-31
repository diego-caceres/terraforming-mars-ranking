import { useState } from 'react';
import type { Player } from '../types';

interface PlayerManagementProps {
  players: Record<string, Player>;
  onAddPlayer: (name: string) => void;
  onPlayerClick: (playerId: string) => void;
}

export default function PlayerManagement({ players, onAddPlayer, onPlayerClick }: PlayerManagementProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newPlayerName.trim();

    if (!trimmedName) {
      alert('Por favor ingresá un nombre de jugador');
      return;
    }

    // Check for duplicate names
    const existingPlayer = Object.values(players).find(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingPlayer) {
      alert('Ya existe un jugador con este nombre');
      return;
    }

    onAddPlayer(trimmedName);
    setNewPlayerName('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const playerArray = Object.values(players).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Gestión de Jugadores
      </h2>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          ¡Jugador agregado exitosamente!
        </div>
      )}

      {/* Add Player Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Agregar Nuevo Jugador
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Ingresá el nombre del jugador"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={50}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
          >
            Agregar Jugador
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Los jugadores nuevos empiezan con un rating de 1500
        </p>
      </form>

      {/* Player List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          Todos los Jugadores ({playerArray.length})
        </h3>

        {playerArray.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Aún no hay jugadores. ¡Agregá tu primer jugador arriba!
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {playerArray.map(player => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.id)}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {player.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {player.gamesPlayed} {player.gamesPlayed === 1 ? 'partida jugada' : 'partidas jugadas'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(player.currentRating)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Rating
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
