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

          <div className="flex items-center gap-4 sm:gap-6 animate-marquee whitespace-nowrap py-1">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] border border-white/8 hover:border-violet-500/40 hover:bg-white/[0.06] transition-all cursor-default shrink-0 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400/80 group-hover:scale-125 transition-transform" />
                <span
                  className={`text-sm sm:text-base shrink-0 font-bold tracking-wide transition-all ${brand.colorClass} group-hover:brightness-125`}
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
