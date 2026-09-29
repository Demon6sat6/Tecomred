/** Importa las 40 fotos locales como borradores sin inventar precios ni existencias.
 * Ejecutar desde backend: node scripts/import-public-products.mjs --replace-demo
 * Requiere MySQL local y una copia de seguridad previa de products.
 */
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

config();
const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../../frontend/public/productos_tienda_tecnologia_20');
const files = readdirSync(directory).filter(name => /^\d{2}_[a-z0-9_]+\.png$/.test(name)).sort();
if (files.length !== 40) throw new Error(`Se esperaban 40 fotos; se encontraron ${files.length}`);

const labels = {
  laptop_gaming: 'Laptop gaming', smartphone: 'Smartphone', monitor_msi: 'Monitor MSI',
  tablet: 'Tablet', impresora_multifuncional: 'Impresora multifuncional',
  teclado_mecanico: 'Teclado mecánico', mouse_gaming: 'Mouse gaming',
  proyector_portatil: 'Proyector portátil', audifonos_gaming: 'Audífonos gaming',
  microfono_usb: 'Micrófono USB', parlantes_estereo: 'Parlantes estéreo',
  refrigeracion_liquida: 'Refrigeración líquida', placa_madre: 'Placa madre',
  ssd_nvme: 'SSD NVMe', procesador: 'Procesador', ssd_sata: 'SSD SATA',
  memoria_ram_rgb: 'Memoria RAM RGB', ups_respaldo_energia: 'UPS de respaldo',
  nas_almacenamiento: 'NAS de almacenamiento', tarjeta_grafica: 'Tarjeta gráfica',
  case_gaming: 'Case gaming', smartwatch: 'Smartwatch', fuente_poder: 'Fuente de poder',
  parlante_bluetooth: 'Parlante Bluetooth', hub_usb_c: 'Hub USB-C',
  router_wifi: 'Router Wi-Fi', repetidor_wifi: 'Repetidor Wi-Fi',
  switch_red: 'Switch de red', camara_seguridad: 'Cámara de seguridad',
  teclado_mini_rgb: 'Teclado mini RGB', tableta_grafica: 'Tableta gráfica',
  webcam: 'Webcam', disco_externo: 'Disco externo',
  lector_codigo_barras: 'Lector de código de barras',
  impresora_termica: 'Impresora térmica', memoria_usb: 'Memoria USB',
  mini_pc: 'Mini PC', monitor_gaming: 'Monitor gaming',
  control_gaming: 'Control gaming', mochila_laptop: 'Mochila para laptop',
};
function category(slug) {
  if (slug.startsWith('laptop')) return 'Laptops';
  if (slug === 'smartphone') return 'Celulares';
  if (slug === 'tablet') return 'Tablets';
  if (slug.startsWith('monitor')) return 'Monitores';
  if (slug.startsWith('impresora')) return 'Impresoras';
  if (slug.startsWith('teclado')) return 'Teclados';
  if (slug.startsWith('mouse') || slug.startsWith('control')) return 'Mouse';
  if (slug.startsWith('proyector')) return 'Proyectores';
  if (['audifonos_gaming', 'microfono_usb', 'parlantes_estereo', 'parlante_bluetooth'].includes(slug)) return 'Audio';
  if (slug.startsWith('refrigeracion')) return 'Refrigeración';
  if (slug === 'placa_madre') return 'Placas Madre';
  if (slug.startsWith('ssd') || slug.startsWith('nas') || slug.startsWith('disco') || slug.startsWith('memoria_usb')) return 'Almacenamiento';
  if (slug === 'procesador') return 'Procesadores';
  if (slug.startsWith('ups')) return 'Energía';
  if (slug.startsWith('memoria_ram')) return 'Memorias RAM';
  if (slug === 'tarjeta_grafica') return 'Tarjetas Gráficas';
  if (slug.startsWith('case')) return 'Cases';
  if (slug === 'smartwatch') return 'Smartwatches';
  if (slug === 'fuente_poder') return 'Fuentes de Poder';
  if (slug.startsWith('router') || slug.startsWith('repetidor')) return 'Routers';
  if (slug.startsWith('switch')) return 'Switches';
  if (slug.startsWith('camara') || slug === 'webcam') return 'Cámaras';
  if (slug.startsWith('tableta_grafica')) return 'Tabletas Gráficas';
  if (slug.startsWith('lector')) return 'Lectores';
  if (slug === 'mini_pc') return 'Mini PC';
  if (slug.startsWith('mochila')) return 'Mochilas';
  return 'Accesorios';
}

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1', user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '', database: process.env.MYSQL_DATABASE || 'tecomred',
});
try {
  await connection.beginTransaction();
  if (process.argv.includes('--replace-demo')) {
    const [demo] = await connection.query('SELECT id, image FROM products WHERE id BETWEEN 1 AND 12 FOR UPDATE');
    if (demo.some(row => !/^\/uploads\/.*\.svg$/.test(row.image) && !/^https:\/\/images\.unsplash\.com\//.test(row.image))) {
      throw new Error('Los productos 1-12 ya no coinciden con los ejemplos; no se eliminaron');
    }
    const [references] = await connection.query('SELECT COUNT(*) AS total FROM order_items WHERE product_id BETWEEN 1 AND 12');
    if (references[0].total) throw new Error('Hay pedidos asociados a los productos de ejemplo; no se eliminaron');
    await connection.query('DELETE FROM products WHERE id BETWEEN 1 AND 12');
  }
  let created = 0;
  let mediaCreated = 0;
  for (const file of files) {
    const slug = file.replace(/^\d{2}_/, '').replace(/\.png$/, '');
    const name = labels[slug];
    if (!name) throw new Error(`Falta nombre para ${file}`);
    const image = `/productos_tienda_tecnologia_20/${file}`;
    const [existing] = await connection.query('SELECT id FROM products WHERE image = ? LIMIT 1', [image]);
    if (!existing.length) {
      await connection.query(
        `INSERT INTO products (name, category, price, image, description, specs, stock, rating, reviews, is_active)
         VALUES (?, ?, 0, ?, ?, JSON_ARRAY(), 0, 0, 0, 0)`,
        [name, category(slug), image, `${name}. Imagen de referencia; precio, disponibilidad y características pendientes de verificar.`]
      );
      created++;
    }
    const [existingMedia] = await connection.query('SELECT id FROM media WHERE url = ? LIMIT 1', [image]);
    if (!existingMedia.length) {
      await connection.query(
        'INSERT INTO media (filename, original_name, url, size_bytes, mime_type, alt_text) VALUES (?, ?, ?, ?, ?, ?)',
        [file, file, image, statSync(resolve(directory, file)).size, 'image/png', name]
      );
      mediaCreated++;
    }
  }
  await connection.commit();
  console.log(`Importación terminada: ${created} borradores y ${mediaCreated} imágenes de biblioteca creados de ${files.length} fotos.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
