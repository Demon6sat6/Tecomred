import { useState, useEffect } from 'react';

// Increment this version whenever you need to force-reset all stored data
export const STORAGE_VERSION = '4'; // v4 = Peru PEN definitivo - reset forzado

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      // Check data version — if outdated, ignore stored value and use fresh default
      const storedVersion = localStorage.getItem('tr_data_version');
      if (storedVersion !== STORAGE_VERSION) {
        return initialValue;
      }
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      // Mark current version
      localStorage.setItem('tr_data_version', STORAGE_VERSION);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  }, [key, value]);

  return [value, setValue] as const;
}
