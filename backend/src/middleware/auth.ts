import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, env.ADMIN_API_KEY) as { type?: string; role?: string };
    if (payload.type === "administrator" && (payload.role === "admin" || payload.role === "editor")) return next();
    return res.status(403).json({ error: "Administrator access required" });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
