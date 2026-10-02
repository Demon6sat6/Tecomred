import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BarChart3, Eye, Package, RefreshCw, ShoppingCart, Wallet } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { parseFlexibleDate } from '../../utils/dateUtils';
import { PageHeader, Segmented, StatCard } from '../../components/admin/AdminUI';

type Period = 'week' | 'month' | 'all';
const money = (amount: number) => `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function periodStart(period: Period) {
  if (period === 'all') return null;
  const date = new Date();
  if (period === 'week') date.setDate(date.getDate() - 6);
  else date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function AdminAnalytics() {
  const { orders, products } = useAdmin();
  const { activeNow, visitsToday, visitsThisWeek, visitsTotal, topPages, visitsByHour, isLiveConnected, lastLiveUpdate, refreshLive } = useAnalytics();
  const [period, setPeriod] = useState<Period>('month');
  const [refreshing, setRefreshing] = useState(false);
  const start = periodStart(period);
  const periodOrders = orders.filter(order => {
    const date = parseFlexibleDate(order.date);
    return Number.isFinite(date.getTime()) && (!start || date >= start);
  });
  const delivered = periodOrders.filter(order => order.status === 'Entregado');
  const revenue = delivered.reduce((sum, order) => sum + order.total, 0);
  const units = delivered.reduce((sum, order) => sum + order.items.reduce((count, item) => count + item.qty, 0), 0);
  const pending = periodOrders.filter(order => order.status === 'Pendiente' || order.status === 'Procesando').length;
  const withoutStock = products.filter(product => product.stock === 0).length;
  const hourlyMax = Math.max(1, ...visitsByHour);
  const cards = [
    { label: 'Ventas entregadas', value: money(revenue), detail: `${delivered.length} pedidos entregados`, icon: Wallet, green: false },
    { label: 'Pedidos recibidos', value: periodOrders.length.toLocaleString('es-PE'), detail: `${pending} por atender`, icon: ShoppingCart, green: true },
    { label: 'Unidades vendidas', value: units.toLocaleString('es-PE'), detail: 'En pedidos entregados', icon: Package, green: false },
    { label: 'Sin stock', value: withoutStock.toLocaleString('es-PE'), detail: `${products.length} productos en catálogo`, icon: BarChart3, green: true },
  ];
  const refresh = async () => {
    setRefreshing(true);
    try { await refreshLive(); } finally { setRefreshing(false); }
  };

  return <div className="space-y-5">
    <PageHeader title="Reportes" description="Ventas, pedidos y visitas de tu tienda en un solo lugar."
      actions={<Segmented label="Período del reporte" value={period} onChange={setPeriod} options={[
        { value: 'week', label: '7 días' }, { value: 'month', label: 'Este mes' }, { value: 'all', label: 'Todo' },
      ]} />} />
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ label, value, detail, icon, green }) => <StatCard key={label} label={label} value={value} detail={detail} icon={icon} tone={green ? 'green' : 'blue'} />)}
    </div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
      <section className="admin-ref-card min-w-0 p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div><h3 className="flex items-center gap-2 text-base font-bold text-slate-900"><Activity className="h-5 w-5 text-blue-600" /> Tráfico de la tienda</h3><p className="mt-1 text-xs text-slate-500">Visitas registradas por el servidor</p></div>
          <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isLiveConnected ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{isLiveConnected ? 'Conectado' : 'Sin conexión'}</span><button onClick={() => void refresh()} disabled={refreshing} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Actualizar</button></div>
        </div>
        {isLiveConnected ? <>
          <div className="grid grid-cols-3 gap-3 border-b border-slate-100 pb-5">
            {([['Activos ahora', activeNow], ['Visitas hoy', visitsToday], ['Esta semana', visitsThisWeek]] as const).map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}
          </div>
          <div className="mt-5"><p className="mb-3 text-sm font-semibold text-slate-800">Visitas por hora · últimas 24 horas</p><div className="flex h-32 items-end gap-1" role="img" aria-label="Gráfico de visitas por hora">
            {visitsByHour.map((count, hour) => <div key={hour} title={`${hour}:00 · ${count} visitas`} className="group relative flex h-full flex-1 items-end"><div className="w-full rounded-t bg-blue-500 transition-colors group-hover:bg-green-500" style={{ height: `${count ? Math.max(5, count / hourlyMax * 100) : 2}%` }} /></div>)}
          </div><div className="mt-1 flex justify-between text-[10px] text-slate-400"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div></div>
          <p className="mt-3 text-xs text-slate-500">{visitsTotal.toLocaleString('es-PE')} visitas en el registro reciente del servidor{lastLiveUpdate ? ` · actualizado a las ${lastLiveUpdate.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
        </> : <div className="grid min-h-56 place-items-center rounded-xl bg-slate-50 px-5 text-center"><div><Eye className="mx-auto mb-3 h-8 w-8 text-slate-400" /><p className="font-semibold text-slate-800">No hay datos de visitas disponibles</p><p className="mt-1 text-sm text-slate-500">Revisa la conexión con el servidor y vuelve a actualizar.</p></div></div>}
      </section>
      <section className="admin-ref-card min-w-0 p-5"><h3 className="text-base font-bold text-slate-900">Páginas más visitadas</h3><p className="mt-1 text-xs text-slate-500">Rutas de la tienda con más actividad</p>
        {isLiveConnected && topPages.length ? <div className="mt-5 space-y-4">{topPages.slice(0, 6).map(page => <div key={page.path}><div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium text-slate-800">{page.label}</span><span className="font-bold text-slate-800">{page.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-green-500" style={{ width: `${Math.round(page.count / Math.max(1, topPages[0].count) * 100)}%` }} /></div></div>)}</div> : <div className="grid min-h-56 place-items-center text-center text-sm text-slate-500">{isLiveConnected ? 'Aún no hay visitas registradas.' : 'Disponible cuando se conecte el servidor.'}</div>}
      </section>
    </div>
    <div className="grid gap-3 sm:grid-cols-2"><Link to="/admin/pedidos" className="admin-ref-card flex items-center justify-between p-5 text-sm font-semibold text-blue-700 hover:border-blue-300">Ver todos los pedidos <ArrowRight className="h-4 w-4" /></Link><Link to="/admin/inventario" className="admin-ref-card flex items-center justify-between p-5 text-sm font-semibold text-blue-700 hover:border-blue-300">Revisar inventario <ArrowRight className="h-4 w-4" /></Link></div>
  </div>;
}
