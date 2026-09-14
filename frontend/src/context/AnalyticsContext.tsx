import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface PageVisit {
  id: string;
  path: string;
  label: string;
  timestamp: number; // ms
  sessionId: string;
  device?: 'desktop' | 'mobile' | 'tablet';
}

export interface ActiveVisitorInfo {
  sessionId: string;
  path: string;
  label: string;
  device: 'desktop' | 'mobile' | 'tablet';
  secondsAgo: number;
}

export interface AnalyticsData {
  visits: PageVisit[];
  activeSessions: Record<string, number>; // sessionId -> lastSeen timestamp
  gaId: string; // Google Analytics ID
}

export interface LiveAnalyticsSnapshot {
  activeNow: number;
  activeVisitors: ActiveVisitorInfo[];
  visitsToday: number;
  visitsYesterday: number;
  visitsThisWeek: number;
  visitsPrevWeek: number;
  visitsTotal: number;
  topPages: { path: string; label: string; count: number }[];
  visitsByHour: number[]; // 24 slots
  recentVisits: PageVisit[];
  devices: { desktop: number; mobile: number; tablet: number };
  serverTime?: number;
}

interface AnalyticsContextType {
  data: AnalyticsData;
  activeNow: number;
  activeVisitors: ActiveVisitorInfo[];
  visitsToday: number;
  visitsYesterday: number;
  visitsThisWeek: number;
  visitsPrevWeek: number;
  visitsTotal: number;
  topPages: { path: string; label: string; count: number }[];
  visitsByHour: number[]; // 24 slots
  recentVisits: PageVisit[];
  devices: { desktop: number; mobile: number; tablet: number };
  isLiveConnected: boolean;
  lastLiveUpdate: Date | null;
  setGaId: (id: string) => void;
  clearData: () => Promise<void>;
  refreshLive: () => Promise<void>;
}

const SESSION_KEY = 'tr_session_id';
const HEARTBEAT_MS = 10_000; // 10s
const LIVE_POLL_MS = 2_500; // 2.5s for admin real-time
const SESSION_TIMEOUT_MS = 60_000; // 1 min inactive = offline

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)
  ?? (import.meta.env.DEV ? '/api' : '/api');

const PAGE_LABELS: Record<string, string> = {
  '/':            'Inicio',
  '/productos':   'Catálogo',
  '/carrito':     'Carrito',
  '/checkout':    'Checkout',
  '/contacto':    'Contacto',
  '/nosotros':    'Nosotros',
  '/proyectos':   'Proyectos',
  '/ubicacion':   'Ubicación',
  '/cuenta':      'Mi Cuenta',
  '/terminos':    'Términos',
  '/privacidad':  'Privacidad',
  '/admin':       'Admin Login',
  '/admin/dashboard':  'Admin Dashboard',
  '/admin/analytics':  'Admin Analytics',
  '/admin/productos':  'Admin Productos',
  '/admin/pedidos':    'Admin Pedidos',
  '/admin/clientes':   'Admin Clientes',
  '/admin/resenas':    'Admin Reseñas',
  '/admin/cupones':    'Admin Cupones',
  '/admin/ajustes':    'Admin Ajustes',
};

function getLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/producto/')) return 'Detalle de Producto';
  if (path.startsWith('/admin/')) return 'Panel Admin';
  return path;
}

