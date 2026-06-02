import { Router } from "express";
import { requireApiKey } from "../middleware/auth.js";
import { productsController } from "../controllers/productsController.js";

export const productsRouter = Router();

// Listado público (sin auth) — la tienda lo usa directamente
productsRouter.get("/", productsController.list);
productsRouter.get("/:id", productsController.getOne);

// Mutaciones protegidas — solo admin
productsRouter.post("/",    requireApiKey, productsController.create);
productsRouter.put("/:id",  requireApiKey, productsController.update);
productsRouter.delete("/:id", requireApiKey, productsController.remove);
