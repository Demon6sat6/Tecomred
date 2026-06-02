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

const conn = await mysql.createConnection({
  host:     process.env.MYSQL_HOST     || 'localhost',
  user:     process.env.MYSQL_USER     || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'tecomred',
  multipleStatements: true,
});

console.log(`\n📦 Conectado a MySQL — base de datos: ${process.env.MYSQL_DATABASE || 'tecomred'}\n`);

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
