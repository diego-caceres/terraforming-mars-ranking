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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Registrar Resultado de Partida
      </h2>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <span>¡Partida registrada exitosamente! Los ratings han sido actualizados.</span>
            {canUndo && (
              <button
                onClick={handleUndo}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors text-sm"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de la Partida
          </label>
          <input
            type="date"
            value={gameDate}
            onChange={(e) => setGameDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Seleccioná la fecha en que se jugó esta partida
          </p>
        </div>

        {/* Expansions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Expansiones Usadas (Opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_EXPANSIONS.map(expansion => (
              <button
                key={expansion}
                type="button"
                onClick={() => toggleExpansion(expansion)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  selectedExpansions.includes(expansion)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {expansion}
              </button>
            ))}
          </div>
        </div>

        {/* Generations */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Generaciones (Opcional)
          </label>
          <input
            type="number"
            min="1"
            max="16"
            value={generations}
            onChange={(e) => setGenerations(e.target.value)}
            placeholder="Ingresá un número (1-16)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ¿Cuántas generaciones se jugaron en esta partida?
          </p>
        </div>

        {/* Player Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar Jugadores
          </label>
          {availablePlayers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {playerArray.length === 0
                ? 'No hay jugadores disponibles. Por favor agregá jugadores primero.'
                : 'Todos los jugadores han sido seleccionados.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleAddPlayer(player.id)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors text-sm font-medium"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Orden de Posiciones (Arrastrá para reordenar)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Arriba = 1er lugar, Abajo = Último lugar
            </p>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="placements">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-2 p-4 rounded-md border-2 border-dashed ${
                      snapshot.isDraggingOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
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
                              className={`flex items-center gap-3 p-3 rounded-md ${
                                snapshot.isDragging
                                  ? 'bg-blue-100 dark:bg-blue-900 shadow-lg'
                                  : 'bg-white dark:bg-gray-700 shadow'
                              }`}
                            >
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {player?.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Rating Actual: {Math.round(player?.currentRating || 0)}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(playerId)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
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
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
          >
            Record Game
          </button>
          {placements.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
