import { Users, Target, Award, Cpu } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { usePageTitle } from '../hooks/usePageTitle';

const equipoBase = [
  { name: 'Carlos Mendoza', role: 'Gerente General', image: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Lucía Torres', role: 'Jefa de Ventas', image: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Miguel Ríos', role: 'Soporte Técnico', image: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Ana Paredes', role: 'Atención al Cliente', image: 'https://i.pravatar.cc/150?img=45' },
];

export default function Nosotros() {
  usePageTitle('Nosotros', 'Conoce al equipo y la misión de TecomRed, especialistas en redes y telecomunicaciones.');
  const { settings } = useAdmin();
  const valores = [
    { icon: Target, title: 'Misión', desc: settings.aboutMission || 'Brindar soluciones tecnológicas de red confiables y accesibles para empresas y hogares del Perú.' },
    { icon: Award, title: 'Visión', desc: settings.aboutVision || 'Ser la tienda líder en equipos de redes y tecnología en la región, reconocida por calidad y servicio.' },
    { icon: Users, title: 'Equipo', desc: 'Contamos con técnicos certificados y apasionados por la tecnología listos para asesorarte.' },
    { icon: Cpu, title: 'Experiencia', desc: 'Más de 5 años conectando empresas y hogares con las mejores marcas del mercado.' },
  ];
  const equipo = settings.aboutTeam !== undefined ? settings.aboutTeam : equipoBase;

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #863bff, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-violet-500/30 text-violet-400 bg-violet-500/10">
            Quiénes Somos
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            Conectamos el Perú con <span className="gradient-text">tecnología de red</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            En TecomRed somos especialistas en equipos de networking y tecnología. Desde switches y routers hasta
            procesadores y almacenamiento, ofrecemos las mejores marcas con asesoría personalizada.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valores.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 text-center card-hover">
              <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Equipo */}
      <section className="py-16 px-4 bg-white/2">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">
            Nuestro <span className="gradient-text">Equipo</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipo.map(({ name, role, image }) => (
              <div key={name} className="glass rounded-2xl p-6 text-center card-hover">
                <img src={image} alt={name} className="w-20 h-20 rounded-full mx-auto mb-4 object-cover ring-2 ring-violet-500/30" />
                <h4 className="text-white font-semibold">{name}</h4>
                <p className="text-violet-400 text-sm mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { val: '500+', label: 'Productos' },
            { val: '1,200+', label: 'Clientes' },
            { val: '5+', label: 'Años' },
            { val: '24/7', label: 'Soporte' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold gradient-text">{val}</p>
              <p className="text-gray-400 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
