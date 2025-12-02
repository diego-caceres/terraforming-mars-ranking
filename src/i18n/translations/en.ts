import type { Translations } from '../types';

/**
 * English translations
 * This file will be populated as translations are added
 */
export const en: Translations = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',
    close: 'Close',
    new: 'New',
  },

  rankings: {
    // Filter buttons
    showingActive: 'Showing Active',
    showOnlyActive: 'Show Only Active',

    // Sort buttons
    sortByRating: 'By Rating',
    sortByPeak: 'By Peak',
    sortByGames: 'By Games',
    sortByWinRate: 'By Win %',

    // View mode buttons
    allTimeView: 'All Time',
    monthlyAccumulatedView: 'Monthly Accumulated',
    monthlyIndependentView: 'Monthly Independent',

    // Month explanations
    monthlyAccumulatedExplanation: '💡 Monthly Accumulated: Shows each player\'s historical Elo at the end of the selected month (accumulated rating since the beginning).',
    monthlyIndependentExplanation: '💡 Monthly Independent: All players start at 1500 and only games from this month are considered (K-factor: 32, confidence threshold: 5 games).',

    // Table headers
    position: 'Position',
    player: 'Player',
    rating: 'Rating',
    peak: 'Peak',
    games: 'Games',
    winRate: 'Win %',
    lastChange: 'Last Change',

    // Empty states
    noPlayersYet: 'No players yet. Add your first player to get started!',
    noGamesThisMonth: 'No games this month',

    // Monthly section
    monthlyIndependentRankings: 'Monthly Independent Rankings',
    monthlyRankingsDescription: 'All players start at 1500 each month. K-factor adjusted to 32 (vs. 40 all-time) to reduce volatility in short periods.',

    // Game count
    gameCount: '{count} {count, plural, one {game} other {games}}',

    // Months
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
  },

  addGame: {
    // Page title
    title: 'Record Game Result',

    // Recent games section
    recentGamesTitle: 'Recently Added Games',
    vs: ' vs ',
    unknown: 'Unknown',

    // Success message
    successMessage: 'Game recorded successfully! Ratings have been updated.',
    undoButton: 'Undo Last Game',

    // Form labels
    gameDateLabel: 'Game Date',
    gameDateHelper: 'Select the date when this game was played',
    generationsLabel: 'Number of Generations (Optional)',
    generationsPlaceholder: 'Enter a number (1-16)',
    generationsHelper: 'How many generations were played in this game?',
    expansionsLabel: 'Expansions Used (Optional)',
    selectPlayersLabel: 'Select Players',
    placementOrderLabel: 'Placement Order (Drag to reorder)',
    placementOrderHelper: 'Top = 1st place, Bottom = Last place',

    // Empty states
    noPlayersAvailable: 'No players available. Please add players first.',
    allPlayersSelected: 'All players have been selected.',

    // Two player note
    twoPlayerNote: 'Note: 2-player games are recorded for activity tracking but do not affect Elo ratings.',

    // Placement info
    currentRating: 'Current Rating',
    remove: 'Remove',

    // Buttons
    addGameButton: 'Add Game',
    resetButton: 'Reset',

    // Alert messages
    selectAtLeastTwoPlayers: 'Please select at least 2 players',
  },

  playerStats: {
    // Loading/Error states
    loadingError: 'Error loading statistics',
    statsNotFound: 'Statistics not found',
    close: 'Close',

    // Header
    pilotRecord: 'Pilot Record',
    color: 'Color',
    memberSince: 'Member since',
    never: 'Never',

    // Stats cards
    currentRating: 'Current Rating',
    peakRating: 'Peak Rating',
    gamesPlayed: 'Games Played',
    winRate: 'Win Rate',
    averagePlacement: 'Average Placement',

    // Chart section
    ratingHistory: 'Rating History',
    gameNumber: 'Game Number',

    // Head to head section
    headToHeadRecords: 'Head-to-Head Records',
    opponent: 'Opponent',
    games: 'Games',
    wins: 'Wins',
    losses: 'Losses',
    ties: 'Ties',

    // Recent games section
    recentGames: 'Recent Games',
    position: 'Position',
    positionOf: 'of',
    noElo: 'No Elo',
    players: 'Players',
    unknown: 'Unknown',
  },

  statsOverview: {
    // Card titles
    totalGames: 'Total Games',
    lastGame: 'Last Game',
    topRated: 'Top Rated',
    mostActive: 'Most Active',
    premiumSpectator: 'Premium Spectator',

    // Empty states
    noGamesYet: 'No games yet',
    noPlayers: 'No players',

    // Stats labels
    points: 'points',
    games: 'games',
    game: 'game',

    // Premium spectator card
    spectatorName: 'Anto',
    spectatorDescription: 'Cheering from the stands',

    // Color label
    color: 'Color',
  },

  app: {
    // Header
    leagueName: 'Los del Cuadrito League',
    appTitle: 'Terraforming Mars',

    // Auth buttons
    login: 'Log In',
    logout: 'Log Out',

    // Navigation tabs
    tabRankings: 'Rankings',
    tabAddGame: 'Record Game',
    tabPlayers: 'Players',
    tabHistory: 'History',
    tabSettings: 'Settings',

    // Mobile menu
    menu: 'Menu',

    // Error states
    errorLoading: 'Error loading data',
    retry: 'Retry',

    // Settings section
    aboutEloTitle: 'About the Elo System',
  },

  playerManagement: {
    // Header
    title: 'Player Management',

    // Success message
    playerAddedSuccess: 'Player added successfully!',

    // Add player form
    addNewPlayer: 'Add New Player',
    playerNamePlaceholder: 'Enter player name',
    addPlayerButton: 'Add Player',
    startingRatingInfo: 'New players start with a rating of 1500',

    // Validation errors
    enterPlayerName: 'Please enter a player name',
    playerAlreadyExists: 'A player with this name already exists',

    // Player list
    allPlayers: 'All Players',
    noPlayersYet: 'No players yet.',
    addFirstPlayer: 'Add your first player above!',
    gamesPlayed: 'games played',
    gamePlayed: 'game played',
    rating: 'Rating',
    editButton: 'Edit',
  },

  playerEdit: {
    // Header
    title: 'Edit Player',

    // Form fields
    nameLabel: 'Name',
    colorLabel: 'Color',
    noColor: 'No color',
    selectedColor: 'Selected color',

    // Validation
    nameRequired: 'Name is required',
    updateError: 'Error updating player',

    // Actions
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
  },

  gameHistory: {
    // Header
    title: 'Game History',
    gamesRecorded: 'games recorded',
    gameRecorded: 'game recorded',

    // Empty state
    noGamesYet: 'No games recorded yet.',
    recordFirstGame: 'Record your first game to see it here!',

    // Game card
    players: 'players',
    player: 'player',
    noElo: 'No Elo',
    gen: 'gen',
    winner: 'Winner',
    unknown: 'Unknown',

    // Button tooltips
    editGame: 'Edit game',
    deleteGame: 'Delete game',

    // Delete confirmation
    confirmDeleteTitle: 'Are you sure you want to delete this game?',
    confirmDeleteDate: 'Date',
    confirmDeletePlayers: 'Players',
    confirmDeleteWarning: 'This will recalculate all ratings from scratch. This action cannot be undone.',

    // Expanded section
    finalStandings: 'Final Standings',
    ratingAfterGame: 'Rating after game',

    // Edit form
    editGameTitle: 'Edit Game',
    generationsLabel: 'Generations (1-16, optional)',
    generationsPlaceholder: 'E.g.: 12',
    expansionsLabel: 'Expansions',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',

    // Validation
    generationsInvalid: 'Generations must be a number between 1 and 16',

    // Game details
    gameId: 'Game ID',
    playersLabel: 'Players',
    generationsInfo: 'Generations',
    expansionsInfo: 'Expansions',
  },

  exportImport: {
    // Header
    title: 'Backup & Restore',

    // Messages
    exportSuccess: 'Data exported successfully!',
    exportError: 'Failed to export data',
    importSuccess: 'Data imported successfully!',
    importError: 'Failed to import data. Please check the file format.',

    // Buttons
    exportData: 'Export Data',
    importData: 'Import Data',

    // Description
    description: 'Export your data to back it up, or import a previously exported file to restore your rankings.',
  },

  settings: {
    // Elo explanation section
    mainFeatures: 'Main Features',
    kFactor: 'K-Factor: 40',
    kFactorDescription: 'Determines how quickly ratings change after each game',
    initialRating: 'Initial Rating: 1500',
    initialRatingDescription: 'All new players start with this score',
    confidenceThreshold: 'Confidence Threshold: 10 games',
    confidenceThresholdDescription: 'Players with fewer than 10 games are marked as "New"',

    // How it works
    howItWorks: 'How it works',
    howItWorksIntro: 'In this multiplayer system, each player is compared against all other players in the game. For each pair of players:',
    step1: 'The expected probability of winning is calculated based on the rating difference',
    step2: 'The actual result is determined: 1.0 = win, 0.5 = tie, 0.0 = loss',
    step3: 'The rating change is calculated as: Change = K × (Actual Result - Expected Result)',
    step4: 'All changes from each comparison are summed to get the player\'s total change',

    // Example
    exampleTitle: 'Example',
    exampleText: 'If you finish 1st in a 4-player game, your rating increases more if you defeated high-rated players than low-rated players. The system rewards beating strong opponents and penalizes losing to weak opponents.',
  },
};
