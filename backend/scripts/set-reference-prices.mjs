/** Precios de partida orientativos para fotos sin modelo identificado.
 * No representan una oferta cerrada ni cambian existencias. Solo rellena precios 0.
 * Ejecutar desde backend: node scripts/set-reference-prices.mjs
 */
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();
const prices = {
  laptop_gaming: 2499, smartphone: 499, monitor_msi: 599, tablet: 399,
  impresora_multifuncional: 499, teclado_mecanico: 89, mouse_gaming: 49,
  proyector_portatil: 349, audifonos_gaming: 79, microfono_usb: 69,
  parlantes_estereo: 79, refrigeracion_liquida: 249, placa_madre: 299,
  ssd_nvme: 119, procesador: 449, ssd_sata: 89, memoria_ram_rgb: 149,
  ups_respaldo_energia: 199, nas_almacenamiento: 899, tarjeta_grafica: 899,
  case_gaming: 149, smartwatch: 99, fuente_poder: 169, parlante_bluetooth: 79,
  hub_usb_c: 49, router_wifi: 99, repetidor_wifi: 59, switch_red: 69,
  camara_seguridad: 99, teclado_mini_rgb: 69, tableta_grafica: 169,
  webcam: 79, disco_externo: 199, lector_codigo_barras: 129,
  impresora_termica: 199, memoria_usb: 25, mini_pc: 899,
  monitor_gaming: 799, control_gaming: 169, mochila_laptop: 99,
};

const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'tecomred',
});
try {
  await connection.beginTransaction();
  const [rows] = await connection.query(
    "SELECT id, image, price FROM products WHERE image LIKE '/productos_tienda_tecnologia_20/%' FOR UPDATE",
  );
  if (rows.length !== 40 || Object.keys(prices).length !== 40) throw new Error('Lote incompleto; no se modificó');
  let updated = 0;
  for (const row of rows) {
    const slug = row.image.match(/^\/productos_tienda_tecnologia_20\/\d{2}_([a-z0-9_]+)\.png$/)?.[1];
    if (!slug || !(slug in prices)) throw new Error(`Imagen inesperada para producto ${row.id}`);
    if (Number(row.price) > 0) continue;
    await connection.query(
      'UPDATE products SET price = ?, description = ? WHERE id = ? AND price = 0',
      [prices[slug], 'Imagen y precio referenciales. Confirma el modelo exacto, el precio final y la disponibilidad antes de comprar.', row.id],
    );
    updated++;
  }
  await connection.commit();
  console.log(`${updated} precios referenciales asignados; existencias conservadas.`);
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
