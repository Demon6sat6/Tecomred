import { useState, useEffect } from 'react';
import { Check, Store, Mail, Phone, MapPin, Globe, Save, Clock } from 'lucide-react';
import { useAdmin, type StoreSettings } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';

function InputField({ label, name, value, icon: Icon, type = 'text', onChange }: {
  label: string;
  name: keyof StoreSettings;
  value: string;
  icon: React.ElementType;
  type?: string;
  onChange: (name: keyof StoreSettings, value: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-600 mb-1 font-semibold">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
        />
      </div>
    </div>
  );
}

function Toggle({ label, desc, name, value, onChange }: {
  label: string;
  desc: string;
  name: keyof StoreSettings;
  value: boolean;
  onChange: (name: keyof StoreSettings, value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-slate-900 text-sm font-bold">{label}</p>
        <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(name, !value)}
        className={`relative w-11 h-6 rounded-full transition-all shrink-0 ${value ? 'gradient-brand' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-5.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const { settings, saveSettings, logout } = useAdmin();
  const { symbol } = useCurrency();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<StoreSettings>({ ...settings });

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveSettings(form);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleInputChange = (name: keyof StoreSettings, value: string) => {
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleToggleChange = (name: keyof StoreSettings, value: boolean) => {
    setForm(s => ({ ...s, [name]: value }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Ajustes de la Tienda</h2>
        <p className="text-slate-500 text-sm mt-0.5">Parámetros generales de contacto, moneda y operatividad</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Store info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-slate-900 font-extrabold text-base flex items-center gap-2">
            <Store className="w-4 h-4 text-blue-600" /> Información Comercial
          </h3>
          <InputField label="Nombre de la Tienda" name="storeName" value={form.storeName} icon={Store} onChange={handleInputChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Correo Electrónico de Ventas" name="storeEmail" value={form.storeEmail} icon={Mail} onChange={handleInputChange} />
            <InputField label="Teléfono / WhatsApp de Soporte" name="storePhone" value={form.storePhone} icon={Phone} onChange={handleInputChange} />
          </div>
          <InputField label="Dirección Física de la Tienda" name="storeAddress" value={form.storeAddress} icon={MapPin} onChange={handleInputChange} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Horario de Atención" name="supportHours" value={form.supportHours} icon={Clock} onChange={handleInputChange} />
            <InputField label="URL Dominio Web" name="storeWebsite" value={form.storeWebsite} icon={Globe} onChange={handleInputChange} />
          </div>
        </div>

        {/* Commerce */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-slate-900 font-extrabold text-base">Políticas de Comercio y Precios</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Moneda Principal</label>
              <select
                value={form.currency}
                onChange={e => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
              >
                {['PEN', 'USD', 'EUR', 'COP', 'MXN'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Envío Gratis Desde</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">{symbol}</span>
                <input
                  type="number"
                  value={form.freeShippingMin}
                  onChange={e => handleInputChange('freeShippingMin', e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1 font-semibold">Impuesto IGV / IVA (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={e => handleInputChange('taxRate', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-slate-900 font-extrabold text-base mb-3">Comportamiento de la Tienda</h3>
          <Toggle label="Modo mantenimiento" desc="Muestra aviso de mantenimiento a los clientes visitantes" name="maintenanceMode" value={form.maintenanceMode} onChange={handleToggleChange} />
          <Toggle label="Mostrar productos sin stock" desc="Los productos agotados siguen visibles con etiqueta 'Agotado'" name="showOutOfStock" value={form.showOutOfStock} onChange={handleToggleChange} />
          <Toggle label="Habilitar reseñas de clientes" desc="Permite a los usuarios dejar calificaciones en los productos" name="allowReviews" value={form.allowReviews} onChange={handleToggleChange} />
          <Toggle label="Barra superior de promociones" desc="Activa el cintillo con promociones en la cabecera" name="showAnnouncementBar" value={Boolean(form.showAnnouncementBar)} onChange={handleToggleChange} />
        </div>

        <button
          type="submit"
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all active:scale-95 shadow-md ${
            saved ? 'bg-emerald-600 shadow-emerald-600/20' : 'gradient-brand shadow-blue-600/20 hover:opacity-95'
          }`}
        >
          {saved ? <><Check className="w-5 h-5" /> ¡Ajustes Guardados con Éxito!</> : <><Save className="w-5 h-5" /> Guardar Todos los Cambios</>}
        </button>
      </form>

      {/* Danger zone */}
      <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-xs">
        <h3 className="text-rose-700 font-extrabold text-sm mb-1">Cierre de Sesión Seguro</h3>
        <p className="text-slate-500 text-xs mb-4">Cierra la sesión activa del panel de control en este navegador.</p>
        <button
          type="button"
          onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 transition-colors"
        >
          Cerrar Sesión de Administrador
        </button>
      </div>
    </div>
  );
}