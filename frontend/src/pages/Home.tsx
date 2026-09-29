import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Truck, Headphones, Zap,
  Network, Cpu, HardDrive, Cable, Wifi, Server,
  CheckCircle, Tag, CircuitBoard, Wrench, Layers, type LucideIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../hooks/useCurrency';
import ProductCard from '../components/ProductCard';
import BrandsBar from '../components/BrandsBar';
import Testimonials from '../components/Testimonials';
import { useScrollReveal } from '../hooks/useScrollReveal';

type CatStyle = { icon: LucideIcon; color: string; bg: string; border: string };
const CATEGORY_STYLES: Record<string, CatStyle> = {
  'Switches':       { icon: Network,      color: 'text-sky-600',     bg: 'bg-sky-50',     border: 'hover:border-sky-300' },
  'Routers':        { icon: Wifi,         color: 'text-indigo-600',  bg: 'bg-indigo-50',  border: 'hover:border-indigo-300' },
  'Procesadores':   { icon: Cpu,          color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'hover:border-purple-300' },
  'Memorias RAM':   { icon: CircuitBoard, color: 'text-cyan-600',    bg: 'bg-cyan-50',    border: 'hover:border-cyan-300' },
  'Almacenamiento': { icon: HardDrive,    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-300' },
  'Cables':         { icon: Cable,        color: 'text-orange-600',  bg: 'bg-orange-50',  border: 'hover:border-orange-300' },
  'Access Points':  { icon: Server,       color: 'text-pink-600',    bg: 'bg-pink-50',    border: 'hover:border-pink-300' },
  'Herramientas':   { icon: Wrench,       color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'hover:border-amber-300' },
  'Componentes':    { icon: Layers,       color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'hover:border-rose-300' },
};
const DEFAULT_CAT_STYLE: CatStyle = { icon: Tag, color: 'text-slate-600', bg: 'bg-slate-100', border: 'hover:border-slate-300' };

const features = [
  { icon: Truck,      title: 'Envío Rápido',      desc: 'Entrega en 24-48 horas a todo el país' },
  { icon: Shield,     title: 'Garantía Oficial',  desc: 'Todos los productos con garantía del fabricante' },
  { icon: Headphones, title: 'Soporte Técnico',   desc: 'Asesoría especializada en redes y hardware' },
  { icon: Zap,        title: 'Mejores Precios',   desc: 'Precios competitivos y ofertas exclusivas' },
];

function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </section>
  );
}

