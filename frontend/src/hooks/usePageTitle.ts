import { useEffect } from 'react';

/**
 * Establece el título de la pestaña y la meta description de forma dinámica
 * por página (SEO on-page). Restaura el título base al desmontar.
 */
export function usePageTitle(title?: string, description?: string) {
  const BASE_TITLE = 'TecomRed — Redes, Switches, Routers y Componentes';

  useEffect(() => {
    const prevTitle = document.title;
    document.title = title ? `${title} | TecomRed` : BASE_TITLE;

    const fallbackDesc =
      'Tu tienda especializada en redes y componentes de cómputo: switches, routers, cables, procesadores, memorias RAM y más. Envío a todo el Perú.';
    let prevDesc: string | null = null;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (meta) {
      prevDesc = meta.getAttribute('content');
      meta.setAttribute('content', description || fallbackDesc);
    }

    return () => {
      document.title = prevTitle;
      if (prevDesc !== null && meta) meta.setAttribute('content', prevDesc);
    };
  }, [title, description]);
}
