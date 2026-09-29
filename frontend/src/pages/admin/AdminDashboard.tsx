import { Link } from 'react-router-dom';
import {
  DollarSign, Package, ShoppingBag, Users,
  ArrowRight, ArrowUpRight, AlertTriangle, Download,
  TrendingUp, Eye, Star,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCurrency } from '../../hooks/useCurrency';
import { parseFlexibleDate, isSameDay } from '../../utils/dateUtils';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-amber-50 text-amber-700 border-amber-200',
  Procesando: 'bg-blue-50 text-blue-700 border-blue-200',
  Enviado:    'bg-indigo-50 text-indigo-700 border-indigo-200',
  Entregado:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelado:  'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AdminDashboard() {
  const { products, orders, customers } = useAdmin();
  const { activeNow, visitsToday, visitsThisWeek } = useAnalytics();
  const { formatShort } = useCurrency();

  const totalRevenue  = orders.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0);
  const totalOrders   = orders.length;
  const totalProducts = products.length;
  const lowStock      = products.filter(p => p.stock <= 5 && p.stock > 0);
  const recentOrders  = [...orders].slice(0, 5);

  // Sales by category
  const byCategory = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCat = Math.max(...topCategories.map(c => c[1]), 1);

  // Real sales chart data (last 7 days from actual orders)
  const today = new Date();
  const last7DaysList = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const days = last7DaysList.map((d) =>
    d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' })
  );

  const salesData = last7DaysList.map((dayDate) => {
    const dayOrders = orders.filter((o) => {
      if (o.status === 'Cancelado') return false;
      const orderDate = parseFlexibleDate(o.date);
      return isSameDay(orderDate, dayDate);
    });
    return Math.round(dayOrders.reduce((sum, o) => sum + o.total, 0));
  });
  const maxSales = Math.max(...salesData, 100);

  // Export orders to CSV
  const exportOrdersCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Ciudad', 'Fecha', 'Total', 'Estado'];
    const rows = orders.map(o => [o.id, o.customer, o.email, o.city, o.date, o.total.toFixed(2), o.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pedidos_siscomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportProductsCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Rating'];
    const rows = products.map(p => [p.id, `"${p.name}"`, p.category, p.price.toFixed(2), p.stock, p.rating]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'productos_siscomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCustomersCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Ciudad', 'Pedidos', 'Total Gastado', 'Estado'];
    const rows = customers.map(c => [c.id, `"${c.name}"`, c.email, c.city, c.orders, c.totalSpent.toFixed(2), c.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clientes_siscomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Ingresos totales', value: formatShort(totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+12.5%' },
    { label: 'Pedidos',          value: totalOrders,      icon: ShoppingBag, color: 'text-blue-600',    bg: 'bg-blue-50',    change: '+8.2%' },
    { label: 'Productos',        value: totalProducts,    icon: Package,     color: 'text-indigo-600',  bg: 'bg-indigo-50',  change: `${totalProducts} activos` },
    { label: 'Clientes',         value: customers.length, icon: Users,       color: 'text-purple-600',  bg: 'bg-purple-50',  change: `${customers.filter(c => c.status === 'Activo').length} activos` },
    { label: 'Activos ahora',    value: activeNow,        icon: Eye,         color: 'text-emerald-600', bg: 'bg-emerald-50', change: `${visitsToday} hoy`, live: true },
    { label: 'Visitas semana',   value: visitsThisWeek,   icon: TrendingUp,  color: 'text-blue-600',    bg: 'bg-blue-50',    change: 'últimos 7 días' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Resumen de ventas y actividad de la tienda</p>
        </div>
        {/* Export buttons */}
        <div className="flex gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors">
              <Download className="w-3.5 h-3.5 text-slate-500" /> Exportar reporte
            </button>
            <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 min-w-[160px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button onClick={exportOrdersCSV}   className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Pedidos CSV</button>
              <button onClick={exportProductsCSV} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Productos CSV</button>
              <button onClick={exportCustomersCSV} className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">Clientes CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change, live }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex items-center gap-1.5">
                {live && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                  {change}
                </span>
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="text-slate-500 text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-slate-900 font-bold text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Ventas últimos 7 días
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Total semana: <strong className="text-slate-800">{formatShort(salesData.reduce((a, b) => a + b, 0))}</strong>
          </span>
        </div>
        <div className="flex items-end gap-2 sm:gap-4 h-36 pt-4">
          {salesData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}</span>
              <div className="w-full bg-slate-100 rounded-t-lg h-24 flex items-end overflow-hidden">
                <div
                  className="w-full rounded-t-lg gradient-brand transition-all duration-700 hover:opacity-90"
                  style={{ height: `${Math.max(6, (val / maxSales) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: Recent Orders & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 font-bold text-base">Pedidos recientes</h3>
            <Link to="/admin/pedidos" className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentOrders.length === 0 ? (
              <p className="text-slate-400 text-sm py-4 text-center">No hay pedidos registrados aún</p>
            ) : (
              recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 text-sm font-semibold truncate">{order.customer}</p>
                    <p className="text-slate-400 text-xs font-mono">{order.id} · {order.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-900 text-sm font-extrabold">{formatShort(order.total)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Categories & Low Stock */}
        <div className="space-y-4">
          {/* Categories chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-slate-900 font-bold text-base mb-4">Productos por categoría</h3>
            <div className="space-y-3">
              {topCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-slate-600 truncate">{cat}</span>
                    <span className="text-slate-900 font-bold shrink-0 ml-2">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-brand rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCat) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <h3 className="text-amber-900 font-bold text-sm">Alerta de stock bajo ({lowStock.length})</h3>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs">
                    <p className="text-amber-950 font-medium truncate flex-1">{p.name}</p>
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded ml-2 shrink-0">{p.stock} uds</span>
                  </div>
                ))}
              </div>
              <Link to="/admin/productos" className="block mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Gestionar inventario &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top products table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900 font-bold text-base">Productos más valorados</h3>
          <Link to="/admin/productos" className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors">
            Ver catálogo completo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-slate-400 text-xs font-semibold pb-3 pr-4">Producto</th>
                <th className="text-left text-slate-400 text-xs font-semibold pb-3 pr-4 hidden sm:table-cell">Categoría</th>
                <th className="text-right text-slate-400 text-xs font-semibold pb-3 pr-4">Precio</th>
                <th className="text-right text-slate-400 text-xs font-semibold pb-3 pr-4">Stock</th>
                <th className="text-right text-slate-400 text-xs font-semibold pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...products].sort((a, b) => b.rating - a.rating).slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-100 p-0.5 shrink-0" />
                      <span className="text-slate-900 text-xs font-semibold truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell"><span className="text-slate-500 text-xs">{p.category}</span></td>
                  <td className="py-3 pr-4 text-right"><span className="text-slate-900 text-xs font-black">{formatShort(p.price)}</span></td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.stock <= 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
