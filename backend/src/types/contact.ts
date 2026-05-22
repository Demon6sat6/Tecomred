import { z } from "zod";

export const createContactSchema = z.object({
  nombre:  z.string().min(2).max(255).transform(s => s.trim()),
  email:   z.string().email().max(255),
  asunto:  z.enum(["consulta", "cotizacion", "soporte", "pedido", "otro"]),
  mensaje: z.string().min(10).max(1000).transform(s => s.trim()),
});

export type CreateContact = z.infer<typeof createContactSchema>;

export interface Contact extends CreateContact {
  id: number;
  is_read: boolean;
  ip_address: string | null;
  created_at: string;
}
