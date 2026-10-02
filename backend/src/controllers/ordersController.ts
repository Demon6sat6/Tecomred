import { Request, Response } from "express";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type Order,
} from "../types/order.js";
import { ordersRepository } from "../data/ordersRepository.js";
import { InvalidCouponError } from "../data/ordersRepository.js";

export const ordersController = {
  list: async (_req: Request, res: Response) => {
    try {
      const orders = await ordersRepository.listOrders();
      res.status(200).json({ data: orders });
    } catch (err) {
      res.status(500).json({ error: "Error al listar órdenes" });
    }
  },

  create: async (req: Request, res: Response) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const id = (typeof req.body.id === "string" && req.body.id.trim())
      ? req.body.id.trim()
      : `TR-${Date.now().toString().slice(-6)}`;
    const order: Order = {
      ...parsed.data,
      id,
      createdAt: req.body.createdAt || new Date().toISOString(),
    };
    try {
      await ordersRepository.createOrder(order);
      return res.status(201).json({ data: order });
    } catch (err) {
      if (err instanceof InvalidCouponError) return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: "Error al crear orden" });
    }
  },

  updateStatus: async (req: Request, res: Response) => {
    const parsed = updateOrderStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload" });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const updated = await ordersRepository.updateOrderStatus(id, parsed.data.status);
      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ data: updated });
    } catch (err) {
      return res.status(500).json({ error: "Error al actualizar estado de orden" });
    }
  },

  remove: async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const deleted = await ordersRepository.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
      return res.status(500).json({ error: "Error al eliminar orden" });
    }
  },

  update: async (req: Request, res: Response) => {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    try {
      const updated = await ordersRepository.updateOrder({ ...parsed.data, id, createdAt: new Date().toISOString() });
      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json({ data: updated });
    } catch (err) {
      return res.status(500).json({ error: "Error al actualizar orden" });
    }
  },
};
