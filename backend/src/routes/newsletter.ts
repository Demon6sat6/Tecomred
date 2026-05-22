import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { newsletterController } from "../controllers/newsletterController.js";

export const newsletterRouter = Router();

// Public: subscribe
newsletterRouter.post("/subscribe",    newsletterController.subscribe);

// Admin only
newsletterRouter.get("/",              requireApiKey, newsletterController.list);
newsletterRouter.patch("/:id/unsub",   requireApiKey, newsletterController.unsubscribe);
