import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Estado local inicializado desde un parámetro de la URL que se vuelve a
 * sincronizar cuando ese parámetro cambia (p. ej. al usar el buscador global).
 */
export function useUrlParam(name: string, initial = '') {
  const [params] = useSearchParams();
  const urlValue = params.get(name);
  const [value, setValue] = useState(urlValue ?? initial);
  const [seen, setSeen] = useState(urlValue);
  if (urlValue !== seen) {
    setSeen(urlValue);
    if (urlValue !== null) setValue(urlValue);
  }
  return [value, setValue] as const;
}
