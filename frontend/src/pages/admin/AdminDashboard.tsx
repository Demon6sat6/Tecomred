import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, Clock, Package, ShoppingCart, Star, UserPlus, Wallet } from 'lucide-react';
import { useAdmin, type Order } from '../../context/AdminContext';
import { Badge, LiveStatus, StatCard } from '../../components/admin/AdminUI';
import { orderStatusTone } from '../../utils/adminFormat';
import { useCurrency } from '../../hooks/useCurrency';
import { parseFlexibleDate } from '../../utils/dateUtils';

type Period = 'month' | 'previous' | 'seven' | 'thirty';
type Grouping = 'daily' | 'weekly';
type ChartMode = 'both' | 'sales' | 'orders';

const validOrder = (order: Order) => order.status !== 'Cancelado';
const completedOrder = (order: Order) => order.status === 'Entregado';
const asDate = (date: string) => parseFlexibleDate(date);
const dateKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const isInRange = (date: Date, start: Date, end: Date) => !Number.isNaN(date.getTime()) && date >= start && date < end;

function getRange(period: Period, now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  if (period === 'previous') { start.setMonth(start.getMonth() - 1); end.setMonth(end.getMonth() - 1); }
  if (period === 'seven' || period === 'thirty') { start.setTime(now.getTime()); start.setDate(start.getDate() - (period === 'seven' ? 6 : 29)); start.setHours(0, 0, 0, 0); end.setTime(now.getTime()); end.setDate(end.getDate() + 1); end.setHours(0, 0, 0, 0); }
  const previousEnd = new Date(start);
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
  return { start, end, previousStart, previousEnd };
}

function StatusPill({ status }: { status: Order['status'] }) {
  return <Badge tone={orderStatusTone[status]}>{status}</Badge>;
}

