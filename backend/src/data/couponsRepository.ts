import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import pool from "../config/mysql.js";

export interface CouponRecord {
  code: string;
  type: "porcentaje" | "fijo";
  value: number;
  minOrder: number;
  uses: number;
  maxUses: number;
  expiry: string;
  active: boolean;
}

interface CouponRow extends RowDataPacket { id: number; payload: CouponRecord | string }

export async function findCoupon(code: string, connection: PoolConnection | typeof pool = pool, lock = false) {
  const [rows] = await connection.query<CouponRow[]>(
    `SELECT id, payload FROM admin_records WHERE kind = 'coupon' AND UPPER(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.code'))) = ? LIMIT 1 ${lock ? 'FOR UPDATE' : ''}`,
    [code.trim().toUpperCase()],
  );
  if (!rows.length) return null;
  const payload = typeof rows[0].payload === "string" ? JSON.parse(rows[0].payload) as CouponRecord : rows[0].payload;
  return { id: Number(rows[0].id), ...payload };
}

export function calculateCoupon(coupon: CouponRecord | null, subtotal: number) {
  if (!coupon) return { valid: false, discount: 0, message: "Cupón no encontrado" };
  if (!coupon.active) return { valid: false, discount: 0, message: "Este cupón no está activo" };
  if (coupon.uses >= coupon.maxUses) return { valid: false, discount: 0, message: "Cupón agotado" };
  if (coupon.expiry && new Date(`${coupon.expiry}T23:59:59`).getTime() < Date.now())
    return { valid: false, discount: 0, message: "Cupón expirado" };
  if (subtotal < coupon.minOrder)
    return { valid: false, discount: 0, message: `Compra mínima: S/${coupon.minOrder.toFixed(2)}` };
  const discount = coupon.type === "porcentaje"
    ? Math.round(subtotal * coupon.value) / 100
    : Math.min(coupon.value, subtotal);
  return { valid: true, discount, message: "Cupón aplicado" };
}
