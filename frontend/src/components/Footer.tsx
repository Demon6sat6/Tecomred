import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wifi, Mail, Phone, MapPin, Share2, MessageCircle, Globe, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const validate = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate(email)) {
      setError('Ingresa un correo válido.');
      return;
    }
    setError('');
    setStatus('loading');
    // Simula envío — reemplazar con llamada real a tu API/newsletter service
    await new Promise(r => setTimeout(r, 900));
    setStatus('success');
    setEmail('');
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium">
        <CheckCircle className="w-4 h-4 shrink-0" />
        ¡Suscrito! Pronto recibirás nuestras ofertas.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-2 w-full sm:w-auto" onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="tu@correo.com"
          aria-label="Correo electrónico para newsletter"
          disabled={status === 'loading'}
          className={`flex-1 sm:w-64 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 border rounded-lg sm:rounded-xl text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:outline-none transition-colors disabled:opacity-50 ${
            error ? 'border-red-500/60' : 'border-white/10 focus:border-sky-500/50'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl gradient-brand text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 sm:gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">Suscribir</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </>
          )}
        </button>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </form>
  );
}

export default function Footer() {
  const { settings } = useAdmin();
  return (
    <footer className="bg-gray-900/80 border-t border-white/8 mt-12 sm:mt-20">
      {/* Newsletter strip */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h3 className="text-white font-bold text-base sm:text-lg">Suscríbete a nuestras ofertas</h3>
              <p className="text-gray-400 text-xs sm:text-sm">Recibe descuentos exclusivos y novedades en tu correo.</p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl gradient-brand flex items-center justify-center">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold gradient-text">TecomRed</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
              Tu tienda especializada en redes, componentes de computadoras y tecnología profesional.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center transition-colors" aria-label="Redes sociales">
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-sky-400" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center transition-colors" aria-label="Chat">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-sky-400" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/5 hover:bg-sky-500/20 flex items-center justify-center transition-colors" aria-label="Sitio web">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 hover:text-sky-400" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Productos</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {['Switches', 'Routers', 'Cables', 'Procesadores', 'Memorias RAM', 'Almacenamiento'].map(cat => (
                <li key={cat}>
                  <Link
                    to={`/productos?categoria=${encodeURIComponent(cat)}`}
                    className="text-gray-400 hover:text-sky-400 text-xs sm:text-sm transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Empresa</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/productos', label: 'Catálogo' },
                { to: '/contacto', label: 'Contacto' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-sky-400 text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">Contacto</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-xs sm:text-sm">{settings.storeAddress}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                <a href={`tel:${settings.storePhone}`} className="text-gray-400 hover:text-sky-400 text-xs sm:text-sm transition-colors">
                  {settings.storePhone}
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                <a href={`mailto:${settings.storeEmail}`} className="text-gray-400 hover:text-sky-400 text-xs sm:text-sm transition-colors break-all">
                  {settings.storeEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
            © 2026 TecomRed. Todos los derechos reservados.
          </p>
          <div className="flex gap-3 sm:gap-4">
            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs sm:text-sm transition-colors">Privacidad</a>
            <a href="#" className="text-gray-500 hover:text-gray-400 text-xs sm:text-sm transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
