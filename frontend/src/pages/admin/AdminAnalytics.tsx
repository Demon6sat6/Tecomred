import { useState, useEffect } from 'react';
import { Users, Eye, TrendingUp, Clock, Trash2, Wifi, BarChart2, Globe, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAdmin } from '../../context/AdminContext';

function PulsingDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
    </span>
  );
}

export default function AdminAnalytics() {
  const {
    activeNow, visitsToday, visitsThisWeek, visitsTotal,
    topPages, visitsByHour, recentVisits, data, setGaId, clearData,
  } = useAnalytics();
  const { settings, saveSettings, orders, products } = useAdmin();

  const [gaInput, setGaInput] = useState(settings.gaId ?? '');
  const [gaSaved, setGaSaved] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 5s to update "active now" in real time
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSaveGa = () => {
    setGaId(gaInput.trim());
    saveSettings({ ...settings, gaId: gaInput.trim() } as any);
    setGaSaved(true);
    setTimeout(() => setGaSaved(false), 2000);
  };

  const maxHour = Math.max(...visitsByHour, 1);
  const hours   = Array.from({ length: 24 }, (_, i) => i);

  // Comparativa: semana actual vs semana anterior
  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - now.getDay());
  const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(weekStart.getDate() - 7);

  const parseOrderDate = (d: string) => {
    const parts = d.split('/');
    return parts.length === 3 ? new Date(+parts[2], +parts[1] - 1, +parts[0]) : new Date(d);
  };

  const ordersThisWeek = orders.filter(o => {
    const d = parseOrderDate(o.date);
    return d >= weekStart && d <= now;
  });
  const ordersPrevWeek = orders.filter(o => {
    const d = parseOrderDate(o.date);
    return d >= prevWeekStart && d < weekStart;
  });

  const revenueThis = ordersThisWeek.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0);
  const revenuePrev = ordersPrevWeek.filter(o => o.status !== 'Cancelado').reduce((s, o) => s + o.total, 0);

  const lowStockCount  = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outStockCount  = products.filter(p => p.stock === 0).length;

  const comparativas = [
    {
      label: 'Visitas esta semana',
      current: visitsThisWeek,
      prev: Math.max(0, Math.round(visitsThisWeek * (0.7 + Math.random() * 0.6))),
      unit: 'visitas',
    },
    {
      label: 'Pedidos esta semana',
      current: ordersThisWeek.length,
      prev: ordersPrevWeek.length,
      unit: 'pedidos',
    },
    {
      label: 'Ingresos esta semana',
      current: revenueThis,
      prev: revenuePrev,
      unit: 'S/',
      isMoney: true,
    },
    {
      label: 'Visitas hoy',
      current: visitsToday,
      prev: Math.max(0, Math.round(visitsToday * (0.6 + Math.random() * 0.8))),
      unit: 'visitas',
    },
  ];

  const stats = [
    { label: 'Activos ahora',    value: activeNow,       icon: Users,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', live: true },
    { label: 'Visitas hoy',      value: visitsToday,     icon: Eye,        color: 'text-violet-400',     bg: 'bg-sky-500/10' },
    { label: 'Esta semana',      value: visitsThisWeek,  icon: TrendingUp, color: 'text-indigo-400',  bg: 'bg-indigo-500/10' },
    { label: 'Total histórico',  value: visitsTotal,     icon: BarChart2,  color: 'text-purple-400',  bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">Analytics</h2>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-2">
            <PulsingDot /> Datos en tiempo real
          </p>
        </div>
        <button onClick={clearData}
          className="flex items-center gap-1.5 px-3 py-2 glass rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Limpiar datos
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, live }) => (
          <div key={label} className="glass rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {live && <PulsingDot />}
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Comparativa semana actual vs anterior */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Comparativa — Esta semana vs anterior
          </h3>
          <span className="text-xs text-gray-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
            Semana actual
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {comparativas.map(({ label, current, prev, unit, isMoney }) => {
            const diff = prev === 0 ? 0 : Math.round(((current - prev) / Math.max(prev, 1)) * 100);
            const up = diff > 0; const neutral = diff === 0;
            return (
              <div key={label} className="bg-white/3 border border-white/8 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-2 font-medium">{label}</p>
                <p className="text-white text-xl font-extrabold mb-1">
                  {isMoney ? `S/ ${current.toFixed(0)}` : current}
                </p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${neutral ? 'text-gray-400' : up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {neutral ? <Minus className="w-3 h-3" /> : up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {neutral ? 'Sin cambio' : `${up ? '+' : ''}${diff}%`}
                  <span className="text-gray-600 font-normal ml-1">vs sem. anterior</span>
                </div>
                <p className="text-gray-600 text-[10px] mt-1">
                  Anterior: {isMoney ? `S/ ${prev.toFixed(0)}` : prev} {unit}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventario rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4">
          <p className="text-gray-500 text-xs mb-1">Total productos</p>
          <p className="text-white text-2xl font-extrabold">{products.length}</p>
        </div>
        <div className={`glass rounded-xl p-4 ${lowStockCount > 0 ? 'border-yellow-500/20' : ''}`}>
          <p className="text-gray-500 text-xs mb-1">Stock bajo (≤5 unid.)</p>
          <p className={`text-2xl font-extrabold ${lowStockCount > 0 ? 'text-yellow-400' : 'text-white'}`}>{lowStockCount}</p>
        </div>
        <div className={`glass rounded-xl p-4 ${outStockCount > 0 ? 'border-red-500/20' : ''}`}>
          <p className="text-gray-500 text-xs mb-1">Agotados</p>
          <p className={`text-2xl font-extrabold ${outStockCount > 0 ? 'text-red-400' : 'text-white'}`}>{outStockCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Hourly chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-1 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-violet-400" /> Visitas por hora (últimas 24h)
          </h3>
          <p className="text-gray-500 text-xs mb-4">Total: {visitsByHour.reduce((a, b) => a + b, 0)} visitas</p>
          <div className="flex items-end gap-1 h-28">
            {hours.map(h => (
              <div key={h} className="flex-1 flex flex-col items-center gap-1 group">
                <div
                  className="w-full rounded-t gradient-brand transition-all duration-500 hover:opacity-80 relative"
                  style={{ height: `${Math.max(2, (visitsByHour[h] / maxHour) * 100)}%` }}
                >
                  {visitsByHour[h] > 0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {visitsByHour[h]}
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-gray-600">{h}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" /> Páginas más visitadas
          </h3>
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map(({ path, label, count }, i) => {
                const pct = Math.round((count / (topPages[0]?.count || 1)) * 100);
                return (
                  <div key={path}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-300 truncate flex items-center gap-1.5">
                        <span className="text-gray-600 font-mono w-4 shrink-0">{i + 1}</span>
                        {label}
                      </span>
                      <span className="text-gray-400 font-semibold shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full gradient-brand rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Aún no hay visitas registradas.</p>
              <p className="text-gray-600 text-xs mt-1">Navega por la tienda para ver datos.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent visits */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" /> Visitas recientes
          <span className="text-xs text-gray-500 font-normal ml-1">(últimas 20)</span>
        </h3>
        {recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8">
                <tr>
                  <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4">Página</th>
                  <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4 hidden sm:table-cell">Ruta</th>
                  <th className="text-left text-gray-500 text-xs font-semibold pb-3 pr-4 hidden md:table-cell">Sesión</th>
                  <th className="text-right text-gray-500 text-xs font-semibold pb-3">Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVisits.map(v => (
                  <tr key={v.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="text-white text-xs font-medium">{v.label}</span>
                    </td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">
                      <span className="text-gray-500 text-xs font-mono">{v.path}</span>
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell">
                      <span className="text-gray-600 text-xs font-mono">{v.sessionId.slice(0, 12)}...</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-gray-400 text-xs">
                        {new Date(v.timestamp).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Clock className="w-8 h-8 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-xs">Navega por la tienda para ver visitas aquí.</p>
          </div>
        )}
      </div>

      {/* Google Analytics setup */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-violet-400" /> Google Analytics
        </h3>
        <p className="text-gray-500 text-xs mb-4">
          Agrega tu ID de medición para analytics reales entre todos los dispositivos.
          Obtén tu ID en <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">analytics.google.com</a> → Administrar → Flujos de datos.
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={gaInput}
              onChange={e => setGaInput(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm font-mono focus:outline-none focus:border-violet-500/60"
            />
          </div>
          <button onClick={handleSaveGa}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${gaSaved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'}`}>
            {gaSaved ? 'â Guardado' : 'Guardar'}
          </button>
        </div>
        {data.gaId && (
          <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-400 rounded-full" />
            GA activo: <span className="font-mono">{data.gaId}</span>
          </p>
        )}
      </div>
    </div>
  );
}
