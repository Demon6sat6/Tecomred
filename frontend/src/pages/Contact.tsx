import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Check, Loader2, MessageCircle } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { usePageTitle } from '../hooks/usePageTitle';

const MAX_MESSAGE = 1000;
const INITIAL_FORM = { nombre: '', email: '', asunto: '', mensaje: '', _trap: '' };

export default function Contact() {
  usePageTitle('Contacto', 'Escríbenos o llámanos: atención personalizada para proyectos de red y cómputo en todo el Perú.');
  const { settings } = useAdmin();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<typeof INITIAL_FORM>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name as keyof typeof errors]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next: Partial<typeof INITIAL_FORM> = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Ingresa un correo válido.';
    if (!form.asunto) next.asunto = 'Selecciona un asunto.';
    if (form.mensaje.trim().length < 10) next.mensaje = 'El mensaje debe tener al menos 10 caracteres.';
    if (form.mensaje.length > MAX_MESSAGE) next.mensaje = `Máximo ${MAX_MESSAGE} caracteres.`;
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form._trap) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) { setErrors(nextErrors); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: form.nombre.trim(), email: form.email, asunto: form.asunto, mensaje: form.mensaje.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setForm(INITIAL_FORM);
      setErrors({});
    } catch {
      setStatus('idle');
      setErrors({ mensaje: 'Error al enviar. Inténtalo de nuevo.' });
    }
  };

  const inputCls = (field: keyof typeof errors) =>
    `w-full px-4 py-2.5 bg-white/5 border rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none text-sm transition-colors ${
      errors[field] ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-violet-500/60'
    }`;

  const phone   = settings.storePhone  || '+51 999 888 777';
  const email   = settings.storeEmail  || 'ventas@tecomred.com';
  const address = settings.storeAddress || 'Av. Tecnología 1234, Lima, Perú';
  const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 border border-violet-500/30 text-violet-400 bg-violet-500/10">
          Contáctanos
        </span>
        <h1 className="text-4xl font-extrabold text-white mb-4">¿En qué podemos <span className="gradient-text">ayudarte?</span></h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          ¿Tienes preguntas sobre nuestros productos o necesitas asesoría técnica? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar info */}
        <div className="space-y-4">
          {[
            { icon: MapPin, label: 'Dirección', value: address, href: undefined },
            { icon: Phone,  label: 'Teléfono',  value: phone,   href: `tel:${phone}` },
            { icon: Mail,   label: 'Email',     value: email,   href: `mailto:${email}` },
            { icon: Clock,  label: 'Horario',   value: 'Lun-Vie 9am-7pm · Sáb 9am-2pm', href: undefined },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5 font-medium uppercase tracking-wide">{label}</p>
                {href ? (
                  <a
                    href={label === 'Teléfono' ? whatsappUrl : href}
                    target={label === 'Teléfono' ? '_blank' : undefined}
                    rel={label === 'Teléfono' ? 'noopener noreferrer' : undefined}
                    className="text-white font-medium text-sm hover:text-violet-400 transition-colors"
                  >{value}</a>
                ) : (
                  <p className="text-white font-medium text-sm">{value}</p>
                )}
              </div>
            </div>
          ))}

          {/* WhatsApp CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Escríbenos por WhatsApp</p>
              <p className="text-emerald-400 text-xs">Respuesta en minutos</p>
            </div>
          </a>

          {/* Map */}
          <div className="glass rounded-2xl overflow-hidden" style={{ height: '200px' }}>
            <iframe
              title="Mapa TecomRed"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.2!2d-77.0428!3d-12.0464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAyJzQ3LjAiUyA3N8KwMDInMzQuMSJX!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe"
              width="100%" height="200" style={{ border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-8 border border-white/8">
            <h2 className="text-white font-bold text-xl mb-6">Envíanos un mensaje</h2>

            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-emerald-400 text-sm">¡Mensaje enviado! Te responderemos en menos de 24 horas.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Honeypot */}
              <input type="text" name="_trap" value={form._trap} onChange={handleChange}
                aria-hidden="true" tabIndex={-1}
                className="absolute -left-[9999px] opacity-0 pointer-events-none" autoComplete="off" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="nombre" className="block text-sm text-gray-400 mb-1.5">
                    Nombre completo <span className="text-red-400">*</span>
                  </label>
                  <input id="nombre" type="text" name="nombre" value={form.nombre}
                    onChange={handleChange} placeholder="Juan Pérez" autoComplete="name"
                    className={inputCls('nombre')} />
                  {errors.nombre && <p className="text-red-400 text-xs mt-1">{errors.nombre}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-400 mb-1.5">
                    Correo electrónico <span className="text-red-400">*</span>
                  </label>
                  <input id="email" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="juan@email.com" autoComplete="email"
                    className={inputCls('email')} />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="asunto" className="block text-sm text-gray-400 mb-1.5">
                  Asunto <span className="text-red-400">*</span>
                </label>
                <select id="asunto" name="asunto" value={form.asunto}
                  onChange={handleChange} className={`${inputCls('asunto')} bg-gray-900`}>
                  <option value="">Selecciona un asunto</option>
                  <option value="consulta">Consulta de producto</option>
                  <option value="cotizacion">Solicitar cotización</option>
                  <option value="soporte">Soporte técnico</option>
                  <option value="pedido">Estado de pedido</option>
                  <option value="proyecto">Proyecto de red</option>
                  <option value="otro">Otro</option>
                </select>
                {errors.asunto && <p className="text-red-400 text-xs mt-1">{errors.asunto}</p>}
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="mensaje" className="block text-sm text-gray-400">
                    Mensaje <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-xs ${form.mensaje.length > MAX_MESSAGE ? 'text-red-400' : 'text-gray-600'}`}>
                    {form.mensaje.length}/{MAX_MESSAGE}
                  </span>
                </div>
                <textarea id="mensaje" name="mensaje" value={form.mensaje}
                  onChange={handleChange} rows={5}
                  placeholder="Describe tu consulta, el proyecto que tienes en mente o la ayuda que necesitas..."
                  className={`${inputCls('mensaje')} resize-none`} />
                {errors.mensaje && <p className="text-red-400 text-xs mt-1">{errors.mensaje}</p>}
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 active:scale-[0.99] transition-all shadow-lg shadow-violet-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                ) : (
                  <><Send className="w-5 h-5" /> Enviar mensaje</>
                )}
              </button>

              <p className="text-gray-600 text-xs text-center">
                Al enviar aceptas nuestra{' '}
                <a href="/privacidad" className="text-violet-400 hover:text-violet-300 transition-colors">política de privacidad</a>.
                Respondemos en menos de 24 horas.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
