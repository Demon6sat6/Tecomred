import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Truck, Headphones, Zap,
  Network, Cpu, HardDrive, Cable, Wifi, Server,
  CheckCircle, Tag, CircuitBoard, Wrench, Layers, type LucideIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAdmin } from '../context/AdminContext';
import ProductCard from '../components/ProductCard';
import BrandsBar from '../components/BrandsBar';
import Testimonials from '../components/Testimonials';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

function AnimatedStat({ value, suffix, label, isStatic = false }: { value: number; suffix: string; label: string; isStatic?: boolean }) {
  const { count, ref } = useCountUp(value, 800);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center py-2">
      <div className="text-3xl sm:text-4xl font-extrabold gradient-text">
        {isStatic ? `${value}${suffix}` : `${count.toLocaleString('es-PE')}${suffix}`}
      </div>
      <div className="text-gray-400 text-xs sm:text-sm mt-1 font-medium">{label}</div>
    </div>
  );
}

type CatStyle = { icon: LucideIcon; color: string; bg: string; border: string };
const CATEGORY_STYLES: Record<string, CatStyle> = {
  'Switches':       { icon: Network,      color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'hover:border-sky-500/40' },
  'Routers':        { icon: Wifi,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'hover:border-indigo-500/40' },
  'Procesadores':   { icon: Cpu,          color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'hover:border-purple-500/40' },
  'Memorias RAM':   { icon: CircuitBoard, color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'hover:border-cyan-500/40' },
  'Almacenamiento': { icon: HardDrive,    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/40' },
  'Cables':         { icon: Cable,        color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'hover:border-orange-500/40' },
  'Access Points':  { icon: Server,       color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'hover:border-pink-500/40' },
  'Herramientas':   { icon: Wrench,       color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'hover:border-amber-500/40' },
  'Componentes':    { icon: Layers,       color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'hover:border-rose-500/40' },
};
const DEFAULT_CAT_STYLE: CatStyle = { icon: Tag, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'hover:border-gray-500/40' };

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
  const { settings, categoryList } = useAdmin();
  const featured = products.filter(p => p.badge === 'Popular' || p.badge === 'Oferta').slice(0, 4);
  const newProducts = products.filter(p => p.badge === 'Nuevo').slice(0, 3);

  return (
    <div>
      {/* ââ HERO ââ */}
      <section className="relative overflow-hidden py-10 sm:py-24 px-3 sm:px-4">
        {/* Animated background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-sky-500/8 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-600/4 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left — text */}
            <div>
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Tecnología profesional al mejor precio
              </div>

              <h1 className="animate-fade-in-up animate-delay-100 text-[2.15rem] leading-[1.08] sm:text-5xl xl:text-6xl font-extrabold text-white mb-5 sm:mb-6">
                Tu tienda de{' '}
                <span className="gradient-text">redes y<br />componentes</span>{' '}
                de confianza
              </h1>

              <p className="animate-fade-in-up animate-delay-200 text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-lg">
                Switches, routers, procesadores, memorias y todo lo que necesitas para construir
                infraestructuras de red profesionales y equipos de alto rendimiento.
              </p>

              {/* Trust bullets */}
              <ul className="animate-fade-in-up animate-delay-300 space-y-2 mb-8">
                {['Productos 100% originales con garantía', 'Envío gratis en pedidos +$100', 'Soporte técnico especializado'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="animate-fade-in-up animate-delay-400 flex flex-wrap gap-4">
                <Link
                  to="/productos"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 px-5 sm:px-7 py-3.5 min-h-[48px] rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/25 touch-manipulation"
                >
                  Ver catálogo <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Hablar con un asesor
                </Link>
              </div>
            </div>

            {/* Right — visual card */}
            <div className="hidden lg:block relative">
              {/* Main image card */}
              <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10 border border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=520&fit=crop"
                  alt="Equipos de red profesionales Cisco y Datacenter"
                  className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute bottom-5 left-5 max-w-[62%] z-10">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-1.5 backdrop-blur-md">
                    Hardware Empresarial
                  </span>
                  <p className="text-white font-bold text-base leading-tight">Cisco Catalyst 2960-X</p>
                  <p className="text-sky-300 text-xs font-medium mt-0.5 line-clamp-1">Switch Gestionable 24 Puertos GbE</p>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -top-4 -left-4 glass-strong rounded-2xl px-4 py-2.5 shadow-xl border border-white/10 flex items-center gap-2.5 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <p className="text-base font-extrabold text-white leading-none">500+</p>
                  <p className="text-gray-400 text-[10px] mt-0.5 font-medium">Equipos en Stock</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 glass-strong rounded-2xl px-4 py-2.5 shadow-xl border border-white/10 flex items-center gap-2.5 z-20">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">2,000+ Clientes</p>
                  <p className="text-gray-400 text-[10px]">Garantía oficial en Perú</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ââ STATS ââ */}
      <SectionReveal className="py-8 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedStat value={Number(settings.stat1Value) || 500} suffix={settings.stat1Suffix || '+'} label={settings.stat1Label || 'Productos en stock'} />
          <AnimatedStat value={Number(settings.stat2Value) || 2000} suffix={settings.stat2Suffix || '+'} label={settings.stat2Label || 'Clientes satisfechos'} />
          <AnimatedStat value={Number(settings.stat3Value) || 10} suffix={settings.stat3Suffix || ' años'} label={settings.stat3Label || 'De experiencia'} />
          <AnimatedStat value={24} suffix="/7" label={settings.stat4Label || 'Soporte técnico'} isStatic={true} />
        </div>
      </SectionReveal>

      {/* ââ BRANDS ââ */}
      <BrandsBar />

      {/* ââ CATEGORIES ââ */}
      <SectionReveal className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sky-400 text-xs font-semibold uppercase tracking-widest mb-1">Explora</p>
              <h2 className="text-2xl font-bold text-white">Categorías</h2>
            </div>
            <Link to="/productos" className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1 transition-colors">
              Ver todas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoryList.slice(0, 6).map(name => {
              const { icon: Icon, color, bg, border } = CATEGORY_STYLES[name] ?? DEFAULT_CAT_STYLE;
              return (
                <Link
                  key={name}
                  to={`/productos?categoria=${encodeURIComponent(name)}`}
                  className={`glass rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 card-hover group border border-transparent ${border}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-7 h-7 ${color}`} />
                  </div>
                  <span className="text-sm font-medium text-gray-300 text-center leading-tight">{name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* ââ FEATURED PRODUCTS ââ */}
      <SectionReveal className="py-16 px-4 bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sky-400 text-xs font-semibold uppercase tracking-widest mb-1">Más vendidos</p>
              <h2 className="text-2xl font-bold text-white">Productos Destacados</h2>
            </div>
            <Link to="/productos" className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ââ NEW PRODUCTS ââ */}
      {newProducts.length > 0 && (
        <SectionReveal className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-1">Recién llegados</p>
                <h2 className="text-2xl font-bold text-white">Nuevos Productos</h2>
              </div>
              <Link to="/productos" className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center gap-1 transition-colors">
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

      {/* ââ FEATURES ââ */}
      <SectionReveal className="py-16 px-4 bg-gray-900/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sky-400 text-xs font-semibold uppercase tracking-widest mb-2">Nuestras ventajas</p>
            <h2 className="text-3xl font-extrabold text-white">¿Por qué elegirnos?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="glass rounded-2xl p-6 text-center card-hover group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ââ TESTIMONIALS ââ */}
      <Testimonials />

      {/* ââ CTA BANNER ââ */}
      <SectionReveal className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center" style={{ background: 'linear-gradient(135deg, #0369a1 0%, #4f46e5 50%, #0369a1 100%)' }}>
            {/* Decorative circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-white/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-3">¿Tienes un proyecto?</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Necesitas asesoría técnica especializada
              </h2>
              <p className="text-white/75 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                Nuestro equipo de expertos en redes y hardware está listo para ayudarte a elegir
                los mejores componentes para tu infraestructura.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/contacto"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-100 active:scale-95 transition-all shadow-xl"
                >
                  Hablar con un experto <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/productos"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
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
