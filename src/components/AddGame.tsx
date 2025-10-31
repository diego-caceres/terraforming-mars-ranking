import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Player } from '../types';

interface AddGameProps {
  players: Record<string, Player>;
  onSubmit: (placements: string[], gameDate: number, expansions: string[], generations: number | undefined) => void;
  onUndo: () => void;
}

const AVAILABLE_EXPANSIONS = ['Venus', 'Turmoil', 'CEOs', 'Velocity', 'Ares'];

export default function AddGame({ players, onSubmit, onUndo }: AddGameProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [placements, setPlacements] = useState<string[]>([]);
  const [gameDate, setGameDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [generations, setGenerations] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  const playerArray = Object.values(players);
  const availablePlayers = playerArray.filter(p => !selectedPlayers.includes(p.id));

  const handleAddPlayer = (playerId: string) => {
    setSelectedPlayers([...selectedPlayers, playerId]);
    setPlacements([...placements, playerId]);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    setPlacements(placements.filter(id => id !== playerId));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(placements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPlacements(items);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (placements.length < 2) {
      alert('Por favor seleccioná al menos 2 jugadores');
      return;
    }

    // Convert date string to timestamp (avoiding timezone issues)
    // Parse the date as local time at noon to avoid timezone shifts
    const [year, month, day] = gameDate.split('-').map(Number);
    const timestamp = new Date(year, month - 1, day, 12, 0, 0).getTime();

    // Parse generations (optional)
    const generationsNum = generations ? parseInt(generations, 10) : undefined;

    onSubmit(placements, timestamp, selectedExpansions, generationsNum);
    setSelectedPlayers([]);
    setPlacements([]);
    setGameDate(new Date().toISOString().split('T')[0]);
    setSelectedExpansions([]);
    setGenerations('');
    setShowSuccess(true);
    setCanUndo(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCanUndo(false);
    }, 10000); // 10 seconds to undo
  };

  const toggleExpansion = (expansion: string) => {
    setSelectedExpansions(prev =>
      prev.includes(expansion)
        ? prev.filter(e => e !== expansion)
        : [...prev, expansion]
    );
  };

  const handleUndo = () => {
    onUndo();
    setShowSuccess(false);
    setCanUndo(false);
  };

  const handleReset = () => {
    setSelectedPlayers([]);
    setPlacements([]);
  };

  return (
    <div className="tm-card p-6 space-y-6">
      <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
        Registrar Resultado de Partida
      </h2>

      {showSuccess && (
        <div className="rounded-lg border border-tm-teal/40 bg-tm-teal/15 px-4 py-3 text-sm text-tm-teal dark:bg-tm-teal/20 dark:text-tm-glow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="font-semibold uppercase tracking-wide">
              ¡Partida registrada exitosamente! Los ratings han sido actualizados.
            </span>
            {canUndo && (
              <button
                onClick={handleUndo}
                className="tm-button-secondary md:ml-4"
              >
                Deshacer Última Partida
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Game Date */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            Fecha de la Partida
          </label>
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide shadow-inner focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
          />
          <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
            Seleccioná la fecha en que se jugó esta partida
          </p>
        </div>

        {/* Expansions */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            Expansiones Usadas (Opcional)
          </label>
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
            {AVAILABLE_EXPANSIONS.map(expansion => (
              <button
                key={expansion}
                type="button"
                onClick={() => toggleExpansion(expansion)}
                className={`rounded-full px-4 py-1.5 transition-all ${
                  selectedExpansions.includes(expansion)
                    ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg'
                    : 'border border-tm-copper/40 bg-white/75 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand'
                }`}
              >
                {expansion}
              </button>
            ))}
          </div>
        </div>

        {/* Generations */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            Número de Generaciones (Opcional)
          </label>
          <input
            type="number"
            min="1"
            max="16"
            value={generations}
            onChange={(e) => setGenerations(e.target.value)}
            placeholder="Ingresá un número (1-16)"
            className="w-full rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
          />
          <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
            ¿Cuántas generaciones se jugaron en esta partida?
          </p>
        </div>

        {/* Player Selection */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            Seleccionar Jugadores
          </label>
          {availablePlayers.length === 0 ? (
            <p className="text-sm text-tm-oxide/60 dark:text-tm-sand/60">
              {playerArray.length === 0
                ? 'No hay jugadores disponibles. Por favor agregá jugadores primero.'
                : 'Todos los jugadores han sido seleccionados.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleAddPlayer(player.id)}
                  className="rounded-md border border-tm-copper/40 bg-white/75 px-4 py-2 text-tm-oxide transition-all hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60"
                >
                  {player.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Placement Order */}
        {placements.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
              Orden de Posiciones (Arrastrá para reordenar)
            </label>
            <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 mb-3">
              Arriba = 1er lugar, Abajo = Último lugar
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="placements">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 rounded-lg border-2 border-dashed p-4 ${
                      snapshot.isDraggingOver
                        ? 'border-tm-copper bg-tm-copper/10 dark:bg-tm-copper/15'
                        : 'border-tm-copper/40 dark:border-tm-copper/30'
                    }`}
                  >
                    {placements.map((playerId, index) => {
                      const player = players[playerId];
                      return (
                        <Draggable key={playerId} draggableId={playerId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center gap-3 rounded-lg border border-white/20 px-4 py-3 shadow-sm ${
                                snapshot.isDragging
                                  ? 'bg-tm-copper/10 dark:bg-tm-copper/15'
                                  : 'bg-white/90 dark:bg-tm-haze/90'
                              }`}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-tm-copper to-tm-copper-dark text-sm font-bold text-white shadow">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-tm-oxide dark:text-tm-sand">
                                  {player?.name}
                                </div>
                                <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                                  Rating Actual: {Math.round(player?.currentRating || 0)}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(playerId)}
                                className="text-xs font-semibold uppercase tracking-wide text-tm-copper-dark hover:text-tm-copper"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={placements.length < 2}
            className={`flex-1 tm-button-primary justify-center disabled:pointer-events-none ${
              placements.length < 2 ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            Record Game
          </button>
          {placements.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-tm-copper/40 bg-white/75 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-tm-oxide transition-colors hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
