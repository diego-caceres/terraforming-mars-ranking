import type { PlayerColor } from '../types';

export const COLOR_CLASSES: Record<PlayerColor, string> = {
  Yellow: 'bg-yellow-400 border-yellow-500',
  Red: 'bg-red-500 border-red-600',
  Green: 'bg-green-500 border-green-600',
  Purple: 'bg-purple-500 border-purple-600',
  Blue: 'bg-blue-500 border-blue-600',
  Pink: 'bg-pink-500 border-pink-600',
  Orange: 'bg-orange-500 border-orange-600',
};

export function getColorClasses(color?: PlayerColor): string {
  if (!color) return '';
  return COLOR_CLASSES[color];
}
