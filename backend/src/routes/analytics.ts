import { Router, Request, Response } from "express";
import pool from "../config/mysql.js";

export const analyticsRouter = Router();

export interface LiveVisit {
  id: string;
  path: string;
  label: string;
  sessionId: string;
  timestamp: number;
  device: "desktop" | "mobile" | "tablet";
  city?: string;
  referrer?: string;
}

export interface ActiveSession {
  sessionId: string;
  path: string;
  label: string;
  device: "desktop" | "mobile" | "tablet";
  lastSeen: number;
  startedAt: number;
}

// In-Memory Real-Time Store for zero-latency instant updates
const SESSION_TIMEOUT_MS = 60_000; // 60s of inactivity = offline
const activeSessions = new Map<string, ActiveSession>();
const recentVisits: LiveVisit[] = [];

// Clean up stale sessions periodically
setInterval(() => {
  const cutoff = Date.now() - SESSION_TIMEOUT_MS;
  for (const [sid, session] of activeSessions.entries()) {
    if (session.lastSeen < cutoff) {
      activeSessions.delete(sid);
    }
  }
}, 10_000);

// Helper to determine device type from User-Agent
function detectDevice(ua: string): "desktop" | "mobile" | "tablet" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|android|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

const PAGE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/productos": "Catálogo de Productos",
  "/carrito": "Carrito de Compras",
  "/checkout": "Checkout / Pago",
  "/contacto": "Contacto y Asesoría",
  "/nosotros": "Sobre Nosotros",
  "/proyectos": "Proyectos de Red",
  "/ubicacion": "Ubicación de Tienda",
  "/terminos": "Términos y Condiciones",
  "/privacidad": "Política de Privacidad",
  "/cuenta": "Mi Cuenta",
};

function resolveLabel(path: string, providedLabel?: string): string {
  if (providedLabel && providedLabel.trim()) return providedLabel;
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/producto/")) return "Detalle de Producto";
  if (path.startsWith("/admin")) return "Panel de Administración";
  return path;
}

// Optional table initialization if MySQL is present
let tableInitialized = false;
async function ensureDbTable() {
  if (tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_visits (
        id VARCHAR(50) PRIMARY KEY,
        session_id VARCHAR(50) NOT NULL,
        path VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL,
        device VARCHAR(20) NOT NULL,
        timestamp BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    tableInitialized = true;
  } catch {
    // MySQL not reachable - in-memory engine handles everything seamlessly
  }
}

// 1. TRACK VISIT (Called on every page navigation)
analyticsRouter.post("/track", async (req: Request, res: Response) => {
  const { path, label, sessionId, device, referrer, city } = req.body;
  if (!path || !sessionId) {
    return res.status(400).json({ error: "path and sessionId required" });
  }

  // Skip tracking admin internal pages in visitor analytics
  if (typeof path === "string" && path.startsWith("/admin")) {
    return res.json({ success: true, ignored: true });
  }

  const now = Date.now();
  const ua = req.headers["user-agent"] || "";
  const detectedDevice: "desktop" | "mobile" | "tablet" =
    device === "desktop" || device === "mobile" || device === "tablet"
      ? device
      : detectDevice(ua);

  const cleanLabel = resolveLabel(path, label);

  const visit: LiveVisit = {
    id: `v_${now}_${Math.random().toString(36).slice(2, 7)}`,
    path,
    label: cleanLabel,
    sessionId,
    timestamp: now,
    device: detectedDevice,
    referrer: referrer || "",
    city: city || "Lima, Perú",
  };

  // Add to in-memory list (limit to 3000 visits in RAM)
  recentVisits.unshift(visit);
  if (recentVisits.length > 3000) {
    recentVisits.pop();
  }

  // Update active session
  const existing = activeSessions.get(sessionId);
  activeSessions.set(sessionId, {
    sessionId,
    path,
    label: cleanLabel,
    device: detectedDevice,
    lastSeen: now,
    startedAt: existing ? existing.startedAt : now,
  });

  // Async persist to MySQL if available
  void (async () => {
    try {
      await ensureDbTable();
      await pool.execute(
        "INSERT INTO analytics_visits (id, session_id, path, label, device, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
        [visit.id, visit.sessionId, visit.path, visit.label, visit.device, visit.timestamp]
      );
    } catch {
      // Ignore DB errors - memory store is primary source of truth for live analytics
    }
  })();

  const activeNow = Array.from(activeSessions.values()).filter(
    (s) => now - s.lastSeen < SESSION_TIMEOUT_MS
  ).length;

  return res.json({
    success: true,
    activeNow,
    visitId: visit.id,
  });
});

// 2. HEARTBEAT (Sent every 10s by active client tabs)
analyticsRouter.post("/heartbeat", (req: Request, res: Response) => {
  const { sessionId, path, label, device } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId required" });
  }

  // Skip tracking admin internal pages in visitor analytics
  if (typeof path === "string" && path.startsWith("/admin")) {
    return res.json({ success: true, ignored: true });
  }

  const now = Date.now();
  const ua = req.headers["user-agent"] || "";
  const detectedDevice = device || detectDevice(ua);
  const cleanLabel = resolveLabel(path || "/", label);

  const existing = activeSessions.get(sessionId);
  activeSessions.set(sessionId, {
    sessionId,
    path: path || (existing?.path ?? "/"),
    label: cleanLabel,
    device: detectedDevice,
    lastSeen: now,
    startedAt: existing ? existing.startedAt : now,
  });

  const activeNow = Array.from(activeSessions.values()).filter(
    (s) => now - s.lastSeen < SESSION_TIMEOUT_MS
  ).length;

  return res.json({ success: true, activeNow });
});

