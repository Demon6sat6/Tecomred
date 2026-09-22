import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/** Botón flotante "volver arriba": aparece tras hacer scroll de 600px. */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 w-11 h-11 rounded-full glass-strong gradient-brand shadow-lg shadow-violet-500/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform touch-manipulation animate-slide-up"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
