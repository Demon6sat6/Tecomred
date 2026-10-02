import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Share2, MessageCircle, Globe, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { useStore } from '../context/StoreContext';

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
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Error');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('idle');
      setError('Error al suscribirse. Inténtalo de nuevo.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
        <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
        ¡Suscrito! Pronto recibirás nuestras ofertas.
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-2 w-full sm:w-auto" onSubmit={handleSubmit} noValidate>
      <div className="flex min-w-0 gap-2">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="tu@correo.com"
          aria-label="Correo electrónico para newsletter"
          disabled={status === 'loading'}
          className={`min-w-0 flex-1 sm:w-64 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-colors disabled:opacity-50 ${
            error ? 'border-red-400' : 'border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
          }`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl gradient-brand text-white text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 sm:gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
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
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </form>
  );
}

export default function Footer() {
  const { settings } = useAdmin();
  const { products } = useStore();
  const footerCategories = [...new Set(products.map(product => product.category))].slice(0, 6);
  return (
    <footer className="bg-slate-100/90 border-t border-slate-200 mt-12 sm:mt-20">
      {/* Newsletter strip */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h3 className="text-slate-900 font-bold text-base sm:text-lg">Suscríbete a nuestras ofertas</h3>
              <p className="text-slate-500 text-xs sm:text-sm">Recibe descuentos exclusivos y novedades en tu correo.</p>
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
              <img
                src="/logo.png"
                alt={settings.storeName || "SiscomRed"}
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
              Tu tienda especializada en redes, componentes de computadoras y tecnología profesional.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 flex items-center justify-center transition-colors shadow-xs" aria-label="Redes sociales">
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 hover:text-sky-600" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 flex items-center justify-center transition-colors shadow-xs" aria-label="Chat">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 hover:text-sky-600" />
              </a>
              <a href="#" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 flex items-center justify-center transition-colors shadow-xs" aria-label="Sitio web">
                <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 hover:text-sky-600" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-3 sm:mb-4">Productos</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {footerCategories.map(cat => (
                <li key={cat}>
                  <Link
                    to={`/productos?categoria=${encodeURIComponent(cat)}`}
                    className="text-slate-600 hover:text-violet-700 text-xs sm:text-sm transition-colors font-medium"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-3 sm:mb-4">Empresa</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                { to: '/', label: 'Inicio' },
                { to: '/productos', label: 'Catálogo' },
                { to: '/contacto', label: 'Contacto' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-600 hover:text-violet-700 text-xs sm:text-sm transition-colors font-medium">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-slate-900 font-bold text-sm sm:text-base mb-3 sm:mb-4">Contacto</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 mt-0.5 shrink-0" />
                <span className="text-slate-600 text-xs sm:text-sm">{settings.storeAddress}</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
                <a
                  href={`https://wa.me/${settings.storePhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-emerald-600 text-xs sm:text-sm transition-colors font-medium"
                >
                  {settings.storePhone}
                </a>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0" />
                <a href={`mailto:${settings.storeEmail}`} className="text-slate-600 hover:text-sky-600 text-xs sm:text-sm transition-colors break-all font-medium">
                  {settings.storeEmail}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-8 sm:mt-10 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
            © 2026 {settings.storeName}. Todos los derechos reservados.
          </p>
          <div className="flex gap-3 sm:gap-4">
            <Link to="/privacidad" className="text-slate-500 hover:text-slate-800 text-xs sm:text-sm transition-colors">Privacidad</Link>
            <Link to="/terminos" className="text-slate-500 hover:text-slate-800 text-xs sm:text-sm transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
