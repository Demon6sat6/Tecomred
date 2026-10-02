import { useMemo, useState } from 'react';
import { useUrlParam } from '../../hooks/useUrlParam';
import { Clock, Eye, Loader2, MessageCircle, Minus, Pencil, Plus, ShoppingBag, ShoppingCart, Trash2, Truck, Wallet, X } from 'lucide-react';
import { useAdmin, type Order } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import { adminAlert } from '../../utils/adminAlerts';
import { orderSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { parseFlexibleDate } from '../../utils/dateUtils';
import { EmptyState, Field, LiveStatus, Modal, PageHeader, SearchInput, Segmented, StatCard } from '../../components/admin/AdminUI';
import { orderStatusTone } from '../../utils/adminFormat';

const allStatuses: Order['status'][] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];
type StatusFilter = 'Todos' | Order['status'];
type OrderForm = Omit<Order, 'id'>;

const today = () => new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
const emptyOrder = (): OrderForm => ({
  customer: '', email: '', phone: '', date: today(), total: 0, discount: 0, couponCode: '',
  status: 'Pendiente', city: '', address: '', notes: '', items: [],
});
const itemsTotal = (items: Order['items']) => items.reduce((sum, item) => sum + item.price * item.qty, 0);
const whatsappLink = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

function CustomerFields({ form, errors, update }: { form: OrderForm; errors: FieldErrors; update: <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => void }) {
  return <>
    <Field label="Nombre del cliente" required error={errors.customer}>
      {props => <input {...props} value={form.customer} maxLength={80} onChange={event => update('customer', event.target.value)} placeholder="Carlos Mendoza" className="admin-input" />}
    </Field>
    <Field label="Correo" required error={errors.email}>
      {props => <input {...props} type="email" value={form.email} maxLength={254} onChange={event => update('email', event.target.value)} placeholder="cliente@email.com" className="admin-input" />}
    </Field>
    <Field label="Teléfono / WhatsApp" required error={errors.phone}>
      {props => <input {...props} type="tel" value={form.phone} maxLength={20} onChange={event => update('phone', event.target.value.replace(/[^\d\s()+-]/g, ''))} placeholder="+51 987 654 321" className="admin-input" />}
    </Field>
    <Field label="Ciudad" required error={errors.city}>
      {props => <input {...props} value={form.city} maxLength={60} onChange={event => update('city', event.target.value)} placeholder="Lima" className="admin-input" />}
    </Field>
    <Field label="Dirección de entrega" required error={errors.address} className="sm:col-span-2">
      {props => <input {...props} value={form.address} maxLength={200} onChange={event => update('address', event.target.value)} placeholder="Av. Javier Prado 1234, San Isidro" className="admin-input" />}
    </Field>
  </>;
}

