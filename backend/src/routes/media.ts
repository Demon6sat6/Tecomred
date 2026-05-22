import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { upload } from "../config/multer.js";
import { mediaController } from "../controllers/mediaController.js";

export const mediaRouter = Router();

// List and upload require admin auth
mediaRouter.get("/",            requireApiKey, mediaController.list);
mediaRouter.post("/upload",     requireApiKey, upload.array("files", 10), mediaController.upload);
mediaRouter.patch("/:id/alt",   requireApiKey, mediaController.updateAlt);
mediaRouter.delete("/:id",      requireApiKey, mediaController.remove);
