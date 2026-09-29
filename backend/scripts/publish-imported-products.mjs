/** Hace visibles únicamente las fichas importadas de las 40 fotos locales.
 * No cambia precios ni existencias. Ejecutar desde backend.
 */
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();
const connection = await mysql.createConnection({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'tecomred',
});

try {
  await connection.beginTransaction();
  const [rows] = await connection.query(
    "SELECT id, image, price, stock FROM products WHERE image LIKE '/productos_tienda_tecnologia_20/%' FOR UPDATE",
  );
  if (rows.length !== 40 || rows.some(row => !/^\/productos_tienda_tecnologia_20\/\d{2}_[a-z0-9_]+\.png$/.test(row.image))) {
    throw new Error('El lote importado no coincide con las 40 imágenes esperadas; no se modificó');
  }
  await connection.query(
    "UPDATE products SET is_active = 1 WHERE image LIKE '/productos_tienda_tecnologia_20/%' AND is_active = 0",
  );
  await connection.commit();
  console.log('40 productos importados visibles. Precios y existencias conservados.');
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
