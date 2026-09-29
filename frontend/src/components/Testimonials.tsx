import { Star, Quote } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const testimonials = [
  {
    name: 'Carlos Mendoza',
    role: 'Administrador de Redes',
    company: 'TechCorp S.A.',
    avatar: 'CM',
    color: 'from-sky-500 to-indigo-500',
    rating: 5,
    text: 'Excelente servicio. Los switches Cisco llegaron en perfectas condiciones y el soporte técnico me ayudó a configurarlos sin problemas. Definitivamente mi tienda de confianza para equipos de red.',
  },
  {
    name: 'María González',
    role: 'Ingeniera de Sistemas',
    company: 'DataCenter Pro',
    avatar: 'MG',
    color: 'from-purple-500 to-pink-500',
    rating: 5,
    text: 'Compré varios procesadores y memorias RAM para actualizar nuestros servidores. Los precios son muy competitivos y el envío fue rapidísimo. El equipo de SiscomRed sabe lo que vende.',
  },
  {
    name: 'Roberto Silva',
    role: 'Técnico en Telecomunicaciones',
    company: 'NetSolutions',
    avatar: 'RS',
    color: 'from-emerald-500 to-teal-500',
    rating: 5,
    text: 'Llevo 2 años comprando aquí y nunca me han fallado. Los productos son originales, los precios justos y cuando tuve un problema con un router, lo resolvieron al instante. 100% recomendado.',
  },
];

export default function Testimonials() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className={`py-12 sm:py-16 px-4 bg-slate-50 border-t border-slate-200 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-sky-700 text-xs sm:text-sm font-bold uppercase tracking-widest mb-2">Testimonios</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Lo que dicen nuestros clientes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-slate-200 shadow-sm card-hover"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Quote icon */}
              <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-sky-500/30" />

              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">"{t.text}"</p>

              {/* Author */}
              <div className="flex items-center gap-2.5 sm:gap-3 pt-3 border-t border-slate-100">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0 shadow-xs`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-xs sm:text-sm">{t.name}</p>
                  <p className="text-slate-500 text-[10px] sm:text-xs">{t.role} · {t.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
