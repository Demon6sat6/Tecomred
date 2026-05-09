import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/login", authController.login);
