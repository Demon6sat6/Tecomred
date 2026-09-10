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

async function readSettings() {
  await ensureSettingsTable();
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT content FROM store_settings WHERE id = 1",
  );
  const content = rows[0]?.content;
  if (!content) return {};
  const raw = typeof content === "string" ? JSON.parse(content) : content;
  const parsed = settingsSchema.safeParse(raw);
  return parsed.success ? parsed.data : (raw ?? {});
}

settingsRouter.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

settingsRouter.get("/", async (_req, res) => {
  try {
    res.json({ data: await readSettings() });
  } catch (error) {
    console.error("Error al obtener la configuración:", error);
    res.status(500).json({ error: "Error al obtener la configuración" });
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
