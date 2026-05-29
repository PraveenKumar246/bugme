import { useState } from 'react';

/**
 * Wraps an async function with loading/error state.
 * Usage:
 *   const { run, loading, error } = useAsync();
 *   await run(() => api.createSomething(data));
 */
export function useAsync() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const run = async (fn) => {
    setError('');
    setLoading(true);
    try {
      return await fn();
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Something went wrong.';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return { run, loading, error, clearError };
}
