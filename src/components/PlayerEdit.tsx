import { useState } from 'react';
import type { Player, PlayerColor } from '../types';
import { useI18n } from '../i18n';

interface PlayerEditProps {
  player: Player;
  onSave: (playerId: string, updates: { name?: string; color?: PlayerColor }) => Promise<void>;
  onClose: () => void;
}

const COLORS: PlayerColor[] = ['Yellow', 'Red', 'Green', 'Purple', 'Blue', 'Pink', 'Orange'];

const COLOR_CLASSES: Record<PlayerColor, string> = {
  Yellow: 'bg-yellow-400 border-yellow-500',
  Red: 'bg-red-500 border-red-600',
  Green: 'bg-green-500 border-green-600',
  Purple: 'bg-purple-500 border-purple-600',
  Blue: 'bg-blue-500 border-blue-600',
  Pink: 'bg-pink-500 border-pink-600',
  Orange: 'bg-orange-500 border-orange-600',
};

export default function PlayerEdit({ player, onSave, onClose }: PlayerEditProps) {
  const { t } = useI18n();
  const [name, setName] = useState(player.name);
  const [color, setColor] = useState<PlayerColor | ''>(player.color || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError(t.playerEdit.nameRequired);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(player.id, {
        name: name.trim(),
        color: color || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.playerEdit.updateError);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="tm-card relative w-full max-w-md">
        {/* Header */}
        <div className="tm-card-header px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="tm-card-subtitle">{t.playerEdit.title}</p>
              <h2 className="text-xl font-heading uppercase tracking-[0.35em] text-tm-oxide dark:text-tm-glow">
                {player.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full border border-tm-copper/30 p-2 text-tm-oxide transition-colors hover:bg-tm-copper/10 hover:text-tm-copper-dark dark:border-white/20 dark:text-tm-sand dark:hover:bg-white/10"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label
              htmlFor="player-name"
              className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-tm-oxide dark:text-tm-sand"
            >
              {t.playerEdit.nameLabel}
            </label>
            <input
              id="player-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-tm-copper/30 bg-white/90 px-4 py-2 text-tm-oxide focus:border-tm-copper focus:outline-none focus:ring-2 focus:ring-tm-copper/20 dark:border-white/20 dark:bg-tm-haze/90 dark:text-tm-sand"
              disabled={saving}
            />
          </div>

          {/* Color Field */}
          <div>
            <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.2em] text-tm-oxide dark:text-tm-sand">
              {t.playerEdit.colorLabel}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {/* No color option */}
              <button
                type="button"
                onClick={() => setColor('')}
                className={`relative h-12 rounded-md border-2 transition-all ${
                  color === ''
                    ? 'border-tm-copper shadow-lg scale-105'
                    : 'border-tm-copper/30 hover:border-tm-copper/50'
                } bg-white/80 dark:bg-tm-haze/80`}
                disabled={saving}
              >
                <span className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">{t.playerEdit.noColor}</span>
              </button>

              {/* Color options */}
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`relative h-12 rounded-md border-2 transition-all ${
                    color === colorOption
                      ? 'border-tm-oxide dark:border-tm-sand shadow-lg scale-105'
                      : 'border-transparent hover:border-tm-copper/50'
                  } ${COLOR_CLASSES[colorOption]}`}
                  title={colorOption}
                  disabled={saving}
                >
                  {color === colorOption && (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            {color && (
              <p className="mt-2 text-xs text-tm-oxide/60 dark:text-tm-sand/60">
                {t.playerEdit.selectedColor}: {color}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="tm-button-secondary flex-1"
              disabled={saving}
            >
              {t.playerEdit.cancel}
            </button>
            <button
              type="submit"
              className="tm-button-primary flex-1"
              disabled={saving}
            >
              {saving ? t.playerEdit.saving : t.playerEdit.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
