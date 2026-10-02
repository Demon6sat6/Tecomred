import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";
import pool from "../config/mysql.js";
import { requireApiKey } from "../middleware/auth.js";

export const adminRecordsRouter = Router();
adminRecordsRouter.use(requireApiKey);

const customerSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().max(254),
  phone: z.string().max(50),
  city: z.string().max(100),
  orders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  joined: z.string().max(100),
  status: z.enum(["Activo", "Inactivo"]),
});
const couponSchema = z.object({
  code: z.string().trim().min(1).max(50),
  type: z.enum(["porcentaje", "fijo"]),
  value: z.number().positive(),
  minOrder: z.number().nonnegative(),
  uses: z.number().int().nonnegative(),
  maxUses: z.number().int().positive(),
  expiry: z.string().max(30),
  active: z.boolean(),
});
const reviewSchema = z.object({
  productId: z.number().int().positive(),
  author: z.string().trim().min(1).max(200),
  avatar: z.string().max(20),
  rating: z.number().int().min(1).max(5),
  date: z.string().max(100),
  title: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(5000),
  verified: z.boolean(),
  approved: z.boolean(),
});
const schemas = { customer: customerSchema, coupon: couponSchema, review: reviewSchema };
type Kind = keyof typeof schemas;
type RecordRow = RowDataPacket & { id: number; payload: object | string };

function kindFrom(value: string | string[] | undefined): Kind | null {
  const kind = Array.isArray(value) ? value[0] : value;
  return kind && kind in schemas ? kind as Kind : null;
}

function toRecord(row: RecordRow) {
  const payload = typeof row.payload === "string" ? JSON.parse(row.payload) : row.payload;
  return { ...payload, id: Number(row.id) };
}

adminRecordsRouter.get("/:kind", async (req, res) => {
  const kind = kindFrom(req.params.kind);
  if (!kind) return res.status(404).json({ error: "Sección desconocida" });
  try {
    const [rows] = await pool.execute<RecordRow[]>(
      "SELECT id, payload FROM admin_records WHERE kind = ? ORDER BY id DESC", [kind],
    );
    return res.json({ data: rows.map(toRecord) });
  } catch {
    return res.status(503).json({ error: "No se pudieron cargar los registros" });
  }
});

adminRecordsRouter.post("/:kind", async (req, res) => {
  const kind = kindFrom(req.params.kind);
  if (!kind) return res.status(404).json({ error: "Sección desconocida" });
  const parsed = schemas[kind].safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
  try {
    if (kind === "coupon") {
      const [existing] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM admin_records WHERE kind = 'coupon' AND UPPER(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.code'))) = ? LIMIT 1",
        [(parsed.data as z.infer<typeof couponSchema>).code.toUpperCase()],
      );
      if (existing.length) return res.status(409).json({ error: "Ese código de cupón ya existe" });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO admin_records (kind, payload) VALUES (?, ?)", [kind, JSON.stringify(parsed.data)],
    );
    return res.status(201).json({ data: { ...parsed.data, id: result.insertId } });
  } catch {
    return res.status(503).json({ error: "No se pudo guardar el registro" });
  }
});

adminRecordsRouter.put("/:kind/:id", async (req, res) => {
  const kind = kindFrom(req.params.kind);
  const id = Number(req.params.id);
  if (!kind || !Number.isSafeInteger(id) || id < 1) return res.status(404).json({ error: "Registro desconocido" });
  const parsed = schemas[kind].safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
  try {
    if (kind === "coupon") {
      const [existing] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM admin_records WHERE kind = 'coupon' AND UPPER(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.code'))) = ? AND id <> ? LIMIT 1",
        [(parsed.data as z.infer<typeof couponSchema>).code.toUpperCase(), id],
      );
      if (existing.length) return res.status(409).json({ error: "Ese código de cupón ya existe" });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE admin_records SET payload = ? WHERE kind = ? AND id = ?",
      [JSON.stringify(parsed.data), kind, id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Registro no encontrado" });
    return res.json({ data: { ...parsed.data, id } });
  } catch {
    return res.status(503).json({ error: "No se pudo actualizar el registro" });
  }
});

adminRecordsRouter.delete("/:kind/:id", async (req, res) => {
  const kind = kindFrom(req.params.kind);
  const id = Number(req.params.id);
  if (!kind || !Number.isSafeInteger(id) || id < 1) return res.status(404).json({ error: "Registro desconocido" });
  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM admin_records WHERE kind = ? AND id = ?", [kind, id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "Registro no encontrado" });
    return res.status(204).end();
  } catch {
    return res.status(503).json({ error: "No se pudo eliminar el registro" });
  }
});
