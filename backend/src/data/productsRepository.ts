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

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: 'Switch Cisco Catalyst 2960-X 24 Puertos',
    category: 'Switches',
    price: 1820.00,
    originalPrice: 2325.00,
    image: '/products/cisco-2960.svg',
    description: 'Switch gestionable de 24 puertos Gigabit Ethernet ideal para redes empresariales medianas.',
    specs: ['24 puertos GbE', 'PoE+ 370W', 'Stacking hasta 8 unidades', 'IOS LAN Base'],
    stock: 12,
    rating: 4.8,
    reviews: 124,
    badge: 'Oferta',
    isActive: true,
  },
  {
    id: 2,
    name: 'Router MikroTik RB4011iGS+RM',
    category: 'Routers',
    price: 787.50,
    image: '/products/mikrotik-rb4011.svg',
    description: 'Router de alto rendimiento con 10 puertos Gigabit y SFP+ para conexiones de fibra.',
    specs: ['10 puertos GbE', '1 puerto SFP+', 'CPU Quad-core 1.4GHz', 'RouterOS L5'],
    stock: 8,
    rating: 4.7,
    reviews: 89,
    badge: 'Popular',
    isActive: true,
  },
  {
    id: 3,
    name: 'Cable UTP Cat6 Bobina 305m',
    category: 'Cables',
    price: 243.75,
    image: '/products/cable-cat6.svg',
    description: 'Cable UTP Cat6 de alta calidad para instalaciones de red estructurada.',
    specs: ['Cat6 UTP', '305 metros', 'Conductor 23AWG', 'CMR Riser'],
    stock: 45,
    rating: 4.6,
    reviews: 210,
    isActive: true,
  },
  {
    id: 4,
    name: 'Procesador Intel Core i7-13700K',
    category: 'Procesadores',
    price: 1458.75,
    originalPrice: 1687.50,
    image: '/products/intel-i7.svg',
    description: 'Procesador de 13ª generación con 16 núcleos para workstations y servidores.',
    specs: ['16 núcleos / 24 hilos', 'Hasta 5.4GHz', 'Socket LGA1700', 'TDP 125W'],
    stock: 6,
    rating: 4.9,
    reviews: 312,
    badge: 'Oferta',
    isActive: true,
  },
  {
    id: 5,
    name: 'Memoria RAM Kingston 32GB DDR5',
    category: 'Memorias RAM',
    price: 468.75,
    image: '/products/ram-kingston.svg',
    description: 'Módulo de memoria DDR5 de alta velocidad para sistemas de última generación.',
    specs: ['32GB DDR5', '5600MHz', 'CL36', 'XMP 3.0'],
    stock: 20,
    rating: 4.7,
    reviews: 156,
    badge: 'Nuevo',
    isActive: true,
  },
  {
    id: 6,
    name: 'SSD Samsung 970 EVO Plus 1TB',
    category: 'Almacenamiento',
    price: 367.50,
    originalPrice: 487.50,
    image: '/products/ssd-samsung.svg',
    description: 'SSD NVMe M.2 de alta velocidad para sistemas operativos y aplicaciones.',
    specs: ['1TB NVMe M.2', 'Lectura 3500MB/s', 'Escritura 3300MB/s', 'TLC V-NAND'],
    stock: 15,
    rating: 4.9,
    reviews: 445,
    badge: 'Popular',
    isActive: true,
  },
  {
    id: 7,
    name: 'Tarjeta de Red Intel X550-T2 10GbE',
    category: 'Tarjetas de Red',
    price: 656.25,
    image: '/products/nic-intel.svg',
    description: 'Tarjeta de red dual 10GbE para servidores y estaciones de trabajo de alto rendimiento.',
    specs: ['2 puertos 10GbE', 'PCIe 3.0 x4', 'iSCSI/FCoE', 'Compatible Linux/Windows'],
    stock: 9,
    rating: 4.6,
    reviews: 67,
    badge: 'Nuevo',
    isActive: true,
  },
  {
    id: 8,
    name: 'Access Point Ubiquiti UniFi U6 Pro',
    category: 'Access Points',
    price: 671.25,
    image: '/products/unifi-u6.svg',
    description: 'Access point WiFi 6 de alto rendimiento para entornos empresariales.',
    specs: ['WiFi 6 (802.11ax)', '4.8 Gbps', 'PoE+', '300+ clientes'],
    stock: 14,
    rating: 4.8,
    reviews: 198,
    badge: 'Popular',
    isActive: true,
  },
  {
    id: 9,
    name: 'Switch TP-Link TL-SG108E 8 Puertos',
    category: 'Switches',
    price: 142.50,
    image: '/products/tplink-sg108e.svg',
    description: 'Switch gestionable de 8 puertos Gigabit para pequeñas oficinas y hogares.',
    specs: ['8 puertos GbE', 'VLAN 802.1Q', 'QoS', 'Gestión web'],
    stock: 30,
    rating: 4.5,
    reviews: 320,
    isActive: true,
  },
  {
    id: 10,
    name: 'Kit Herramientas de Red Profesional',
    category: 'Herramientas',
    price: 168.75,
    image: '/products/tools-kit.svg',
    description: 'Kit completo para instalación y mantenimiento de redes estructuradas.',
    specs: ['Ponchadora RJ45/RJ11', 'Tester de cable', 'Pelacables', 'Destornilladores'],
    stock: 25,
    rating: 4.4,
    reviews: 88,
    badge: 'Nuevo',
    isActive: true,
  },
  {
    id: 11,
    name: 'Router Ubiquiti EdgeRouter X',
    category: 'Routers',
    price: 221.25,
    image: '/products/ubiquiti-edgerouter.svg',
    description: 'Router compacto de alto rendimiento con 5 puertos Gigabit.',
    specs: ['5 puertos GbE', 'PoE pasivo', '1M pps', 'EdgeOS'],
    stock: 18,
    rating: 4.6,
    reviews: 145,
    isActive: true,
  },
  {
    id: 12,
    name: 'SSD Kingston A400 480GB SATA',
    category: 'Almacenamiento',
    price: 157.50,
    originalPrice: 206.25,
    image: '/products/ssd-kingston.svg',
    description: 'SSD SATA económico para actualizar laptops y PCs de escritorio.',
    specs: ['480GB SATA III', 'Lectura 500MB/s', 'Escritura 450MB/s', 'Factor 2.5"'],
    stock: 40,
    rating: 4.5,
    reviews: 567,
    isActive: true,
  },
];

