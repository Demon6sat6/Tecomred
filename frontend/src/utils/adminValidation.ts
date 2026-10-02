import { z } from 'zod';

// Reglas compartidas por los formularios del panel. El backend aplica sus
// propios esquemas Zod; estas reglas dan respuesta inmediata al administrador.

const PERSON_NAME = /^[\p{L}][\p{L}\s.'-]*$/u;
const PHONE = /^\+?[\d\s()-]{7,20}$/;
const SAFE_LABEL = /^[\p{L}\p{N}][\p{L}\p{N}\s&.,/()+-]*$/u;

const text = (label: string, min: number, max: number) => z.string().trim()
  .min(min, min === 1 ? `${label} es obligatorio` : `${label} debe tener al menos ${min} caracteres`)
  .max(max, `${label} no puede superar ${max} caracteres`);

const optionalText = (label: string, max: number) => z.string().trim().max(max, `${label} no puede superar ${max} caracteres`);

const personName = (label: string) => text(label, 3, 80).regex(PERSON_NAME, `${label} solo puede contener letras, espacios, puntos o guiones`);

const email = (label = 'El correo') => z.string().trim().toLowerCase()
  .min(1, `${label} es obligatorio`)
  .max(254, `${label} es demasiado largo`)
  .pipe(z.email(`${label} no tiene un formato válido`));

const optionalPhone = z.string().trim().refine(value => !value || PHONE.test(value), 'El teléfono debe tener entre 7 y 20 dígitos (puede iniciar con +)');

const city = optionalText('La ciudad', 60).refine(value => !value || PERSON_NAME.test(value), 'La ciudad solo puede contener letras');

const money = (label: string, max = 1_000_000) => z.number({ error: `${label} debe ser un número` })
  .refine(Number.isFinite, `${label} debe ser un número`)
  .min(0, `${label} no puede ser negativo`)
  .max(max, `${label} no puede superar ${max.toLocaleString('es-PE')}`);

const integer = (label: string, min: number, max: number) => z.number({ error: `${label} debe ser un número` })
  .int(`${label} debe ser un número entero`)
  .min(min, `${label} debe ser al menos ${min}`)
  .max(max, `${label} no puede superar ${max.toLocaleString('es-PE')}`);

const imageRef = z.string().trim().min(1, 'Selecciona o sube una imagen del producto')
  .refine(value => value.startsWith('/') || /^https?:\/\/\S+$/i.test(value), 'La imagen debe ser una ruta (/uploads/...) o una URL http(s)');

export const productSchema = (categories: string[]) => z.object({
  name: text('El nombre', 3, 120),
  category: z.string().refine(value => categories.includes(value), 'Selecciona una categoría existente'),
  badge: z.enum(['Nuevo', 'Oferta', 'Popular', 'Agotado']).optional(),
  price: money('El precio'),
  originalPrice: money('El precio anterior').optional(),
  stock: integer('El stock', 0, 100_000),
  rating: z.number().min(0, 'El rating va de 0 a 5').max(5, 'El rating va de 0 a 5'),
  reviews: integer('El número de reseñas', 0, 1_000_000),
  image: imageRef,
  description: text('La descripción', 10, 2000),
  specs: z.array(z.string().max(150, 'Cada especificación puede tener hasta 150 caracteres')).max(30, 'Máximo 30 especificaciones'),
  isActive: z.boolean().optional(),
}).superRefine((product, ctx) => {
  if (product.isActive && product.price <= 0) ctx.addIssue({ code: 'custom', path: ['price'], message: 'Para publicar el producto el precio debe ser mayor que cero' });
  if (product.originalPrice !== undefined && product.originalPrice <= product.price) ctx.addIssue({ code: 'custom', path: ['originalPrice'], message: 'El precio anterior debe ser mayor que el precio actual' });
});

export const labelSchema = (label: string, existing: string[]) => text(label, 2, 40)
  .regex(SAFE_LABEL, `${label} contiene caracteres no permitidos`)
  .refine(value => !existing.some(item => item.toLocaleLowerCase('es') === value.toLocaleLowerCase('es')), `${label} ya existe`);

export const couponSchema = (otherCodes: string[], isNew: boolean) => z.object({
  code: z.string().trim().toUpperCase()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(20, 'El código no puede superar 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'El código solo admite letras, números, guiones y guion bajo (sin espacios)')
    .refine(code => !otherCodes.includes(code), 'Ya existe un cupón con ese código'),
  type: z.enum(['porcentaje', 'fijo']),
  value: z.number({ error: 'El descuento debe ser un número' }).refine(Number.isFinite, 'El descuento debe ser un número').positive('El descuento debe ser mayor que cero'),
  minOrder: money('La compra mínima'),
  uses: integer('Los usos', 0, 1_000_000),
  maxUses: integer('El límite de usos', 1, 1_000_000),
  expiry: z.string().refine(value => !value || !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), 'La fecha de vencimiento no es válida'),
  active: z.boolean(),
}).superRefine((coupon, ctx) => {
  if (coupon.type === 'porcentaje' && coupon.value > 100) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Un descuento porcentual no puede superar 100%' });
  if (coupon.type === 'fijo' && coupon.minOrder > 0 && coupon.value >= coupon.minOrder) ctx.addIssue({ code: 'custom', path: ['value'], message: 'El descuento fijo debe ser menor que la compra mínima' });
  if (coupon.maxUses < coupon.uses) ctx.addIssue({ code: 'custom', path: ['maxUses'], message: `El límite no puede ser menor que los usos ya canjeados (${coupon.uses})` });
  if (isNew && coupon.expiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(`${coupon.expiry}T00:00:00`) < today) ctx.addIssue({ code: 'custom', path: ['expiry'], message: 'La fecha de vencimiento no puede estar en el pasado' });
  }
});

