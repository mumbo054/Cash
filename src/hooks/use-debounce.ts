import { useEffect, useState } from 'react';

/**
 * Delays updating the returned value until `delayMs` has elapsed without further changes.
 * Ideal for search and autocomplete inputs to avoid redundant filtering or API calls.
 */
export function useDebounce<T>(value: T, delayMs = 250): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
