import { Router } from "express";
import { administratorsController } from "../controllers/administratorsController.js";
import { requireApiKey } from "../middleware/auth.js";

export const administratorsRouter = Router();
administratorsRouter.use(requireApiKey);
administratorsRouter.get("/", administratorsController.list);
administratorsRouter.post("/", administratorsController.create);
administratorsRouter.put("/:id", administratorsController.update);
administratorsRouter.delete("/:id", administratorsController.remove);
