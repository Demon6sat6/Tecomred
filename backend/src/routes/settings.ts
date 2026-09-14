import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import pool from "../config/mysql.js";
import { requireApiKey } from "../middleware/auth.js";
import { settingsSchema } from "../types/settings.js";

export const settingsRouter = Router();

let tableEnsured = false;
async function ensureSettingsTable() {
  if (tableEnsured) return;
  await pool.query(
    "CREATE TABLE IF NOT EXISTS store_settings (" +
      "  id TINYINT UNSIGNED NOT NULL PRIMARY KEY," +
      "  content JSON NOT NULL," +
      "  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
      ")",
  );
  tableEnsured = true;
}

const fallbackSettings: Record<string, any> = {
  storeName: "TecomRed",
  storeEmail: "ventas@tecomred.pe",
  storePhone: "+51 1 234-5678",
  storeAddress: "Av. Javier Prado Este 4200, San Isidro, Lima",
  supportHours: "Lun-Vie 9am-7pm",
  storeWebsite: "https://tecomred.pe",
  freeShippingMin: "300",
  currency: "PEN",
  taxRate: "18",
  maintenanceMode: false,
  showOutOfStock: true,
  allowReviews: true,
  brands: [
    { name: "Cisco", colorClass: "text-blue-400" },
    { name: "MikroTik", colorClass: "text-red-400" },
    { name: "Ubiquiti", colorClass: "text-sky-400" },
    { name: "Intel", colorClass: "text-blue-300" },
    { name: "Samsung", colorClass: "text-blue-500" },
    { name: "Kingston", colorClass: "text-red-500" },
    { name: "TP-Link", colorClass: "text-green-400" },
    { name: "Seagate", colorClass: "text-emerald-400" },
  ],
  categories: [
    "Switches", "Routers", "Cables", "Procesadores",
    "Memorias RAM", "Almacenamiento", "Tarjetas de Red", "Access Points", "Herramientas"
  ],
  stat1Value: "500", stat1Suffix: "+", stat1Label: "Productos en stock",
  stat2Value: "2000", stat2Suffix: "+", stat2Label: "Clientes satisfechos",
  stat3Value: "10", stat3Suffix: " años", stat3Label: "De experiencia",
  stat4Value: "24", stat4Suffix: "/7", stat4Label: "Soporte técnico"
};

async function readSettings() {
  try {
    await ensureSettingsTable();
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT content FROM store_settings WHERE id = 1",
    );
    const content = rows[0]?.content;
    if (!content) return fallbackSettings;
    const raw = typeof content === "string" ? JSON.parse(content) : content;
    const parsed = settingsSchema.safeParse(raw);
    return parsed.success ? { ...fallbackSettings, ...parsed.data } : (raw ?? fallbackSettings);
  } catch {
    return fallbackSettings;
  }
}

settingsRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

settingsRouter.get("/", async (_req, res) => {
  try {
    res.json({ data: await readSettings() });
  } catch (error) {
    res.json({ data: fallbackSettings });
  }
});

settingsRouter.patch("/", requireApiKey, async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success || !Object.keys(parsed.data ?? {}).length) {
    return res.status(400).json({
      error: "Configuración inválida",
      details: !parsed.success ? parsed.error.flatten() : undefined,
    });
  }

  try {
    await ensureSettingsTable();
    const content = JSON.stringify(parsed.data);
    // Mezcla atómica: editar Nosotros no sobrescribe los ajustes o las marcas.
    await pool.execute(
      "INSERT INTO store_settings (id, content) VALUES (1, ?) ON DUPLICATE KEY UPDATE content = JSON_MERGE_PATCH(content, ?)",
      [content, content],
    );
    return res.json({ data: await readSettings() });
  } catch (error) {
    console.error("Error al actualizar la configuración:", error);
    return res
      .status(500)
      .json({ error: "Error al actualizar la configuración" });
  }
});
