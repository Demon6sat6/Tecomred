import { z } from "zod";

export const productSchema = z.object({
  name:          z.string().min(1),
  category:      z.string().min(1),
  price:         z.number().min(0),
  originalPrice: z.number().positive().nullable().optional(),
  image:         z.string().refine(value => /^https?:\/\//.test(value) || /^\/(?!\/)/.test(value), "URL o ruta local inválida"),
  description:   z.string().min(1),
  specs:         z.array(z.string()),
  stock:         z.number().int().min(0),
  rating:        z.number().min(0).max(5).default(4.5),
  reviews:       z.number().int().min(0).default(0),
  badge:         z.enum(["Nuevo", "Oferta", "Popular", "Agotado"]).nullable().optional(),
  isActive:      z.boolean().default(false),
}).refine(product => !product.isActive || product.price > 0, {
  message: "Un producto publicado necesita precio mayor que cero",
  path: ["price"],
});

export type ProductInput = z.infer<typeof productSchema>;

export interface Product extends ProductInput {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}