export default function Home() {
  const { products } = useStore();
  const { settings } = useAdmin();
  const { formatShort } = useCurrency();
  // Imported catalog items do not have badges. Keep the storefront populated
  // from published products while honoring badges set later in the panel.
  const pricedProducts = products.filter(product => product.price > 0);
  const featuredCandidates = [
    ...pricedProducts.filter(product => product.badge === 'Popular' || product.badge === 'Oferta'),
    ...['Laptops', 'Monitores', 'Celulares', 'Mini PC'].flatMap(category =>
      pricedProducts.filter(product => product.category === category).slice(0, 1)
    ),
    ...pricedProducts,
  ];
  const featured = featuredCandidates.filter((product, index) =>
    featuredCandidates.findIndex(candidate => candidate.id === product.id) === index
  ).slice(0, 4);
  const remainingProducts = pricedProducts.filter(product => !featured.some(item => item.id === product.id));
  const newProducts = [
    ...remainingProducts.filter(product => product.badge === 'Nuevo'),
    ...remainingProducts,
  ].filter((product, index, list) => list.findIndex(item => item.id === product.id) === index).slice(0, 3);
  const visibleCategories = [...new Set(products.map(product => product.category))].slice(0, 6);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-10 sm:py-24 px-3 sm:px-4 bg-gradient-to-b from-sky-50/70 via-indigo-50/30 to-slate-50 border-b border-slate-200/80">
        {/* Animated background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left — text */}
            <div>
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-sm font-semibold mb-6 shadow-xs">
                <Zap className="w-4 h-4 text-sky-600" />
                Tecnología profesional al mejor precio
              </div>

              <h1 className="animate-fade-in-up animate-delay-100 text-[2.15rem] leading-[1.08] sm:text-5xl xl:text-6xl font-extrabold text-slate-900 mb-5 sm:mb-6 tracking-tight">
                Tu tienda de{' '}
                <span className="gradient-text">redes y<br />componentes</span>{' '}
                de confianza
              </h1>

              <p className="animate-fade-in-up animate-delay-200 text-base sm:text-lg text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Laptops, monitores, componentes y equipos de red para tus proyectos.
                Explora el catálogo o consulta con nuestro equipo.
              </p>

              {/* Trust bullets */}
              <ul className="animate-fade-in-up animate-delay-300 space-y-2 mb-8">
                {[
                  'Productos 100% originales con garantía oficial',
                  `Envío gratis en pedidos desde ${formatShort(Number(settings.freeShippingMin) || 300)}`,
                  'Soporte técnico especializado para tu empresa',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-sky-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="animate-fade-in-up animate-delay-400 flex flex-wrap gap-4">
                <Link
                  to="/productos"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 sm:px-8 py-3.5 min-h-[48px] rounded-xl gradient-brand text-white font-bold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-sky-500/25 touch-manipulation"
                >
                  Ver catálogo <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                >
                  Hablar con un asesor
                </Link>
              </div>
            </div>

            {/* Right — visual card */}
            <div className="hidden lg:block relative">
              {/* Main image card */}
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200 group">
                <img
                  src="/productos_tienda_tecnologia_20/01_laptop_gaming.png"
                  alt="Laptop gaming del nuevo catálogo"
                  className="w-full h-80 object-contain bg-slate-50 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-5 left-5 max-w-[65%] z-10">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500 text-white mb-1.5 shadow-sm">
                    Tecnología para tus proyectos
                  </span>
                  <p className="text-white font-bold text-base leading-tight">Explora nuevas opciones</p>
                  <p className="text-sky-200 text-xs font-medium mt-0.5 line-clamp-1">Asesoría en cómputo y redes</p>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl border border-slate-200 flex items-center gap-2.5 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-base font-extrabold text-slate-900 leading-none">{products.length}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5 font-medium">Productos en catálogo</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 shadow-xl border border-slate-200 flex items-center gap-2.5 z-20">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-xs font-bold leading-tight">Atención personalizada</p>
                  <p className="text-slate-500 text-[10px]">Consulta precio y disponibilidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── BRANDS ── */}
      <BrandsBar />

      {/* ── CATEGORIES ── */}
      {visibleCategories.length > 0 && <SectionReveal className="py-14 sm:py-16 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sky-700 text-xs font-bold uppercase tracking-widest mb-1">Explora</p>
              <h2 className="text-2xl font-bold text-slate-900">Categorías</h2>
            </div>
            <Link to="/productos" className="text-violet-700 hover:text-violet-900 text-sm font-semibold flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {visibleCategories.map(name => {
              const { icon: Icon, color, bg, border } = CATEGORY_STYLES[name] ?? DEFAULT_CAT_STYLE;
              return (
                <Link
                  key={name}
                  to={`/productos?categoria=${encodeURIComponent(name)}`}
                  className={`bg-white rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 card-hover group border border-slate-200 shadow-xs ${border}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 text-center leading-tight">{name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </SectionReveal>}

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && <SectionReveal className="py-14 sm:py-16 px-4 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sky-700 text-xs font-bold uppercase tracking-widest mb-1">Selección del catálogo</p>
              <h2 className="text-2xl font-bold text-slate-900">Productos destacados</h2>
            </div>
            <Link to="/productos" className="text-violet-700 hover:text-violet-900 text-sm font-semibold flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </SectionReveal>}

      {/* ── NEW PRODUCTS ── */}
      {newProducts.length > 0 && (
        <SectionReveal className="py-14 sm:py-16 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-widest mb-1">Más opciones para ti</p>
                <h2 className="text-2xl font-bold text-slate-900">Explora más productos</h2>
              </div>
              <Link to="/productos" className="text-violet-700 hover:text-violet-900 text-sm font-semibold flex items-center gap-1 transition-colors">
                Ver todos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {newProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </SectionReveal>
      )}

      {/* ── FEATURES ── */}
      <SectionReveal className="relative overflow-hidden bg-[#f5f9ff] border-y border-blue-100 py-16 sm:py-20 px-4">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-lime-100/60 blur-3xl pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-16 lg:items-center">
          <div>
            <p className="flex items-center gap-3 text-[#0052cc] text-xs font-bold uppercase tracking-[0.2em] mb-5">
              <span className="h-px w-8 bg-[#48bb07]" aria-hidden="true" />
              Nuestras ventajas
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-5">
              ¿Por qué elegirnos?
            </h2>
            <p className="max-w-md text-slate-600 text-base leading-relaxed">
              Todo lo que necesitas para comprar tecnología con confianza, desde la elección hasta la entrega.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="group rounded-2xl border border-blue-100 bg-white p-6 sm:p-7 shadow-sm transition-all hover:border-[#0052cc]/30 hover:shadow-lg hover:shadow-blue-100/70">
                <div className="flex items-start justify-between mb-7">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0052cc] group-hover:bg-lime-50 group-hover:text-[#348f00] group-hover:border-lime-200 transition-colors">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-bold text-[#48bb07] tabular-nums">0{i + 1}</span>
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── CTA BANNER ── */}
      <SectionReveal className="py-12 sm:py-16 px-3 sm:px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative isolate overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center shadow-xl bg-slate-900">
            <video
              className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              src="/animacion.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/75 to-blue-950/85" aria-hidden="true" />
            <div className="relative">
              <p className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-3">¿Tienes un proyecto?</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Necesitas asesoría técnica especializada
              </h2>
              <p className="text-white/85 mb-8 max-w-xl mx-auto text-lg leading-relaxed font-medium">
                Nuestro equipo de expertos en redes y hardware está listo para ayudarte a elegir
                los mejores componentes para tu infraestructura.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-indigo-800 font-bold hover:bg-slate-100 active:scale-95 transition-all shadow-xl"
                >
                  Hablar con un experto <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/15 border border-white/25 text-white font-semibold hover:bg-white/25 transition-colors"
                >
                  Ver catálogo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>
    </div>
  );
}
