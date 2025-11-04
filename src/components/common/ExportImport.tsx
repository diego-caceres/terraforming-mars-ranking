import { useRef, useState } from 'react';
import { exportData, importData } from '../../services/apiService';

interface ExportImportProps {
  onImportSuccess: () => void;
  isAuthenticated: boolean;
  onAuthenticationRequired: () => void;
}

export default function ExportImport({ onImportSuccess, isAuthenticated, onAuthenticationRequired }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = () => {
    if (!isAuthenticated) {
      onAuthenticationRequired();
      return;
    }
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `board-game-rankings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export data');
      setSuccess(null);
    }
  };

  const handleImport = () => {
    if (!isAuthenticated) {
      onAuthenticationRequired();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      importData(text);
      setSuccess('Data imported successfully!');
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
      onImportSuccess();
    } catch (err) {
      setError('Failed to import data. Please check the file format.');
      setSuccess(null);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="tm-card p-6 space-y-4">
      <h3 className="text-lg font-heading uppercase tracking-[0.3em] text-tm-oxide dark:text-tm-glow">
        Backup & Restore
      </h3>

      {error && (
        <div className="rounded-md border border-tm-copper-dark/40 bg-tm-copper-dark/10 p-3 text-sm font-semibold uppercase tracking-wide text-tm-copper-dark dark:bg-tm-copper-dark/20 dark:text-tm-glow">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-tm-teal/40 bg-tm-teal/15 p-3 text-sm font-semibold uppercase tracking-wide text-tm-teal dark:bg-tm-teal/20 dark:text-tm-glow">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleExport}
          className="flex-1 tm-button-primary justify-center"
        >
          Export Data
        </button>
        <button
          onClick={handleImport}
          className="flex-1 rounded-md border border-tm-copper/40 bg-white/75 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-tm-oxide transition-colors hover:bg-white dark:bg-tm-haze/70 dark:text-tm-sand dark:hover:bg-tm-haze/60"
        >
          Import Data
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-tm-oxide/60 dark:text-tm-sand/60">
        Export your data to back it up, or import a previously exported file to restore your rankings.
      </p>
    </div>
  );
}
