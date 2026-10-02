import { useEffect, useRef, useState, type ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Globe, Loader2, LogOut, Mail, MapPin, Phone, RotateCcw, Save, SlidersHorizontal, Store, Wallet } from 'lucide-react';
import { useAdmin, type StoreSettings } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import { adminAlert } from '../../utils/adminAlerts';
import { settingsSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { Field, PageHeader, Switch } from '../../components/admin/AdminUI';

type TextKey = 'storeName' | 'storeEmail' | 'storePhone' | 'storeAddress' | 'supportHours' | 'storeWebsite' | 'freeShippingMin' | 'taxRate' | 'currency';
type ToggleKey = 'maintenanceMode' | 'showOutOfStock' | 'allowReviews' | 'showAnnouncementBar';
type SettingsForm = Record<TextKey, string> & Record<ToggleKey, boolean>;

const textKeys: TextKey[] = ['storeName', 'storeEmail', 'storePhone', 'storeAddress', 'supportHours', 'storeWebsite', 'freeShippingMin', 'taxRate', 'currency'];
const toggles: { key: ToggleKey; label: string; desc: string }[] = [
  { key: 'maintenanceMode', label: 'Modo mantenimiento', desc: 'Muestra un aviso de mantenimiento a los visitantes.' },
  { key: 'showOutOfStock', label: 'Mostrar productos sin stock', desc: "Los productos agotados siguen visibles con la etiqueta 'Agotado'." },
  { key: 'allowReviews', label: 'Reseñas de clientes', desc: 'Permite que los compradores califiquen los productos.' },
  { key: 'showAnnouncementBar', label: 'Barra de promociones', desc: 'Activa el cintillo de promociones en la cabecera.' },
];

const pick = (settings: StoreSettings): SettingsForm => ({
  ...Object.fromEntries(textKeys.map(key => [key, String(settings[key] ?? '')])) as Record<TextKey, string>,
  ...Object.fromEntries(toggles.map(({ key }) => [key, Boolean(settings[key])])) as Record<ToggleKey, boolean>,
});
const sameForm = (a: SettingsForm, b: SettingsForm) => (Object.keys(a) as (keyof SettingsForm)[]).every(key => a[key] === b[key]);

function Section({ icon: Icon, title, description, children }: { icon: ElementType; title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="admin-card grid gap-5 p-5 sm:p-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <span className="admin-kpi-icon admin-tone-blue !h-10 !w-10"><Icon className="h-5 w-5" /></span>
        <h3 className="mt-3 text-[15px]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>
      </div>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function AdminSettings() {
  const { settings, saveSettings, logout, isSavingSettings } = useAdmin();
  const { symbol } = useCurrency();
  const navigate = useNavigate();
  const [form, setForm] = useState<SettingsForm>(() => pick(settings));
  const [errors, setErrors] = useState<FieldErrors>({});
  const dirty = !sameForm(form, pick(settings));
  const dirtyRef = useRef(dirty);
  useEffect(() => { dirtyRef.current = dirty; });

  // Sincroniza cambios llegados del servidor solo si no hay ediciones pendientes.
  useEffect(() => { if (!dirtyRef.current) setForm(pick(settings)); }, [settings]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validate(settingsSchema, form);
    if (!result.ok) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    const ok = await saveSettings({ ...form, ...(result.data as Partial<StoreSettings>) });
    if (ok) void adminAlert.success('Configuración guardada', 'Los cambios ya se aplican en la tienda.');
    else void adminAlert.error('No se pudieron guardar los cambios. Revisa la conexión con el servidor.');
  };

  const discard = () => { setForm(pick(settings)); setErrors({}); };

  const handleLogout = async () => {
    if (!await adminAlert.confirm('¿Cerrar sesión?', 'Saldrás del panel de administración en este navegador.', 'Cerrar sesión')) return;
    logout();
    navigate('/cuenta');
  };

  const textField = (key: TextKey, label: string, Icon: ElementType, options: { type?: string; placeholder?: string; hint?: string; required?: boolean; wide?: boolean; maxLength?: number } = {}) => (
    <Field label={label} required={options.required} error={errors[key]} hint={options.hint} className={options.wide ? 'sm:col-span-2' : ''}>
      {props => <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input {...props} type={options.type ?? 'text'} value={form[key]} maxLength={options.maxLength ?? 200} placeholder={options.placeholder} onChange={event => update(key, event.target.value)} className="admin-input !pl-9" />
      </div>}
    </Field>
  );

  return (
    <div className="space-y-5 pb-20">
      <PageHeader title="Configuración" description="Datos de contacto, políticas comerciales y comportamiento de la tienda." />

      <form id="settings-form" onSubmit={event => void handleSave(event)} noValidate className="space-y-5">
        <Section icon={Store} title="Información comercial" description="Se muestra en el pie de página, la página de contacto y los mensajes de WhatsApp.">
          {textField('storeName', 'Nombre de la tienda', Store, { required: true, wide: true, maxLength: 60 })}
          {textField('storeEmail', 'Correo de ventas', Mail, { type: 'email', required: true, maxLength: 254 })}
          {textField('storePhone', 'Teléfono / WhatsApp', Phone, { type: 'tel', required: true, maxLength: 20, hint: 'Se usa para recibir los pedidos por WhatsApp' })}
          {textField('storeAddress', 'Dirección física', MapPin, { required: true, wide: true })}
          {textField('supportHours', 'Horario de atención', Clock, { required: true, maxLength: 80, placeholder: 'Lun-Vie 9am-7pm' })}
          {textField('storeWebsite', 'Sitio web', Globe, { type: 'url', placeholder: 'https://siscomred.pe' })}
        </Section>

        <Section icon={Wallet} title="Comercio y precios" description="Moneda, impuestos y el monto desde el que el envío es gratuito.">
          <Field label="Moneda principal" error={errors.currency}>
            {props => <select {...props} value={form.currency} onChange={event => update('currency', event.target.value)} className="admin-input">{['PEN', 'USD', 'EUR', 'COP', 'MXN'].map(currency => <option key={currency} value={currency}>{currency}</option>)}</select>}
          </Field>
          <Field label={`Envío gratis desde (${symbol})`} required error={errors.freeShippingMin} hint="0 = siempre gratis">
            {props => <input {...props} type="number" inputMode="decimal" min="0" step="0.01" value={form.freeShippingMin} onChange={event => update('freeShippingMin', event.target.value)} className="admin-input tabular" />}
          </Field>
          <Field label="Impuesto IGV / IVA (%)" required error={errors.taxRate} hint="Entre 0 y 100">
            {props => <input {...props} type="number" inputMode="decimal" min="0" max="100" step="0.01" value={form.taxRate} onChange={event => update('taxRate', event.target.value)} className="admin-input tabular" />}
          </Field>
        </Section>

        <Section icon={SlidersHorizontal} title="Comportamiento" description="Activa o desactiva funciones visibles para los clientes.">
          <div className="divide-y divide-slate-100 sm:col-span-2">
            {toggles.map(toggle => (
              <div key={toggle.key} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div><p className="text-sm font-semibold text-slate-900">{toggle.label}</p><p className="text-xs text-slate-500">{toggle.desc}</p></div>
                <Switch checked={form[toggle.key]} onChange={value => update(toggle.key, value)} label={toggle.label} />
              </div>
            ))}
          </div>
        </Section>
      </form>

      <section className="admin-card flex flex-col gap-3 !border-rose-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-[15px] !text-rose-700">Cerrar sesión</h3><p className="text-xs text-slate-500">Cierra la sesión activa del panel en este navegador.</p></div>
        <button type="button" onClick={() => void handleLogout()} className="admin-btn admin-btn-secondary text-rose-600 hover:!bg-rose-50"><LogOut className="h-4 w-4" /> Cerrar sesión</button>
      </section>

      <div className={`fixed bottom-4 left-1/2 z-40 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 transition-all duration-200 ${dirty ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`} aria-hidden={!dirty}>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl">
          <p className="text-sm font-medium">Tienes cambios sin guardar</p>
          <div className="flex gap-2">
            <button type="button" onClick={discard} tabIndex={dirty ? 0 : -1} className="admin-btn admin-btn-sm text-slate-200 hover:bg-white/10"><RotateCcw className="h-3.5 w-3.5" /> Descartar</button>
            <button type="submit" form="settings-form" tabIndex={dirty ? 0 : -1} disabled={isSavingSettings} className="admin-btn admin-btn-primary admin-btn-sm">{isSavingSettings ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
