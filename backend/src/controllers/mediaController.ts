import type { Request, Response } from "express";
import pool from "../config/mysql.js";
import fs from "fs";
import path from "path";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { updateAltSchema, type MediaFile } from "../types/media.js";
import { env } from "../config/env.js";

function fileToMedia(file: Express.Multer.File, req: Request): Omit<MediaFile, "id" | "created_at"> {
  const baseUrl = env.NODE_ENV === "production"
    ? env.CORS_ORIGIN.replace(/\/$/, "")
    : `http://localhost:${env.PORT}`;
  return {
    filename:      file.filename,
    original_name: file.originalname,
    url:           `${baseUrl}/uploads/${file.filename}`,
    size_bytes:    file.size,
    mime_type:     file.mimetype,
    alt_text:      "",
    width:         null,
    height:        null,
  };
}

export const mediaController = {
  list: async (_req: Request, res: Response) => {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM media ORDER BY created_at DESC"
    );
    res.json({ data: rows });
  },

  upload: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const inserted: MediaFile[] = [];
    for (const file of files) {
      const m = fileToMedia(file, req);
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO media (filename, original_name, url, size_bytes, mime_type, alt_text) VALUES (?,?,?,?,?,?)",
        [m.filename, m.original_name, m.url, m.size_bytes, m.mime_type, m.alt_text]
      );
      inserted.push({ ...m, id: result.insertId, created_at: new Date().toISOString() });
    }

    return res.status(201).json({ data: inserted });
  },

  updateAlt: async (req: Request, res: Response) => {
    const parsed = updateAltSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos" });

    const id = Number(req.params.id);
    await pool.query("UPDATE media SET alt_text = ? WHERE id = ?", [parsed.data.alt_text, id]);
    res.json({ message: "Alt text actualizado" });
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>("SELECT filename FROM media WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Archivo no encontrado" });

    const filename = rows[0].filename as string;
    const filePath = path.resolve("uploads", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query("DELETE FROM media WHERE id = ?", [id]);
    res.json({ message: "Archivo eliminado" });
  },
};
