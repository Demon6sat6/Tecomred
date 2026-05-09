import mysql, { type RowDataPacket } from "mysql2/promise";
import type { Order, OrderItem } from "../types/order.js";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Sat271227",
  database: process.env.MYSQL_DATABASE || "tecomred",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

export const ordersRepository = {
  async listOrders(): Promise<Order[]> {
    const [rows] = await pool.query<OrderRow[]>(
      "SELECT id, customer, email, phone, date, total, discount, coupon_code AS couponCode, status, city, address, notes, created_at AS createdAt FROM orders ORDER BY created_at DESC"
    );
    const orders = await Promise.all(
      rows.map(async (order) => {
        const [items] = await pool.query<OrderItemRow[]>(
          "SELECT product_id AS productId, name, qty, price FROM order_items WHERE order_id = ? ORDER BY id",
          [order.id]
        );
        return { ...order, items: items as OrderItem[] };
      })
    );
    return orders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    const [rows] = await pool.query<OrderRow[]>(
      "SELECT id, customer, email, phone, date, total, discount, coupon_code AS couponCode, status, city, address, notes, created_at AS createdAt FROM orders WHERE id = ?",
      [id]
    );
    if (rows.length === 0) return null;
    const [items] = await pool.query<OrderItemRow[]>(
      "SELECT product_id AS productId, name, qty, price FROM order_items WHERE order_id = ? ORDER BY id",
      [id]
    );
    return { ...rows[0], items: items as OrderItem[] };
  },

  async createOrder(order: Order): Promise<Order> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        "INSERT INTO orders (id, customer, email, phone, date, total, discount, coupon_code, status, city, address, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          order.id,
          order.customer,
          order.email,
          order.phone,
          order.date,
          order.total,
          order.discount,
          order.couponCode,
          order.status,
          order.city,
          order.address,
          order.notes,
          order.createdAt || new Date().toISOString(),
        ]
      );

      for (const item of order.items) {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)",
          [order.id, item.productId, item.name, item.qty, item.price]
        );
      }

      await conn.commit();
      return order;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateOrderStatus(
    id: string,
    status: Order["status"]
  ): Promise<Order | null> {
    const [result] = await pool.query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );
    if ((result as any).affectedRows === 0) return null;
    return this.getOrderById(id);
  },

  async updateOrder(order: Order): Promise<Order | null> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        "UPDATE orders SET customer = ?, email = ?, phone = ?, date = ?, total = ?, discount = ?, coupon_code = ?, status = ?, city = ?, address = ?, notes = ?, updated_at = NOW() WHERE id = ?",
        [
          order.customer,
          order.email,
          order.phone,
          order.date,
          order.total,
          order.discount,
          order.couponCode,
          order.status,
          order.city,
          order.address,
          order.notes,
          order.id,
        ]
      );

      if ((result as any).affectedRows === 0) {
        await conn.rollback();
        return null;
      }

      await conn.query("DELETE FROM order_items WHERE order_id = ?", [order.id]);
      for (const item of order.items) {
        await conn.query(
          "INSERT INTO order_items (order_id, product_id, name, qty, price) VALUES (?, ?, ?, ?, ?)",
          [order.id, item.productId, item.name, item.qty, item.price]
        );
      }

      await conn.commit();
      return order;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    const [result] = await pool.query("DELETE FROM orders WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  },
};