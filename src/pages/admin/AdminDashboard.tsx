import { Link } from 'react-router-dom';
import {
  DollarSign, Package, ShoppingBag, Users,
  ArrowRight, ArrowUpRight, AlertTriangle, Download,
  TrendingUp, Eye,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useCurrency } from '../../hooks/useCurrency';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Procesando: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Enviado:    'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  Entregado:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Cancelado:  'bg-red-500/15 text-red-400 border-red-500/20',
};

// Build last 7 days labels
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric' });
  });
}

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

  // Fake sales chart data (last 7 days)
  const days = getLast7Days();
  const salesData = days.map((_, i) => {
    // Simulate some variation based on orders
    const base = totalRevenue / 7;
    const variation = [0.8, 1.2, 0.9, 1.4, 1.1, 0.7, 1.3][i] ?? 1;
    return Math.round(base * variation);
  });
  const maxSales = Math.max(...salesData, 1);

  // Export orders to CSV
  const exportOrdersCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Ciudad', 'Fecha', 'Total', 'Estado'];
    const rows = orders.map(o => [o.id, o.customer, o.email, o.city, o.date, o.total.toFixed(2), o.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pedidos_tecomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportProductsCSV = () => {
    const headers = ['ID', 'Nombre', 'CategorÃ­a', 'Precio', 'Stock', 'Rating'];
    const rows = products.map(p => [p.id, `"${p.name}"`, p.category, p.price.toFixed(2), p.stock, p.rating]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'productos_tecomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCustomersCSV = () => {
    const headers = ['ID', 'Nombre', 'Email', 'Ciudad', 'Pedidos', 'Total Gastado', 'Estado'];
    const rows = customers.map(c => [c.id, `"${c.name}"`, c.email, c.city, c.orders, c.totalSpent.toFixed(2), c.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'clientes_tecomred.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    { label: 'Ingresos totales', value: formatShort(totalRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+12.5%' },
    { label: 'Pedidos',          value: totalOrders,      icon: ShoppingBag, color: 'text-sky-400',    bg: 'bg-sky-500/10',    change: '+8.2%' },
    { label: 'Productos',        value: totalProducts,    icon: Package,     color: 'text-indigo-400', bg: 'bg-indigo-500/10', change: `${totalProducts}` },
    { label: 'Clientes',         value: customers.length, icon: Users,       color: 'text-purple-400', bg: 'bg-purple-500/10', change: `${customers.filter(c => c.status === 'Activo').length} activos` },
    { label: 'Activos ahora',    value: activeNow,        icon: Eye,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: `${visitsToday} hoy`, live: true },
    { label: 'Visitas semana',   value: visitsThisWeek,   icon: TrendingUp,  color: 'text-sky-400',    bg: 'bg-sky-500/10',    change: 'Ãºltimos 7 dÃ­as' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-0.5">Resumen general de la tienda</p>
        </div>
        {/* Export buttons */}
        <div className="flex gap-2">
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-xs text-gray-300 hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <div className="absolute right-0 top-full mt-1 glass-strong rounded-xl shadow-xl border border-white/10 py-1 min-w-[150px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={exportOrdersCSV}   className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Pedidos CSV</button>
              <button onClick={exportProductsCSV} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Productos CSV</button>
              <button onClick={exportCustomersCSV} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Clientes CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change, live }) => (
          <div key={label} className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="flex items-center gap-1.5">
                {live && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
                <span className="text-xs text-gray-500 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  {change}
                </span>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Sales chart */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" /> Ventas Ãºltimos 7 dÃ­as
          </h3>
          <span className="text-xs text-gray-500">Total: {formatShort(salesData.reduce((a, b) => a + b, 0))}</span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {salesData.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-600">${val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}</span>
              <div className="w-full rounded-t-lg gradient-brand transition-all duration-700 hover:opacity-80"
                style={{ height: `${Math.max(4, (val / maxSales) * 100)}%` }} />
              <span className="text-[9px] text-gray-600 truncate w-full text-center">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-bold">Pedidos recientes</h3>
            <Link to="/admin/pedidos" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 transition-colors">
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{order.customer}</p>
                  <p className="text-gray-500 text-xs">{order.id} Â· {order.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-bold">{formatShort(order.total)}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Categories chart */}
          <div className="glass rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Productos por categorÃ­a</h3>
            <div className="space-y-3">
              {topCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 truncate">{cat}</span>
                    <span className="text-gray-300 font-semibold shrink-0 ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-brand rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock alert */}
          {lowStock.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h3 className="text-yellow-400 font-bold text-sm">Stock bajo ({lowStock.length})</h3>
              </div>
              <div className="space-y-2">
                {lowStock.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <p className="text-gray-300 text-xs truncate flex-1">{p.name}</p>
                    <span className="text-yellow-400 text-xs font-bold ml-2 shrink-0">{p.stock} uds</span>
                  </div>
                ))}
              </div>
              <Link to="/admin/productos" className="block mt-3 text-xs text-sky-400 hover:text-sky-300 transition-colors">
                Gestionar stock â†’
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top products table */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Productos mÃ¡s valorados</h3>
          <Link to="/admin/productos" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4">Producto</th>
                <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4 hidden sm:table-cell">CategorÃ­a</th>
                <th className="text-right text-gray-500 text-xs font-semibold pb-3 pr-4">Precio</th>
                <th className="text-right text-gray-500 text-xs font-semibold pb-3 pr-4">Stock</th>
                <th className="text-right text-gray-500 text-xs font-semibold pb-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[...products].sort((a, b) => b.rating - a.rating).slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-white/3 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      <span className="text-white text-xs font-medium truncate max-w-[140px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell"><span className="text-gray-400 text-xs">{p.category}</span></td>
                  <td className="py-3 pr-4 text-right"><span className="text-white text-xs font-bold">{formatShort(p.price)}</span></td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`text-xs font-semibold ${p.stock <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>{p.stock}</span>
                  </td>
                  <td className="py-3 text-right"><span className="text-yellow-400 text-xs font-bold">â­ {p.rating}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


