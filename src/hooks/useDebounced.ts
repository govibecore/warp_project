import { useEffect, useState } from 'react';

/**
 * Returns `value` delayed by `delay`ms. Used so a keystroke in a filter box
 * does not fire a query per character.
 */
export function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
