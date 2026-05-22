import type { Request, Response } from "express";
import pool from "../config/mysql.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { createContactSchema } from "../types/contact.js";

export const contactController = {
  create: async (req: Request, res: Response) => {
    const parsed = createContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Datos inválidos", details: parsed.error.flatten() });
    }
    const ip = req.ip || req.socket?.remoteAddress || null;
    const { nombre, email, asunto, mensaje } = parsed.data;

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO contacts (nombre, email, asunto, mensaje, ip_address) VALUES (?,?,?,?,?)",
      [nombre, email, asunto, mensaje, ip]
    );
    return res.status(201).json({ data: { id: result.insertId } });
  },

  list: async (_req: Request, res: Response) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM contacts ORDER BY created_at DESC LIMIT 200"
    );
    res.json({ data: rows });
  },

  markRead: async (req: Request, res: Response) => {
    await pool.query("UPDATE contacts SET is_read = 1 WHERE id = ?", [req.params.id]);
    res.json({ message: "Marcado como leído" });
  },

  remove: async (req: Request, res: Response) => {
    await pool.query("DELETE FROM contacts WHERE id = ?", [req.params.id]);
    res.json({ message: "Eliminado" });
  },
};
