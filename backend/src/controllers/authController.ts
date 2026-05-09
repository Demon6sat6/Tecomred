import { Request, Response } from "express";
import { env } from "../config/env.js";

export const authController = {
  login: (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    if (username !== env.ADMIN_USER || password !== env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    return res.status(200).json({
      token: env.ADMIN_API_KEY,
      user: { username: env.ADMIN_USER },
    });
  },
};
