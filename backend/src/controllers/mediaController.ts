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

const inMemoryMedia: MediaFile[] = [
  {
    id: 1,
    filename: 'cisco-2960.svg',
    original_name: 'cisco-2960.svg',
    url: '/products/cisco-2960.svg',
    size_bytes: 12450,
    mime_type: 'image/svg+xml',
    alt_text: 'Switch Cisco Catalyst',
    width: null,
    height: null,
    created_at: new Date('2025-01-10').toISOString(),
  },
  {
    id: 2,
    filename: 'mikrotik-rb4011.svg',
    original_name: 'mikrotik-rb4011.svg',
    url: '/products/mikrotik-rb4011.svg',
    size_bytes: 15300,
    mime_type: 'image/svg+xml',
    alt_text: 'Router MikroTik RB4011',
    width: null,
    height: null,
    created_at: new Date('2025-01-11').toISOString(),
  },
];

export const mediaController = {
  list: async (_req: Request, res: Response) => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM media ORDER BY created_at DESC"
      );
      res.json({ data: rows.length > 0 ? rows : inMemoryMedia });
    } catch {
      res.json({ data: inMemoryMedia });
    }
  },

  upload: async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const inserted: MediaFile[] = [];
    for (const file of files) {
      const m = fileToMedia(file, req);
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
      await pool.query("UPDATE media SET alt_text = ? WHERE id = ?", [parsed.data.alt_text, id]);
    } catch {}
    const mem = inMemoryMedia.find(m => m.id === id);
    if (mem) mem.alt_text = parsed.data.alt_text;
    res.json({ message: "Alt text actualizado" });
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const [rows] = await pool.query<RowDataPacket[]>("SELECT filename FROM media WHERE id = ?", [id]);
      if (rows.length > 0) {
        const filename = rows[0].filename as string;
        const filePath = path.resolve("uploads", filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        await pool.query("DELETE FROM media WHERE id = ?", [id]);
      }
    } catch {}
    const index = inMemoryMedia.findIndex(m => m.id === id);
    if (index !== -1) inMemoryMedia.splice(index, 1);
    res.json({ message: "Archivo eliminado" });
  },
};
