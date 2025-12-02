import type { Translations } from '../types';

/**
 * Spanish translations (current default)
 * This file will be populated with all existing Spanish text from the app
 */
export const es: Translations = {
  common: {
    loading: 'Cargando...',
    error: 'Error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    new: 'Nuevo',
  },

  rankings: {
    // Filter buttons
    showingActive: 'Mostrando Activos',
    showOnlyActive: 'Mostrar Solo Activos',

    // Sort buttons
    sortByRating: 'Por Rating',
    sortByPeak: 'Por Pico',
    sortByGames: 'Por Partidas',
    sortByWinRate: 'Por % Victorias',

    // View mode buttons
    allTimeView: 'Histórico',
    monthlyAccumulatedView: 'Mensual Acumulado',
    monthlyIndependentView: 'Mensual Independiente',

    // Month explanations
    monthlyAccumulatedExplanation: '💡 Mensual Acumulado: Muestra el Elo histórico de cada jugador al final del mes seleccionado (rating acumulado desde el inicio).',
    monthlyIndependentExplanation: '💡 Mensual Independiente: Todos los jugadores arrancan en 1500 y solo se consideran las partidas de este mes (K-factor: 32, umbral de confianza: 5 partidas).',

    // Table headers
    position: 'Posición',
    player: 'Jugador',
    rating: 'Rating',
    peak: 'Pico',
    games: 'Partidas',
    winRate: '% Victorias',
    lastChange: 'Último Cambio',

    // Empty states
    noPlayersYet: 'Aún no hay jugadores. ¡Agregá tu primer jugador para comenzar!',
    noGamesThisMonth: 'Sin partidas este mes',

    // Monthly section
    monthlyIndependentRankings: 'Rankings Mensuales Independientes',
    monthlyRankingsDescription: 'Todos los jugadores arrancan en 1500 cada mes. K-factor ajustado a 32 (vs. 40 histórico) para reducir la volatilidad en períodos cortos.',

    // Game count
    gameCount: '{count} {count, plural, one {partida} other {partidas}}',

    // Months
    months: {
      january: 'Enero',
      february: 'Febrero',
      march: 'Marzo',
      april: 'Abril',
      may: 'Mayo',
      june: 'Junio',
      july: 'Julio',
      august: 'Agosto',
      september: 'Septiembre',
      october: 'Octubre',
      november: 'Noviembre',
      december: 'Diciembre',
    },
  },

  addGame: {
    // Page title
    title: 'Registrar Resultado de Partida',

    // Recent games section
    recentGamesTitle: 'Últimas Partidas Agregadas',
    vs: ' vs ',
    unknown: 'Desconocido',

    // Success message
    successMessage: '¡Partida registrada exitosamente! Los ratings han sido actualizados.',
    undoButton: 'Deshacer Última Partida',

    // Form labels
    gameDateLabel: 'Fecha de la Partida',
    gameDateHelper: 'Seleccioná la fecha en que se jugó esta partida',
    generationsLabel: 'Número de Generaciones (Opcional)',
    generationsPlaceholder: 'Ingresá un número (1-16)',
    generationsHelper: '¿Cuántas generaciones se jugaron en esta partida?',
    expansionsLabel: 'Expansiones Usadas (Opcional)',
    selectPlayersLabel: 'Seleccionar Jugadores',
    placementOrderLabel: 'Orden de Posiciones (Arrastrá para reordenar)',
    placementOrderHelper: 'Arriba = 1er lugar, Abajo = Último lugar',

    // Empty states
    noPlayersAvailable: 'No hay jugadores disponibles. Por favor agregá jugadores primero.',
    allPlayersSelected: 'Todos los jugadores han sido seleccionados.',

    // Two player note
    twoPlayerNote: 'Nota: Las partidas de 2 jugadores se registran para tracking de actividad pero no afectan el rating ELO.',

    // Placement info
    currentRating: 'Rating Actual',
    remove: 'Borrar',

    // Buttons
    addGameButton: 'Agregar Partida',
    resetButton: 'Resetear',

    // Alert messages
    selectAtLeastTwoPlayers: 'Por favor seleccioná al menos 2 jugadores',
  },

  playerStats: {
    // Loading/Error states
    loadingError: 'Error al cargar estadísticas',
    statsNotFound: 'No se encontraron estadísticas',
    close: 'Cerrar',

    // Header
    pilotRecord: 'Expediente de Piloto',
    color: 'Color',
    memberSince: 'Miembro desde',
    never: 'Nunca',

    // Stats cards
    currentRating: 'Rating Actual',
    peakRating: 'Rating Pico',
    gamesPlayed: 'Partidas Jugadas',
    winRate: '% de Victorias',
    averagePlacement: 'Posición Promedio',

    // Chart section
    ratingHistory: 'Historial de Rating',
    gameNumber: 'Número de Partida',

    // Head to head section
    headToHeadRecords: 'Récords Cara a Cara',
    opponent: 'Oponente',
    games: 'Partidas',
    wins: 'Victorias',
    losses: 'Derrotas',
    ties: 'Empates',

    // Recent games section
    recentGames: 'Partidas Recientes',
    position: 'Posición',
    positionOf: 'de',
    noElo: 'Sin ELO',
    players: 'Jugadores',
    unknown: 'Desconocido',
  },

  statsOverview: {
    // Card titles
    totalGames: 'Total Partidas',
    lastGame: 'Última Partida',
    topRated: 'Mejor Rating',
    mostActive: 'Más Activo',
    premiumSpectator: 'Espectadora Premium',

    // Empty states
    noGamesYet: 'Aún no hay partidas',
    noPlayers: 'Sin jugadores',

    // Stats labels
    points: 'puntos',
    games: 'partidas',
    game: 'partida',

    // Premium spectator card
    spectatorName: 'Anto',
    spectatorDescription: 'Animando desde las gradas',

    // Color label
    color: 'Color',
  },

  app: {
    // Header
    leagueName: 'Liga Los del Cuadrito',
    appTitle: 'Terraforming Mars',

    // Auth buttons
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',

    // Navigation tabs
    tabRankings: 'Rankings',
    tabAddGame: 'Registrar partida',
    tabPlayers: 'Jugadores',
    tabHistory: 'Historial',
    tabSettings: 'Configuración',

    // Mobile menu
    menu: 'Menú',

    // Error states
    errorLoading: 'Error al cargar datos',
    retry: 'Reintentar',

    // Settings section
    aboutEloTitle: 'Acerca del Sistema Elo',
  },

  playerManagement: {
    // Header
    title: 'Gestión de Jugadores',

    // Success message
    playerAddedSuccess: '¡Jugador agregado exitosamente!',

    // Add player form
    addNewPlayer: 'Agregar Nuevo Jugador',
    playerNamePlaceholder: 'Ingresá el nombre del jugador',
    addPlayerButton: 'Agregar Jugador',
    startingRatingInfo: 'Los jugadores nuevos empiezan con un rating de 1500',

    // Validation errors
    enterPlayerName: 'Por favor ingresá un nombre de jugador',
    playerAlreadyExists: 'Ya existe un jugador con este nombre',

    // Player list
    allPlayers: 'Todos los Jugadores',
    noPlayersYet: 'Aún no hay jugadores.',
    addFirstPlayer: '¡Agregá tu primer jugador arriba!',
    gamesPlayed: 'partidas jugadas',
    gamePlayed: 'partida jugada',
    rating: 'Rating',
    editButton: 'Editar',
  },

  playerEdit: {
    // Header
    title: 'Editar Jugador',

    // Form fields
    nameLabel: 'Nombre',
    colorLabel: 'Color',
    noColor: 'Sin color',
    selectedColor: 'Color seleccionado',

    // Validation
    nameRequired: 'El nombre es requerido',
    updateError: 'Error al actualizar jugador',

    // Actions
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando...',
  },

  gameHistory: {
    // Header
    title: 'Historial de Partidas',
    gamesRecorded: 'partidas registradas',
    gameRecorded: 'partida registrada',

    // Empty state
    noGamesYet: 'Aún no hay partidas registradas.',
    recordFirstGame: '¡Registrá tu primera partida para verla acá!',

    // Game card
    players: 'jugadores',
    player: 'jugador',
    noElo: 'Sin ELO',
    gen: 'gen',
    winner: 'Ganador',
    unknown: 'Desconocido',

    // Button tooltips
    editGame: 'Editar partida',
    deleteGame: 'Eliminar partida',

    // Delete confirmation
    confirmDeleteTitle: '¿Estás seguro de que querés eliminar esta partida?',
    confirmDeleteDate: 'Fecha',
    confirmDeletePlayers: 'Jugadores',
    confirmDeleteWarning: 'Esto recalculará todos los ratings desde cero. Esta acción no se puede deshacer.',

    // Expanded section
    finalStandings: 'Clasificación Final',
    ratingAfterGame: 'Rating después de la partida',

    // Edit form
    editGameTitle: 'Editar Partida',
    generationsLabel: 'Generaciones (1-16, opcional)',
    generationsPlaceholder: 'Ej: 12',
    expansionsLabel: 'Expansiones',
    saveChanges: 'Guardar Cambios',
    cancel: 'Cancelar',

    // Validation
    generationsInvalid: 'Las generaciones deben ser un número entre 1 y 16',

    // Game details
    gameId: 'ID de Partida',
    playersLabel: 'Jugadores',
    generationsInfo: 'Generaciones',
    expansionsInfo: 'Expansiones',
  },

  exportImport: {
    // Header
    title: 'Backup & Restore',

    // Messages
    exportSuccess: '¡Datos exportados exitosamente!',
    exportError: 'Error al exportar datos',
    importSuccess: '¡Datos importados exitosamente!',
    importError: 'Error al importar datos. Por favor verificá el formato del archivo.',

    // Buttons
    exportData: 'Exportar Datos',
    importData: 'Importar Datos',

    // Description
    description: 'Exportá tus datos para hacer un backup, o importá un archivo exportado previamente para restaurar tus rankings.',
  },

  settings: {
    // Elo explanation section
    mainFeatures: 'Características principales',
    kFactor: 'K-Factor: 40',
    kFactorDescription: 'Determina qué tan rápido cambian los ratings después de cada partida',
    initialRating: 'Rating Inicial: 1500',
    initialRatingDescription: 'Todos los jugadores nuevos empiezan con este puntaje',
    confidenceThreshold: 'Umbral de Confianza: 10 partidas',
    confidenceThresholdDescription: 'Los jugadores con menos de 10 partidas se marcan como "Nuevo"',

    // How it works
    howItWorks: 'Cómo funciona',
    howItWorksIntro: 'En este sistema multijugador, cada jugador es comparado contra todos los demás jugadores en la partida. Para cada par de jugadores:',
    step1: 'Se calcula la probabilidad esperada de ganar basada en la diferencia de ratings',
    step2: 'Se determina el resultado real: 1.0 = victoria, 0.5 = empate, 0.0 = derrota',
    step3: 'El cambio de rating se calcula como: Cambio = K × (Resultado Real - Resultado Esperado)',
    step4: 'Se suman todos los cambios de cada comparación para obtener el cambio total del jugador',

    // Example
    exampleTitle: 'Ejemplo',
    exampleText: 'Si terminás 1° en una partida de 4 jugadores, tu rating aumenta más si venciste a jugadores con rating alto que si venciste a jugadores con rating bajo. El sistema recompensa ganarle a oponentes fuertes y penaliza perder contra oponentes débiles.',
  },
};
