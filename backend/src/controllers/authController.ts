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
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    try {
      await ensureDefaultAdmin();
      const [rows] = await pool.query(
        "SELECT id, username, password_hash, role FROM administrators WHERE username = ? AND is_active = 1 LIMIT 1",
        [username],
      );
      const admin = (rows as { id: number; username: string; password_hash: string; role: string }[])[0];
      if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      return res.status(200).json({
        token: signToken("administrator", admin.id, admin.role),
        user: { id: admin.id, username: admin.username, role: admin.role },
      });
    } catch (error) {
      console.error("Admin login failed", error);
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

  loginUser: async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Correo y contraseña son obligatorios" });
    try {
      const [rows] = await pool.query("SELECT id, name, email, phone, password_hash FROM users WHERE email = ? AND is_active = 1 LIMIT 1", [String(email).trim().toLowerCase()]);
      const user = (rows as { id: number; name: string; email: string; phone: string | null; password_hash: string }[])[0];
      if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Correo o contraseña incorrectos" });
      return res.json({ token: signToken("user", user.id), user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
    } catch (error) {
      console.error("User login failed", error);
      return res.status(503).json({ error: "Authentication service unavailable" });
    }
  },
};
