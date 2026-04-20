import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import { useAdmin, type Order } from '../../context/AdminContext';

const statusColors: Record<string, string> = {
  Pendiente:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Procesando: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  Enviado:    'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  Entregado:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Cancelado:  'bg-red-500/15 text-red-400 border-red-500/20',
};

const allStatuses: Order['status'][] = ['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado'];

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'Todos' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered
    .filter(o => o.status !== 'Cancelado')
    .reduce((s, o) => s + o.total, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white">Pedidos</h2>
        <p className="text-gray-500 text-sm">{orders.length} pedidos en total</p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        {['Todos', ...allStatuses].map(s => {
          const count = s === 'Todos' ? orders.length : orders.filter(o => o.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                filterStatus === s
                  ? 'gradient-brand text-white border-transparent shadow-lg shadow-sky-500/20'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              {s} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search + revenue */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente o ID..."
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-sky-500/60"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-mono font-semibold">{order.id}</p>
                    <p className="text-gray-600 text-[10px]">{order.items} item{order.items !== 1 ? 's' : ''}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white text-xs font-semibold">{order.customer}</p>
                    <p className="text-gray-500 text-[10px]">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-xs">{order.city}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-400 text-xs">{order.date}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white text-xs font-bold">${order.total.toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Status dropdown */}
                    <div className="relative flex justify-center">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${statusColors[order.status]}`}
                      >
                        {order.status}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {openDropdown === order.id && (
                        <div className="absolute top-full mt-1 right-0 z-20 glass-strong rounded-xl shadow-xl border border-white/10 py-1 min-w-[130px]">
                          {allStatuses.map(s => (
                            <button
                              key={s}
                              onClick={() => { updateOrderStatus(order.id, s); setOpenDropdown(null); }}
                              className={`w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-white/5 transition-colors ${
                                order.status === s ? 'text-sky-400' : 'text-gray-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500 text-sm">No se encontraron pedidos.</div>
          )}
        </div>
      </div>
    </div>
  );
}
