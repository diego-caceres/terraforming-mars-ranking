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
    <div className="tm-card p-6 space-y-6">
      <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
        Gestión de Jugadores
      </h2>

      {showSuccess && (
        <div className="rounded-lg border border-tm-teal/40 bg-tm-teal/15 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-tm-teal dark:bg-tm-teal/20 dark:text-tm-glow">
          ¡Jugador agregado exitosamente!
        </div>
      )}

      {/* Add Player Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70">
          Agregar Nuevo Jugador
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Ingresá el nombre del jugador"
            className="flex-1 rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
            maxLength={50}
          />
          <button
            type="submit"
            className="tm-button-primary"
          >
            Agregar Jugador
          </button>
        </div>
        <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
          Los jugadores nuevos empiezan con un rating de 1500
        </p>
      </form>

      {/* Player List */}
      <div className="space-y-3">
        <h3 className="text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
          Todos los Jugadores ({playerArray.length})
        </h3>

        {playerArray.length === 0 ? (
          <p className="text-sm text-tm-oxide/60 dark:text-tm-sand/60">
            Aún no hay jugadores. ¡Agregá tu primer jugador arriba!
          </p>
        ) : (
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {playerArray.map(player => (
              <div
                key={player.id}
                onClick={() => onPlayerClick(player.id)}
                className="flex items-center justify-between rounded-lg border border-tm-copper/30 bg-white/80 px-4 py-3 transition-colors hover:bg-white dark:border-white/10 dark:bg-tm-haze/80 dark:hover:bg-tm-haze/70 cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-tm-oxide dark:text-tm-sand">
                    {player.name}
                  </div>
                  <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 uppercase tracking-wide">
                    {player.gamesPlayed} {player.gamesPlayed === 1 ? 'partida jugada' : 'partidas jugadas'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-tm-oxide dark:text-tm-glow">
                    {Math.round(player.currentRating)}
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-[0.2em] text-tm-oxide/60 dark:text-tm-sand/60">
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
