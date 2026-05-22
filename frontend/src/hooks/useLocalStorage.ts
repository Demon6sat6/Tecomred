import { useState, useEffect, useCallback } from 'react';

// Increment this version whenever you need to force-reset all stored data
export const STORAGE_VERSION = '4';

function readStorage<T>(key: string, initialValue: T): T {
  try {
    const storedVersion = localStorage.getItem('tr_data_version');
    if (storedVersion !== STORAGE_VERSION) return initialValue;
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : initialValue;
  } catch {
    return initialValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem('tr_data_version', STORAGE_VERSION);
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      // Storage is full — silently ignore; data stays in memory for this session
      console.warn(`[useLocalStorage] QuotaExceededError writing "${key}". Data kept in memory only.`);
    }
  }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readStorage(key, initialValue));

  // Sync to localStorage whenever value or key changes
  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  // Listen for changes made in other tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key || e.storageArea !== localStorage) return;
      try {
        setValue(e.newValue ? (JSON.parse(e.newValue) as T) : initialValue);
      } catch {
        // Ignore parse errors from other tabs
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, initialValue]);

  // Stable setter — same API as useState
  const setStoredValue = useCallback((updater: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof updater === 'function'
        ? (updater as (prev: T) => T)(prev)
        : updater;
      return next;
    });
  }, []);

  return [value, setStoredValue] as const;
}
