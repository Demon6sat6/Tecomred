import type { Request, Response } from "express";
import pool from "../config/mysql.js";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { subscribeSchema } from "../types/newsletter.js";

export const newsletterController = {
  subscribe: async (req: Request, res: Response) => {
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Correo inválido" });
    }
    const ip = req.ip || req.socket?.remoteAddress || null;
    const email = parsed.data.email;

    // Si ya existe, lo reactivamos
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id, is_active FROM newsletter_subscribers WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      if (existing[0].is_active) {
        return res.status(200).json({ message: "Ya estás suscrito." });
      }
      await pool.query("UPDATE newsletter_subscribers SET is_active = 1 WHERE email = ?", [email]);
      return res.status(200).json({ message: "Suscripción reactivada." });
    }

    await pool.query<ResultSetHeader>(
      "INSERT INTO newsletter_subscribers (email, ip_address) VALUES (?,?)",
      [email, ip]
    );
    return res.status(201).json({ message: "¡Suscrito exitosamente!" });
  },

  list: async (_req: Request, res: Response) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, is_active, created_at FROM newsletter_subscribers ORDER BY created_at DESC"
    );
    res.json({ data: rows });
  },

  unsubscribe: async (req: Request, res: Response) => {
    await pool.query(
      "UPDATE newsletter_subscribers SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: "Desuscrito" });
  },
};
