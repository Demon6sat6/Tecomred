import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, User, ShoppingBag } from 'lucide-react';
import { useAdmin, type Customer } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';

const emptyCustomer: Omit<Customer, 'id'> = {
  name: '', email: '', phone: '', city: '',
  orders: 0, totalSpent: 0, joined: new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }),
  status: 'Activo',
};

function FormField({ label, name, value, type = 'text', placeholder = '', onChange }: {
  label: string;
  name: keyof Omit<Customer, 'id'>;
  value: string | number;
  type?: string;
  placeholder?: string;
  onChange: (name: keyof Omit<Customer, 'id'>, value: string | number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-slate-600 mb-1 font-semibold">{label}</label>
      <input
        type={type}
        value={value as string}
        placeholder={placeholder}
        onChange={e => onChange(name, type === 'number' ? +e.target.value : e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

export default function AdminCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'history' | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState<Omit<Customer, 'id'>>(emptyCustomer);
  const [saved, setSaved] = useState(false);

  const filtered = customers.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyCustomer); setModal('add'); };
  const openEdit = (c: Customer) => {
    setSelected(c);
    setForm({
      name: c.name, email: c.email, phone: c.phone, city: c.city,
      orders: c.orders, totalSpent: c.totalSpent, joined: c.joined, status: c.status
    });
    setModal('edit');
  };
  const openDelete  = (c: Customer) => { setSelected(c); setModal('delete'); };
  const openHistory = (c: Customer) => { setSelected(c); setModal('history'); };

  const handleSave = () => {
    if (modal === 'add') addCustomer(form);
    else if (modal === 'edit' && selected) updateCustomer({ ...form, id: selected.id });
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1000);
  };

  const handleChange = (name: keyof Omit<Customer, 'id'>, value: string | number) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Directorio de Clientes</h2>
          <p className="text-slate-500 text-sm mt-0.5">{customers.length} compradores registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Agregar Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o ciudad..."
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Cliente</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Ciudad</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Pedidos</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Total gastado</th>
                <th className="text-center text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Estado</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 text-xs font-bold truncate">{c.name}</p>
                        <p className="text-slate-400 text-[11px]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-600 text-xs font-medium">{c.city || '-'}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                    <span className="text-slate-800 text-xs font-bold">{c.orders}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-slate-900 text-xs font-black">{formatShort(c.totalSpent)}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      c.status === 'Activo'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openHistory(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver historial de compras"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar cliente"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDelete(c)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar cliente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              <User className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No se encontraron clientes registrados.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-slate-900 font-extrabold flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                {modal === 'add' ? 'Registrar Cliente' : 'Editar Cliente'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              <FormField label="Nombre completo *" name="name" value={form.name} placeholder="Carlos Mendoza" onChange={handleChange} />
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Email *" name="email" value={form.email} type="email" placeholder="carlos@email.com" onChange={handleChange} />
                <FormField label="Teléfono" name="phone" value={form.phone} placeholder="+51 987 654 321" onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Ciudad" name="city" value={form.city} placeholder="Lima" onChange={handleChange} />
                <div>
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">Estado</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Customer['status'] }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
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
                {saved ? '¡Guardado!' : 'Guardar Cliente'}
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
            <h3 className="text-slate-900 font-extrabold text-lg mb-2">¿Eliminar cliente?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Se eliminará el perfil de <span className="font-bold text-slate-900">"{selected.name}"</span> de la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteCustomer(selected.id); setModal(null); }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/20 active:scale-95 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {modal === 'history' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shadow-xs">
                  {selected.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-slate-900 font-extrabold text-base">{selected.name}</h3>
                  <p className="text-slate-400 text-xs">{selected.email}</p>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Pedidos', value: selected.orders },
                  { label: 'Total gastado', value: `${formatShort(selected.totalSpent)}` },
                  { label: 'Cliente desde', value: selected.joined },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-center">
                    <p className="text-slate-900 font-black text-sm">{s.value}</p>
                    <p className="text-slate-400 text-[11px] font-semibold mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Orders */}
              <h4 className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-3">Historial de pedidos</h4>
              {(() => {
                const customerOrders = orders.filter(o => o.email?.toLowerCase() === selected.email?.toLowerCase());
                return customerOrders.length > 0 ? (
                  <div className="space-y-2">
                    {customerOrders.map(o => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                        <div>
                          <p className="text-blue-600 text-xs font-mono font-bold">{o.id}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">{o.date} · {o.items?.length || 0} items</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-900 text-xs font-black">{formatShort(o.total)}</p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 mt-0.5 inline-block">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No hay pedidos registrados para este cliente.
                  </div>
                );
              })()}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => setModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}