import { useRef, useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function BrandsBar() {
  const { settings } = useAdmin();
  const brands = settings.brands ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Auto-scroll continuo y suave en celulares que no dependa solo de CSS
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;

    let animId: number;
    let lastTime = performance.now();

    const step = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Si el usuario no está tocando o arrastrando, avanzar automáticamente
      if (!isUserInteracting && el) {
        const speed = 0.055; // px por milisegundo (~35px/s en móvil)
        el.scrollLeft += speed * delta;

        // Bucle infinito sin saltos
        const halfScroll = el.scrollWidth / 2;
        if (el.scrollLeft >= halfScroll) {
          el.scrollLeft -= halfScroll;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [brands.length, isUserInteracting]);

  if (brands.length === 0) return null;

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -220 : 220;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Duplicamos x3 para asegurar scroll continuo y fluido tanto táctil como automático
  const brandList = [...brands, ...brands, ...brands];

  return (
    <section className="py-7 sm:py-9 px-3 sm:px-4 bg-[#0a0f1d] border-y border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
          <p className="text-[11px] sm:text-xs text-sky-400 uppercase tracking-widest font-bold">
            Marcas que distribuimos
          </p>

          {/* Controles táctiles / flechas para móvil y desktop */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleManualScroll('left')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-90 border border-slate-700"
              aria-label="Desplazar marcas a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleManualScroll('right')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors active:scale-90 border border-slate-700"
              aria-label="Desplazar marcas a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          {/* Contenedor deslizante interactivo con soporte táctil y momentum */}
          <div
            ref={scrollRef}
            onPointerDown={() => setIsUserInteracting(true)}
            onPointerUp={() => {
              // Reanuda el auto-scroll 1.5s después de soltar
              setTimeout(() => setIsUserInteracting(false), 1500);
            }}
            onTouchStart={() => setIsUserInteracting(true)}
            onTouchEnd={() => {
              setTimeout(() => setIsUserInteracting(false), 1500);
            }}
            className="flex items-center gap-3 sm:gap-5 overflow-x-auto scrollbar-none py-1.5 select-none cursor-grab active:cursor-grabbing touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {brandList.map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 transition-all shrink-0 shadow-md group"
              >
                <span className="w-2 h-2 rounded-full bg-sky-400 group-hover:scale-125 transition-transform shrink-0" />
                <span
                  className={`text-sm sm:text-base font-bold tracking-wide whitespace-nowrap ${brand.colorClass} group-hover:brightness-125`}
                >
                  {brand.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
