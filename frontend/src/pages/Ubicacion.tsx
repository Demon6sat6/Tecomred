import { MapPin, Clock, Phone, Mail, Navigation } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

const horarios = [
  { dia: 'Lunes — Viernes', hora: '9:00 am — 7:00 pm' },
  { dia: 'Sábado', hora: '9:00 am — 2:00 pm' },
  { dia: 'Domingo', hora: 'Cerrado' },
];

export default function Ubicacion() {
  const { settings } = useAdmin();
  const phone = settings.storePhone || 'No configurado';
  const email = settings.storeEmail || 'No configurado';
  const address = settings.storeAddress || 'No configurada';
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #863bff, transparent 70%)' }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-violet-200 text-violet-700 bg-violet-50">
            Encuéntranos
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Nuestra <span className="gradient-text">Ubicación</span>
          </h1>
          <p className="text-slate-600 text-lg">Visítanos en nuestra tienda física o contáctanos por cualquier canal.</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

          {/* Mapa embed */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs" style={{ minHeight: '420px' }}>
            <iframe
              title="Ubicación SiscomRed"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.2!2d-77.0428!3d-12.0464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAyJzQ3LjAiUyA3N8KwMDInMzQuMSJX!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Info de contacto */}
          <div className="flex flex-col gap-5">
            {/* Dirección */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold mb-1">Dirección</h3>
                  <p className="text-slate-600 text-sm">{address}</p>
                  <a
                    href="https://maps.google.com/?q=-12.0464,-77.0428"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-violet-600 text-sm font-medium hover:text-violet-700 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Cómo llegar
                  </a>
                </div>
              </div>
            </div>

            {/* Horario */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-slate-900 font-bold mb-3">Horario de Atención</h3>
                  <div className="space-y-2">
                    {horarios.map(({ dia, hora }) => (
                      <div key={dia} className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">{dia}</span>
                        <span className={hora === 'Cerrado' ? 'text-red-600 font-semibold' : 'text-slate-900 font-medium'}>
                          {hora}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Teléfono */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold mb-1">Teléfono</h3>
                  <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors text-sm">
                    {phone}
                  </a>
                  <p className="text-slate-500 text-xs mt-0.5">WhatsApp disponible</p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 gradient-brand rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-violet-500/20">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold mb-1">Correo Electrónico</h3>
                  <a href={`mailto:${email}`} className="text-violet-600 hover:text-violet-700 font-medium transition-colors text-sm">
                    {email}
                  </a>
                  <p className="text-slate-500 text-xs mt-0.5">Respondemos en menos de 24 h</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
