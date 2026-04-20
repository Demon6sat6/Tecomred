import { Link } from 'react-router-dom';
import {
  DollarSign, Package, ShoppingBag, TrendingUp,
  ArrowRight, ArrowUpRight, AlertTriangle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Procesando: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Enviado:    'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  Entregado:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Cancelado:  'bg-red-500/15 text-red-400 border-red-500/20',
};

export default function AdminDashboard() {
  const { products, orders } = useAdmin();

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
  const maxCat = Math.max(...topCategories.map(c => c[1]));

  const stats = [
    { label: 'Ingresos totales', value: `$${totalRevenue.toLocaleString('es', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+12.5%' },
    { label: 'Pedidos',          value: totalOrders,   icon: ShoppingBag, color: 'text-sky-400',     bg: 'bg-sky-500/10',     change: '+8.2%' },
    { label: 'Productos',        value: totalProducts, icon: Package,     color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  change: '+2' },
    { label: 'Stock bajo',       value: lowStock.length, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', change: 'Atención' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-0.5">Resumen general de la tienda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-gray-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                {change}
              </span>
            </div>
            <p className="text-2xl font-extrabold text-white">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
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
                  <p className="text-gray-500 text-xs">{order.id} · {order.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-bold">${order.total.toFixed(2)}</p>
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
            <h3 className="text-white font-bold mb-4">Productos por categoría</h3>
            <div className="space-y-3">
              {topCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 truncate">{cat}</span>
                    <span className="text-gray-300 font-semibold shrink-0 ml-2">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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
            <div className="glass rounded-2xl p-5 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h3 className="text-yellow-400 font-bold text-sm">Stock bajo</h3>
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
                Gestionar stock →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Productos más valorados</h3>
          <Link to="/admin/productos" className="text-sky-400 hover:text-sky-300 text-xs flex items-center gap-1 transition-colors">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4">Producto</th>
                <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4 hidden sm:table-cell">Categoría</th>
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
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <span className="text-gray-400 text-xs">{p.category}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className="text-white text-xs font-bold">${p.price.toFixed(2)}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`text-xs font-semibold ${p.stock <= 5 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <span className="text-yellow-400 text-xs font-bold">⭐ {p.rating}</span>
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
