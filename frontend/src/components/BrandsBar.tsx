import { useAdmin } from '../context/AdminContext';

export default function BrandsBar() {
  const { settings } = useAdmin();
  const brands = settings.brands ?? [];

  if (brands.length === 0) return null;

  return (
    <section className="py-8 sm:py-10 px-4 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4 sm:mb-6">
          Marcas que distribuimos
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={i}
                className={`text-base sm:text-xl shrink-0 font-bold opacity-50 hover:opacity-100 transition-opacity cursor-default ${brand.colorClass}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