function detectDevice(): 'desktop' | 'mobile' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android|ipod|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getSessionId(): string {
  if (typeof window === 'undefined') return 's_initial';
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
  const [serverLive, setServerLive] = useState<LiveAnalyticsSnapshot | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date | null>(null);

  const sessionId = useRef(getSessionId());
  const channel = useRef<BroadcastChannel | null>(null);
  const deviceType = useRef(detectDevice());

  // BroadcastChannel so multiple tabs share active sessions locally
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
      // BroadcastChannel not supported in this environment
    }
    return () => channel.current?.close();
  }, []);

  // Dynamically inject Google Analytics script if gaId is set
  useEffect(() => {
    if (!data.gaId) return;
    const scriptId = 'ga-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${data.gaId}`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) { (window as any).dataLayer.push(args); }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', data.gaId, { send_page_view: false });
    };
  }, [data.gaId]);

  // 1. Send Heartbeat every 10s to keep session alive in backend & local
  useEffect(() => {
    const beat = () => {
      const now = Date.now();
      setData(prev => ({
        ...prev,
        activeSessions: { ...prev.activeSessions, [sessionId.current]: now },
      }));
      channel.current?.postMessage({ type: 'heartbeat', sessionId: sessionId.current });

      // Send to backend
      fetch(`${API_BASE}/analytics/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId.current,
          path: location.pathname,
          label: getLabel(location.pathname),
          device: deviceType.current,
        }),
      }).catch(() => {});
    };

    beat();
    const interval = setInterval(beat, HEARTBEAT_MS);

    // Leave on unload
    const onLeave = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${API_BASE}/analytics/leave`,
          new Blob([JSON.stringify({ sessionId: sessionId.current })], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', onLeave);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onLeave);
    };
  }, [location.pathname]);

  // 2. Track page views immediately on route change
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/admin')) return;

    const now = Date.now();
    const cleanLabel = getLabel(path);
    const visit: PageVisit = {
      id: `v_${now}_${Math.random().toString(36).slice(2, 6)}`,
      path,
      label: cleanLabel,
      timestamp: now,
      sessionId: sessionId.current,
      device: deviceType.current,
    };

    setData(prev => ({
      ...prev,
      visits: [visit, ...prev.visits].slice(0, 2000),
    }));

    // Post to backend centralized real-time engine
    fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        label: cleanLabel,
        sessionId: sessionId.current,
        device: deviceType.current,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      }),
    }).catch(() => {});

    // Google Analytics pageview
    if (data.gaId && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', data.gaId, { page_path: path });
    }
  }, [location.pathname]);

  // 3. Real-Time live fetch function (Used by admin pages)
  const fetchLive = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/live`, { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const live = (await res.json()) as LiveAnalyticsSnapshot;
      setServerLive(live);
      setIsLiveConnected(true);
      setLastLiveUpdate(new Date());
    } catch {
      setIsLiveConnected(false);
    }
  };

  // Poll real-time live data when in admin panel
  useEffect(() => {
    const isAdmin = location.pathname.startsWith('/admin');
    if (!isAdmin) return;

    void fetchLive();
    const interval = setInterval(fetchLive, LIVE_POLL_MS);
    return () => clearInterval(interval);
  }, [location.pathname]);

  // Derived local stats (Fallback if backend unreachable or offline)
  const now = Date.now();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7);
  const prevWeekStart = new Date(weekStart); prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  const localActiveNow = Object.values(data.activeSessions).filter(
    ts => now - ts < SESSION_TIMEOUT_MS
  ).length;

  const localVisitsToday = data.visits.filter(v => v.timestamp >= todayStart.getTime()).length;
  const localVisitsYesterday = data.visits.filter(
    v => v.timestamp >= yesterdayStart.getTime() && v.timestamp < todayStart.getTime()
  ).length;
  const localVisitsThisWeek = data.visits.filter(v => v.timestamp >= weekStart.getTime()).length;
  const localVisitsPrevWeek = data.visits.filter(
    v => v.timestamp >= prevWeekStart.getTime() && v.timestamp < weekStart.getTime()
  ).length;
  const localVisitsTotal = data.visits.length;

  // Local top pages
  const pageCounts: Record<string, { label: string; count: number }> = {};
  data.visits.forEach(v => {
    if (!pageCounts[v.path]) pageCounts[v.path] = { label: v.label, count: 0 };
    pageCounts[v.path].count++;
  });
  const localTopPages = Object.entries(pageCounts)
    .map(([path, { label, count }]) => ({ path, label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Local visits by hour
  const localVisitsByHour = Array(24).fill(0);
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  data.visits
    .filter(v => v.timestamp >= oneDayAgo)
    .forEach(v => {
      const h = new Date(v.timestamp).getHours();
      localVisitsByHour[h]++;
    });

  // Local devices
  const localDevices = { desktop: 0, mobile: 0, tablet: 0 };
  data.visits.forEach(v => {
    const dev = v.device || 'desktop';
    if (dev in localDevices) localDevices[dev]++;
    else localDevices.desktop++;
  });

  // Decide source of truth: Server live data if available, else local
  const activeNow = serverLive?.activeNow !== undefined && serverLive.activeNow > 0
    ? serverLive.activeNow
    : Math.max(localActiveNow, 1);

  const activeVisitors = serverLive?.activeVisitors ?? [
    {
      sessionId: sessionId.current,
      path: location.pathname,
      label: getLabel(location.pathname),
      device: deviceType.current,
      secondsAgo: 0,
    },
  ];

  const visitsToday = (serverLive?.visitsToday && serverLive.visitsToday > 0)
    ? serverLive.visitsToday
    : localVisitsToday;

  const visitsYesterday = serverLive?.visitsYesterday ?? localVisitsYesterday;

  const visitsThisWeek = (serverLive?.visitsThisWeek && serverLive.visitsThisWeek > 0)
    ? serverLive.visitsThisWeek
    : localVisitsThisWeek;

  const visitsPrevWeek = serverLive?.visitsPrevWeek ?? localVisitsPrevWeek;

  const visitsTotal = (serverLive?.visitsTotal && serverLive.visitsTotal > 0)
    ? serverLive.visitsTotal
    : localVisitsTotal;

  const topPages = (serverLive?.topPages && serverLive.topPages.length > 0)
    ? serverLive.topPages
    : localTopPages;

  const visitsByHour = serverLive?.visitsByHour ?? localVisitsByHour;
  const recentVisits = (serverLive?.recentVisits && serverLive.recentVisits.length > 0)
    ? serverLive.recentVisits
    : data.visits.slice(0, 25);

  const devices = serverLive?.devices ?? localDevices;

  const setGaId = (id: string) => setData(prev => ({ ...prev, gaId: id }));

  const clearData = async () => {
    setData(emptyData);
    setServerLive(null);
    try {
      await fetch(`${API_BASE}/analytics`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <AnalyticsContext.Provider
      value={{
        data,
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
        setGaId,
        clearData,
        refreshLive: fetchLive,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider');
  return ctx;
}

