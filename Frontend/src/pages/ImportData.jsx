/**
 * ImportData page — CSV data import interface.
 * 
 * Allows uploading CSV files to one of the 4 tables.
 * Supports two modes: append (safe) and replace (destructive).
 */
import { useState } from 'react';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { importCsv } from '../services/api';

const TABLES = [
  { value: 'customers', label: 'Customers' },
  { value: 'products', label: 'Products' },
  { value: 'orders', label: 'Orders' },
  { value: 'order_items', label: 'Order Items' },
];

const MODES = [
  { value: 'append', label: 'Append (Add new rows)' },
  { value: 'replace', label: 'Replace (Delete all existing rows first)' },
];

export default function ImportData() {
  const [table, setTable] = useState('');
  const [mode, setMode] = useState('append');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Verify it's a CSV file
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a .csv file');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!table || !file) {
      setError('Please select a table and upload a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await importCsv(table, mode, file);
      setSuccess(
        `Successfully imported ${result.rowsImported} row(s) to ${result.table} (mode: ${result.mode})`
      );
      
      // Reset form
      setFile(null);
      setTable('');
      setMode('append');
      
      // Reset file input
      const fileInput = document.getElementById('csv-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = table && mode && file;
  const showReplaceWarning = mode === 'replace';

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Import Data (Demo)"
        subtitle="Upload CSV files to populate the database tables"
      />

      <div className="flex-1 p-6 max-w-2xl">
        <div className="card">
          <h2 className="section-title mb-2">CSV File Import</h2>
          <p className="section-subtitle mb-6">
            Upload a CSV file with the exact column structure expected by the selected table.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Table Selection */}
            <div>
              <label htmlFor="table-select" className="block text-sm font-medium text-slate-200 mb-2">
                Target Table
              </label>
              <select
                id="table-select"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-surface-900 border border-surface-600 rounded-lg 
                         text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Select a table --</option>
                {TABLES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Selection */}
            <div>
              <label htmlFor="mode-select" className="block text-sm font-medium text-slate-200 mb-2">
                Import Mode
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-surface-900 border border-surface-600 rounded-lg 
                         text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              {/* Replace Mode Warning */}
              {showReplaceWarning && (
                <div className="mt-3 p-3 bg-rose-900/20 border border-rose-800/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    </svg>
                    <div className="text-xs text-rose-400">
                      <p className="font-semibold mb-1">⚠️ Warning: Destructive Operation</p>
                      <p>
                        This will permanently delete all existing rows in this table 
                        (and any dependent rows in linked tables) before loading the new file.
                        <strong className="block mt-1">This cannot be undone.</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label htmlFor="csv-file-input" className="block text-sm font-medium text-slate-200 mb-2">
                CSV File
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-surface-900 border border-surface-600 rounded-lg 
                         text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg 
                         file:border-0 file:text-sm file:font-medium 
                         file:bg-primary-600 file:text-white file:cursor-pointer
                         hover:file:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {file && (
                <p className="mt-2 text-xs text-slate-400">
                  Selected: <span className="text-slate-200">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload & Import
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Status Messages */}
          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} />
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd" />
                </svg>
                <p className="text-sm text-emerald-400">{success}</p>
              </div>
            </div>
          )}
        </div>

        {/* Expected Format Guide */}
        <div className="card mt-6">
          <h3 className="section-title mb-4">Expected CSV Format</h3>
          <div className="space-y-4 text-xs text-slate-400">
            <div>
              <p className="font-semibold text-slate-300 mb-1">customers.csv</p>
              <code className="block bg-surface-900 p-2 rounded text-emerald-400">
                customer_id,name,email,signup_date
              </code>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">products.csv</p>
              <code className="block bg-surface-900 p-2 rounded text-emerald-400">
                product_id,name,category,price
              </code>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">orders.csv</p>
              <code className="block bg-surface-900 p-2 rounded text-emerald-400">
                order_id,customer_id,order_date,status
              </code>
            </div>
            <div>
              <p className="font-semibold text-slate-300 mb-1">order_items.csv</p>
              <code className="block bg-surface-900 p-2 rounded text-emerald-400">
                order_item_id,order_id,product_id,quantity,unit_price
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
