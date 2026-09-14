import { useState } from 'react';
import {
  Users, Eye, TrendingUp, Clock, Trash2, Wifi, BarChart2,
  Globe, ArrowUpRight, ArrowDownRight, Minus, Monitor,
  Smartphone, Tablet, RefreshCw, CheckCircle2, Radio,
} from 'lucide-react';
import { useAnalytics } from '../../context/AnalyticsContext';
import { useAdmin } from '../../context/AdminContext';
import { parseFlexibleDate } from '../../utils/dateUtils';

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
    activeNow,
    activeVisitors,
    visitsToday,
    visitsYesterday,
    visitsThisWeek,
    visitsPrevWeek,
    visitsTotal,
    topPages,
    visitsByHour,
    recentVisits,
    devices,
    isLiveConnected,
    lastLiveUpdate,
    data,
    setGaId,
    clearData,
    refreshLive,
  } = useAnalytics();

  const { settings, saveSettings, orders, products } = useAdmin();

  const [gaInput, setGaInput] = useState(settings.gaId ?? '');
  const [gaSaved, setGaSaved] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshLive();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleSaveGa = () => {
    setGaId(gaInput.trim());
    saveSettings({ ...settings, gaId: gaInput.trim() } as any);
    setGaSaved(true);
    setTimeout(() => setGaSaved(false), 2000);
  };

  const maxHour = Math.max(...visitsByHour, 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const peakHour = hours.reduce((best, h) => (visitsByHour[h] > visitsByHour[best] ? h : best), 0);

  // Comparativas reales: semana actual vs semana anterior (basadas en fechas reales)
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(weekStart.getDate() - 7);

  const ordersThisWeek = orders.filter((o) => {
    const d = parseFlexibleDate(o.date);
    return d >= weekStart && d <= now;
  });

  const ordersPrevWeek = orders.filter((o) => {
    const d = parseFlexibleDate(o.date);
    return d >= prevWeekStart && d < weekStart;
  });

  const revenueThis = ordersThisWeek
    .filter((o) => o.status !== 'Cancelado')
    .reduce((s, o) => s + o.total, 0);

  const revenuePrev = ordersPrevWeek
    .filter((o) => o.status !== 'Cancelado')
    .reduce((s, o) => s + o.total, 0);

  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outStockCount = products.filter((p) => p.stock === 0).length;

  const totalDeviceCount = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;
  const desktopPct = Math.round(((devices.desktop || 0) / totalDeviceCount) * 100);
  const mobilePct = Math.round(((devices.mobile || 0) / totalDeviceCount) * 100);
  const tabletPct = Math.max(0, 100 - desktopPct - mobilePct);

  const comparativas = [
    {
      label: 'Visitas esta semana',
      current: visitsThisWeek,
      prev: visitsPrevWeek,
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
      prev: visitsYesterday,
      unit: 'visitas',
    },
  ];

  const stats = [
    {
      label: 'Activos ahora mismo',
      value: activeNow,
      sublabel: 'Sesiones activas en la tienda',
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      live: true,
    },
    {
      label: 'Visitas hoy',
      value: visitsToday,
      sublabel: `Ayer: ${visitsYesterday} visitas`,
      icon: Eye,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-white/10',
    },
    {
      label: 'Esta semana',
      value: visitsThisWeek,
      sublabel: `Semana anterior: ${visitsPrevWeek}`,
      icon: TrendingUp,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-white/10',
    },
    {
      label: 'Total histórico',
      value: visitsTotal,
      sublabel: `${topPages.length} páginas exploradas`,
      icon: BarChart2,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-white/10',
    },
  ];

  const getDeviceIcon = (device?: string) => {
    if (device === 'mobile') return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
    if (device === 'tablet') return <Tablet className="w-3.5 h-3.5 text-indigo-400" />;
    return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header with real-time status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Analytics</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <PulsingDot /> Tiempo real 100%
            </span>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            {isLiveConnected
              ? 'Conexión en vivo con el servidor — actualizando cada 2.5s'
              : 'Sincronización local activa con BroadcastChannel multi-pestaña'}
            {lastLiveUpdate && (
              <span className="text-gray-500 text-xs">
                (Último pulso: {lastLiveUpdate.toLocaleTimeString('es')})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 glass rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Refrescar métricas ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={clearData}
            className="flex items-center gap-1.5 px-3.5 py-2 glass rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpiar datos
          </button>
        </div>
      </div>

      {/* Main 4 Live KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, sublabel, icon: Icon, color, bg, border, live }) => (
          <div key={label} className={`glass rounded-2xl p-4 sm:p-5 border ${border} relative overflow-hidden`}>
            {live && (
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.4) 0%, transparent 60%)',
                }}
              />
            )}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              {live && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <PulsingDot /> EN VIVO
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{value}</p>
            <p className="text-gray-300 text-xs font-semibold mt-0.5">{label}</p>
            <p className="text-gray-500 text-[11px] mt-1 truncate">{sublabel}</p>
          </div>
        ))}
      </div>

      {/* Live Active Visitors Stream */}
      <div className="glass rounded-2xl p-5 border border-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PulsingDot />
            <h3 className="text-white font-bold text-sm sm:text-base">
              Visitantes navegando en este instante
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
              {activeVisitors.length} activos
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline-block">
            Ventana de actividad: últimos 60 segundos
          </span>
        </div>

        {activeVisitors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeVisitors.map((visitor, idx) => (
              <div
                key={visitor.sessionId + idx}
                className="bg-white/[0.03] border border-white/8 rounded-xl p-3 flex items-center gap-3 hover:border-emerald-500/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 border border-white/10">
                  {getDeviceIcon(visitor.device)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-bold truncate">{visitor.label}</p>
                  <p className="text-gray-500 text-[11px] font-mono truncate">{visitor.path}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    {visitor.secondsAgo === 0 ? 'Ahora' : `Hace ${visitor.secondsAgo}s`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 text-xs">
            Sin sesiones activas en los últimos 60 segundos.
          </div>
        )}
      </div>

      {/* Comparativa semana actual vs anterior (Datos Reales) */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 text-violet-400" /> Comparativa de Rendimiento Real
          </h3>
          <span className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/8">
            Sin datos simulados
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {comparativas.map(({ label, current, prev, unit, isMoney }) => {
            const diff =
              prev === 0
                ? current > 0
                  ? 100
                  : 0
                : Math.round(((current - prev) / Math.max(prev, 1)) * 100);
            const up = diff > 0;
            const neutral = diff === 0;
            return (
              <div key={label} className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-1.5 font-medium">{label}</p>
                <p className="text-white text-xl sm:text-2xl font-black mb-1">
                  {isMoney ? `S/ ${current.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : current}
                </p>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    neutral ? 'text-gray-400' : up ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {neutral ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : up ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {neutral ? 'Sin variación' : `${up ? '+' : ''}${diff}%`}
                  <span className="text-gray-500 font-normal ml-0.5">vs período ant.</span>
                </div>
                <p className="text-gray-500 text-[10px] mt-1.5">
                  Anterior: {isMoney ? `S/ ${prev.toFixed(2)}` : prev} {unit}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dispositivos + Inventario Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Device Breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Monitor className="w-4 h-4 text-sky-400" /> Dispositivos de Visitantes
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" /> Computadoras (Desktop)
                </span>
                <span className="text-white font-bold">{desktopPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${desktopPct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Celulares (Móvil)
                </span>
                <span className="text-white font-bold">{mobilePct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${mobilePct}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-indigo-400" /> Tablets
                </span>
                <span className="text-white font-bold">{tabletPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${tabletPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Inventory Stock */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Estado de Inventario en Tiempo Real
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4">
              <p className="text-gray-400 text-xs mb-1">Total catálogo activo</p>
              <p className="text-white text-2xl font-black">{products.length}</p>
              <p className="text-gray-500 text-[10px] mt-1">Modelos listados</p>
            </div>
            <div className={`bg-white/[0.03] border rounded-xl p-4 ${lowStockCount > 0 ? 'border-yellow-500/30' : 'border-white/8'}`}>
              <p className="text-gray-400 text-xs mb-1">Stock bajo (≤5 unid.)</p>
              <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-yellow-400' : 'text-white'}`}>
                {lowStockCount}
              </p>
              <p className="text-gray-500 text-[10px] mt-1">Requieren reposición</p>
            </div>
            <div className={`bg-white/[0.03] border rounded-xl p-4 ${outStockCount > 0 ? 'border-red-500/30' : 'border-white/8'}`}>
              <p className="text-gray-400 text-xs mb-1">Agotados</p>
              <p className={`text-2xl font-black ${outStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
                {outStockCount}
              </p>
              <p className="text-gray-500 text-[10px] mt-1">Sin unidades disponibles</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Hourly chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
              <BarChart2 className="w-4 h-4 text-violet-400" /> Distribución de Visitas (Últimas 24h)
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
              Pico: {peakHour}:00h ({visitsByHour[peakHour] ?? 0})
            </span>
          </div>
          <p className="text-gray-400 text-xs mb-5">
            Total en 24 horas: {visitsByHour.reduce((a, b) => a + b, 0)} visitas
          </p>
          <div className="flex items-end gap-1 h-32 pt-4">
            {hours.map((h) => (
              <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t transition-all duration-500 relative ${
                    h === peakHour ? 'bg-sky-400 shadow-lg shadow-sky-500/40' : 'gradient-brand hover:opacity-80'
                  }`}
                  style={{ height: `${Math.max(4, (visitsByHour[h] / maxHour) * 100)}%` }}
                >
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 border border-white/20 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    {h}:00h · {visitsByHour[h]}
                  </div>
                </div>
                <span className="text-[8px] text-gray-500 font-mono">{h}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top pages */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
            <Eye className="w-4 h-4 text-violet-400" /> Páginas Más Exploradas
          </h3>
          {topPages.length > 0 ? (
            <div className="space-y-3">
              {topPages.map(({ path, label, count }, i) => {
                const pct = Math.round((count / (topPages[0]?.count || 1)) * 100);
                return (
                  <div key={path}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-200 truncate flex items-center gap-1.5">
                        <span className="text-gray-500 font-mono w-4 shrink-0 font-bold">{i + 1}</span>
                        {label}
                      </span>
                      <span className="text-white font-bold shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-brand rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Eye className="w-8 h-8 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-xs">Aún no hay visitas registradas.</p>
              <p className="text-gray-600 text-xs mt-1">Navega por la tienda para ver datos en vivo.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Visits Live Feed */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2 text-sm sm:text-base">
            <Clock className="w-4 h-4 text-violet-400" /> Flujo de Visitas Recientes en Vivo
            <span className="text-xs text-gray-500 font-normal ml-1">
              (Últimas {recentVisits.length} entradas)
            </span>
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <PulsingDot /> Registro en tiempo real
          </span>
        </div>

        {recentVisits.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/8">
                <tr>
                  <th className="text-left text-gray-400 text-xs font-semibold pb-3 pr-4">Página</th>
                  <th className="text-left text-gray-400 text-xs font-semibold pb-3 pr-4 hidden sm:table-cell">Ruta</th>
                  <th className="text-center text-gray-400 text-xs font-semibold pb-3 pr-4">Dispositivo</th>
                  <th className="text-left text-gray-400 text-xs font-semibold pb-3 pr-4 hidden md:table-cell">ID Sesión</th>
                  <th className="text-right text-gray-400 text-xs font-semibold pb-3">Hora exacta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.04] transition-colors">
                    <td className="py-2.5 pr-4">
                      <span className="text-white text-xs font-semibold">{v.label}</span>
                    </td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">
                      <span className="text-gray-400 text-xs font-mono">{v.path}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-center">
                      <span className="inline-flex items-center justify-center p-1 rounded-md bg-white/5">
                        {getDeviceIcon(v.device)}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 hidden md:table-cell">
                      <span className="text-gray-500 text-xs font-mono">{v.sessionId.slice(0, 14)}...</span>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="text-gray-300 text-xs font-mono">
                        {new Date(v.timestamp).toLocaleTimeString('es', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
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
            <p className="text-gray-500 text-xs">Esperando tráfico en la tienda.</p>
          </div>
        )}
      </div>

      {/* Google Analytics Setup */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-white font-bold mb-1 flex items-center gap-2 text-sm sm:text-base">
          <Globe className="w-4 h-4 text-violet-400" /> Integración Externa con Google Analytics 4 (Opcional)
        </h3>
        <p className="text-gray-400 text-xs mb-4">
          Si deseas consolidar analítica cross-domain con Google, ingresa tu ID de medición (G-XXXXXXXXXX).
        </p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Wifi className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={gaInput}
              onChange={(e) => setGaInput(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-200 text-sm font-mono focus:outline-none focus:border-violet-500/60"
            />
          </div>
          <button
            onClick={handleSaveGa}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all active:scale-95 ${
              gaSaved ? 'bg-emerald-500' : 'gradient-brand hover:opacity-90'
            }`}
          >
            {gaSaved ? '✓ Guardado' : 'Guardar'}
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
