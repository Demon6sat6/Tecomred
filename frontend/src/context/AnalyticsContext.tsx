import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface PageVisit {
  id: string;
  path: string;
  label: string;
  timestamp: number; // ms
  sessionId: string;
}

export interface AnalyticsData {
  visits: PageVisit[];
  activeSessions: Record<string, number>; // sessionId -> lastSeen timestamp
  gaId: string; // Google Analytics ID
}

interface AnalyticsContextType {
  data: AnalyticsData;
  activeNow: number;
  visitsToday: number;
  visitsThisWeek: number;
  visitsTotal: number;
  topPages: { path: string; label: string; count: number }[];
  visitsByHour: number[];   // 24 slots
  recentVisits: PageVisit[];
  setGaId: (id: string) => void;
  clearData: () => void;
}

const SESSION_KEY = 'tr_session_id';
const HEARTBEAT_MS = 15_000; // 15s
const SESSION_TIMEOUT_MS = 60_000; // 1 min inactive = offline

const PAGE_LABELS: Record<string, string> = {
  '/':            'Inicio',
  '/productos':   'Catálogo',
  '/carrito':     'Carrito',
  '/checkout':    'Checkout',
  '/contacto':    'Contacto',
  '/admin':       'Admin Login',
  '/admin/dashboard':  'Admin Dashboard',
  '/admin/productos':  'Admin Productos',
  '/admin/pedidos':    'Admin Pedidos',
  '/admin/clientes':   'Admin Clientes',
  '/admin/resenas':    'Admin Reseñas',
  '/admin/cupones':    'Admin Cupones',
  '/admin/ajustes':    'Admin Ajustes',
};

function getLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/producto/')) return 'Detalle de producto';
  if (path.startsWith('/admin/')) return 'Admin';
  return path;
}

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const emptyData: AnalyticsData = { visits: [], activeSessions: {}, gaId: '' };

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [data, setData] = useLocalStorage<AnalyticsData>('tr_analytics', emptyData);
  const sessionId = useRef(getSessionId());
  const channel = useRef<BroadcastChannel | null>(null);

  // BroadcastChannel so multiple tabs share active sessions
  useEffect(() => {
    try {
      channel.current = new BroadcastChannel('tr_analytics');
      channel.current.onmessage = (e) => {
        if (e.data?.type === 'heartbeat') {
          setData(prev => ({
            ...prev,
            activeSessions: { ...prev.activeSessions, [e.data.sessionId]: Date.now() },
          }));
        }
      };
    } catch {
      // BroadcastChannel not supported
    }
    return () => channel.current?.close();
  }, []);

  // Heartbeat — mark this session as active every 15s
  useEffect(() => {
    const beat = () => {
      setData(prev => ({
        ...prev,
        activeSessions: { ...prev.activeSessions, [sessionId.current]: Date.now() },
      }));
      channel.current?.postMessage({ type: 'heartbeat', sessionId: sessionId.current });
    };
    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);
    return () => clearInterval(interval);
  }, []);

  // Track page views
  useEffect(() => {
    const path = location.pathname;
    // Skip admin pages from public analytics
    if (path.startsWith('/admin')) return;

    const visit: PageVisit = {
      id: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      path,
      label: getLabel(path),
      timestamp: Date.now(),
      sessionId: sessionId.current,
    };

    setData(prev => ({
      ...prev,
      visits: [visit, ...prev.visits].slice(0, 2000), // keep last 2000
    }));

    // Google Analytics pageview
    if (data.gaId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', data.gaId, { page_path: path });
    }
  }, [location.pathname]);

  // Derived stats
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 7); weekStart.setHours(0, 0, 0, 0);

  const activeNow = Object.values(data.activeSessions)
    .filter(ts => now - ts < SESSION_TIMEOUT_MS).length;

  const visitsToday    = data.visits.filter(v => v.timestamp >= todayStart.getTime()).length;
  const visitsThisWeek = data.visits.filter(v => v.timestamp >= weekStart.getTime()).length;
  const visitsTotal    = data.visits.length;

  // Top pages
  const pageCounts: Record<string, { label: string; count: number }> = {};
  data.visits.forEach(v => {
    if (!pageCounts[v.path]) pageCounts[v.path] = { label: v.label, count: 0 };
    pageCounts[v.path].count++;
  });
  const topPages = Object.entries(pageCounts)
    .map(([path, { label, count }]) => ({ path, label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Visits by hour (last 24h)
  const visitsByHour = Array(24).fill(0);
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  data.visits
    .filter(v => v.timestamp >= oneDayAgo)
    .forEach(v => {
      const hour = new Date(v.timestamp).getHours();
      visitsByHour[hour]++;
    });

  const recentVisits = data.visits.slice(0, 20);

  const setGaId = (id: string) => setData(prev => ({ ...prev, gaId: id }));
  const clearData = () => setData(emptyData);

  return (
    <AnalyticsContext.Provider value={{
      data, activeNow, visitsToday, visitsThisWeek, visitsTotal,
      topPages, visitsByHour, recentVisits, setGaId, clearData,
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}
