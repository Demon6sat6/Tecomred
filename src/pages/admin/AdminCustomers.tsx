import { useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, Check, User, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAdmin, type Customer } from '../../context/AdminContext';

const emptyCustomer: Omit<Customer, 'id'> = {
  name: '', email: '', phone: '', city: '',
  orders: 0, totalSpent: 0, joined: new Date().toLocaleDateString('es', { month: 'short', year: 'numeric' }),
  status: 'Activo',
};

export default function AdminCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useAdmin();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [form, setForm] = useState<Omit<Customer, 'id'>>(emptyCustomer);
  const [saved, setSaved] = useState(false);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyCustomer); setModal('add'); };
  const openEdit = (c: Customer) => {
    setSelected(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, city: c.city,
      orders: c.orders, totalSpent: c.totalSpent, joined: c.joined, status: c.status });
    setModal('edit');
  };
  const openDelete = (c: Customer) => { setSelected(c); setModal('delete'); };

  const handleSave = () => {
    if (modal === 'add') addCustomer(form);
    else if (modal === 'edit' && selected) updateCustomer({ ...form, id: selected.id });
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); }, 1000);
  };

  const F = ({ label, name, value, type = 'text', placeholder = '' }: {
    label: string; name: keyof Omit<Customer, 'id'>; value: string | number; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5 font-medium">{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [name]: type === 'number' ? +e.target.value : e.target.value }))}
        className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Clientes</h2>
          <p className="text-gray-500 text-sm">{customers.length} clientes registrados</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Agregar cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
          className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-500" /></button>}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3">Cliente</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3 hidden md:table-cell">Ciudad</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3 hidden sm:table-cell">Pedidos</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Total gastado</th>
                <th className="text-center text-gray-500 text-xs font-semibold px-4 py-3">Estado</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                        <p className="text-gray-500 text-[10px]">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-gray-400 text-xs">{c.city}</span></td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell"><span className="text-white text-xs font-semibold">{c.orders}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-white text-xs font-bold">${c.totalSpent.toFixed(2)}</span></td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      c.status === 'Activo'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        : 'bg-gray-500/15 text-gray-400 border-gray-500/20'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-sky-500/15 text-gray-400 hover:text-sky-400 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openDelete(c)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">No se encontraron clientes.</div>}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-md shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                {modal === 'add' ? 'Agregar cliente' : 'Editar cliente'}
              </h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <F label="Nombre completo *" name="name"  value={form.name}  placeholder="Juan Pérez" />
              <div className="grid grid-cols-2 gap-3">
                <F label="Email *"    name="email"  value={form.email}  type="email" placeholder="juan@email.com" />
                <F label="Teléfono"   name="phone"  value={form.phone}  placeholder="+1 234 567" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Ciudad"     name="city"   value={form.city}   placeholder="Caracas" />
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Estado</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Customer['status'] }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                    <option value="Activo" className="bg-gray-900">Activo</option>
                    <option value="Inactivo" className="bg-gray-900">Inactivo</option>
                  </select>
                </div>
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
            <h3 className="text-white font-bold text-lg mb-2">¿Eliminar cliente?</h3>
            <p className="text-gray-400 text-sm mb-6">Se eliminará <span className="text-white font-semibold">"{selected.name}"</span> permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={() => { deleteCustomer(selected.id); setModal(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
