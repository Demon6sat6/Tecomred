import { useState } from 'react';
import { Search, X, ChevronDown, Plus, Trash2, Check } from 'lucide-react';
import { useAdmin, type Order } from '../../context/AdminContext';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Procesando: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Enviado:    'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  Entregado:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Cancelado:  'bg-red-500/15 text-red-400 border-red-500/20',
};

const allStatuses: Order['status'][] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

const emptyOrder: Omit<Order, 'id'> = {
  customer: '', email: '', phone: '',
  date: new Date().toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }),
  total: 0, status: 'Pendiente', city: '', address: '', notes: '', items: [],
};

export default function AdminOrders() {
  const { orders, addOrder, updateOrderStatus, deleteOrder, products } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'detail' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form, setForm] = useState<Omit<Order, 'id'>>(emptyOrder);
  const [saved, setSaved] = useState(false);
  const [itemProductId, setItemProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  const filtered = orders.filter(o => {
    const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0);

  const addItem = () => {
    const product = products.find(p => p.id === Number(itemProductId));
    if (!product) return;
    const newItems = [...form.items, { productId: product.id, name: product.name, qty: itemQty, price: product.price }];
    setForm(f => ({ ...f, items: newItems, total: newItems.reduce((s, i) => s + i.price * i.qty, 0) }));
    setItemProductId(''); setItemQty(1);
  };

  const removeItem = (idx: number) => {
    const newItems = form.items.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, items: newItems, total: newItems.reduce((s, i) => s + i.price * i.qty, 0) }));
  };

  const handleSave = () => {
    addOrder(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); setForm(emptyOrder); }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Pedidos</h2>
          <p className="text-gray-500 text-sm">{orders.length} pedidos en total</p>
        </div>
        <button onClick={() => { setForm(emptyOrder); setModal('add'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-sky-500/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Nuevo pedido
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {['Todos', ...allStatuses].map(s => {
          const count = s === 'Todos' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterStatus === s ? 'gradient-brand text-white border-transparent shadow-lg shadow-sky-500/20' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}>
              {s} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search + revenue */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente o ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-500" /></button>}
        </div>
        <div className="glass rounded-xl px-4 py-2 text-sm">
          <span className="text-gray-400">Ingresos filtrados: </span>
          <span className="text-white font-bold">${totalRevenue.toFixed(2)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8">
              <tr>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3">Pedido</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3">Cliente</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3 hidden md:table-cell">Ciudad</th>
                <th className="text-left text-gray-500 text-xs font-semibold px-4 py-3 hidden sm:table-cell">Fecha</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Total</th>
                <th className="text-center text-gray-500 text-xs font-semibold px-4 py-3">Estado</th>
                <th className="text-right text-gray-500 text-xs font-semibold px-4 py-3">Acc.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelected(order); setModal('detail'); }}
                      className="text-sky-400 hover:text-sky-300 text-xs font-mono font-semibold transition-colors">{order.id}</button>
                    <p className="text-gray-600 text-[10px]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-semibold">{order.customer}</p>
                    <p className="text-gray-500 text-[10px]">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-gray-400 text-xs">{order.city}</span></td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="text-gray-400 text-xs">{order.date}</span></td>
                  <td className="px-4 py-3 text-right"><span className="text-white text-xs font-bold">${order.total.toFixed(2)}</span></td>
                  <td className="px-4 py-3">
                    <div className="relative flex justify-center">
                      <button onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${statusColors[order.status]}`}>
                        {order.status} <ChevronDown className="w-3 h-3" />
                      </button>
                      {openDropdown === order.id && (
                        <div className="absolute top-full mt-1 right-0 z-20 glass-strong rounded-xl shadow-xl border border-white/10 py-1 min-w-[130px]">
                          {allStatuses.map(s => (
                            <button key={s} onClick={() => { updateOrderStatus(order.id, s); setOpenDropdown(null); }}
                              className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-white/5 transition-colors ${order.status === s ? 'text-sky-400' : 'text-gray-300'}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setSelected(order); setModal('delete'); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-12 text-gray-500 text-sm">No se encontraron pedidos.</div>}
        </div>
      </div>

      {/* ADD ORDER MODAL */}
      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold">Nuevo pedido</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Datos del cliente</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Nombre *', key: 'customer', placeholder: 'Juan Pérez' },
                  { label: 'Email *',  key: 'email',    placeholder: 'juan@email.com' },
                  { label: 'Teléfono', key: 'phone',    placeholder: '+1 234 567' },
                  { label: 'Ciudad',   key: 'city',     placeholder: 'Caracas' },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-gray-400 mb-1.5 font-medium">{f.label}</label>
                    <input value={(form as any)[f.key]} placeholder={f.placeholder}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Dirección</label>
                  <input value={form.address} placeholder="Av. Principal 123"
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Estado inicial</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Order['status'] }))}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                  {allStatuses.map(s => <option key={s} value={s} className="bg-gray-900">{s}</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold pt-2">Productos del pedido</p>
              <div className="flex gap-2">
                <select value={itemProductId} onChange={e => setItemProductId(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60">
                  <option value="" className="bg-gray-900">Seleccionar producto...</option>
                  {products.map(p => <option key={p.id} value={p.id} className="bg-gray-900">{p.name} — ${p.price}</option>)}
                </select>
                <input type="number" min={1} value={itemQty} onChange={e => setItemQty(+e.target.value)}
                  className="w-16 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 text-center" />
                <button onClick={addItem} disabled={!itemProductId}
                  className="px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.items.length > 0 && (
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/3 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-medium truncate">{item.name}</p>
                        <p className="text-gray-500 text-[10px]">x{item.qty} · ${item.price.toFixed(2)} c/u</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white text-xs font-bold">${(item.price * item.qty).toFixed(2)}</span>
                        <button onClick={() => removeItem(idx)} className="p-1 rounded hover:bg-red-500/15 text-gray-500 hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-white/10 font-bold">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="gradient-text text-lg">${form.total.toFixed(2)}</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Notas</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2} placeholder="Instrucciones especiales..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm focus:outline-none focus:border-sky-500/60 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={!form.customer || form.items.length === 0}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${saved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'}`}>
                {saved ? <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Creado</span> : 'Crear pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modal === 'detail' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-white font-bold font-mono">{selected.id}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cliente',   value: selected.customer },
                  { label: 'Email',     value: selected.email },
                  { label: 'Telefono',  value: selected.phone || '—' },
                  { label: 'Ciudad',    value: selected.city },
                  { label: 'Direccion', value: selected.address || '—' },
                  { label: 'Fecha',     value: selected.date },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                ))}
              </div>
              {selected.notes && (
                <div className="p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Notas</p>
                  <p className="text-gray-300 text-xs">{selected.notes}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-2">Productos</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300 truncate flex-1">{item.name} x{item.qty}</span>
                      <span className="text-white font-semibold ml-3">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="gradient-text text-lg">${selected.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Eliminar pedido?</h3>
            <p className="text-gray-400 text-sm mb-6">Se eliminara el pedido <span className="text-white font-mono font-bold">{selected.id}</span>.</p>
            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 transition-colors">Cancelar</button>
              <button onClick={() => { deleteOrder(selected.id); setModal(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 active:scale-95 transition-all">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
