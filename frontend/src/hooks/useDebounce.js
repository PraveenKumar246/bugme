import { useState, useEffect } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of silence.
 * Prevents expensive filtering / API calls on every keystroke.
 *
 * @param {*}      value  - the value to debounce
 * @param {number} delay  - milliseconds (default 250)
 */
export function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
