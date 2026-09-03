import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import pool from "../config/mysql.js";

interface AdministratorRow {
  id: number;
  name: string;
  username: string;
  email: string | null;
  role: "admin" | "editor";
  is_active: number;
  created_at: Date;
}

const publicAdministrator = (admin: AdministratorRow) => ({
  id: admin.id,
  name: admin.name,
  username: admin.username,
  email: admin.email,
  role: admin.role,
  isActive: Boolean(admin.is_active),
  createdAt: admin.created_at,
});

export const administratorsController = {
  list: async (_req: Request, res: Response) => {
    const [rows] = await pool.query("SELECT id, name, username, email, role, is_active, created_at FROM administrators ORDER BY created_at DESC");
    res.json({ data: (rows as AdministratorRow[]).map(publicAdministrator) });
  },

  create: async (req: Request, res: Response) => {
    const { name, username, email, password, role = "editor" } = req.body;
    if (!name || !username || !password) return res.status(400).json({ error: "Nombre, usuario y contraseña son obligatorios" });
    if (String(password).length < 8) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    if (role !== "admin" && role !== "editor") return res.status(400).json({ error: "Rol inválido" });

    try {
      const passwordHash = await bcrypt.hash(String(password), 12);
      const [result] = await pool.query(
        "INSERT INTO administrators (name, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
        [String(name).trim(), String(username).trim(), email ? String(email).trim().toLowerCase() : null, passwordHash, role],
      );
      const [rows] = await pool.query("SELECT id, name, username, email, role, is_active, created_at FROM administrators WHERE id = ?", [(result as { insertId: number }).insertId]);
      return res.status(201).json({ data: publicAdministrator((rows as AdministratorRow[])[0]) });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") return res.status(409).json({ error: "El usuario o correo ya existe" });
      console.error("Administrator creation failed", error);
      return res.status(500).json({ error: "No se pudo crear el administrador" });
    }
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { name, email, role, isActive, password } = req.body;
    if (!Number.isInteger(id) || !name) return res.status(400).json({ error: "Datos inválidos" });
    if (role !== "admin" && role !== "editor") return res.status(400).json({ error: "Rol inválido" });
    if (password && String(password).length < 8) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });

    try {
      const passwordHash = password ? await bcrypt.hash(String(password), 12) : null;
      await pool.query(
        passwordHash
          ? "UPDATE administrators SET name = ?, email = ?, role = ?, is_active = ?, password_hash = ? WHERE id = ?"
          : "UPDATE administrators SET name = ?, email = ?, role = ?, is_active = ? WHERE id = ?",
        passwordHash
          ? [String(name).trim(), email ? String(email).trim().toLowerCase() : null, role, isActive ? 1 : 0, passwordHash, id]
          : [String(name).trim(), email ? String(email).trim().toLowerCase() : null, role, isActive ? 1 : 0, id],
      );
      const [rows] = await pool.query("SELECT id, name, username, email, role, is_active, created_at FROM administrators WHERE id = ?", [id]);
      const admin = (rows as AdministratorRow[])[0];
      return admin ? res.json({ data: publicAdministrator(admin) }) : res.status(404).json({ error: "Administrador no encontrado" });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") return res.status(409).json({ error: "El correo ya existe" });
      console.error("Administrator update failed", error);
      return res.status(500).json({ error: "No se pudo actualizar el administrador" });
    }
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const [result] = await pool.query("DELETE FROM administrators WHERE id = ?", [id]);
    if (!(result as { affectedRows: number }).affectedRows) return res.status(404).json({ error: "Administrador no encontrado" });
    return res.json({ message: "Administrador eliminado" });
  },
};
