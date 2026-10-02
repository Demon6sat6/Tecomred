import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Pencil, Plus, ShoppingBag, Trash2, User, UserCheck, Users, Wallet } from 'lucide-react';
import { useUrlParam } from '../../hooks/useUrlParam';
import { useAdmin, type Customer } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import { adminAlert } from '../../utils/adminAlerts';
import { customerSchema, validate, type FieldErrors } from '../../utils/adminValidation';
import { Badge, EmptyState, Field, Modal, PageHeader, SearchInput, Segmented, StatCard } from '../../components/admin/AdminUI';
import { initials, orderStatusTone } from '../../utils/adminFormat';

type CustomerForm = Omit<Customer, 'id'>;
type Filter = 'all' | 'Activo' | 'Inactivo';

const emptyCustomer = (): CustomerForm => ({
  name: '', email: '', phone: '', city: '', orders: 0, totalSpent: 0,
  joined: new Date().toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }), status: 'Activo',
});

export default function AdminCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, orders } = useAdmin();
  const { formatShort } = useCurrency();
  const [search, setSearch] = useUrlParam('search');
  const [filter, setFilter] = useState<Filter>('all');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [history, setHistory] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyCustomer);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);


  // Estadísticas en vivo calculadas desde los pedidos reales (excluye cancelados).
  const statsByEmail = useMemo(() => {
    const stats = new Map<string, { orders: number; spent: number }>();
    orders.forEach(order => {
      const key = order.email?.toLowerCase();
      if (!key || order.status === 'Cancelado') return;
      const entry = stats.get(key) ?? { orders: 0, spent: 0 };
      entry.orders += 1;
      entry.spent += order.total;
      stats.set(key, entry);
    });
    return stats;
  }, [orders]);
  const statsFor = (customer: Customer) => {
    const live = statsByEmail.get(customer.email.toLowerCase());
    return { orders: Math.max(live?.orders ?? 0, customer.orders), spent: Math.max(live?.spent ?? 0, customer.totalSpent) };
  };

  const term = search.trim().toLocaleLowerCase('es');
  const filtered = customers.filter(customer =>
    (!term || `${customer.name} ${customer.email} ${customer.city} ${customer.phone}`.toLocaleLowerCase('es').includes(term)) &&
    (filter === 'all' || customer.status === filter));
  const activeCount = customers.filter(customer => customer.status === 'Activo').length;
  const totalRevenue = customers.reduce((sum, customer) => sum + statsFor(customer).spent, 0);
  const buyers = customers.filter(customer => statsFor(customer).orders > 0).length;

  const update = <K extends keyof CustomerForm>(key: K, value: CustomerForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => { if (!current[key]) return current; const next = { ...current }; delete next[key]; return next; });
  };

  const openAdd = () => { setEditing(null); setForm(emptyCustomer()); setErrors({}); setFormOpen(true); };
  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setForm({ name: customer.name, email: customer.email, phone: customer.phone, city: customer.city, orders: customer.orders, totalSpent: customer.totalSpent, joined: customer.joined, status: customer.status });
    setErrors({});
    setFormOpen(true);
  };
  const close = () => { if (!saving) setFormOpen(false); };

  const handleSave = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const otherEmails = customers.filter(customer => customer.id !== editing?.id).map(customer => customer.email.toLowerCase());
    const result = validate(customerSchema(otherEmails), form);
    if (!result.ok || !result.data) {
      setErrors(result.errors);
      void adminAlert.validation(result.messages);
      return;
    }
    setSaving(true);
    try {
      if (editing) await updateCustomer({ ...result.data, id: editing.id });
      else await addCustomer(result.data);
      setFormOpen(false);
      void adminAlert.success(editing ? 'Cliente actualizado' : 'Cliente registrado', result.data.name);
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo guardar el cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (!await adminAlert.confirmDelete('¿Eliminar cliente?', `Se eliminará el perfil de ${customer.name}. Sus pedidos se conservan.`)) return;
    try {
      await deleteCustomer(customer.id);
      void adminAlert.success('Cliente eliminado');
    } catch (cause) {
      void adminAlert.failure(cause, 'No se pudo eliminar el cliente');
    }
  };

  const historyOrders = history ? orders.filter(order => order.email?.toLowerCase() === history.email.toLowerCase()) : [];

  return (
    <div className="space-y-5">
      <PageHeader title="Clientes" description="Directorio de clientes con su historial de compras en tiempo real."
        actions={<button onClick={openAdd} className="admin-btn admin-btn-primary"><Plus className="h-4 w-4" /> Agregar cliente</button>} />

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Clientes" value={customers.length} icon={Users} tone="blue" />
        <StatCard label="Activos" value={activeCount} icon={UserCheck} tone="green" detail={`${customers.length - activeCount} inactivos`} />
        <StatCard label="Con compras" value={buyers} icon={ShoppingBag} tone="violet" />
        <StatCard label="Ingresos de clientes" value={formatShort(totalRevenue)} icon={Wallet} tone="sky" detail="Pedidos no cancelados" />
      </section>

      <div className="admin-card overflow-hidden">
        <div className="admin-card-header">
          <Segmented label="Filtrar por estado" value={filter} onChange={setFilter} options={[
            { value: 'all', label: 'Todos', count: customers.length },
            { value: 'Activo', label: 'Activos', count: activeCount },
            { value: 'Inactivo', label: 'Inactivos', count: customers.length - activeCount },
          ]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nombre, email o ciudad" className="w-full sm:w-72" />
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead><tr><th>Cliente</th><th className="hidden md:table-cell">Teléfono</th><th className="hidden md:table-cell">Ciudad</th><th className="!text-right">Pedidos</th><th className="!text-right">Total gastado</th><th>Estado</th><th className="!text-right">Acciones</th></tr></thead>
            <tbody>
              {filtered.map(customer => {
                const stats = statsFor(customer);
                return (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0052cc] to-[#3b82f6] text-xs font-bold text-white">{initials(customer.name)}</span>
                        <div className="min-w-0"><p className="max-w-[220px] truncate font-semibold text-slate-900">{customer.name}</p><p className="max-w-[220px] truncate text-[11.5px] text-slate-500">{customer.email}</p></div>
                      </div>
                    </td>
                    <td className="hidden text-slate-600 md:table-cell">{customer.phone || <span className="text-slate-300">—</span>}</td>
                    <td className="hidden text-slate-600 md:table-cell">{customer.city || <span className="text-slate-300">—</span>}</td>
                    <td className="tabular text-right font-semibold text-slate-800">{stats.orders}</td>
                    <td className="tabular text-right font-bold text-slate-900">{formatShort(stats.spent)}</td>
                    <td><Badge tone={customer.status === 'Activo' ? 'green' : 'slate'}>{customer.status}</Badge></td>
                    <td>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setHistory(customer)} className="admin-action" title="Historial de compras" aria-label={`Historial de ${customer.name}`}><ShoppingBag className="h-4 w-4" /></button>
                        <button onClick={() => openEdit(customer)} className="admin-action" title="Editar" aria-label={`Editar ${customer.name}`}><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => void handleDelete(customer)} className="admin-action admin-action-danger" title="Eliminar" aria-label={`Eliminar ${customer.name}`}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <EmptyState icon={User} title={customers.length ? 'Sin resultados' : 'Aún no hay clientes'} text={customers.length ? 'Prueba con otro término de búsqueda.' : 'Registra tu primer cliente para empezar.'} />}
        </div>
      </div>

      {formOpen && (
        <Modal title={editing ? 'Editar cliente' : 'Nuevo cliente'} subtitle={editing?.email ?? 'Datos de contacto del cliente'} icon={User} onClose={close}
          footer={<>
            <button type="button" onClick={close} className="admin-btn admin-btn-secondary">Cancelar</button>
            <button type="submit" form="customer-form" disabled={saving} className="admin-btn admin-btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Guardar cliente</button>
          </>}>
          <form id="customer-form" onSubmit={event => void handleSave(event)} noValidate className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre completo" required error={errors.name} className="sm:col-span-2">
              {props => <input {...props} value={form.name} maxLength={80} autoComplete="name" onChange={event => update('name', event.target.value)} placeholder="Carlos Mendoza" className="admin-input" />}
            </Field>
            <Field label="Correo electrónico" required error={errors.email}>
              {props => <input {...props} type="email" value={form.email} maxLength={254} autoComplete="email" onChange={event => update('email', event.target.value)} placeholder="carlos@email.com" className="admin-input" />}
            </Field>
            <Field label="Teléfono" error={errors.phone} hint="Opcional · 7 a 20 dígitos">
              {props => <input {...props} type="tel" value={form.phone} maxLength={20} autoComplete="tel" onChange={event => update('phone', event.target.value.replace(/[^\d\s()+-]/g, ''))} placeholder="+51 987 654 321" className="admin-input" />}
            </Field>
            <Field label="Ciudad" error={errors.city}>
              {props => <input {...props} value={form.city} maxLength={60} onChange={event => update('city', event.target.value)} placeholder="Lima" className="admin-input" />}
            </Field>
            <Field label="Estado" error={errors.status}>
              {props => <select {...props} value={form.status} onChange={event => update('status', event.target.value as Customer['status'])} className="admin-input"><option value="Activo">Activo</option><option value="Inactivo">Inactivo</option></select>}
            </Field>
          </form>
        </Modal>
      )}

      {history && (
        <Modal title={history.name} subtitle={history.email} icon={ShoppingBag} onClose={() => setHistory(null)}
          footer={<button type="button" onClick={() => setHistory(null)} className="admin-btn admin-btn-secondary">Cerrar</button>}>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Pedidos', value: statsFor(history).orders }, { label: 'Total gastado', value: formatShort(statsFor(history).spent) }, { label: 'Cliente desde', value: history.joined }].map(stat => (
              <div key={stat.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"><p className="tabular text-sm font-extrabold text-slate-900">{stat.value}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{stat.label}</p></div>
            ))}
          </div>
          <h4 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-wider text-slate-500">Historial de pedidos</h4>
          {historyOrders.length ? <ul className="space-y-2">
            {historyOrders.map(order => (
              <li key={order.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                <div className="min-w-0"><Link to={`/admin/pedidos?search=${encodeURIComponent(order.id)}`} className="font-mono text-xs font-bold text-[#0052cc] hover:underline">{order.id}</Link><p className="mt-0.5 text-[11px] text-slate-500">{order.date} · {order.items?.length || 0} productos</p></div>
                <div className="text-right"><p className="tabular text-sm font-extrabold text-slate-900">{formatShort(order.total)}</p><Badge tone={orderStatusTone[order.status]}>{order.status}</Badge></div>
              </li>
            ))}
          </ul> : <EmptyState icon={ShoppingBag} title="Sin pedidos" text="Este cliente todavía no tiene pedidos registrados con su correo." />}
        </Modal>
      )}
    </div>
  );
}
