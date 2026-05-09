import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return next();
}
