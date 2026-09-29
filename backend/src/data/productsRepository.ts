import pool from "../config/mysql.js";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { Product, ProductInput } from "../types/product.js";

interface ProductRow extends RowDataPacket {
  id: number; name: string; category: string; price: number;
  original_price: number | null; image: string; description: string;
  specs: unknown; stock: number; rating: number; reviews: number;
  badge: string | null; is_active: number;
}

function rowToProduct(row: ProductRow): Product {
  const specs = typeof row.specs === "string" ? JSON.parse(row.specs) : row.specs;
  return {
    id: row.id, name: row.name, category: row.category,
    price: Number(row.price), originalPrice: row.original_price == null ? undefined : Number(row.original_price),
    image: row.image, description: row.description,
    specs: Array.isArray(specs) ? specs : [], stock: row.stock,
    rating: Number(row.rating), reviews: row.reviews,
    badge: (row.badge as Product["badge"]) ?? undefined,
    isActive: Boolean(row.is_active),
  };
}

export const productsRepository = {
  async list(activeOnly = false): Promise<Product[]> {
    const [rows] = await pool.query<ProductRow[]>(
      `SELECT * FROM products ${activeOnly ? "WHERE is_active = 1" : ""} ORDER BY created_at DESC, id DESC`
    );
    return rows.map(rowToProduct);
  },
  async getById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<ProductRow[]>("SELECT * FROM products WHERE id = ?", [id]);
    return rows.length ? rowToProduct(rows[0]) : null;
  },
  async create(input: ProductInput): Promise<Product> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (name, category, price, original_price, image, description, specs, stock, rating, reviews, badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.name, input.category, input.price, input.originalPrice ?? null, input.image,
       input.description, JSON.stringify(input.specs), input.stock, input.rating,
       input.reviews, input.badge ?? null, input.isActive ? 1 : 0]
    );
    const created = await this.getById(result.insertId);
    if (!created) throw new Error("Producto creado pero no encontrado");
    return created;
  },
  async update(id: number, input: ProductInput): Promise<Product | null> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE products SET name=?, category=?, price=?, original_price=?, image=?, description=?,
       specs=?, stock=?, rating=?, reviews=?, badge=?, is_active=? WHERE id=?`,
      [input.name, input.category, input.price, input.originalPrice ?? null, input.image,
       input.description, JSON.stringify(input.specs), input.stock, input.rating,
       input.reviews, input.badge ?? null, input.isActive ? 1 : 0, id]
    );
    return result.affectedRows ? this.getById(id) : null;
  },
  async remove(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM products WHERE id=?", [id]);
    return result.affectedRows > 0;
  },
};
