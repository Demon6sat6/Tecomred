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
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      <input
        type={type}
        value={value as string | number}
        placeholder={placeholder}
        onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60"
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Cupones</h2>
          <p className="text-gray-500 text-sm">{coupons.filter(c => c.active).length} cupones activos</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Crear cupón
        </button>
      </div>

      {/* Coupons grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map(coupon => {
          const usePct = Math.round((coupon.uses / coupon.maxUses) * 100);
          const isExpired = coupon.expiry && new Date(coupon.expiry) < new Date();
          return (
            <div key={coupon.id} className={`glass rounded-2xl p-5 border transition-all ${
              !coupon.active || isExpired ? 'opacity-60 border-white/5' : 'border-white/10 hover:border-sky-500/20'
            }`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${coupon.active && !isExpired ? 'bg-sky-500/10' : 'bg-gray-500/10'}`}>
                    <Tag className={`w-4 h-4 ${coupon.active && !isExpired ? 'text-sky-400' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-mono text-sm">{coupon.code}</span>
                      <button onClick={() => handleCopy(coupon.id, coupon.code)}
                        className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors">
                        {copied === coupon.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isExpired ? 'bg-red-500/15 text-red-400' :
                      coupon.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-400'
                    }`}>
                      {isExpired ? 'Expirado' : coupon.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 rounded-lg hover:bg-sky-500/15 text-gray-400 hover:text-sky-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => openDelete(coupon)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Value */}
              <div className="text-3xl font-extrabold gradient-text mb-1">
                {coupon.type === 'porcentaje' ? `${coupon.value}%` : `$${coupon.value}`}
                <span className="text-gray-500 text-sm font-normal ml-1">descuento</span>
              </div>
              {coupon.minOrder > 0 && <p className="text-gray-500 text-xs mb-3">Mínimo de compra: ${coupon.minOrder}</p>}

              {/* Usage bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Usos</span>
                  <span className="text-gray-400">{coupon.uses} / {coupon.maxUses}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${usePct >= 90 ? 'bg-red-400' : 'gradient-brand'}`} style={{ width: `${usePct}%` }} />
                </div>
              </div>

              {coupon.expiry && (
                <p className="text-gray-600 text-[10px] mt-2">Vence: {new Date(coupon.expiry).toLocaleDateString('es')}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold">{modal === 'add' ? 'Crear cupón' : 'Editar cupón'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <FormField label="Código *" name="code" value={form.code} onChange={handleChange} placeholder="DESCUENTO10" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Tipo</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Coupon['type'] }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                    <option value="porcentaje" className="bg-gray-900">Porcentaje (%)</option>
                    <option value="fijo" className="bg-gray-900">Monto fijo ($)</option>
                  </select>
                </div>
                <FormField label={form.type === 'porcentaje' ? 'Valor (%)' : 'Valor ($)'} name="value" value={form.value} onChange={handleChange} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Pedido mínimo ($)" name="minOrder" value={form.minOrder} onChange={handleChange} type="number" />
                <FormField label="Máximo de usos" name="maxUses" value={form.maxUses} onChange={handleChange} type="number" />
              </div>
              <FormField label="Fecha de vencimiento" name="expiry" value={form.expiry} onChange={handleChange} type="date" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-300 font-medium">Cupón activo</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`relative w-11 h-6 rounded-full transition-all ${form.active ? 'gradient-brand' : 'bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.active ? 'left-5.5 translate-x-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleSave} className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${saved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'}`}>
                {saved ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Guardado</span> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar cupón?</h3>
            <p className="text-gray-400 text-sm mb-6">Se eliminará el cupón <span className="text-white font-mono font-bold">"{selected.code}"</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={() => { deleteCoupon(selected.id); setModal(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}