// 3. DISCONNECT (Sent on window unload)
analyticsRouter.post("/leave", (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
  return res.json({ success: true });
});

// 4. LIVE SNAPSHOT (Polled by Admin Analytics in real time)
analyticsRouter.get("/live", (_req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  const now = Date.now();

  // Active visitors within last 60 seconds
  const activeList = Array.from(activeSessions.values())
    .filter((s) => now - s.lastSeen < SESSION_TIMEOUT_MS)
    .sort((a, b) => b.lastSeen - a.lastSeen);

  const activeNow = activeList.length;

  // Time boundaries
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const prevWeekStart = new Date(weekStart);
  prevWeekStart.setDate(prevWeekStart.getDate() - 7);

  // Visits metrics
  const visitsToday = recentVisits.filter((v) => v.timestamp >= todayStart.getTime()).length;
  const visitsYesterday = recentVisits.filter(
    (v) => v.timestamp >= yesterdayStart.getTime() && v.timestamp < todayStart.getTime()
  ).length;

  const visitsThisWeek = recentVisits.filter((v) => v.timestamp >= weekStart.getTime()).length;
  const visitsPrevWeek = recentVisits.filter(
    (v) => v.timestamp >= prevWeekStart.getTime() && v.timestamp < weekStart.getTime()
  ).length;

  const visitsTotal = recentVisits.length;

  // Top Pages
  const pageMap = new Map<string, { path: string; label: string; count: number }>();
  recentVisits.forEach((v) => {
    const existing = pageMap.get(v.path);
    if (existing) {
      existing.count += 1;
    } else {
      pageMap.set(v.path, { path: v.path, label: v.label, count: 1 });
    }
  });

  const topPages = Array.from(pageMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Visits by Hour (last 24 slots)
  const visitsByHour = Array(24).fill(0);
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  recentVisits
    .filter((v) => v.timestamp >= oneDayAgo)
    .forEach((v) => {
      const h = new Date(v.timestamp).getHours();
      visitsByHour[h] += 1;
    });

  // Device Breakdown
  const devices = { desktop: 0, mobile: 0, tablet: 0 };
  recentVisits.forEach((v) => {
    if (v.device in devices) devices[v.device] += 1;
    else devices.desktop += 1;
  });

  return res.json({
    activeNow,
    activeVisitors: activeList.slice(0, 15).map((s) => ({
      sessionId: s.sessionId,
      path: s.path,
      label: s.label,
      device: s.device,
      secondsAgo: Math.max(0, Math.round((now - s.lastSeen) / 1000)),
    })),
    visitsToday,
    visitsYesterday,
    visitsThisWeek,
    visitsPrevWeek,
    visitsTotal,
    visitsByHour,
    topPages,
    recentVisits: recentVisits.slice(0, 25),
    devices,
    serverTime: now,
  });
});

// 5. CLEAR DATA
analyticsRouter.delete("/", (_req: Request, res: Response) => {
  activeSessions.clear();
  recentVisits.length = 0;
  return res.json({ success: true, message: "Analytics reiniciadas" });
});
