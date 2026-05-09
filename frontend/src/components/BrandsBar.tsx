// Logos de marcas como texto estilizado (sin imágenes externas)
const brands = [
  { name: 'Cisco',     style: 'font-bold tracking-tight text-blue-400' },
  { name: 'MikroTik',  style: 'font-bold text-red-400' },
  { name: 'Ubiquiti',  style: 'font-bold text-sky-400' },
  { name: 'Intel',     style: 'font-bold text-blue-300' },
  { name: 'Samsung',   style: 'font-bold text-blue-500' },
  { name: 'Kingston',  style: 'font-bold text-red-500' },
  { name: 'TP-Link',   style: 'font-bold text-green-400' },
  { name: 'Seagate',   style: 'font-bold text-emerald-400' },
];

export default function BrandsBar() {
  return (
    <section className="py-8 sm:py-10 px-4 border-y border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4 sm:mb-6">
          Marcas que distribuimos
        </p>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

          <div className="flex items-center gap-8 sm:gap-12 animate-marquee whitespace-nowrap">
            {[...brands, ...brands].map((brand, i) => (
              <span
                key={i}
                className={`text-base sm:text-xl shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-default ${brand.style}`}
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
