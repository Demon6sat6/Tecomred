import { useState } from 'react';
import { CalendarClock, Check, Copy, Loader2, Pencil, Plus, Tag, TicketPercent, Trash2 } from 'lucide-react';
import { useAdmin, type Coupon } from '../../context/AdminContext';
import { adminAlert } from '../../utils/adminAlerts';
import { couponSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { Badge, EmptyState, Field, Modal, PageHeader, SearchInput, Segmented, StatCard, Switch } from '../../components/admin/AdminUI';

type CouponForm = Omit<Coupon, 'id'>;
type Filter = 'all' | 'active' | 'inactive' | 'expired';

const emptyCoupon: CouponForm = { code: '', type: 'porcentaje', value: 10, minOrder: 0, uses: 0, maxUses: 100, expiry: '', active: true };

const isExpired = (coupon: Coupon) => Boolean(coupon.expiry) && new Date(`${coupon.expiry}T23:59:59`) < new Date();
const isExhausted = (coupon: Coupon) => coupon.uses >= coupon.maxUses;
const numberValue = (value: string) => value === '' ? Number.NaN : Number(value);
const numberInput = (value: number) => Number.isNaN(value) ? '' : value;
const formatExpiry = (expiry: string) => new Date(`${expiry}T00:00:00`).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useAdmin();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CouponForm>(emptyCoupon);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const update = <K extends keyof CouponForm>(key: K, value: CouponForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  };

  const openAdd = () => { setEditing(null); setForm(emptyCoupon); setErrors({}); setOpen(true); };
  const openEdit = (coupon: Coupon) => {
    setEditing(coupon);
    setForm({ code: coupon.code, type: coupon.type, value: coupon.value, minOrder: coupon.minOrder, uses: coupon.uses, maxUses: coupon.maxUses, expiry: coupon.expiry, active: coupon.active });
    setErrors({});
    setOpen(true);
  };
  const close = () => { if (!saving) setOpen(false); };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otherCodes = coupons.filter(coupon => coupon.id !== editing?.id).map(coupon => coupon.code.toUpperCase());
    const result = validate(couponSchema(otherCodes, !editing), form);
    if (!result.ok || !result.data) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateCoupon({ ...result.data, id: editing.id });
      else await addCoupon(result.data);
      setOpen(false);
      void adminAlert.success(editing ? 'Cupón actualizado' : 'Cupón creado', `Código ${result.data.code}`);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo guardar el cupón');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!await adminAlert.confirmDelete('¿Eliminar cupón?', `El código ${coupon.code} dejará de funcionar en la tienda.`)) return;
    try {
      await deleteCoupon(coupon.id);
      void adminAlert.success('Cupón eliminado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el cupón');
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await updateCoupon({ ...coupon, active: !coupon.active });
      void adminAlert.toast(coupon.active ? 'Cupón desactivado' : 'Cupón activado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo actualizar el cupón');
    }
  };

  const handleCopy = async (coupon: Coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(coupon.id);
      window.setTimeout(() => setCopied(null), 1500);
      void adminAlert.toast('Código copiado');
    } catch {
      void adminAlert.error('El navegador no permitió copiar al portapapeles.');
    }
  };

  const active = coupons.filter(coupon => coupon.active && !isExpired(coupon) && !isExhausted(coupon));
  const expired = coupons.filter(isExpired);
  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.uses, 0);
  const term = search.trim().toUpperCase();
  const visible = coupons.filter(coupon => (!term || coupon.code.toUpperCase().includes(term)) && (
    filter === 'all' || (filter === 'active' ? active.includes(coupon) : filter === 'expired' ? isExpired(coupon) : !coupon.active)));

  return (
    <div className="space-y-5">
      <PageHeader title="Promociones" description="Crea códigos de descuento, define sus condiciones y controla su uso."
        actions={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Crear cupón</button>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Cupones" value={coupons.length} icon={Tag} tone="blue" />
        <StatCard label="Vigentes" value={active.length} icon={TicketPercent} tone="green" detail="Activos, sin vencer y con usos" />
        <StatCard label="Vencidos" value={expired.length} icon={CalendarClock} tone={expired.length ? 'rose' : 'slate'} />
        <StatCard label="Usos canjeados" value={totalUses.toLocaleString('es-PE')} icon={Check} tone="violet" />
      </section>

      {coupons.length === 0 ? (
        <section className="admin-card">
          <EmptyState icon={TicketPercent} title="Prepara tu primera promoción" text="Crea un código de descuento, define sus condiciones y actívalo cuando quieras ofrecerlo en la tienda."
            action={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Crear primer cupón</button>} />
        </section>
      ) : <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Segmented label="Filtrar cupones" value={filter} onChange={setFilter} options={[
            { value: 'all', label: 'Todos', count: coupons.length },
            { value: 'active', label: 'Vigentes', count: active.length },
            { value: 'inactive', label: 'Inactivos', count: coupons.filter(coupon => !coupon.active).length },
            { value: 'expired', label: 'Vencidos', count: expired.length },
          ]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar código" className="sm:w-64" />
        </div>
        {visible.length === 0 ? <div className="admin-card"><EmptyState icon={Tag} title="Sin resultados" text="No hay cupones con ese filtro." /></div> :
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {visible.map(coupon => {
              const expiredCoupon = isExpired(coupon);
              const exhausted = isExhausted(coupon);
              const usePct = Math.min(100, Math.round((coupon.uses / (coupon.maxUses || 1)) * 100));
              const state = expiredCoupon ? { tone: 'rose' as const, label: 'Vencido' } : exhausted ? { tone: 'amber' as const, label: 'Agotado' } : coupon.active ? { tone: 'green' as const, label: 'Activo' } : { tone: 'slate' as const, label: 'Inactivo' };
              return (
                <article key={coupon.id} className={`admin-card flex flex-col p-5 transition ${coupon.active && !expiredCoupon ? 'hover:border-blue-200' : 'opacity-80'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 font-mono text-sm font-extrabold tracking-wider text-slate-900">{coupon.code}</span>
                        <button onClick={() => void handleCopy(coupon)} className="admin-action" title="Copiar código" aria-label={`Copiar ${coupon.code}`}>{copied === coupon.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}</button>
                      </div>
                      <div className="mt-2"><Badge tone={state.tone}>{state.label}</Badge></div>
                    </div>
                    <Switch checked={coupon.active} onChange={() => void toggleActive(coupon)} label={`${coupon.active ? 'Desactivar' : 'Activar'} ${coupon.code}`} />
                  </div>
                  <p className="tabular mt-4 text-3xl font-black tracking-tight text-slate-900">{coupon.type === 'porcentaje' ? `${coupon.value}%` : `S/ ${coupon.value.toLocaleString('es-PE')}`}<span className="ml-1.5 text-xs font-semibold text-slate-500">de descuento</span></p>
                  <p className="mt-1 text-xs text-slate-500">{coupon.minOrder > 0 ? `Compra mínima S/ ${coupon.minOrder.toLocaleString('es-PE')}` : 'Sin compra mínima'}{coupon.expiry && ` · Vence ${formatExpiry(coupon.expiry)}`}</p>
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <div className="flex justify-between text-xs"><span className="text-slate-500">Usos</span><span className="tabular font-bold text-slate-800">{coupon.uses} / {coupon.maxUses}</span></div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${usePct >= 90 ? 'bg-rose-500' : 'bg-[#0052cc]'}`} style={{ width: `${usePct}%` }} /></div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => openEdit(coupon)} className="admin-btn admin-btn-secondary admin-btn-sm flex-1"><Pencil className="h-3.5 w-3.5" /> Editar</button>
                    <button onClick={() => void handleDelete(coupon)} className="admin-btn admin-btn-secondary admin-btn-sm text-rose-600 hover:!bg-rose-50" aria-label={`Eliminar ${coupon.code}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </article>
              );
            })}
          </div>}
      </>}

      {open && (
        <Modal title={editing ? 'Editar cupón' : 'Nuevo cupón'} subtitle={editing ? editing.code : 'Define el descuento y sus condiciones'} icon={TicketPercent} onClose={close}
          footer={<>
            <button type="button" onClick={close} className="admin-btn admin-btn-secondary">Cancelar</button>
            <button type="submit" form="coupon-form" disabled={saving} className="admin-btn admin-btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar cupón</button>
          </>}>
          <form id="coupon-form" onSubmit={event => void handleSave(event)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Código del cupón" required error={errors.code} hint="Letras, números, guion y guion bajo. Se guarda en mayúsculas." className="sm:col-span-2">
              {props => <input {...props} value={form.code} maxLength={20} autoCapitalize="characters" onChange={event => update('code', event.target.value.toUpperCase().replace(/\s/g, ''))} placeholder="SISCOM10" className="admin-input font-mono uppercase tracking-wider" />}
            </Field>
            <Field label="Tipo de descuento" error={errors.type}>
              {props => <select {...props} value={form.type} onChange={event => update('type', event.target.value as Coupon['type'])} className="admin-input"><option value="porcentaje">Porcentaje (%)</option><option value="fijo">Monto fijo (S/)</option></select>}
            </Field>
            <Field label={form.type === 'porcentaje' ? 'Descuento (%)' : 'Descuento (S/)'} required error={errors.value}>
              {props => <input {...props} type="number" inputMode="decimal" min="0" max={form.type === 'porcentaje' ? 100 : undefined} step="0.01" value={numberInput(form.value)} onChange={event => update('value', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="Compra mínima (S/)" error={errors.minOrder} hint="0 = sin mínimo">
              {props => <input {...props} type="number" inputMode="decimal" min="0" step="0.01" value={numberInput(form.minOrder)} onChange={event => update('minOrder', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="Límite de usos" required error={errors.maxUses} hint={editing ? `Usados: ${form.uses}` : undefined}>
              {props => <input {...props} type="number" inputMode="numeric" min="1" step="1" value={numberInput(form.maxUses)} onChange={event => update('maxUses', numberValue(event.target.value))} className="admin-input tabular" />}
            </Field>
            <Field label="Fecha de vencimiento" error={errors.expiry} hint="Opcional · vacío = sin vencimiento" className="sm:col-span-2">
              {props => <input {...props} type="date" value={form.expiry} min={editing ? undefined : new Date().toISOString().slice(0, 10)} onChange={event => update('expiry', event.target.value)} className="admin-input" />}
            </Field>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 sm:col-span-2">
              <div><p className="text-sm font-semibold text-slate-900">Cupón habilitado</p><p className="text-xs text-slate-500">Los clientes podrán aplicarlo en el carrito.</p></div>
              <Switch checked={form.active} onChange={value => update('active', value)} label="Cupón habilitado" />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
