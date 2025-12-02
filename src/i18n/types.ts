/**
 * Supported languages
 */
export type Language = 'es' | 'en';

/**
 * Translation keys structure
 * This will be the shape of your translation files
 */
export interface Translations {
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    close: string;
    new: string;
  };

  rankings: {
    // Filter buttons
    showingActive: string;
    showOnlyActive: string;

    // Sort buttons
    sortByRating: string;
    sortByPeak: string;
    sortByGames: string;
    sortByWinRate: string;

    // View mode buttons
    allTimeView: string;
    monthlyAccumulatedView: string;
    monthlyIndependentView: string;

    // Month explanations
    monthlyAccumulatedExplanation: string;
    monthlyIndependentExplanation: string;

    // Table headers
    position: string;
    player: string;
    rating: string;
    peak: string;
    games: string;
    winRate: string;
    lastChange: string;

    // Empty states
    noPlayersYet: string;
    noGamesThisMonth: string;

    // Monthly section
    monthlyIndependentRankings: string;
    monthlyRankingsDescription: string;

    // Game count (for pluralization helpers)
    gameCount: string; // "{count} game" or "{count} games"

    // Months
    months: {
      january: string;
      february: string;
      march: string;
      april: string;
      may: string;
      june: string;
      july: string;
      august: string;
      september: string;
      october: string;
      november: string;
      december: string;
    };
  };

  addGame: {
    // Page title
    title: string;

    // Recent games section
    recentGamesTitle: string;
    vs: string; // "vs" separator for player names
    unknown: string; // Unknown player name

    // Success message
    successMessage: string;
    undoButton: string;

    // Form labels
    gameDateLabel: string;
    gameDateHelper: string;
    generationsLabel: string;
    generationsPlaceholder: string;
    generationsHelper: string;
    expansionsLabel: string;
    selectPlayersLabel: string;
    placementOrderLabel: string;
    placementOrderHelper: string;

    // Empty states
    noPlayersAvailable: string;
    allPlayersSelected: string;

    // Two player note
    twoPlayerNote: string;

    // Placement info
    currentRating: string;
    remove: string;

    // Buttons
    addGameButton: string;
    resetButton: string;

    // Alert messages
    selectAtLeastTwoPlayers: string;
  };

  playerStats: {
    // Loading/Error states
    loadingError: string;
    statsNotFound: string;
    close: string;

    // Header
    pilotRecord: string;
    color: string;
    memberSince: string;
    never: string; // For dates that don't exist

    // Stats cards
    currentRating: string;
    peakRating: string;
    gamesPlayed: string;
    winRate: string;
    averagePlacement: string;

    // Chart section
    ratingHistory: string;
    gameNumber: string; // X-axis label

    // Head to head section
    headToHeadRecords: string;
    opponent: string;
    games: string;
    wins: string;
    losses: string;
    ties: string;

    // Recent games section
    recentGames: string;
    position: string; // "Position #{placement} of {total}"
    positionOf: string; // "of" - for "Position #1 of 4"
    noElo: string; // Tag for 2-player games
    players: string; // "Players:" label
    unknown: string; // Unknown player name
  };

  statsOverview: {
    // Card titles
    totalGames: string;
    lastGame: string;
    topRated: string;
    mostActive: string;
    premiumSpectator: string;

    // Empty states
    noGamesYet: string;
    noPlayers: string;

    // Stats labels
    points: string; // "points" for rating display
    games: string; // For game count (used with pluralize)
    game: string; // Singular form

    // Premium spectator card
    spectatorName: string; // "Anto"
    spectatorDescription: string; // "Cheering from the stands"

    // Color label
    color: string; // "Color:" for title attribute
  };

  app: {
    // Header
    leagueName: string; // "Liga Los del Cuadrito"
    appTitle: string; // "Terraforming Mars"

    // Auth buttons
    login: string;
    logout: string;

    // Navigation tabs
    tabRankings: string;
    tabAddGame: string;
    tabPlayers: string;
    tabHistory: string;
    tabSettings: string;

    // Mobile menu
    menu: string;

    // Error states
    errorLoading: string; // "Error loading data"
    retry: string;

    // Settings section
    aboutEloTitle: string; // "About the Elo System"
  };

  playerManagement: {
    // Header
    title: string; // "Player Management"

    // Success message
    playerAddedSuccess: string;

    // Add player form
    addNewPlayer: string; // "Add New Player"
    playerNamePlaceholder: string;
    addPlayerButton: string;
    startingRatingInfo: string; // "New players start with a rating of 1500"

    // Validation errors
    enterPlayerName: string;
    playerAlreadyExists: string;

    // Player list
    allPlayers: string; // "All Players"
    noPlayersYet: string;
    addFirstPlayer: string; // "Add your first player above!"
    gamesPlayed: string; // For pluralization
    gamePlayed: string; // Singular
    rating: string;
    editButton: string;
  };

  playerEdit: {
    // Header
    title: string; // "Edit Player"

    // Form fields
    nameLabel: string;
    colorLabel: string;
    noColor: string;
    selectedColor: string; // "Selected color: {color}"

    // Validation
    nameRequired: string;
    updateError: string; // "Error updating player"

    // Actions
    cancel: string;
    save: string;
    saving: string;
  };

  gameHistory: {
    // Header
    title: string; // "Game History"
    gamesRecorded: string; // For pluralization
    gameRecorded: string; // Singular

    // Empty state
    noGamesYet: string;
    recordFirstGame: string; // "Record your first game to see it here!"

    // Game card
    players: string; // "players" for pluralization
    player: string; // singular
    noElo: string; // "No Elo" tag for 2-player games
    gen: string; // "gen" abbreviation for generations
    winner: string; // "Winner:"
    unknown: string; // Unknown player name

    // Button tooltips
    editGame: string;
    deleteGame: string;

    // Delete confirmation
    confirmDeleteTitle: string; // "Are you sure you want to delete this game?"
    confirmDeleteDate: string; // "Date:"
    confirmDeletePlayers: string; // "Players:"
    confirmDeleteWarning: string; // "This will recalculate all ratings from scratch. This action cannot be undone."

    // Expanded section
    finalStandings: string; // "Final Standings"
    ratingAfterGame: string; // "Rating after game:"

    // Edit form
    editGameTitle: string; // "Edit Game"
    generationsLabel: string; // "Generations (1-16, optional)"
    generationsPlaceholder: string; // "E.g.: 12"
    expansionsLabel: string; // "Expansions"
    saveChanges: string;
    cancel: string;

    // Validation
    generationsInvalid: string; // "Generations must be a number between 1 and 16"

    // Game details
    gameId: string; // "Game ID:"
    playersLabel: string; // "Players:"
    generationsInfo: string; // "Generations:"
    expansionsInfo: string; // "Expansions:"
  };

  exportImport: {
    // Header
    title: string; // "Backup & Restore"

    // Messages
    exportSuccess: string;
    exportError: string;
    importSuccess: string;
    importError: string;

    // Buttons
    exportData: string;
    importData: string;

    // Description
    description: string; // "Export your data to back it up, or import a previously exported file to restore your rankings."
  };

  settings: {
    // Elo explanation section
    mainFeatures: string; // "Main Features:"
    kFactor: string; // "K-Factor: 40"
    kFactorDescription: string; // "Determines how quickly ratings change after each game"
    initialRating: string; // "Initial Rating: 1500"
    initialRatingDescription: string; // "All new players start with this score"
    confidenceThreshold: string; // "Confidence Threshold: 10 games"
    confidenceThresholdDescription: string; // "Players with fewer than 10 games are marked as 'New'"

    // How it works
    howItWorks: string; // "How it works:"
    howItWorksIntro: string; // "In this multiplayer system, each player is compared against all other players in the game. For each pair of players:"
    step1: string; // "The expected probability of winning is calculated based on the rating difference"
    step2: string; // "The actual result is determined: 1.0 = win, 0.5 = tie, 0.0 = loss"
    step3: string; // "The rating change is calculated as: Change = K × (Actual Result - Expected Result)"
    step4: string; // "All changes from each comparison are summed to get the player's total change"

    // Example
    exampleTitle: string; // "Example:"
    exampleText: string; // "If you finish 1st in a 4-player game, your rating increases more if you defeated high-rated players than low-rated players. The system rewards beating strong opponents and penalizes losing to weak opponents."
  };
}

/**
 * Deep partial type for allowing incomplete translations during development
 */
export type PartialTranslations = {
  [K in keyof Translations]?: Partial<Translations[K]>;
};
