import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import type { Player, Game } from '../types';
import { getColorClasses } from '../utils/colorUtils';
import { getPodiumClasses } from '../utils/podiumUtils';
import { useI18n, getRelativeTimeString, formatDate as formatLocalizedDate } from '../i18n';
import GameResultModal from './common/GameResultModal';
import {
  getDefaultGameDate,
  getMontevideoToday,
  getMontevideoYesterday,
  isLateNightInMontevideo,
  dateInputToTimestamp,
} from '../utils/gameDateUtils';

interface AddGameProps {
  players: Record<string, Player>;
  games: Game[];
  onSubmit: (placements: string[], gameDate: number, expansions: string[], generations: number | undefined) => Promise<{ game: Game; players: Record<string, Player> } | null>;
  onUndo: () => void;
}

const AVAILABLE_EXPANSIONS = ['Venus', 'Turmoil', 'CEOs', 'Velocity', 'Ares', 'Pathfinders', 'Colonies', 'The Moon'];

export default function AddGame({ players, games, onSubmit, onUndo }: AddGameProps) {
  const { t, language } = useI18n();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [placements, setPlacements] = useState<string[]>([]);
  const [viewingGame, setViewingGame] = useState<Game | null>(null);
  // Snapshot de jugadores devuelto junto con la partida recién registrada.
  // Se usa (mezclado sobre `players`) sólo para esa partida puntual, así el
  // modal muestra el rating correcto al instante, sin depender de que el
  // prop `players` del padre ya se haya refrescado.
  const [viewingGamePlayers, setViewingGamePlayers] = useState<Record<string, Player> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameDate, setGameDate] = useState<string>(() => getDefaultGameDate());
  const [showDateOptions, setShowDateOptions] = useState(false);
  // Una vez que el usuario abre las opciones de fecha, la elige él: no tiene
  // sentido seguir explicándole la preselección de madrugada.
  const [dateTouched, setDateTouched] = useState(false);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>(() => games[0]?.expansions ?? []);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (placements.length < 2) {
      alert(t.addGame.selectAtLeastTwoPlayers);
      return;
    }

    // Convert date string to timestamp (avoiding timezone issues)
    // Parse the date as local time at noon to avoid timezone shifts
    const timestamp = dateInputToTimestamp(gameDate);

    // Parse generations (optional)
    const generationsNum = generations ? parseInt(generations, 10) : undefined;
    const usedExpansions = [...selectedExpansions];

    setIsSubmitting(true);
    const result = await onSubmit(placements, timestamp, selectedExpansions, generationsNum);
    setIsSubmitting(false);
    setSelectedPlayers([]);
    setPlacements([]);
    setGameDate(getDefaultGameDate());
    setShowDateOptions(false);
    setDateTouched(false);
    setSelectedExpansions(usedExpansions);
    setGenerations('');
    if (result) {
      setViewingGame(result.game);
      setViewingGamePlayers(result.players);
    } else {
      setShowSuccess(true);
      setCanUndo(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCanUndo(false);
      }, 10000); // 10 seconds to undo
    }
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

  // Get last 5 games
  const recentGames = games.slice(0, 5);

  const formatDate = (timestamp: number) => {
    return getRelativeTimeString(timestamp, language);
  };

  const getPlayerName = (playerId: string) => {
    return players[playerId]?.name || t.addGame.unknown;
  };

  // Fecha de la partida: se preselecciona según la hora en Montevideo
  const todayStr = getMontevideoToday();
  const yesterdayStr = getMontevideoYesterday();
  const isLateNight = isLateNightInMontevideo();
  const gameDateShortcut =
    gameDate === todayStr ? t.addGame.gameDateToday
    : gameDate === yesterdayStr ? t.addGame.gameDateYesterday
    : null;
  const gameDateFormatted = formatLocalizedDate(new Date(dateInputToTimestamp(gameDate)), language, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="space-y-6">

      {/* Game Result Modal */}
      {viewingGame && (
        <GameResultModal
          game={viewingGame}
          players={viewingGamePlayers ? { ...players, ...viewingGamePlayers } : players}
          games={games}
          onClose={() => {
            setViewingGame(null);
            setViewingGamePlayers(null);
          }}
        />
      )}
      {/* Recent Games Summary */}
      {recentGames.length > 0 && (
        <div className="tm-card p-4">
          <h3 className="text-sm font-heading uppercase tracking-[0.25em] text-tm-oxide/70 dark:text-tm-sand/70 mb-3">
            {t.addGame.recentGamesTitle}
          </h3>
          <div className="space-y-2">
            {recentGames.map((game) => (
              <div
                key={game.id}
                onClick={() => { setViewingGame(game); setViewingGamePlayers(null); }}
                className="flex items-center justify-between text-xs border-l-2 border-tm-copper/40 pl-3 py-1.5 cursor-pointer rounded-r-md transition-colors hover:bg-tm-copper/10 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <span className="text-tm-oxide/60 dark:text-tm-sand/60 font-medium min-w-[3rem]">
                    {formatDate(game.date)}
                  </span>
                  <span className="text-tm-oxide dark:text-tm-sand">
                    <span className="font-semibold text-tm-copper">{getPlayerName(game.placements[0])}</span>
                    {game.placements.length > 1 && (
                      <span className="text-tm-oxide/60 dark:text-tm-sand/60">
                        {t.addGame.vs}
                        {game.placements.slice(1).map((id, idx) => (
                          <span key={id}>
                            {idx > 0 && ', '}
                            {getPlayerName(id)}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </div>
                {game.expansions && game.expansions.length > 0 && (
                  <div className="flex gap-1">
                    {game.expansions.map((exp) => (
                      <span
                        key={exp}
                        className="text-[0.65rem] px-1.5 py-0.5 rounded bg-tm-copper/20 text-tm-copper-dark dark:bg-tm-glow/20 dark:text-tm-glow"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Game Form */}
      <div className="tm-card p-6 space-y-6">
        <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
          {t.addGame.title}
        </h2>

      {showSuccess && (
        <div className="rounded-lg border border-tm-teal/40 bg-tm-teal/15 px-4 py-3 text-sm text-tm-teal dark:bg-tm-teal/20 dark:text-tm-glow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span className="font-semibold uppercase tracking-wide">
              {t.addGame.successMessage}
            </span>
            {canUndo && (
              <button
                onClick={handleUndo}
                className="tm-button-secondary md:ml-4"
              >
                {t.addGame.undoButton}
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Game Date */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            {t.addGame.gameDateLabel}
          </label>

          {/* Fecha preseleccionada: se muestra como texto, con opción discreta de cambiarla */}
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-tm-oxide dark:text-tm-sand">
            {gameDateShortcut && <span className="font-semibold">{gameDateShortcut}</span>}
            <span className={gameDateShortcut ? 'text-tm-oxide/60 dark:text-tm-sand/60' : 'font-semibold'}>
              {gameDateFormatted}
            </span>
            <button
              type="button"
              onClick={() => {
                setShowDateOptions(prev => !prev);
                setDateTouched(true);
              }}
              aria-expanded={showDateOptions}
              className="text-xs uppercase tracking-wide text-tm-copper-dark underline decoration-dotted underline-offset-4 hover:text-tm-copper dark:text-tm-glow/80 dark:hover:text-tm-glow"
            >
              {t.addGame.gameDateChange}
            </button>
          </div>

          {isLateNight && !dateTouched && (
            <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
              {t.addGame.gameDateLateNightNote}
            </p>
          )}

          {showDateOptions && (
            <div className="mt-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGameDate(yesterdayStr)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all ${
                      gameDate === yesterdayStr
                        ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg border-2 border-tm-copper'
                        : 'border-2 border-tm-copper/40 bg-white/75 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60'
                    }`}
                  >
                    {t.addGame.gameDateYesterday}
                  </button>
                  <button
                    type="button"
                    onClick={() => setGameDate(todayStr)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-all ${
                      gameDate === todayStr
                        ? 'bg-gradient-to-r from-tm-copper to-tm-copper-dark text-white shadow-lg border-2 border-tm-copper'
                        : 'border-2 border-tm-copper/40 bg-white/75 text-tm-oxide hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60'
                    }`}
                  >
                    {t.addGame.gameDateToday}
                  </button>
                </div>
                <input
                  type="date"
                  value={gameDate}
                  onChange={(e) => setGameDate(e.target.value)}
                  max={todayStr}
                  className="flex-1 rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide shadow-inner focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
                />
              </div>
              <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                {t.addGame.gameDateHelper}
              </p>
            </div>
          )}
        </div>

        {/* Generations */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            {t.addGame.generationsLabel}
          </label>
          <input
            type="number"
            min="1"
            max="16"
            value={generations}
            onChange={(e) => setGenerations(e.target.value)}
            placeholder={t.addGame.generationsPlaceholder}
            className="w-full rounded-md border border-tm-copper/40 bg-white/85 px-4 py-2 text-tm-oxide focus:border-tm-copper focus:ring-2 focus:ring-tm-glow/60 dark:bg-tm-haze/80 dark:text-tm-sand"
          />
          <p className="mt-1 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
            {t.addGame.generationsHelper}
          </p>
        </div>

        {/* Expansions */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            {t.addGame.expansionsLabel}
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

        {/* Player Selection */}
        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.3em] text-tm-oxide/70 dark:text-tm-sand/70 mb-2">
            {t.addGame.selectPlayersLabel}
          </label>
          {availablePlayers.length === 0 ? (
            <p className="text-sm text-tm-oxide/60 dark:text-tm-sand/60">
              {playerArray.length === 0
                ? t.addGame.noPlayersAvailable
                : t.addGame.allPlayersSelected}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleAddPlayer(player.id)}
                  className="rounded-md border border-tm-copper/40 bg-white/75 px-4 py-2 text-tm-oxide transition-all hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60 flex items-center gap-2"
                >
                  {player.color && (
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${getColorClasses(player.color)}`}
                      title={player.color}
                    />
                  )}
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
              {t.addGame.placementOrderLabel}
            </label>
            <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60 mb-3">
              {t.addGame.placementOrderHelper}
            </p>
            {placements.length === 2 && (
              <div className="mb-3 rounded-lg border border-tm-copper/30 bg-tm-copper/10 px-3 py-2 dark:bg-tm-copper/20">
                <p className="text-xs text-tm-oxide dark:text-tm-sand">
                  {t.addGame.twoPlayerNote}
                </p>
              </div>
            )}

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
                              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow ${getPodiumClasses(index + 1)}`}>
                                {index + 1}
                              </div>
                              {player?.color && (
                                <div
                                  className={`w-5 h-5 rounded-full border-2 ${getColorClasses(player.color)} shadow-sm`}
                                  title={player.color}
                                />
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-tm-oxide dark:text-tm-sand">
                                  {player?.name}
                                </div>
                                <div className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                                  {t.addGame.currentRating}: {Math.round(player?.currentRating || 0)}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemovePlayer(playerId)}
                                className="text-xs font-semibold uppercase tracking-wide text-tm-copper-dark hover:text-tm-copper"
                              >
                                {t.addGame.remove}
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
            disabled={placements.length < 2 || isSubmitting}
            className={`flex-1 tm-button-primary justify-center disabled:pointer-events-none ${
              placements.length < 2 || isSubmitting ? 'cursor-not-allowed opacity-60' : ''
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {language === 'es' ? 'Guardando...' : 'Saving...'}
              </span>
            ) : t.addGame.addGameButton}
          </button>
          {placements.length > 0 && !isSubmitting && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md border border-tm-copper/40 bg-white/75 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-tm-oxide transition-colors hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60"
            >
              {t.addGame.resetButton}
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}
