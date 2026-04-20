import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Check } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ nombre: '', email: '', asunto: '', mensaje: '' });
  };

  const contactInfo = [
    { icon: MapPin, label: 'Dirección', value: 'Av. Tecnología 123, Ciudad' },
    { icon: Phone, label: 'Teléfono', value: '+1 (234) 567-890' },
    { icon: Mail, label: 'Email', value: 'info@tecomred.com' },
    { icon: Clock, label: 'Horario', value: 'Lun–Vie 8am–6pm' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-14">
        <h1 className="text-4xl font-extrabold text-white mb-4">Contáctanos</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          ¿Tienes preguntas sobre nuestros productos o necesitas asesoría técnica? Estamos aquí para ayudarte.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact info */}
        <div className="space-y-4">
          {contactInfo.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                <p className="text-white font-medium text-sm">{value}</p>
              </div>
            </div>
          ))}

          {/* Map placeholder */}
          <div className="glass rounded-2xl overflow-hidden h-48 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-10 h-10 text-sky-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Mapa de ubicación</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-white font-bold text-xl mb-6">Envíanos un mensaje</h2>

            {sent && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6">
                <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-emerald-400 text-sm">¡Mensaje enviado! Te responderemos pronto.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Nombre completo</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="juan@email.com"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Asunto</label>
                <select
                  name="asunto"
                  value={form.asunto}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 focus:outline-none focus:border-sky-500 text-sm"
                >
                  <option value="" className="bg-gray-900">Selecciona un asunto</option>
                  <option value="consulta" className="bg-gray-900">Consulta de producto</option>
                  <option value="cotizacion" className="bg-gray-900">Solicitar cotización</option>
                  <option value="soporte" className="bg-gray-900">Soporte técnico</option>
                  <option value="pedido" className="bg-gray-900">Estado de pedido</option>
                  <option value="otro" className="bg-gray-900">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Mensaje</label>
                <textarea
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe tu consulta o necesidad..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 text-sm resize-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-brand text-white font-semibold hover:opacity-90 transition-opacity"
              >
                <Send className="w-5 h-5" />
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
