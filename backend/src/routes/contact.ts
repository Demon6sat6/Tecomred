import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { contactController } from "../controllers/contactController.js";

export const contactRouter = Router();

// Public: send message
contactRouter.post("/", contactController.create);

// Admin only
contactRouter.get("/",          requireApiKey, contactController.list);
contactRouter.patch("/:id/read",requireApiKey, contactController.markRead);
contactRouter.delete("/:id",    requireApiKey, contactController.remove);
