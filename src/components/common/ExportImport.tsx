import { useRef, useState } from 'react';
import { exportData, importData } from '../../services/storageService';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Backup & Restore
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm"
        >
          Export Data
        </button>
        <button
          onClick={handleImport}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors text-sm"
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

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Export your data to back it up, or import a previously exported file to restore your rankings.
      </p>
    </div>
  );
}
