import { Router } from "express";
import { z } from "zod";
import { calculateCoupon, findCoupon } from "../data/couponsRepository.js";

export const couponsRouter = Router();
const validateSchema = z.object({ code: z.string().trim().min(1).max(50), subtotal: z.number().nonnegative() });

couponsRouter.post("/validate", async (req, res) => {
  const parsed = validateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Código o subtotal inválido" });
  try {
    const coupon = await findCoupon(parsed.data.code);
    return res.json(calculateCoupon(coupon, parsed.data.subtotal));
  } catch {
    return res.status(503).json({ error: "No se pudo validar el cupón" });
  }
});
