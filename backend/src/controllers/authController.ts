import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { env } from "../config/env.js";
import pool from "../config/mysql.js";

const tokenSecret = env.ADMIN_API_KEY;

function signToken(subjectType: "user" | "administrator", subjectId: number, role?: string) {
  return jwt.sign({ sub: subjectId, type: subjectType, role }, tokenSecret, { expiresIn: "7d" });
}

async function ensureDefaultAdmin() {
  const [rows] = await pool.query("SELECT id FROM administrators LIMIT 1");
  if ((rows as { id: number }[]).length > 0) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await pool.query(
    "INSERT INTO administrators (name, username, password_hash, role) VALUES (?, ?, ?, 'admin')",
    ["Administrador principal", env.ADMIN_USER, passwordHash],
  );
}

export const authController = {
  login: async (req: Request, res: Response) => {
    const identifier = String(req.body?.email ?? req.body?.username ?? '').trim().toLowerCase();
    const password = req.body?.password;
    if (!identifier || typeof password !== 'string') {
      return res.status(400).json({ error: "Invalid payload" });
    }

    try {
      await ensureDefaultAdmin();
      const [rows] = await pool.query(
        "SELECT id, name, username, email, password_hash, role FROM administrators WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND is_active = 1 LIMIT 1",
        [identifier, identifier],
      );
      const admin = (rows as { id: number; name: string; username: string; email: string | null; password_hash: string; role: string }[])[0];
      if (admin && await bcrypt.compare(password, admin.password_hash)) {
        return res.status(200).json({
          token: signToken("administrator", admin.id, admin.role),
          user: { id: admin.id, name: admin.name, username: admin.username, email: admin.email, role: admin.role },
        });
      }
      const [userRows] = await pool.query(
        "SELECT id, name, email, phone, password_hash FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
        [identifier],
      );
      const user = (userRows as { id: number; name: string; email: string; phone: string | null; password_hash: string }[])[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: "Correo, usuario o contraseña incorrectos" });
      }
      return res.json({ token: signToken("user", user.id), user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: "customer" } });
    } catch (error) {
      console.error("Login failed", error);
      return res.status(503).json({ error: "Authentication service unavailable" });
    }
  },

  registerUser: async (req: Request, res: Response) => {
    const { name, email, password, phone } = req.body;
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Nombre, correo y contraseña son obligatorios" });
    }
    if (password.length < 8) return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });

    try {
      const passwordHash = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        "INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)",
        [name.trim(), email.trim().toLowerCase(), passwordHash, phone || null],
      );
      const userId = (result as { insertId: number }).insertId;
      return res.status(201).json({ token: signToken("user", userId), user: { id: userId, name: name.trim(), email: email.trim().toLowerCase(), phone: phone || null } });
    } catch (error: unknown) {
      if ((error as { code?: string }).code === "ER_DUP_ENTRY") return res.status(409).json({ error: "El correo ya está registrado" });
      console.error("User registration failed", error);
      return res.status(500).json({ error: "No se pudo registrar el usuario" });
    }
  },

};