export default function AdminOrders() {
  const { orders, products, addOrder, updateOrder, updateOrderStatus, deleteOrder } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useUrlParam('search');
  const [statusParam, setStatusParam] = useUrlParam('status', 'Todos');
  const filterStatus: StatusFilter = (allStatuses as string[]).includes(statusParam) ? statusParam as Order['status'] : 'Todos';
  const [mode, setMode] = useState<'add' | 'edit' | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyOrder);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [busyStatus, setBusyStatus] = useState<string | null>(null);
  const [itemProductId, setItemProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);

  // El detalle siempre refleja la versión más reciente que llega por sondeo.
  const detail = detailId ? orders.find(order => order.id === detailId) ?? null : null;

  const sorted = useMemo(() => [...orders].sort((a, b) => parseFlexibleDate(b.date).getTime() - parseFlexibleDate(a.date).getTime()), [orders]);
  const term = search.trim().toLocaleLowerCase('es');
  const filtered = sorted.filter(order =>
    (!term || `${order.id} ${order.customer} ${order.email} ${order.phone} ${order.city}`.toLocaleLowerCase('es').includes(term)) &&
    (filterStatus === 'Todos' || order.status === filterStatus));
  const countBy = (status: Order['status']) => orders.filter(order => order.status === status).length;
  const filteredRevenue = filtered.filter(order => order.status !== 'Cancelado').reduce((sum, order) => sum + order.total, 0);
  const delivered = orders.filter(order => order.status === 'Entregado');
  const averageTicket = delivered.length ? delivered.reduce((sum, order) => sum + order.total, 0) / delivered.length : 0;

  const update = <K extends keyof OrderForm>(key: K, value: OrderForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  };

  const openAdd = () => { setForm(emptyOrder()); setErrors({}); setItemProductId(''); setItemQty(1); setEditingId(null); setMode('add'); };
  const openEdit = (order: Order) => {
    const { id, ...rest } = order;
    setForm(rest);
    setErrors({});
    setEditingId(id);
    setDetailId(null);
    setMode('edit');
  };
  const closeForm = () => { if (!saving) setMode(null); };

  const addItem = () => {
    const product = products.find(item => item.id === Number(itemProductId));
    if (!product) return;
    if (!Number.isInteger(itemQty) || itemQty < 1 || itemQty > 999) { void adminAlert.validation(['La cantidad debe ser un número entero entre 1 y 999']); return; }
    if (product.price <= 0) { void adminAlert.validation([`${product.name} no tiene un precio definido`]); return; }
    const existing = form.items.find(item => item.productId === product.id);
    const items = existing
      ? form.items.map(item => item.productId === product.id ? { ...item, qty: Math.min(999, item.qty + itemQty) } : item)
      : [...form.items, { productId: product.id, name: product.name, qty: itemQty, price: product.price }];
    setForm(current => ({ ...current, items, total: Math.max(0, itemsTotal(items) - current.discount) }));
    setErrors(current => ({ ...current, items: '' }));
    if (itemQty > product.stock) void adminAlert.toast(`Atención: solo hay ${product.stock} en stock`, 'warning');
    setItemProductId('');
    setItemQty(1);
  };
  const changeQty = (productId: number, delta: number) => {
    const items = form.items.map(item => item.productId === productId ? { ...item, qty: Math.min(999, Math.max(1, item.qty + delta)) } : item);
    setForm(current => ({ ...current, items, total: Math.max(0, itemsTotal(items) - current.discount) }));
  };
  const removeItem = (productId: number) => {
    const items = form.items.filter(item => item.productId !== productId);
    setForm(current => ({ ...current, items, total: Math.max(0, itemsTotal(items) - current.discount) }));
  };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validate(orderSchema, form);
    if (!result.ok || !result.data) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    const clean = { ...form, ...result.data, total: mode === 'add' ? Math.max(0, itemsTotal(form.items) - form.discount) : form.total } as OrderForm;
    setSaving(true);
    try {
      if (mode === 'edit' && editingId) {
        await updateOrder({ ...clean, id: editingId });
        void adminAlert.success('Pedido actualizado', editingId);
      } else {
        const id = await addOrder(clean);
        void adminAlert.success('Pedido registrado', id);
      }
      setMode(null);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo guardar el pedido');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (order: Order, status: Order['status']) => {
    if (status === order.status) return;
    if (status === 'Cancelado' && !await adminAlert.confirm('¿Cancelar pedido?', `El pedido ${order.id} se marcará como cancelado y no contará en las ventas.`, 'Sí, cancelar', 'warning')) return;
    setBusyStatus(order.id);
    try {
      await updateOrderStatus(order.id, status);
      void adminAlert.toast(`${order.id} → ${status}`);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo cambiar el estado');
    } finally {
      setBusyStatus(null);
    }
  };

  const handleDelete = async (order: Order) => {
    if (!await adminAlert.confirmDelete('¿Eliminar pedido?', `El pedido ${order.id} de ${order.customer} se eliminará del historial de ventas.`)) return;
    try {
      await deleteOrder(order.id);
      if (detailId === order.id) setDetailId(null);
      void adminAlert.success('Pedido eliminado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el pedido');
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Órdenes" description={<span className="inline-flex flex-wrap items-center gap-2">Pedidos de la tienda sincronizados automáticamente <LiveStatus compact /></span>}
        actions={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Registrar pedido</button>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Pendientes" value={countBy('Pendiente')} icon={Clock} tone={countBy('Pendiente') ? 'amber' : 'slate'} detail="Requieren atención" />
        <StatCard label="En proceso / enviados" value={countBy('Procesando') + countBy('Enviado')} icon={Truck} tone="blue" />
        <StatCard label="Entregados" value={delivered.length} icon={ShoppingBag} tone="green" detail={`Ticket promedio ${formatShort(averageTicket)}`} />
        <StatCard label="Total del filtro" value={formatShort(filteredRevenue)} icon={Wallet} tone="violet" detail="Sin pedidos cancelados" />
      </section>

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header">
          <Segmented label="Filtrar por estado" value={filterStatus} onChange={setStatusParam} options={[
            { value: 'Todos', label: 'Todos', count: orders.length },
            ...allStatuses.map(status => ({ value: status, label: status, count: countBy(status) })),
          ]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, cliente o teléfono" className="w-full sm:w-72" />
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Pedido</th><th>Cliente</th><th className="hidden lg:table-cell">Ciudad</th><th className="hidden md:table-cell">Fecha</th><th className="!text-right">Total</th><th>Estado</th><th className="!text-right">Acciones</th></tr></thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td>
                    <button onClick={() => setDetailId(order.id)} className="font-mono text-[13px] font-bold text-[#0052cc] hover:underline">{order.id}</button>
                    <p className="text-[11px] text-slate-400">{order.items?.length || 0} producto{(order.items?.length || 0) === 1 ? '' : 's'}</p>
                  </td>
                  <td><p className="max-w-[200px] truncate font-semibold text-slate-900">{order.customer}</p><p className="max-w-[200px] truncate text-[11.5px] text-slate-500">{order.email}</p></td>
                  <td className="hidden text-slate-600 lg:table-cell">{order.city || '—'}</td>
                  <td className="hidden whitespace-nowrap text-xs text-slate-500 md:table-cell">{order.date}</td>
                  <td className="tabular text-right font-bold text-slate-900">{formatShort(order.total)}</td>
                  <td>
                    <label className="relative inline-flex items-center">
                      <span className="sr-only">Estado de {order.id}</span>
                      <select value={order.status} disabled={busyStatus === order.id} onChange={event => void handleStatusChange(order, event.target.value as Order['status'])}
                        className={`admin-badge admin-tone-${orderStatusTone[order.status]} no-dot cursor-pointer appearance-none border-0 py-1 pl-2.5 pr-6 outline-none focus-visible:ring-2 focus-visible:ring-blue-300`}>
                        {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                      </select>
                      {busyStatus === order.id ? <Loader2 className="pointer-events-none absolute right-1.5 h-3 w-3 animate-spin" /> : <span className="pointer-events-none absolute right-2 text-[9px] opacity-70">▼</span>}
                    </label>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-0.5">
                      <button onClick={() => setDetailId(order.id)} className="admin-action" title="Ver detalle" aria-label={`Ver ${order.id}`}><Eye className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(order)} className="admin-action" title="Editar" aria-label={`Editar ${order.id}`}><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => void handleDelete(order)} className="admin-action admin-action-danger" title="Eliminar" aria-label={`Eliminar ${order.id}`}><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={ShoppingCart} title={orders.length ? 'Sin resultados' : 'Aún no hay pedidos'} text={orders.length ? 'No hay pedidos que coincidan con la búsqueda o el filtro.' : 'Los pedidos de la tienda aparecerán aquí automáticamente.'} />}
        </div>
        {filtered.length > 0 && <p className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">Mostrando {filtered.length} de {orders.length} pedidos</p>}
      </div>

      {detail && (
        <Modal title={`Pedido ${detail.id}`} subtitle={detail.date} icon={ShoppingBag} onClose={() => setDetailId(null)}
          footer={<>
            {detail.phone && <a href={whatsappLink(detail.phone, `Hola ${detail.customer}, te escribimos de SISCOMRED sobre tu pedido ${detail.id}.`)} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary mr-auto"><MessageCircle className="h-4 w-4 text-green-600" /> WhatsApp</a>}
            <button type="button" onClick={() => openEdit(detail)} className="admin-btn admin-btn-secondary"><Pencil className="h-4 w-4" /> Editar</button>
            <button type="button" onClick={() => setDetailId(null)} className="admin-btn admin-btn-primary">Cerrar</button>
          </>}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Estado:</span>
            {allStatuses.map(status => (
              <button key={status} type="button" disabled={busyStatus === detail.id} onClick={() => void handleStatusChange(detail, status)} aria-pressed={detail.status === status}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${detail.status === status ? `admin-tone-${orderStatusTone[status]} border-transparent` : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{status}</button>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            {[['Cliente', detail.customer], ['Correo', detail.email], ['Teléfono', detail.phone || '—'], ['Ciudad', detail.city || '—'], ['Dirección', detail.address || '—'], ['Cupón', detail.couponCode || '—']].map(([label, value]) => (
              <div key={label} className={label === 'Dirección' ? 'col-span-2' : ''}><dt className="text-[11px] font-semibold text-slate-500">{label}</dt><dd className="mt-0.5 break-words font-semibold text-slate-800">{value}</dd></div>
            ))}
          </dl>
          {detail.notes && <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><span className="font-bold">Notas: </span>{detail.notes}</p>}
          <h4 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Productos</h4>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {detail.items.map((item, index) => (
              <li key={`${item.productId}-${index}`} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <span className="min-w-0 truncate text-slate-800">{item.name} <span className="text-slate-400">× {item.qty}</span></span>
                <span className="tabular shrink-0 font-semibold text-slate-900">{formatShort(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 px-1 text-sm">
            {detail.discount > 0 && <div className="flex justify-between text-slate-600"><span>Descuento</span><span className="tabular">− {formatShort(detail.discount)}</span></div>}
            <div className="flex justify-between text-base font-extrabold text-slate-900"><span>Total</span><span className="tabular">{formatShort(detail.total)}</span></div>
          </div>
        </Modal>
      )}

      {mode && (
        <Modal title={mode === 'add' ? 'Registrar pedido' : `Editar pedido ${editingId}`} subtitle={mode === 'add' ? 'Pedido manual (teléfono, tienda física, WhatsApp)' : 'Actualiza datos de contacto, estado o notas'} icon={ShoppingCart} onClose={closeForm} size="lg"
          footer={<>
            <button type="button" onClick={closeForm} className="admin-btn admin-btn-secondary">Cancelar</button>
            <button type="submit" form="order-form" disabled={saving} className="admin-btn admin-btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'add' ? 'Crear pedido' : 'Guardar cambios'}</button>
          </>}>
          <form id="order-form" onSubmit={event => void handleSave(event)} noValidate className="space-y-5">
            <fieldset className="grid gap-4 sm:grid-cols-2">
              <legend className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Datos del cliente</legend>
              <CustomerFields form={form} errors={errors} update={update} />
            </fieldset>

            {mode === 'add' ? (
              <fieldset>
                <legend className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Productos <span className="text-rose-600">*</span></legend>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select value={itemProductId} onChange={event => setItemProductId(event.target.value)} aria-label="Producto" className="admin-input flex-1">
                    <option value="">Selecciona un producto del catálogo…</option>
                    {products.filter(product => product.price > 0).map(product => <option key={product.id} value={product.id}>{product.name} — {formatShort(product.price)} ({product.stock} en stock)</option>)}
                  </select>
                  <input type="number" min={1} max={999} step={1} value={itemQty} onChange={event => setItemQty(Number(event.target.value))} aria-label="Cantidad" className="admin-input tabular sm:!w-24" />
                  <button type="button" onClick={addItem} disabled={!itemProductId} className="admin-btn admin-btn-secondary"><Plus className="h-4 w-4" /> Añadir</button>
                </div>
                {errors.items && <p className="admin-field-error">{errors.items}</p>}
                {form.items.length > 0 && <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {form.items.map(item => (
                    <li key={item.productId} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{item.name}</p><p className="text-[11px] text-slate-500">{formatShort(item.price)} c/u</p></div>
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button type="button" onClick={() => changeQty(item.productId, -1)} className="grid h-8 w-8 place-items-center text-slate-500 hover:bg-slate-50" aria-label="Restar uno"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="tabular w-8 text-center text-sm font-bold">{item.qty}</span>
                        <button type="button" onClick={() => changeQty(item.productId, 1)} className="grid h-8 w-8 place-items-center text-slate-500 hover:bg-slate-50" aria-label="Sumar uno"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="tabular w-24 text-right text-sm font-bold text-slate-900">{formatShort(item.price * item.qty)}</span>
                      <button type="button" onClick={() => removeItem(item.productId)} className="admin-action admin-action-danger" aria-label={`Quitar ${item.name}`}><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                  <li className="flex justify-between bg-slate-50 px-4 py-3 text-sm font-extrabold text-slate-900"><span>Total a cobrar</span><span className="tabular">{formatShort(itemsTotal(form.items))}</span></li>
                </ul>}
              </fieldset>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">{form.items.length} producto{form.items.length === 1 ? '' : 's'} · Total <span className="tabular font-bold text-slate-900">{formatShort(form.total)}</span> <span className="text-xs text-slate-400">(los productos de un pedido existente no se modifican)</span></div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Estado" error={errors.status}>
                {props => <select {...props} value={form.status} onChange={event => update('status', event.target.value as Order['status'])} className="admin-input">{allStatuses.map(status => <option key={status} value={status}>{status}</option>)}</select>}
              </Field>
              <Field label="Notas / observaciones" error={errors.notes} hint={`${form.notes.length}/500`} className="sm:col-span-2">
                {props => <textarea {...props} value={form.notes} maxLength={500} rows={2} onChange={event => update('notes', event.target.value)} placeholder="Instrucciones de entrega, facturación, etc." className="admin-input" />}
              </Field>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
