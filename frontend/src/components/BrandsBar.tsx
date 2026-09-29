import { useRef, useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const brandLogos: Record<string, string> = {
  cisco: '/brands/cisco.svg',
  mikrotik: '/brands/mikrotik.svg',
  ubiquiti: '/brands/ubiquiti.svg',
  intel: '/brands/intel.svg',
  samsung: '/brands/samsung.svg',
  kingston: '/brands/kingston.png',
  tplink: '/brands/tplink.svg',
  seagate: '/brands/seagate.svg',
};

export default function BrandsBar() {
  const { settings } = useAdmin();
  const brands = settings.brands ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Auto-scroll continuo y suave en celulares que no dependa solo de CSS
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || brands.length === 0) return;

    const loopWidth = el.scrollWidth / 3;
    el.scrollLeft = loopWidth;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
        if (el.scrollLeft >= loopWidth * 2) {
          el.scrollLeft -= loopWidth;
        } else if (el.scrollLeft < loopWidth) {
          el.scrollLeft += loopWidth;
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
    const offset = direction === 'left' ? -208 : 208;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Duplicamos x3 para asegurar scroll continuo y fluido tanto táctil como automático
  const brandList = [...brands, ...brands, ...brands];

  return (
    <section className="py-9 sm:py-12 px-3 sm:px-4 bg-[#f8fbff] border-y border-blue-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-5 sm:mb-6 px-1">
          <p className="flex items-center gap-2.5 text-xs text-[#0052cc] uppercase tracking-[0.16em] font-bold">
            <span className="w-1 h-5 rounded-full bg-[#48bb07]" aria-hidden="true" />
            Marcas que distribuimos
          </p>

          {/* Controles táctiles / flechas para móvil y desktop */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleManualScroll('left')}
              className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 text-[#0052cc] flex items-center justify-center transition-colors border border-blue-100 shadow-sm"
              aria-label="Desplazar marcas a la izquierda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleManualScroll('right')}
              className="w-9 h-9 rounded-full bg-white hover:bg-blue-50 text-[#0052cc] flex items-center justify-center transition-colors border border-blue-100 shadow-sm"
              aria-label="Desplazar marcas a la derecha"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-[#f8fbff] to-transparent z-10 pointer-events-none" aria-hidden="true" />
          <div className="absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-[#f8fbff] to-transparent z-10 pointer-events-none" aria-hidden="true" />
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
            className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none py-2 select-none cursor-grab active:cursor-grabbing touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {brandList.map((brand, i) => {
              const logo = brandLogos[brand.name.toLowerCase().replace(/[^a-z0-9]/g, '')];
              return (
              <div
                key={`${brand.name}-${i}`}
                className="flex items-center justify-center w-44 sm:w-48 h-20 rounded-2xl bg-white border border-blue-100 hover:border-[#0052cc]/30 hover:shadow-md hover:shadow-blue-100/70 transition-all shrink-0 shadow-sm"
                aria-hidden={i >= brands.length}
              >
                {logo ? (
                  <div className="flex items-center justify-center gap-2 px-4 w-full">
                    <img
                      src={logo}
                      alt={brand.name}
                      className={`max-h-11 w-full object-contain ${brand.name.toLowerCase() === 'ubiquiti' ? 'max-w-11' : 'max-w-36'}`}
                      loading="lazy"
                      draggable={false}
                    />
                    {brand.name.toLowerCase() === 'ubiquiti' && <span className="font-bold text-slate-800">Ubiquiti</span>}
                  </div>
                ) : (
                  <span className="text-base font-bold text-slate-700 whitespace-nowrap">{brand.name}</span>
                )}
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
