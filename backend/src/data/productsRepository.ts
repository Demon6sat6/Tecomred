import mysql, { type RowDataPacket } from "mysql2/promise";
import type { Product, ProductInput } from "../types/product.js";

const pool = mysql.createPool({
  host:             process.env.MYSQL_HOST || process.env.MYSQLHOST || "localhost",
  user:             process.env.MYSQL_USER || process.env.MYSQLUSER || "root",
  password:         process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || "",
  database:         process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || "tecomred",
  waitForConnections: true,
  connectionLimit:  10,
});

interface ProductRow extends RowDataPacket {
  id: number;
  name: string;
  category: string;
  price: number;
  original_price: number | null;
  image: string;
  description: string;
  specs: string;
  stock: number;
  rating: number;
  reviews: number;
  badge: string | null;
  is_active: number;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id:            row.id,
    name:          row.name,
    category:      row.category,
    price:         Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    image:         row.image,
    description:   row.description,
    specs:         JSON.parse(row.specs || "[]"),
    stock:         row.stock,
    rating:        Number(row.rating),
    reviews:       row.reviews,
    badge:         (row.badge as Product["badge"]) ?? undefined,
    isActive:      Boolean(row.is_active),
  };
}

export const productsRepository = {
  async list(activeOnly = false): Promise<Product[]> {
    const where = activeOnly ? "WHERE is_active = 1" : "";
    const [rows] = await pool.query<ProductRow[]>(
      `SELECT * FROM products ${where} ORDER BY created_at DESC`
    );
    return rows.map(rowToProduct);
  },

  async getById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<ProductRow[]>(
      "SELECT * FROM products WHERE id = ?", [id]
    );
    return rows.length ? rowToProduct(rows[0]) : null;
  },

  async create(input: ProductInput): Promise<Product> {
    const [result] = await pool.query(
      `INSERT INTO products
         (name, category, price, original_price, image, description, specs, stock, rating, reviews, badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.name, input.category, input.price,
        input.originalPrice ?? null,
        input.image, input.description,
        JSON.stringify(input.specs),
        input.stock, input.rating ?? 4.5, input.reviews ?? 0,
        input.badge ?? null,
        input.isActive !== false ? 1 : 0,
      ]
    );
    const id = (result as any).insertId;
    return (await this.getById(id))!;
  },

  async update(id: number, input: ProductInput): Promise<Product | null> {
    const [result] = await pool.query(
      `UPDATE products SET
         name=?, category=?, price=?, original_price=?, image=?, description=?,
         specs=?, stock=?, rating=?, reviews=?, badge=?, is_active=?
       WHERE id=?`,
      [
        input.name, input.category, input.price,
        input.originalPrice ?? null,
        input.image, input.description,
        JSON.stringify(input.specs),
        input.stock, input.rating ?? 4.5, input.reviews ?? 0,
        input.badge ?? null,
        input.isActive !== false ? 1 : 0,
        id,
      ]
    );
    if ((result as any).affectedRows === 0) return null;
    return this.getById(id);
  },

  async remove(id: number): Promise<boolean> {
    const [result] = await pool.query("DELETE FROM products WHERE id=?", [id]);
    return (result as any).affectedRows > 0;
  },
};
