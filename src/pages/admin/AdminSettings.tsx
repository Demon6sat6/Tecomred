import { useState } from 'react';
import { Check, Store, Mail, Phone, MapPin, Globe, Save } from 'lucide-react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'TecomRed',
    storeEmail: 'info@tecomred.com',
    storePhone: '+1 (234) 567-890',
    storeAddress: 'Av. Tecnología 123, Ciudad',
    storeWebsite: 'https://tecomred.com',
    freeShippingMin: '100',
    currency: 'USD',
    taxRate: '0',
    maintenanceMode: false,
    showOutOfStock: true,
    allowReviews: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Field = ({ label, name, value, icon: Icon, type = 'text', prefix = '' }: {
    label: string; name: string; value: string;
    icon: React.ElementType; type?: string; prefix?: string;
  }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        {prefix && (
          <span className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => setSettings(s => ({ ...s, [name]: e.target.value }))}
          className={`w-full ${prefix ? 'pl-12' : 'pl-9'} pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60`}
        />
      </div>
    </div>
  );

  const Toggle = ({ label, desc, name, value }: {
    label: string; desc: string; name: string; value: boolean;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => setSettings(s => ({ ...s, [name]: !value }))}
        className={`relative w-11 h-6 rounded-full transition-all ${value ? 'gradient-brand' : 'bg-gray-700'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Ajustes</h2>
        <p className="text-gray-500 text-sm">Configuración general de la tienda</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Store info */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Store className="w-4 h-4 text-sky-400" /> Información de la tienda
          </h3>
          <Field label="Nombre de la tienda" name="storeName"    value={settings.storeName}    icon={Store} />
          <Field label="Correo electrónico"  name="storeEmail"   value={settings.storeEmail}   icon={Mail} />
          <Field label="Teléfono"            name="storePhone"   value={settings.storePhone}   icon={Phone} />
          <Field label="Dirección"           name="storeAddress" value={settings.storeAddress} icon={MapPin} />
          <Field label="Sitio web"           name="storeWebsite" value={settings.storeWebsite} icon={Globe} />
        </div>

        {/* Commerce */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold">Comercio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Moneda</label>
              <select
                value={settings.currency}
                onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
              >
                {['USD', 'EUR', 'VES', 'COP', 'MXN', 'ARS'].map(c => (
                  <option key={c} value={c} className="bg-gray-900">{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Envío gratis desde</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number" value={settings.freeShippingMin}
                  onChange={e => setSettings(s => ({ ...s, freeShippingMin: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Impuesto (%)</label>
              <input
                type="number" value={settings.taxRate}
                onChange={e => setSettings(s => ({ ...s, taxRate: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3">Opciones</h3>
          <Toggle label="Modo mantenimiento" desc="La tienda mostrará una página de mantenimiento" name="maintenanceMode" value={settings.maintenanceMode} />
          <Toggle label="Mostrar productos agotados" desc="Los productos sin stock seguirán visibles" name="showOutOfStock" value={settings.showOutOfStock} />
          <Toggle label="Permitir reseñas" desc="Los clientes pueden dejar reseñas en los productos" name="allowReviews" value={settings.allowReviews} />
        </div>

        <button
          type="submit"
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg ${
            saved ? 'bg-emerald-500 shadow-emerald-500/20' : 'gradient-brand shadow-sky-500/20 hover:opacity-90'
          }`}
        >
          {saved ? <><Check className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar cambios</>}
        </button>
      </form>
    </div>
  );
}
