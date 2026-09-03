import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (token === env.ADMIN_API_KEY) return next();

  try {
    const payload = jwt.verify(token, env.ADMIN_API_KEY) as { type?: string };
    if (payload.type !== "administrator") return res.status(403).json({ error: "Administrator access required" });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}
