import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, Tag, Copy } from 'lucide-react';
import { useAdmin, type Coupon } from '../../context/AdminContext';

const emptyCoupon: Omit<Coupon, 'id'> = {
  code: '', type: 'porcentaje', value: 10, minOrder: 0,
  uses: 0, maxUses: 100, expiry: '', active: true,
};

function FormField({
  label, name, value, onChange, type = 'text', placeholder = ''
}: {
  label: string;
  name: keyof Omit<Coupon, 'id'>;
  value: string | number | boolean;
  onChange: (name: keyof Omit<Coupon, 'id'>, value: string | number | boolean) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-600 mb-1 font-semibold">{label}</label>
      <input
        type={type}
        value={value as string | number}
        placeholder={placeholder}
        onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useAdmin();
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Omit<Coupon, 'id'>>(emptyCoupon);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  const openAdd = () => { setForm(emptyCoupon); setModal('add'); };
  const openEdit = (c: Coupon) => {
    setSelected(c);
    setForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, uses: c.uses, maxUses: c.maxUses, expiry: c.expiry, active: c.active });
    setModal('edit');
  };
  const openDelete = (c: Coupon) => { setSelected(c); setModal('delete'); };

  const handleSave = () => {
    if (modal === 'add') addCoupon(form);
    else if (modal === 'edit' && selected) updateCoupon({ ...form, id: selected.id });
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1000);
  };

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleChange = (name: keyof Omit<Coupon, 'id'>, value: string | number | boolean) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Cupones y Promociones</h2>
          <p className="text-slate-500 text-sm mt-0.5">{coupons.filter(c => c.active).length} cupones activos para la tienda</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Crear Cupón
        </button>
      </div>

      {/* Coupons grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const usePct = Math.min(100, Math.round((coupon.uses / (coupon.maxUses || 1)) * 100));
          const isExpired = coupon.expiry && new Date(coupon.expiry) < new Date();
          return (
            <div
              key={coupon.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                !coupon.active || isExpired ? 'opacity-65 border-slate-200' : 'border-slate-200 hover:border-blue-400 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${coupon.active && !isExpired ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-extrabold font-mono text-sm tracking-wide">{coupon.code}</span>
                        <button
                          onClick={() => handleCopy(coupon.id, coupon.code)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Copiar código"
                        >
                          {copied === coupon.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 border ${
                        isExpired ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        coupon.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isExpired ? 'Expirado' : coupon.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(coupon)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Editar cupón"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDelete(coupon)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar cupón"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Value */}
                <div className="text-2xl font-black text-slate-900 tracking-tight my-2">
                  {coupon.type === 'porcentaje' ? `${coupon.value}%` : `$${coupon.value}`}
                  <span className="text-slate-500 text-xs font-semibold ml-1.5">descuento</span>
                </div>
                {coupon.minOrder > 0 && (
                  <p className="text-slate-500 text-xs mb-3 font-medium">Pedido mínimo: ${coupon.minOrder}</p>
                )}
              </div>

              {/* Usage bar */}
              <div className="space-y-1.5 pt-3 border-t border-slate-100 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Usos canjeados</span>
                  <span className="text-slate-800 font-bold">{coupon.uses} / {coupon.maxUses}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${usePct >= 90 ? 'bg-rose-500' : 'gradient-brand'}`}
                    style={{ width: `${usePct}%` }}
                  />
                </div>
                {coupon.expiry && (
                  <p className="text-slate-400 text-[11px] pt-1">Vence: {new Date(coupon.expiry).toLocaleDateString('es-PE')}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-slate-900 font-extrabold">{modal === 'add' ? 'Crear Nuevo Cupón' : 'Editar Cupón'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <FormField label="Código de cupón *" name="code" value={form.code} onChange={handleChange} placeholder="SISCOM10" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">Tipo de descuento</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as Coupon['type'] }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <FormField label={form.type === 'porcentaje' ? 'Valor (%)' : 'Valor ($)'} name="value" value={form.value} onChange={handleChange} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Compra mínima ($)" name="minOrder" value={form.minOrder} onChange={handleChange} type="number" />
                <FormField label="Límite de usos" name="maxUses" value={form.maxUses} onChange={handleChange} type="number" />
              </div>
              <FormField label="Fecha de vencimiento" name="expiry" value={form.expiry} onChange={handleChange} type="date" />
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <span className="text-sm text-slate-800 font-semibold">Cupón habilitado</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-all ${form.active ? 'gradient-brand' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.active ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${
                  saved ? 'bg-emerald-600' : 'gradient-brand hover:opacity-95 shadow-md shadow-blue-600/20'
                }`}
              >
                {saved ? '¡Guardado!' : 'Guardar Cupón'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-lg mb-2">¿Eliminar cupón?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Se eliminará el cupón <span className="font-mono font-bold text-slate-900">"{selected.code}"</span> permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteCoupon(selected.id); setModal(null); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}