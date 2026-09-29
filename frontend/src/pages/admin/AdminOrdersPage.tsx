import { useState } from 'react';
import { Search, X, ChevronDown, Plus, Trash2, Pencil, Eye, ShoppingBag } from 'lucide-react';
import { useAdmin, type Order } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-amber-50 text-amber-700 border-amber-200',
  Procesando: 'bg-blue-50 text-blue-700 border-blue-200',
  Enviado:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  Entregado:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelado:  'bg-rose-50 text-rose-700 border-rose-200',
};

const allStatuses: Order['status'][] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

const emptyOrder: Omit<Order, 'id'> = {
  customer: '', email: '', phone: '',
  date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
  total: 0, discount: 0, couponCode: '', status: 'Pendiente', city: '', address: '', notes: '', items: [],
};

export default function AdminOrders() {
  const { orders, addOrder, updateOrder, updateOrderStatus, deleteOrder, loadOrders, products } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [modal, setModal] = useState<'add' | 'detail' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form, setForm] = useState<Omit<Order, 'id'>>(emptyOrder);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [itemProductId, setItemProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  const filtered = orders.filter(o => {
    const matchSearch = (o.customer || '').toLowerCase().includes(search.toLowerCase()) || (o.id || '').toLowerCase().includes(search.toLowerCase());
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

  const handleSave = async () => {
    setSaving(true);
    await addOrder(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); setModal(null); setForm(emptyOrder); }, 1000);
  };

  const handleStatusChange = async (id: string, status: Order['status']) => {
    await updateOrderStatus(id, status);
    setOpenDropdown(null);
  };

  const handleEditSave = async () => {
    if (!selected) return;
    setSaving(true);
    await updateOrder(selected);
    setSaving(false);
    setModal(null);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSaving(true);
    await deleteOrder(selected.id);
    setSaving(false);
    setModal(null);
  };

  const openEdit = async (order: Order) => {
    await loadOrders();
    const fresh = orders.find(o => o.id === order.id) || order;
    setSelected(fresh);
    setModal('edit');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Pedidos y Ventas</h2>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} pedidos registrados en tiempo real</p>
        </div>
        <button
          onClick={() => { setForm(emptyOrder); setModal('add'); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-md shadow-blue-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Pedido Manual
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {['Todos', ...allStatuses].map(s => {
          const count = s === 'Todos' ? orders.length : orders.filter(o => o.status === s).length;
          const isActive = filterStatus === s;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isActive
                  ? 'gradient-brand text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s} <span className={isActive ? 'text-white/80' : 'text-slate-400 font-semibold'}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Revenue Summary */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente o código de pedido..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-xs transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm shadow-xs flex items-center gap-2">
          <span className="text-slate-500 text-xs font-semibold">Total filtrado:</span>
          <span className="text-slate-900 font-black text-base">{formatShort(totalRevenue)}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">ID Pedido</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Cliente</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">Ciudad</th>
                <th className="text-left text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">Fecha</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Total</th>
                <th className="text-center text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Estado</th>
                <th className="text-right text-slate-500 text-xs font-bold uppercase tracking-wider px-4 py-3.5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => { setSelected(order); setModal('detail'); }}
                      className="text-blue-600 hover:text-blue-700 text-xs font-mono font-bold transition-colors text-left"
                    >
                      {order.id}
                    </button>
                    <p className="text-slate-400 text-[11px] mt-0.5">{order.items?.length || 0} producto{(order.items?.length || 0) !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-900 text-xs font-bold">{order.customer}</p>
                    <p className="text-slate-400 text-[11px]">{order.email}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-600 text-xs">{order.city || '-'}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-500 text-xs">{order.date}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-slate-900 text-xs font-black">{formatShort(order.total)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="relative flex justify-center">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                        className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border shadow-2xs transition-all ${statusColors[order.status] ?? 'bg-slate-100 text-slate-700'}`}
                      >
                        {order.status} <ChevronDown className="w-3 h-3 opacity-70" />
                      </button>
                      {openDropdown === order.id && (
                        <div className="absolute top-full mt-1.5 right-0 z-20 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 min-w-[140px] animate-fade-in">
                          {allStatuses.map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusChange(order.id, s)}
                              className={`w-full text-left px-3.5 py-1.5 text-xs font-bold transition-colors ${
                                order.status === s ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setSelected(order); setModal('detail'); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(order)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar pedido"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelected(order); setModal('delete'); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Eliminar pedido"
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
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              No se encontraron pedidos coincidentes.
            </div>
          )}
        </div>
      </div>

      {/* ADD ORDER MODAL */}
      {modal === 'add' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-slate-900 font-extrabold text-base">Nuevo Pedido</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Datos del cliente</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: 'Nombre *', key: 'customer', placeholder: 'Carlos Mendoza' },
                  { label: 'Email *',  key: 'email',    placeholder: 'cliente@email.com' },
                  { label: 'Teléfono', key: 'phone',    placeholder: '+51 987 654 321' },
                  { label: 'Ciudad',   key: 'city',     placeholder: 'Lima' },
                ] as const).map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-600 mb-1 font-semibold">{f.label}</label>
                    <input
                      value={(form as any)[f.key]}
                      placeholder={f.placeholder}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">Dirección</label>
                  <input
                    value={form.address}
                    placeholder="Av. Javier Prado 1234, San Isidro"
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Estado Inicial</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as Order['status'] }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold pt-2">Productos del pedido</p>
              <div className="flex gap-2">
                <select
                  value={itemProductId}
                  onChange={e => setItemProductId(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Seleccionar producto de catálogo...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>)}
                </select>
                <input
                  type="number"
                  min={1}
                  value={itemQty}
                  onChange={e => setItemQty(+e.target.value)}
                  className="w-16 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none text-center font-bold"
                />
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!itemProductId}
                  className="px-4 py-2 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {form.items.length > 0 && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 text-xs font-bold truncate">{item.name}</p>
                        <p className="text-slate-400 text-[10px]">x{item.qty} · {formatShort(item.price)} c/u</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 text-xs font-extrabold">{formatShort(item.price * item.qty)}</span>
                        <button onClick={() => removeItem(idx)} className="p-1 rounded text-slate-400 hover:text-rose-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-bold px-1">
                    <span className="text-slate-600 text-sm">Total a cobrar:</span>
                    <span className="text-slate-900 text-lg font-black">{formatShort(form.total)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Notas / Observaciones</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Instrucciones de entrega, factura, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
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
                disabled={saving || !form.customer || form.items.length === 0}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40 ${
                  saved ? 'bg-emerald-600' : 'gradient-brand hover:opacity-95 shadow-md shadow-blue-600/20'
                }`}
              >
                {saved ? '¡Pedido Creado!' : 'Crear Pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {modal === 'detail' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-slate-900 font-extrabold text-base">Detalle de Pedido</h3>
                <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">{selected.id}</p>
              </div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {[
                  { label: 'Cliente',   value: selected.customer },
                  { label: 'Email',     value: selected.email },
                  { label: 'Teléfono',  value: selected.phone || '-' },
                  { label: 'Ciudad',    value: selected.city || '-' },
                  { label: 'Dirección', value: selected.address || '-' },
                  { label: 'Fecha',     value: selected.date },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-slate-400 text-[11px] font-semibold">{label}</p>
                    <p className="text-slate-800 text-xs font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs">
                  <p className="text-amber-900 font-bold mb-0.5">Notas de entrega:</p>
                  <p className="text-amber-800">{selected.notes}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Artículos comprados</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                      <span className="text-slate-800 font-medium truncate flex-1">{item.name} x{item.qty}</span>
                      <span className="text-slate-900 font-extrabold ml-3">{formatShort(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-bold pt-3 border-t border-slate-200">
                    <span className="text-slate-700 text-sm">Total del pedido:</span>
                    <span className="text-slate-900 text-lg font-black">{formatShort(selected.total)}</span>
                  </div>
                </div>
              </div>
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

      {/* EDIT ORDER MODAL */}
      {modal === 'edit' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-slate-900 font-extrabold">Editar Pedido <span className="font-mono text-blue-600">{selected.id}</span></h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-3.5">
              {([
                { label: 'Cliente',   key: 'customer', placeholder: 'Juan Pérez' },
                { label: 'Email',     key: 'email',    placeholder: 'juan@email.com' },
                { label: 'Teléfono',  key: 'phone',    placeholder: '+51 987 654 321' },
                { label: 'Ciudad',    key: 'city',     placeholder: 'Lima' },
                { label: 'Dirección', key: 'address',  placeholder: 'Av. Principal 123' },
              ] as const).map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-600 mb-1 font-semibold">{f.label}</label>
                  <input
                    value={(selected as any)[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setSelected(s => s ? { ...s, [f.key]: e.target.value } : s)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Estado</label>
                <select
                  value={selected.status}
                  onChange={e => setSelected(s => s ? { ...s, status: e.target.value as Order['status'] } : s)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                >
                  {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1 font-semibold">Notas</label>
                <textarea
                  value={selected.notes}
                  onChange={e => setSelected(s => s ? { ...s, notes: e.target.value } : s)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
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
                onClick={handleEditSave}
                className="flex-1 py-2.5 rounded-xl gradient-brand text-white text-sm font-bold hover:opacity-95 active:scale-95 transition-all shadow-md shadow-blue-600/20"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {modal === 'delete' && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-lg mb-2">¿Eliminar pedido?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Se eliminará el pedido <span className="font-mono font-bold text-slate-900">{selected.id}</span> del historial de ventas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
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
