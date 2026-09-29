import AnimatedSection from './AnimatedSection';

const brands = [
  { name: 'Cisco', abbr: 'CISCO' },
  { name: 'MikroTik', abbr: 'MikroTik' },
  { name: 'Ubiquiti', abbr: 'Ubiquiti' },
  { name: 'Intel', abbr: 'intel' },
  { name: 'Samsung', abbr: 'SAMSUNG' },
  { name: 'Kingston', abbr: 'Kingston' },
  { name: 'TP-Link', abbr: 'TP-Link' },
  { name: 'Seagate', abbr: 'Seagate' },
];

export default function BrandsSection() {
  return (
    <section className="py-12 px-4 border-y border-slate-200 bg-white/50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <p className="text-center text-slate-500 text-sm font-semibold uppercase tracking-widest mb-8">
            Marcas que distribuimos
          </p>
        </AnimatedSection>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          {/* Scrolling track */}
          <div className="flex gap-10 brands-scroll">
            {[...brands, ...brands].map((brand, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center justify-center px-6 py-3 bg-white border border-slate-200 rounded-xl min-w-[120px] h-14 shadow-xs hover:border-violet-300 transition-colors"
              >
                <span className="text-slate-700 font-bold text-sm tracking-wide whitespace-nowrap">
                  {brand.abbr}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
