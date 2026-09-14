import { Router } from "express";

import { requireApiKey } from "../middleware/auth.js";
import { ordersController } from "../controllers/ordersController.js";

export const ordersRouter = Router();

// Permitir creación pública de pedidos desde Checkout
ordersRouter.post("/", ordersController.create);

// Operaciones de gestión exclusivas para administradores
ordersRouter.use(requireApiKey);
ordersRouter.get("/", ordersController.list);
ordersRouter.put("/:id", ordersController.update);
ordersRouter.patch("/:id/status", ordersController.updateStatus);
ordersRouter.delete("/:id", ordersController.remove);
