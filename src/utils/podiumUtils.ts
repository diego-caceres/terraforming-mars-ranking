export function getPodiumClasses(position: number): string {
  switch (position) {
    case 1:
      return 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg'; // Gold
    case 2:
      return 'bg-gradient-to-br from-gray-300 to-gray-500'; // Silver
    case 3:
      return 'bg-gradient-to-br from-amber-600 to-amber-800'; // Bronze
    default:
      return 'bg-gradient-to-br from-slate-500 to-slate-700'; // Slate for 4th+
  }
}
