/**
 * Aplica todas las migraciones y el seed inicial.
 * Uso: node scripts/db-setup.mjs [--seed]
 *
 * Flags:
 *   (sin flags)  Solo aplica migraciones
 *   --seed       Aplica migraciones + seed de productos
 *   --seed-only  Solo el seed (cuando las tablas ya existen)
 */

import mysql from 'mysql2/promise';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = resolve(__dirname, '../src/migrations');
const SEEDS      = resolve(__dirname, '../seeds');

const args      = process.argv.slice(2);
const runSeed   = args.includes('--seed') || args.includes('--seed-only');
const seedOnly  = args.includes('--seed-only');
const mysqlHost = process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost';
const mysqlUser = process.env.MYSQL_USER || process.env.MYSQLUSER || 'root';
const mysqlPassword = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '';
const mysqlDatabase = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'tecomred';

const conn = await mysql.createConnection({
  host:     mysqlHost,
  user:     mysqlUser,
  password: mysqlPassword,
  database: mysqlDatabase,
  multipleStatements: true,
});

console.log(`\n📦 Conectado a MySQL — base de datos: ${mysqlDatabase}\n`);

// ── Migraciones ──────────────────────────────────────────────
if (!seedOnly) {
  const files = readdirSync(MIGRATIONS)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`🔧 Aplicando ${files.length} migración(es):`);

  for (const file of files) {
    const sql = readFileSync(resolve(MIGRATIONS, file), 'utf8');
    try {
      await conn.query(sql);
      console.log(`   ✅ ${file}`);
    } catch (err) {
      console.error(`   ❌ ${file}: ${err.message}`);
      await conn.end();
      process.exit(1);
    }
  }
}

// ── Seeds ────────────────────────────────────────────────────
if (runSeed) {
  const files = readdirSync(SEEDS)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\n🌱 Aplicando ${files.length} seed(s):`);

  for (const file of files) {
    const sql = readFileSync(resolve(SEEDS, file), 'utf8');
    try {
      await conn.query(sql);
      console.log(`   ✅ ${file}`);
    } catch (err) {
      console.error(`   ❌ ${file}: ${err.message}`);
      await conn.end();
      process.exit(1);
    }
  }
}

await conn.end();
console.log('\n🚀 Base de datos lista.\n');