export const customerSchema = (otherEmails: string[]) => z.object({
  name: personName('El nombre'),
  email: email().refine(value => !otherEmails.includes(value), 'Ya existe un cliente con ese correo'),
  phone: optionalPhone,
  city,
  orders: integer('Los pedidos', 0, 1_000_000),
  totalSpent: money('El total gastado', 100_000_000),
  joined: z.string().max(100),
  status: z.enum(['Activo', 'Inactivo']),
});

const password = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña no puede superar 72 caracteres')
  .regex(/[A-Za-z]/, 'La contraseña debe incluir al menos una letra')
  .regex(/\d/, 'La contraseña debe incluir al menos un número');

export const administratorSchema = (isNew: boolean, otherUsernames: string[]) => z.object({
  name: personName('El nombre'),
  username: isNew
    ? z.string().trim().toLowerCase().min(3, 'El usuario debe tener al menos 3 caracteres').max(30, 'El usuario no puede superar 30 caracteres')
      .regex(/^[a-z0-9._-]+$/, 'El usuario solo admite letras, números, punto, guion y guion bajo')
      .refine(value => !otherUsernames.includes(value), 'Ese nombre de usuario ya está en uso')
    : z.string(),
  email: z.string().trim().toLowerCase().refine(value => !value || z.email().safeParse(value).success, 'El correo no tiene un formato válido'),
  password: isNew ? password : z.union([z.literal(''), password]),
  role: z.enum(['admin', 'editor']),
  isActive: z.boolean(),
});

export const orderSchema = z.looseObject({
  customer: personName('El nombre del cliente'),
  email: email('El correo del cliente'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio').regex(PHONE, 'El teléfono debe tener entre 7 y 20 dígitos (puede iniciar con +)'),
  city: text('La ciudad', 2, 60).regex(PERSON_NAME, 'La ciudad solo puede contener letras'),
  address: text('La dirección', 5, 200),
  notes: optionalText('Las notas', 500),
  status: z.enum(['Pendiente', 'Procesando', 'Enviado', 'Entregado', 'Cancelado']),
  items: z.array(z.object({
    productId: z.number(),
    name: z.string(),
    qty: integer('La cantidad', 1, 999),
    price: money('El precio'),
  })).min(1, 'Agrega al menos un producto al pedido'),
});

const numericString = (label: string, min: number, max: number) => z.string().trim()
  .min(1, `${label} es obligatorio`)
  .refine(value => Number.isFinite(Number(value)), `${label} debe ser un número`)
  .refine(value => Number(value) >= min && Number(value) <= max, `${label} debe estar entre ${min} y ${max.toLocaleString('es-PE')}`);

export const settingsSchema = z.looseObject({
  storeName: text('El nombre de la tienda', 2, 60),
  storeEmail: email('El correo de ventas'),
  storePhone: z.string().trim().min(1, 'El teléfono es obligatorio').regex(PHONE, 'El teléfono debe tener entre 7 y 20 dígitos (puede iniciar con +)'),
  storeAddress: text('La dirección', 5, 200),
  supportHours: text('El horario de atención', 3, 80),
  storeWebsite: z.string().trim().refine(value => !value || /^https?:\/\/[^\s.]+\.\S+$/i.test(value), 'La web debe ser una URL válida que empiece con http:// o https://'),
  freeShippingMin: numericString('El envío gratis', 0, 1_000_000),
  taxRate: numericString('El impuesto', 0, 100),
});

export type FieldErrors = Record<string, string>;
export type ValidationResult<T> = { ok: boolean; data?: T; errors: FieldErrors; messages: string[] };

/** Valida datos con un esquema y devuelve el primer error de cada campo. */
export function validate<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data, errors: {}, messages: [] };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : '_form';
    errors[key] ??= issue.message;
  }
  return { ok: false, errors, messages: [...new Set(Object.values(errors))] };
}
