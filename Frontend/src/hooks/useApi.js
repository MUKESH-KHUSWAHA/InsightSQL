/**
 * useApi — generic hook for fetching data from the API service.
 *
 * Usage:
 *   const { data, loading, error, retry } = useApi(fetchMonthlyRevenue);
 *
 * @param {Function} fetchFn  — async function from services/api.js
 * @param {Array}    deps     — extra dependencies (passed to useCallback)
 */
import { useState, useEffect, useCallback } from 'react';

export default function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable reference to the fetch — recreates only when deps change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message ?? 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, retry: load };
}
