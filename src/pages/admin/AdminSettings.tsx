import { useState } from 'react';
import { Check, Store, Mail, Phone, MapPin, Globe, Save, Lock, Eye, EyeOff, AlertCircle, BarChart2 } from 'lucide-react';
import { useAdmin, type StoreSettings } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';

export default function AdminSettings() {
  const { settings, saveSettings, logout } = useAdmin();
  const { symbol } = useCurrency();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<StoreSettings>({ ...settings });

  // Password change
  const [showPassSection, setShowPassSection] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passError, setPassError] = useState('');
  const [passSaved, setPassSaved] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleChangePass = () => {
    setPassError('');
    if (passForm.current !== settings.adminPass) { setPassError('Contraseña actual incorrecta'); return; }
    if (passForm.newPass.length < 6) { setPassError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    if (passForm.newPass !== passForm.confirm) { setPassError('Las contraseñas no coinciden'); return; }
    saveSettings({ ...form, adminUser: passForm.current !== '' ? form.adminUser : form.adminUser, adminPass: passForm.newPass });
    setPassSaved(true);
    setPassForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => { setPassSaved(false); setShowPassSection(false); }, 2000);
  };

  const InputField = ({ label, name, value, icon: Icon, type = 'text' }: {
    label: string; name: keyof StoreSettings; value: string; icon: React.ElementType; type?: string;
  }) => (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type={type} value={value}
          onChange={e => setForm(s => ({ ...s, [name]: e.target.value }))}
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
      </div>
    </div>
  );

  const Toggle = ({ label, desc, name, value }: { label: string; desc: string; name: keyof StoreSettings; value: boolean }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-gray-500 text-xs">{desc}</p>
      </div>
      <button type="button" onClick={() => setForm(s => ({ ...s, [name]: !value }))}
        className={`relative w-11 h-6 rounded-full transition-all ${value ? 'gradient-brand' : 'bg-gray-700'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
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
          <h3 className="text-white font-bold flex items-center gap-2"><Store className="w-4 h-4 text-sky-400" /> Información de la tienda</h3>
          <InputField label="Nombre de la tienda" name="storeName"    value={form.storeName}    icon={Store} />
          <InputField label="Correo electrónico"  name="storeEmail"   value={form.storeEmail}   icon={Mail} />
          <InputField label="Teléfono"            name="storePhone"   value={form.storePhone}   icon={Phone} />
          <InputField label="Dirección"           name="storeAddress" value={form.storeAddress} icon={MapPin} />
          <InputField label="Sitio web"           name="storeWebsite" value={form.storeWebsite} icon={Globe} />
        </div>

        {/* Commerce */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold">Comercio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Moneda</label>
              <select value={form.currency} onChange={e => setForm(s => ({ ...s, currency: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                {['PEN','USD', 'EUR', 'COP', 'MXN', 'ARS'].map(c => <option key={c} value={c} className="bg-gray-900">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Envío gratis desde</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">{symbol}</span>
                <input type="number" value={form.freeShippingMin} onChange={e => setForm(s => ({ ...s, freeShippingMin: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">Impuesto (%)</label>
              <input type="number" value={form.taxRate} onChange={e => setForm(s => ({ ...s, taxRate: e.target.value }))}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3">Opciones</h3>
          <Toggle label="Modo mantenimiento"       desc="La tienda mostrará una página de mantenimiento"    name="maintenanceMode" value={form.maintenanceMode} />
          <Toggle label="Mostrar productos agotados" desc="Los productos sin stock seguirán visibles"       name="showOutOfStock"  value={form.showOutOfStock} />
          <Toggle label="Permitir reseñas"         desc="Los clientes pueden dejar reseñas en los productos" name="allowReviews"   value={form.allowReviews} />
        </div>

        {/* Stats del Home */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-400" /> Estadísticas del Home
          </h3>
          <p className="text-gray-500 text-xs">Edita los 4 números que aparecen en la sección de estadísticas de la página principal.</p>
          <div className="space-y-3">
            {([
              { v: 'stat1Value', s: 'stat1Suffix', l: 'stat1Label', preview: `${form.stat1Value}${form.stat1Suffix}` },
              { v: 'stat2Value', s: 'stat2Suffix', l: 'stat2Label', preview: `${form.stat2Value}${form.stat2Suffix}` },
              { v: 'stat3Value', s: 'stat3Suffix', l: 'stat3Label', preview: `${form.stat3Value}${form.stat3Suffix}` },
              { v: 'stat4Value', s: 'stat4Suffix', l: 'stat4Label', preview: `${form.stat4Value}${form.stat4Suffix}` },
            ] as const).map((stat, i) => (
              <div key={i} className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">{i + 1}</span>
                  <span className="text-sky-400 font-bold text-sm">{stat.preview}</span>
                  <span className="text-gray-500 text-xs">â€” {(form as any)[stat.l]}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Número</label>
                    <input
                      type="number"
                      value={(form as any)[stat.v]}
                      onChange={e => setForm(f => ({ ...f, [stat.v]: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Sufijo</label>
                    <input
                      type="text"
                      value={(form as any)[stat.s]}
                      onChange={e => setForm(f => ({ ...f, [stat.s]: e.target.value }))}
                      placeholder="+ / años / /7"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Etiqueta</label>
                    <input
                      type="text"
                      value={(form as any)[stat.l]}
                      onChange={e => setForm(f => ({ ...f, [stat.l]: e.target.value }))}
                      placeholder="Descripción"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit"
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold transition-all active:scale-95 shadow-lg ${saved ? 'bg-emerald-500 shadow-emerald-500/20' : 'gradient-brand shadow-sky-500/20 hover:opacity-90'}`}>
          {saved ? <><Check className="w-5 h-5" /> Guardado</> : <><Save className="w-5 h-5" /> Guardar cambios</>}
        </button>
      </form>

      {/* Change password */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-sky-400" /> Seguridad</h3>
          <button onClick={() => setShowPassSection(s => !s)}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
            {showPassSection ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Usuario: <span className="font-mono text-sky-400">{settings.adminUser}</span></p>
            <p className="text-gray-500 text-xs">Contraseña protegida</p>
          </div>
        </div>

        {showPassSection && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            {passError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{passError}</p>
              </div>
            )}
            {passSaved && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-emerald-400 text-xs">Contraseña actualizada correctamente</p>
              </div>
            )}
            {[
              { label: 'Contraseña actual', key: 'current', show: showCurrent, toggle: () => setShowCurrent(s => !s) },
              { label: 'Nueva contraseña',  key: 'newPass',  show: showNew,     toggle: () => setShowNew(s => !s) },
              { label: 'Confirmar nueva',   key: 'confirm',  show: showNew,     toggle: () => setShowNew(s => !s) },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">{f.label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type={f.show ? 'text' : 'password'}
                    value={(passForm as any)[f.key]}
                    onChange={e => setPassForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                  <button type="button" onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePass}
              className="w-full py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all mt-2">
              Actualizar contraseña
            </button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-5 border border-red-500/20">
        <h3 className="text-red-400 font-bold mb-3">Zona de peligro</h3>
        <p className="text-gray-400 text-sm mb-4">Estas acciones son irreversibles. Procede con cuidado.</p>
        <button onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors">
          Cerrar sesión del panel
        </button>
      </div>
    </div>
  );
}

