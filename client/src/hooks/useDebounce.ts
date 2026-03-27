import { useState, useEffect, useRef } from 'react';

/**
 * Delays updating the returned value until `delay` ms have elapsed
 * since the last change to `value`.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 400);
 * // Only fires React Query fetch after user stops typing for 400 ms
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Returns a stable debounced callback. The callback is only invoked
 * `delay` ms after the last call.
 *
 * @example
 * const debouncedSave = useDebouncedCallback((val) => saveToServer(val), 500);
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 300,
): (...args: Args) => void {
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref current without restarting the timer
  useEffect(() => { callbackRef.current = callback; }, [callback]);

  return (...args: Args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  };
}

/**
 * Returns `true` for `delay` ms after `value` last changed.
 * Useful to show a "typing…" indicator.
 *
 * @example
 * const isTyping = useIsDebouncing(searchInput, 400);
 */
export function useIsDebouncing(value: unknown, delay = 300): boolean {
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const timer = setTimeout(() => setIsDebouncing(false), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return isDebouncing;
}
