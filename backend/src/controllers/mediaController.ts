import type { Request, Response } from "express";
import pool from "../config/mysql.js";
import fs from "fs";
import path from "path";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import { updateAltSchema, type MediaFile } from "../types/media.js";

const UPLOAD_DIR = path.resolve("uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

function fileToMedia(file: Express.Multer.File): Omit<MediaFile, "id" | "created_at"> {
  const ext = path.extname(file.filename);
  const base = path.basename(file.filename, ext).replace(/[-_]+/g, " ");
  const defaultAlt = base.charAt(0).toUpperCase() + base.slice(1);

  return {
    filename:      file.filename,
    original_name: file.originalname,
    url:           `/uploads/${file.filename}`,
    size_bytes:    file.size,
    mime_type:     file.mimetype,
    alt_text:      defaultAlt,
    width:         null,
    height:        null,
  };
}

let tableEnsured = false;
async function ensureMediaTable() {
  if (tableEnsured) return;
  await pool.query(
    "CREATE TABLE IF NOT EXISTS media (" +
    "  id INT AUTO_INCREMENT PRIMARY KEY," +
    "  filename VARCHAR(255) NOT NULL," +
    "  original_name VARCHAR(255) NOT NULL," +
    "  url VARCHAR(500) NOT NULL," +
    "  size_bytes INT NOT NULL DEFAULT 0," +
    "  mime_type VARCHAR(100) NOT NULL," +
    "  alt_text VARCHAR(255) DEFAULT ''," +
    "  width INT NULL," +
    "  height INT NULL," +
    "  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
    ")"
  );
  tableEnsured = true;
}

const inMemoryMedia: MediaFile[] = [];

export const mediaController = {
  list: async (_req: Request, res: Response) => {
    try {
      await ensureMediaTable();
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM media ORDER BY created_at DESC"
      );
      return res.json({ data: rows.length > 0 ? rows : inMemoryMedia });
    } catch {
      return res.json({ data: inMemoryMedia });
    }
  },

  upload: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    await ensureMediaTable();
    const inserted: MediaFile[] = [];

    for (const file of files) {
      const m = fileToMedia(file);
      try {
        const [result] = await pool.query<ResultSetHeader>(
          "INSERT INTO media (filename, original_name, url, size_bytes, mime_type, alt_text) VALUES (?,?,?,?,?,?)",
          [m.filename, m.original_name, m.url, m.size_bytes, m.mime_type, m.alt_text]
        );
        const item: MediaFile = { ...m, id: result.insertId, created_at: new Date().toISOString() };
        inserted.push(item);
        inMemoryMedia.unshift(item);
      } catch {
        const item: MediaFile = { ...m, id: Date.now() + Math.floor(Math.random() * 1000), created_at: new Date().toISOString() };
        inserted.push(item);
        inMemoryMedia.unshift(item);
      }
    }

    return res.status(201).json({ data: inserted });
  },

  updateAlt: async (req: Request, res: Response) => {
    const parsed = updateAltSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Datos inválidos" });

    const id = Number(req.params.id);
    try {
      await ensureMediaTable();
      await pool.query("UPDATE media SET alt_text = ? WHERE id = ?", [parsed.data.alt_text, id]);
    } catch {}

    const mem = inMemoryMedia.find(m => m.id === id);
    if (mem) mem.alt_text = parsed.data.alt_text;
    return res.json({ message: "Alt text actualizado" });
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await ensureMediaTable();
      const [rows] = await pool.query<RowDataPacket[]>("SELECT filename FROM media WHERE id = ?", [id]);
      if (rows.length > 0) {
        const filename = rows[0].filename as string;
        const filePath = path.resolve(UPLOAD_DIR, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        await pool.query("DELETE FROM media WHERE id = ?", [id]);
      }
    } catch {}

    const index = inMemoryMedia.findIndex(m => m.id === id);
    if (index !== -1) inMemoryMedia.splice(index, 1);

    return res.json({ message: "Archivo eliminado exitosamente" });
  },
};
