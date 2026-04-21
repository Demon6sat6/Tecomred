import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Truck, Headphones, Zap,
  Network, Cpu, HardDrive, Cable, Wifi, Server,
  CheckCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAdmin } from '../context/AdminContext';
import ProductCard from '../components/ProductCard';
import BrandsBar from '../components/BrandsBar';
import Testimonials from '../components/Testimonials';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';

function AnimatedStat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(value, 1600);
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="text-center py-2">
      <div className="text-3xl font-extrabold gradient-text">{count}{suffix}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

const categoryIcons = [
  { name: 'Switches',      icon: Network,    color: 'text-sky-400',     bg: 'bg-sky-500/10',     border: 'hover:border-sky-500/40' },
  { name: 'Routers',       icon: Wifi,       color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'hover:border-indigo-500/40' },
  { name: 'Procesadores',  icon: Cpu,        color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'hover:border-purple-500/40' },
  { name: 'Almacenamiento',icon: HardDrive,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'hover:border-emerald-500/40' },
  { name: 'Cables',        icon: Cable,      color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'hover:border-orange-500/40' },
  { name: 'Access Points', icon: Server,     color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'hover:border-pink-500/40' },
];

const features = [
  { icon: Truck,      title: 'Envío Rápido',      desc: 'Entrega en 24–48 horas a todo el país' },
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
  const featured = products.filter(p => p.badge === 'Popular' || p.badge === 'Oferta').slice(0, 4);
  const newProducts = products.filter(p => p.badge === 'Nuevo').slice(0, 3);

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        {/* Animated background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-60 -right-60 w-[600px] h-[600px] bg-sky-500/8 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-60 -left-60 w-[600px] h-[600px] bg-indigo-500/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-sky-600/4 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div>
              <div className="animate-fade-in-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Tecnología profesional al mejor precio
              </div>

              <h1 className="animate-fade-in-up animate-delay-100 text-4xl sm:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-6">
                Tu tienda de{' '}
                <span className="gradient-text">redes y<br />componentes</span>{' '}
                de confianza
              </h1>

              <p className="animate-fade-in-up animate-delay-200 text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
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
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/25"
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
              <div className="relative glass-strong rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/10">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=420&fit=crop"
                  alt="Equipos de red profesionales"
                  className="w-full h-72 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-semibold text-sm">Cisco Catalyst 2960-X</p>
                  <p className="text-sky-400 text-xs">Switch Gestionable 24 Puertos</p>
                </div>
              </div>

              {/* Floating stat cards */}
              <div className="absolute -top-4 -right-4 glass-strong rounded-2xl px-4 py-3 shadow-xl">
                <p className="text-2xl font-extrabold gradient-text">500+</p>
                <p className="text-gray-400 text-xs">Productos</p>
              </div>
              <div className="absolute -bottom-4 -left-4 glass-strong rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">2,000+ clientes</p>
                  <p className="text-gray-500 text-xs">satisfechos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <SectionReveal className="py-8 px-4 border-y border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedStat value={500}   suffix="+"  label="Productos en stock" />
          <AnimatedStat value={2000}  suffix="+"  label="Clientes satisfechos" />
          <AnimatedStat value={10}    suffix=" años" label="De experiencia" />
          <AnimatedStat value={24}    suffix="/7" label="Soporte técnico" />
        </div>
      </SectionReveal>

      {/* ── BRANDS ── */}
      <BrandsBar />

      {/* ── CATEGORIES ── */}
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
            {categoryIcons.map(({ name, icon: Icon, color, bg, border }) => (
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
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* ── FEATURED PRODUCTS ── */}
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

      {/* ── NEW PRODUCTS ── */}
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

      {/* ── FEATURES ── */}
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

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── CTA BANNER ── */}
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
