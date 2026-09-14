import mysql, { type RowDataPacket } from "mysql2/promise";
import type { Order, OrderItem } from "../types/order.js";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || process.env.MYSQLHOST || "localhost",
  user: process.env.MYSQL_USER || process.env.MYSQLUSER || "root",
  password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || "",
  database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || "tecomred",
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

function generateFallbackOrders(): Order[] {
  const now = new Date();
  const formatOrderDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatOrderIso = (daysAgo: number, hours: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  return [
    { id: 'TR-001241', customer: 'Carlos Mendoza',   email: 'carlos@email.com',   phone: '+51 987 654 321', date: formatOrderDate(0), createdAt: formatOrderIso(0, 10), total: 2607.50, discount: 0, couponCode: '', status: 'Entregado',  city: 'Lima',          address: 'Av. Javier Prado 1234, San Isidro',    notes: '',                              items: [{ productId: 1, name: 'Switch Cisco Catalyst', qty: 1, price: 1820 }, { productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 787.50 }] },
    { id: 'TR-001240', customer: 'María González',   email: 'maria@email.com',    phone: '+51 956 789 012', date: formatOrderDate(1), createdAt: formatOrderIso(1, 14), total: 1927.50, discount: 0, couponCode: '', status: 'Enviado',    city: 'Arequipa',      address: 'Calle Mercaderes 234, Cercado',         notes: 'Entregar en recepción',         items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 1458.75 }, { productId: 5, name: 'RAM Kingston 32GB', qty: 1, price: 468.75 }] },
    { id: 'TR-001239', customer: 'Roberto Silva',    email: 'roberto@email.com',  phone: '+51 945 123 456', date: formatOrderDate(2), createdAt: formatOrderIso(2, 9),  total: 787.50,  discount: 0, couponCode: '', status: 'Procesando', city: 'Trujillo',      address: 'Jr. Pizarro 456, Centro',              notes: '',                              items: [{ productId: 2, name: 'Router MikroTik', qty: 1, price: 787.50 }] },
    { id: 'TR-001238', customer: 'Ana Rodríguez',    email: 'ana@email.com',      phone: '+51 934 567 890', date: formatOrderDate(3), createdAt: formatOrderIso(3, 16), total: 1458.75, discount: 0, couponCode: '', status: 'Pendiente',  city: 'Cusco',         address: 'Av. El Sol 789, Wanchaq',              notes: 'Llamar antes de entregar',      items: [{ productId: 4, name: 'Procesador Intel i7', qty: 1, price: 1458.75 }] },
    { id: 'TR-001237', customer: 'Luis Pérez',       email: 'luis@email.com',     phone: '+51 923 456 789', date: formatOrderDate(4), createdAt: formatOrderIso(4, 11), total: 555.00,  discount: 0, couponCode: '', status: 'Entregado',  city: 'Piura',         address: 'Av. Grau 321, Piura',                  notes: '',                              items: [{ productId: 3, name: 'Cable UTP Cat6', qty: 1, price: 243.75 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 168.75 }, { productId: 9, name: 'Switch TP-Link', qty: 1, price: 142.50 }] },
    { id: 'TR-001236', customer: 'Sofia Torres',     email: 'sofia@email.com',    phone: '+51 912 345 678', date: formatOrderDate(8), createdAt: formatOrderIso(8, 18), total: 367.50,  discount: 0, couponCode: '', status: 'Cancelado',  city: 'Chiclayo',      address: 'Av. Balta 654, Chiclayo',              notes: 'Cliente canceló',               items: [{ productId: 6, name: 'SSD Samsung 970', qty: 1, price: 367.50 }] },
    { id: 'TR-001235', customer: 'Diego Fernández',  email: 'diego@email.com',    phone: '+51 901 234 567', date: formatOrderDate(9), createdAt: formatOrderIso(9, 12), total: 2158.75, discount: 0, couponCode: '', status: 'Enviado',    city: 'Lima',          address: 'Av. La Marina 1500, San Miguel',        notes: '',                              items: [{ productId: 1, name: 'Switch Cisco', qty: 1, price: 1820 }, { productId: 10, name: 'Kit Herramientas', qty: 1, price: 168.75 }, { productId: 3, name: 'Cable UTP', qty: 1, price: 170 }] },
  ];
}

const fallbackOrders: Order[] = generateFallbackOrders();

export const ordersRepository = {
  async listOrders(): Promise<Order[]> {
    try {
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
    } catch {
      return fallbackOrders;
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    try {
      const [rows] = await pool.query<OrderRow[]>(
        "SELECT id, customer, email, phone, date, total, discount, coupon_code AS couponCode, status, city, address, notes, created_at AS createdAt FROM orders WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return fallbackOrders.find((o) => o.id === id) ?? null;
      const [items] = await pool.query<OrderItemRow[]>(
        "SELECT product_id AS productId, name, qty, price FROM order_items WHERE order_id = ? ORDER BY id",
        [id]
      );
      return { ...rows[0], items: items as OrderItem[] };
    } catch {
      return fallbackOrders.find((o) => o.id === id) ?? null;
    }
  },

  async createOrder(order: Order): Promise<Order> {
    const memIdx = fallbackOrders.findIndex((o) => o.id === order.id);
    if (memIdx !== -1) fallbackOrders[memIdx] = order;
    else fallbackOrders.unshift(order);

    try {
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
    } catch {
      return order;
    }
  },

  async updateOrderStatus(
    id: string,
    status: Order["status"]
  ): Promise<Order | null> {
    const memOrder = fallbackOrders.find((o) => o.id === id);
    if (memOrder) memOrder.status = status;

    try {
      const [result] = await pool.query(
        "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
        [status, id]
      );
      if ((result as any).affectedRows === 0 && !memOrder) return null;
      return this.getOrderById(id);
    } catch {
      return memOrder ?? null;
    }
  },

  async updateOrder(order: Order): Promise<Order | null> {
    const memIdx = fallbackOrders.findIndex((o) => o.id === order.id);
    if (memIdx !== -1) fallbackOrders[memIdx] = order;

    try {
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

        if ((result as any).affectedRows === 0 && memIdx === -1) {
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
    } catch {
      return memIdx !== -1 ? order : null;
    }
  },

  async deleteOrder(id: string): Promise<boolean> {
    let deleted = false;
    try {
      const [result] = await pool.query("DELETE FROM orders WHERE id = ?", [id]);
      if ((result as any).affectedRows > 0) deleted = true;
    } catch {}

    const index = fallbackOrders.findIndex((o) => o.id === id);
    if (index !== -1) {
      fallbackOrders.splice(index, 1);
      deleted = true;
    }
    return deleted;
  },
};