import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/authController.js";
import { requireApiKey } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/login",  authController.login);
authRouter.get("/verify",  requireApiKey, (_req, res) => res.json({ valid: true }));
