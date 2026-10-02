import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../config/mysql.js";
import type { Order, OrderItem } from "../types/order.js";
import { calculateCoupon, findCoupon } from "./couponsRepository.js";

export class InvalidCouponError extends Error {}

interface OrderRow extends RowDataPacket {
  id: string;
  customer: string;
  email: string;
  phone: string;
  date: string;
  total: number;
  discount: number;
  couponCode: string;
  status: Order["status"];
  city: string;
  address: string;
  notes: string;
  createdAt: string;
}

interface OrderItemRow extends RowDataPacket {
  productId: number;
  name: string;
  qty: number;
  price: number;
}

const orderColumns = "id, customer, email, phone, date, total, discount, coupon_code AS couponCode, status, city, address, notes, created_at AS createdAt";

async function attachItems(row: OrderRow): Promise<Order> {
  const [items] = await pool.execute<OrderItemRow[]>(
    "SELECT product_id AS productId, name, qty, price FROM order_items WHERE order_id = ? ORDER BY id",
    [row.id],
  );
  return { ...row, items: items as OrderItem[] };
}

export const ordersRepository = {
  async listOrders(): Promise<Order[]> {
    const [rows] = await pool.query<OrderRow[]>(`SELECT ${orderColumns} FROM orders ORDER BY created_at DESC`);
    return Promise.all(rows.map(attachItems));
  },

  async getOrderById(id: string): Promise<Order | null> {
    const [rows] = await pool.execute<OrderRow[]>(`SELECT ${orderColumns} FROM orders WHERE id = ?`, [id]);
    return rows.length ? attachItems(rows[0]) : null;
  },

  async createOrder(order: Order): Promise<Order> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      let couponId: number | null = null;
      if (order.couponCode) {
        const coupon = await findCoupon(order.couponCode, conn, true);
        const subtotal = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const validation = calculateCoupon(coupon, subtotal);
        if (!validation.valid || Math.abs(order.discount - validation.discount) > 0.01 || Math.abs(order.total - (subtotal - validation.discount)) > 0.01) {
          throw new InvalidCouponError(validation.valid ? "El total del cupón cambió. Vuelve a revisar el pedido." : validation.message);
        }
        couponId = coupon!.id;
      }
      await conn.execute(
        "INSERT INTO orders (id, customer, email, phone, date, total, discount, coupon_code, status, city, address, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [order.id, order.customer, order.email, order.phone, order.date, order.total, order.discount,
          order.couponCode, order.status, order.city, order.address, order.notes, new Date(order.createdAt)],
      );
      for (const item of order.items) {
        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)",
          [order.id, item.productId, item.name, item.qty, item.price],
        );
      }
      if (couponId !== null) {
        await conn.execute("UPDATE admin_records SET payload = JSON_SET(payload, '$.uses', CAST(JSON_EXTRACT(payload, '$.uses') AS UNSIGNED) + 1) WHERE id = ? AND kind = 'coupon'", [couponId]);
      }
      await conn.commit();
      return order;
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async updateOrderStatus(id: string, status: Order["status"]): Promise<Order | null> {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, id],
    );
    return result.affectedRows ? this.getOrderById(id) : null;
  },

  async updateOrder(order: Order): Promise<Order | null> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.execute<ResultSetHeader>(
        "UPDATE orders SET customer = ?, email = ?, phone = ?, date = ?, total = ?, discount = ?, coupon_code = ?, status = ?, city = ?, address = ?, notes = ?, updated_at = NOW() WHERE id = ?",
        [order.customer, order.email, order.phone, order.date, order.total, order.discount,
          order.couponCode, order.status, order.city, order.address, order.notes, order.id],
      );
      if (!result.affectedRows) {
        await conn.rollback();
        return null;
      }
      await conn.execute("DELETE FROM order_items WHERE order_id = ?", [order.id]);
      for (const item of order.items) {
        await conn.execute(
          "INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)",
          [order.id, item.productId, item.name, item.qty, item.price],
        );
      }
      await conn.commit();
      return this.getOrderById(order.id);
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM orders WHERE id = ?", [id]);
    return result.affectedRows > 0;
  },
};