export const productsRepository = {
  async list(activeOnly = false): Promise<Product[]> {
    try {
      const where = activeOnly ? "WHERE is_active = 1" : "";
      const [rows] = await pool.query<ProductRow[]>(
        `SELECT * FROM products ${where} ORDER BY created_at DESC`
      );
      return rows.map(rowToProduct);
    } catch {
      return activeOnly ? fallbackProducts.filter(p => p.isActive) : fallbackProducts;
    }
  },

  async getById(id: number): Promise<Product | null> {
    try {
      const [rows] = await pool.query<ProductRow[]>(
        "SELECT * FROM products WHERE id = ?", [id]
      );
      return rows.length ? rowToProduct(rows[0]) : null;
    } catch {
      return fallbackProducts.find(p => p.id === id) ?? null;
    }
  },

  async create(input: ProductInput): Promise<Product> {
    try {
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
    } catch {
      const newProduct: Product = {
        id: Date.now(),
        ...input,
        isActive: input.isActive !== false,
      };
      fallbackProducts.unshift(newProduct);
      return newProduct;
    }
  },

  async update(id: number, input: ProductInput): Promise<Product | null> {
    try {
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
    } catch {
      const index = fallbackProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        fallbackProducts[index] = {
          ...fallbackProducts[index],
          ...input,
          isActive: input.isActive !== false,
        };
        return fallbackProducts[index];
      }
      return null;
    }
  },

  async remove(id: number): Promise<boolean> {
    try {
      const [result] = await pool.query("DELETE FROM products WHERE id=?", [id]);
      return (result as any).affectedRows > 0;
    } catch {
      const index = fallbackProducts.findIndex(p => p.id === id);
      if (index !== -1) {
        fallbackProducts.splice(index, 1);
        return true;
      }
      return false;
    }
  },
};
