import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().nonnegative(),
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderStatusSchema = z.enum([
  "Pendiente",
  "Procesando",
  "Enviado",
  "Entregado",
  "Cancelado",
]);

export const createOrderSchema = z.object({
  customer: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  date: z.string().min(3),
  total: z.number().nonnegative(),
  discount: z.number().nonnegative().default(0),
  couponCode: z.string().default(""),
  status: orderStatusSchema.default("Pendiente"),
  city: z.string().min(2),
  address: z.string().min(5),
  notes: z.string().default(""),
  items: z.array(orderItemSchema).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export type Order = z.infer<typeof createOrderSchema> & {
  id: string;
  createdAt: string;
};
