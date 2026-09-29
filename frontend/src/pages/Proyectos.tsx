import { Building2, Wifi, Server, Shield } from 'lucide-react';

const proyectos = [
  {
    icon: Building2,
    titulo: 'Red Corporativa — Empresa Minera',
    descripcion: 'Instalación de infraestructura de red con switches Cisco y cableado estructurado para 200 puestos de trabajo.',
    tags: ['Cisco', 'Cableado Cat6A', 'VLANs'],
    año: '2024',
  },
  {
    icon: Wifi,
    titulo: 'Cobertura Wi-Fi — Centro Comercial',
    descripcion: 'Despliegue de 45 access points Ubiquiti para cobertura total en un centro comercial de 3 pisos.',
    tags: ['Ubiquiti', 'Wi-Fi 6', 'UniFi'],
    año: '2024',
  },
  {
    icon: Server,
    titulo: 'Data Center — Municipalidad',
    descripcion: 'Diseño e implementación de sala de servidores con switches core MikroTik y sistema de respaldo.',
    tags: ['MikroTik', 'Servidores', 'UPS'],
    año: '2023',
  },
  {
    icon: Shield,
    titulo: 'Seguridad de Red — Hospital Regional',
    descripcion: 'Configuración de firewall, segmentación de red y monitoreo 24/7 para un hospital con 500 dispositivos.',
    tags: ['Firewall', 'VPN', 'Monitoreo'],
    año: '2023',
  },
  {
    icon: Wifi,
    titulo: 'Internet Rural — Comunidades Andinas',
    descripcion: 'Proyecto de conectividad para 8 comunidades rurales usando enlaces punto a punto y equipos MikroTik.',
    tags: ['MikroTik', 'Punto a Punto', 'Rural'],
    año: '2022',
  },
  {
    icon: Building2,
    titulo: 'Red Universitaria — Campus Norte',
    descripcion: 'Actualización completa de la red universitaria con fibra óptica y switching de alta disponibilidad.',
    tags: ['Fibra Óptica', 'Alta Disponibilidad', 'Core Switch'],
    año: '2022',
  },
];

export default function Proyectos() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #47bfff, transparent 70%)' }} />
          <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #863bff, transparent 70%)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-violet-200 text-violet-700 bg-violet-50">
            Portafolio
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6">
            Proyectos que hablan por <span className="gradient-text">nuestra experiencia</span>
          </h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            Hemos ejecutado proyectos de redes y tecnología para empresas, instituciones públicas y comunidades
            en todo el Perú. Cada proyecto es un testimonio de nuestro compromiso con la calidad.
          </p>
        </div>
      </section>

      {/* Proyectos */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.map(({ icon: Icon, titulo, descripcion, tags, año }) => (
            <div key={titulo} className="bg-white border border-slate-200 rounded-2xl p-6 card-hover flex flex-col gap-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  {año}
                </span>
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-base mb-2">{titulo}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{descripcion}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {tags.map(tag => (
                  <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">¿Tienes un proyecto en mente?</h2>
          <p className="text-slate-600 mb-6">Cuéntanos tu necesidad y te preparamos una solución a medida.</p>
          <a
            href="/contacto"
            className="inline-block px-8 py-3 gradient-brand text-white font-bold rounded-xl shadow-md shadow-violet-500/20 hover:opacity-90 transition-opacity"
          >
            Contáctanos
          </a>
        </div>
      </section>
    </main>
  );
}
