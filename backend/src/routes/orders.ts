import { Router } from "express";

import { requireApiKey } from "../middleware/auth.js";
import { ordersController } from "../controllers/ordersController.js";

export const ordersRouter = Router();

ordersRouter.use(requireApiKey);

ordersRouter.get("/", ordersController.list);
ordersRouter.post("/", ordersController.create);
ordersRouter.put("/:id", ordersController.update);
ordersRouter.patch("/:id/status", ordersController.updateStatus);
ordersRouter.delete("/:id", ordersController.remove);
