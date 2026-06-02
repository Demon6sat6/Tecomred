import { Request, Response } from "express";
import { productSchema } from "../types/product.js";
import { productsRepository } from "../data/productsRepository.js";

export const productsController = {
  list: async (req: Request, res: Response) => {
    const activeOnly = req.query.active === "true";
    const products = await productsRepository.list(activeOnly);
    res.json({ data: products });
  },

  getOne: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const product = await productsRepository.getById(id);
    if (!product) return res.status(404).json({ error: "Producto no encontrado" });
    return res.json({ data: product });
  },

  create: async (req: Request, res: Response) => {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Payload inválido", details: parsed.error.flatten() });
    try {
      const product = await productsRepository.create(parsed.data);
      return res.status(201).json({ data: product });
    } catch {
      return res.status(500).json({ error: "Error al crear producto" });
    }
  },

  update: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Payload inválido", details: parsed.error.flatten() });
    try {
      const product = await productsRepository.update(id, parsed.data);
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      return res.json({ data: product });
    } catch {
      return res.status(500).json({ error: "Error al actualizar producto" });
    }
  },

  remove: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const deleted = await productsRepository.remove(id);
      if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });
      return res.json({ message: "Producto eliminado" });
    } catch {
      return res.status(500).json({ error: "Error al eliminar producto" });
    }
  },
};