export default function AdminDashboard() {
  const { products, orders, reviews } = useAdmin();
  const { formatShort } = useCurrency();
  const [period, setPeriod] = useState<Period>('month');
  const [grouping, setGrouping] = useState<Grouping>('daily');
  const [chartMode, setChartMode] = useState<ChartMode>('both');
  const now = new Date();
  const { start, end, previousStart, previousEnd } = getRange(period, now);
  const currentOrders = orders.filter(order => isInRange(asDate(order.date), start, end) && validOrder(order));
  const priorOrders = orders.filter(order => isInRange(asDate(order.date), previousStart, previousEnd) && validOrder(order));
  const completed = currentOrders.filter(completedOrder);
  const priorCompleted = priorOrders.filter(completedOrder);
  const revenue = completed.reduce((total, order) => total + order.total, 0);
  const priorRevenue = priorCompleted.reduce((total, order) => total + order.total, 0);
  const sold = completed.flatMap(order => order.items).reduce((total, item) => total + item.qty, 0);
  const priorSold = priorCompleted.flatMap(order => order.items).reduce((total, item) => total + item.qty, 0);
  const newCustomers = new Set(currentOrders.map(order => order.email.toLowerCase()).filter(Boolean)).size;
  const priorCustomers = new Set(priorOrders.map(order => order.email.toLowerCase()).filter(Boolean)).size;
  const change = (current: number, previous: number) => {
    if (previous <= 0) return <span className="text-slate-400">Sin datos del período anterior</span>;
    const pct = ((current - previous) / previous) * 100;
    const up = pct >= 0;
    return <span><span className={`mr-1 rounded-md px-1.5 py-0.5 font-bold ${up ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{up ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%</span>vs. período anterior</span>;
  };
  const stats = [
    { label: 'Ventas entregadas', value: formatShort(revenue), icon: Wallet, tone: 'blue' as const, change: change(revenue, priorRevenue) },
    { label: 'Órdenes', value: currentOrders.length.toLocaleString('es-PE'), icon: ShoppingCart, tone: 'green' as const, change: change(currentOrders.length, priorOrders.length) },
    { label: 'Clientes únicos', value: newCustomers.toLocaleString('es-PE'), icon: UserPlus, tone: 'violet' as const, change: change(newCustomers, priorCustomers) },
    { label: 'Productos vendidos', value: sold.toLocaleString('es-PE'), icon: Package, tone: 'sky' as const, change: change(sold, priorSold) },
  ];
  const attention = [
    { label: 'Órdenes pendientes', value: orders.filter(order => order.status === 'Pendiente').length, to: '/admin/pedidos?status=Pendiente', icon: Clock, tone: 'amber' as const },
    { label: 'Productos con stock bajo', value: products.filter(product => product.stock <= 5).length, to: '/admin/inventario', icon: AlertTriangle, tone: 'rose' as const },
    { label: 'Reseñas por moderar', value: reviews.filter(review => review.approved === false).length, to: '/admin/resenas', icon: Star, tone: 'violet' as const },
  ];

  const chart = (() => {
    const points: { date: Date; sales: number; count: number }[] = [];
    for (let day = new Date(start); day < end; day.setDate(day.getDate() + 1)) {
      const date = new Date(day);
      const dayOrders = currentOrders.filter(order => dateKey(asDate(order.date)) === dateKey(date));
      points.push({ date, sales: dayOrders.filter(completedOrder).reduce((sum, order) => sum + order.total, 0), count: dayOrders.length });
    }
    if (grouping === 'daily') return points;
    const weeks: typeof points = [];
    points.forEach((point, index) => { if (index % 7 === 0) weeks.push({ date: point.date, sales: 0, count: 0 }); weeks[weeks.length - 1].sales += point.sales; weeks[weeks.length - 1].count += point.count; });
    return weeks;
  })();
  const maxSales = Math.max(1, ...chart.map(point => point.sales));
  const maxCount = Math.max(1, ...chart.map(point => point.count));
  const linePoints = chart.map((point, index) => `${((index + .5) / chart.length) * 1000},${200 - (point.count / maxCount) * 170}`).join(' ');
  const showSales = chartMode !== 'orders';
  const showOrders = chartMode !== 'sales';

  const productById = new Map(products.map(product => [product.id, product]));
  const categoryData = new Map<string, { units: number; image: string }>();
  const productData = new Map<number, { units: number; revenue: number }>();
  completed.forEach(order => order.items.forEach(item => {
    const product = productById.get(item.productId);
    if (!product) return;
    const category = categoryData.get(product.category) ?? { units: 0, image: product.image };
    category.units += item.qty;
    categoryData.set(product.category, category);
    const entry = productData.get(product.id) ?? { units: 0, revenue: 0 };
    entry.units += item.qty;
    entry.revenue += item.price * item.qty;
    productData.set(product.id, entry);
  }));
  const categories = [...categoryData].sort((a, b) => b[1].units - a[1].units).slice(0, 5);
  const topProducts = [...productData].sort((a, b) => b[1].units - a[1].units).slice(0, 5);
  const recentOrders = [...currentOrders].sort((a, b) => asDate(b.date).getTime() - asDate(a.date).getTime()).slice(0, 5);
  const dateLabel = (date: Date) => date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  const rangeLabel = `${dateLabel(start)} - ${dateLabel(new Date(end.getTime() - 1))} ${end.getFullYear()}`;

  return <div className="space-y-3.5">
    <div className="flex flex-wrap items-start justify-between gap-3 pb-1">
      <div><h2>Dashboard</h2><p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">Resumen general de tu tienda en línea <LiveStatus /></p></div>
      <label className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm"><CalendarDays className="h-4 w-4 text-slate-600" /><span className="sr-only">Período del dashboard</span><select value={period} onChange={event => setPeriod(event.target.value as Period)} aria-label="Período del dashboard" className="h-10 min-w-[185px] border-0 bg-transparent text-xs font-medium text-slate-800 outline-none"><option value="month">{rangeLabel}</option><option value="previous">Mes anterior</option><option value="seven">Últimos 7 días</option><option value="thirty">Últimos 30 días</option></select></label>
    </div>

    <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Indicadores del período">
      {stats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone={stat.tone} detail={stat.change} />)}
    </section>

    {attention.some(item => item.value > 0) && <section className="grid gap-3 sm:grid-cols-3" aria-label="Requiere atención">
      {attention.map(item => <Link key={item.label} to={item.to} className={`admin-card group flex items-center gap-3 p-3.5 transition hover:border-blue-200 ${item.value ? '' : 'opacity-60'}`}>
        <span className={`admin-kpi-icon admin-tone-${item.value ? item.tone : 'slate'} !h-10 !w-10`}><item.icon className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1"><span className="tabular block text-lg font-extrabold leading-tight text-slate-900">{item.value}</span><span className="block truncate text-xs font-medium text-slate-500">{item.label}</span></span>
        <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0052cc]" />
      </Link>)}
    </section>}

    <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.75fr)_minmax(330px,1fr)]">
      <section className="admin-ref-card min-w-0 p-4" aria-label="Ventas y órdenes"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-[16px] font-bold">Ventas y órdenes</h3><div className="flex gap-2"><select value={grouping} onChange={event => setGrouping(event.target.value as Grouping)} aria-label="Agrupar gráfico" className="admin-chart-select"><option value="daily">Diario</option><option value="weekly">Semanal</option></select><select value={chartMode} onChange={event => setChartMode(event.target.value as ChartMode)} aria-label="Serie del gráfico" className="admin-chart-select"><option value="both">Ventas y órdenes</option><option value="sales">Ventas</option><option value="orders">Órdenes</option></select></div></div>
        <div className="relative mt-4 h-[245px] min-w-0 pl-9 pr-7"><div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-6 text-[10px] text-slate-500"><span>{formatShort(maxSales)}</span><span>{formatShort(maxSales / 2)}</span><span>0</span></div><div className="relative h-[205px] border-b border-l border-slate-200"><div className="absolute inset-0 flex flex-col justify-between"><span className="border-t border-slate-100" /><span className="border-t border-slate-100" /><span className="border-t border-slate-100" /></div><div className="relative flex h-full items-end gap-[2px]">{chart.map((point, index) => <div key={index} className="flex h-full min-w-0 flex-1 items-end justify-center" title={`${dateLabel(point.date)}: ${formatShort(point.sales)}, ${point.count} órdenes`}>{showSales && <div className="w-[72%] max-w-5 rounded-t-sm bg-[#1972e8]" style={{ height: `${point.sales ? Math.max(2, (point.sales / maxSales) * 88) : 0}%` }} />}</div>)}</div>{showOrders && chart.length > 1 && <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true"><polyline fill="none" stroke="#33a329" strokeWidth="3" vectorEffect="non-scaling-stroke" points={linePoints} /></svg>}{currentOrders.length === 0 && <div className="absolute inset-0 flex items-center justify-center bg-white/75 text-center"><p className="max-w-[250px] text-xs font-medium text-slate-500">El gráfico mostrará las ventas y órdenes cuando se registren pedidos.</p></div>}</div><div className="mt-2 flex justify-between pl-1 text-[10px] text-slate-500">{chart.filter((_, index) => index % Math.max(1, Math.ceil(chart.length / 6)) === 0).map(point => <span key={dateKey(point.date)}>{dateLabel(point.date)}</span>)}</div><div className="absolute inset-y-0 right-0 flex flex-col justify-between pb-6 text-[10px] text-slate-500"><span>{maxCount}</span><span>{Math.round(maxCount / 2)}</span><span>0</span></div></div>
        <div className="mt-2 flex items-center justify-center gap-5 text-[11px] text-slate-700"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#1972e8]" />Ventas (S/)</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#33a329]" />Órdenes</span></div>
      </section>
      <section className="admin-ref-card min-w-0 p-4"><div className="flex items-center justify-between"><h3 className="text-[16px] font-bold">Categorías más vendidas</h3><Link to="/admin/categorias" className="text-xs font-medium text-blue-600 hover:underline">Ver todas</Link></div>{categories.length ? <div className="mt-3 divide-y divide-slate-100">{categories.map(([name, data]) => <div key={name} className="flex items-center gap-3 py-2"><img src={data.image} alt="" className="h-10 w-10 shrink-0 rounded-md bg-slate-50 object-contain" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold text-slate-800">{name}</p><span className="text-[11px] font-medium text-slate-700">{sold ? ((data.units / sold) * 100).toFixed(1) : 0}%</span></div><p className="text-[11px] text-slate-500">{data.units} vendidos</p><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#36a229]" style={{ width: `${sold ? (data.units / sold) * 100 : 0}%` }} /></div></div></div>)}</div> : <div className="flex h-[270px] flex-col items-center justify-center text-center"><Package className="mb-2 h-7 w-7 text-slate-300" /><p className="text-sm font-semibold text-slate-700">Sin categorías vendidas aún</p><p className="mt-1 text-xs text-slate-500">Aparecerán al completar pedidos.</p></div>}</section>
    </div>

    <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1.75fr)_minmax(330px,1fr)]">
      <section className="admin-ref-card min-w-0 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[16px] font-bold">Órdenes recientes</h3><Link to="/admin/pedidos" className="text-xs font-medium text-blue-600 hover:underline">Ver todas</Link></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="px-2 py-2"># Orden</th><th className="px-2 py-2">Cliente</th><th className="px-2 py-2">Fecha</th><th className="px-2 py-2">Estado</th><th className="px-2 py-2 text-right">Total</th><th className="px-2 py-2 text-center">Acciones</th></tr></thead><tbody>{recentOrders.map(order => <tr key={order.id} className="border-b border-slate-100 last:border-0"><td className="px-2 py-2"><Link to={`/admin/pedidos?search=${encodeURIComponent(order.id)}`} className="font-semibold text-blue-600 hover:underline">{order.id}</Link></td><td className="max-w-36 truncate px-2 py-2 text-slate-700">{order.customer}</td><td className="whitespace-nowrap px-2 py-2 text-slate-500">{order.date}</td><td className="px-2 py-2"><StatusPill status={order.status} /></td><td className="px-2 py-2 text-right font-semibold text-slate-800">{formatShort(order.total)}</td><td className="px-2 py-2 text-center"><Link to={`/admin/pedidos?search=${encodeURIComponent(order.id)}`} aria-label={`Ver orden ${order.id}`} className="inline-flex rounded-md border border-slate-200 px-2 py-1 text-slate-600 hover:bg-slate-50">···</Link></td></tr>)}</tbody></table>{!recentOrders.length && <p className="py-10 text-center text-sm text-slate-500">No hay órdenes en este período.</p>}</div></section>
      <section className="admin-ref-card min-w-0 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="text-[16px] font-bold">Productos con mayor rendimiento</h3><Link to="/admin/productos" className="text-xs font-medium text-blue-600 hover:underline">Ver todos</Link></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="px-2 py-2">Producto</th><th className="px-2 py-2 text-right">Ventas</th><th className="px-2 py-2 text-right">Ingresos</th></tr></thead><tbody>{topProducts.map(([id, data]) => { const product = productById.get(id); return product && <tr key={id} className="border-b border-slate-100 last:border-0"><td className="px-2 py-2"><div className="flex min-w-0 items-center gap-2"><img src={product.image} alt="" className="h-8 w-8 shrink-0 rounded bg-slate-50 object-contain" /><span className="max-w-40 truncate text-slate-700">{product.name}</span></div></td><td className="px-2 py-2 text-right font-medium text-slate-700">{data.units}</td><td className="px-2 py-2 text-right font-medium text-slate-800">{formatShort(data.revenue)}</td></tr>; })}</tbody></table>{!topProducts.length && <p className="py-10 text-center text-sm text-slate-500">Aún no hay productos vendidos.</p>}</div></section>
    </div>
  </div>;
}
