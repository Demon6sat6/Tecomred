import { Router } from "express";
import rateLimit from "express-rate-limit";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";
import pool from "../config/mysql.js";

export const reviewsRouter = Router();
const reviewInput = z.object({
  author: z.string().trim().min(2).max(120),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(300),
  body: z.string().trim().min(10).max(5000),
});
const submitLimit = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });

function productId(value: string | string[] | undefined) {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

reviewsRouter.get("/:productId", async (req, res) => {
  const id = productId(req.params.productId);
  if (!id) return res.status(400).json({ error: "Producto inválido" });
  try {
    const [rows] = await pool.execute<(RowDataPacket & { id: number; payload: object | string })[]>(
      "SELECT id, payload FROM admin_records WHERE kind = 'review' AND JSON_EXTRACT(payload, '$.productId') = ? AND JSON_EXTRACT(payload, '$.approved') = true ORDER BY id DESC",
      [id],
    );
    return res.json({ data: rows.map(row => ({ ...(typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload), id: Number(row.id) })) });
  } catch {
    return res.status(503).json({ error: "No se pudieron cargar las reseñas" });
  }
});

reviewsRouter.post("/:productId", submitLimit, async (req, res) => {
  const id = productId(req.params.productId);
  if (!id) return res.status(400).json({ error: "Producto inválido" });
  const parsed = reviewInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Reseña inválida" });
  try {
    const [settings] = await pool.query<RowDataPacket[]>("SELECT JSON_EXTRACT(content, '$.allowReviews') AS allowed FROM store_settings WHERE id = 1");
    if ([false, 0, "false", "0"].includes(settings[0]?.allowed)) return res.status(403).json({ error: "Las reseñas están deshabilitadas" });
    const [products] = await pool.execute<RowDataPacket[]>("SELECT id FROM products WHERE id = ? LIMIT 1", [id]);
    if (!products.length) return res.status(404).json({ error: "Producto no encontrado" });
    const author = parsed.data.author;
    const payload = {
      ...parsed.data,
      productId: id,
      avatar: author.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      date: new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }),
      verified: false,
      approved: false,
    };
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO admin_records (kind, payload) VALUES ('review', ?)", [JSON.stringify(payload)],
    );
    return res.status(201).json({ data: { ...payload, id: result.insertId } });
  } catch {
    return res.status(503).json({ error: "No se pudo enviar la reseña" });
  }
});
