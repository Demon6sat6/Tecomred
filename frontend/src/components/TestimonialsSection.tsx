import { Star } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const testimonials = [
  {
    name: 'Carlos Mendoza',
    role: 'Administrador de Redes',
    company: 'TechCorp S.A.',
    avatar: 'CM',
    rating: 5,
    text: 'Excelente servicio. Los switches Cisco llegaron en perfectas condiciones y el soporte técnico me ayudó a configurarlos sin problemas. Definitivamente mi tienda de confianza para equipos de red.',
    color: 'from-sky-500 to-indigo-500',
  },
  {
    name: 'María González',
    role: 'Directora de IT',
    company: 'Grupo Empresarial Norte',
    avatar: 'MG',
    rating: 5,
    text: 'Compré procesadores y memorias RAM para renovar 20 equipos de la empresa. Los precios son muy competitivos y el envío fue rapidísimo. El equipo de SiscomRed siempre responde rápido.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Roberto Silva',
    role: 'Técnico en Sistemas',
    company: 'Freelance',
    avatar: 'RS',
    rating: 5,
    text: 'Como técnico independiente, necesito proveedores confiables. SiscomRed tiene todo lo que necesito: cables, herramientas, access points. Los precios y la calidad son insuperables.',
    color: 'from-emerald-500 to-sky-500',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Lo que dicen nuestros clientes</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Más de 2,000 clientes confían en SiscomRed para sus proyectos de tecnología
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <AnimatedSection key={t.name} delay={i * 100}>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 h-full flex flex-col shadow-xs card-hover">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-700 text-sm leading-relaxed flex-1 mb-6">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
