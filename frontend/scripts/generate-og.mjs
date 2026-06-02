/**
 * Genera /public/og-image.png (1200 × 630 px) para redes sociales.
 * Uso: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'og-image.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#030712"/>
      <stop offset="100%" stop-color="#0c1524"/>
    </linearGradient>
    <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#6366f1"/>
    </linearGradient>
    <linearGradient id="glow1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0ea5e9" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="glow2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#6366f1" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <!-- Fondo -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Glows decorativos -->
  <circle cx="1050" cy="100" r="350" fill="url(#glow1)"/>
  <circle cx="150"  cy="530" r="300" fill="url(#glow2)"/>

  <!-- Grid sutil -->
  <g stroke="#ffffff" stroke-opacity="0.03" stroke-width="1">
    <line x1="0"    y1="105" x2="1200" y2="105"/>
    <line x1="0"    y1="210" x2="1200" y2="210"/>
    <line x1="0"    y1="315" x2="1200" y2="315"/>
    <line x1="0"    y1="420" x2="1200" y2="420"/>
    <line x1="0"    y1="525" x2="1200" y2="525"/>
    <line x1="200"  y1="0"   x2="200"  y2="630"/>
    <line x1="400"  y1="0"   x2="400"  y2="630"/>
    <line x1="600"  y1="0"   x2="600"  y2="630"/>
    <line x1="800"  y1="0"   x2="800"  y2="630"/>
    <line x1="1000" y1="0"   x2="1000" y2="630"/>
  </g>

  <!-- Icono logo (wifi simplificado) -->
  <g transform="translate(80, 90)">
    <rect width="72" height="72" rx="18" fill="url(#brand)"/>
    <!-- wifi arcs -->
    <path d="M36 52 m-4 0 a4 4 0 0 1 8 0" fill="#fff" fill-opacity="0.95"/>
    <path d="M36 52 m-14 -8 a15 10 0 0 1 28 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity="0.9"/>
    <path d="M36 52 m-24 -16 a26 17 0 0 1 48 0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-opacity="0.6"/>
  </g>

  <!-- Nombre marca -->
  <text x="172" y="143" font-family="Arial, sans-serif" font-weight="900"
        font-size="52" fill="url(#brand)" letter-spacing="-1">TecomRed</text>

  <!-- Separador -->
  <rect x="80" y="188" width="400" height="3" rx="2" fill="url(#brand)" opacity="0.6"/>

  <!-- Tagline principal -->
  <text x="80" y="270" font-family="Arial, sans-serif" font-weight="800"
        font-size="58" fill="#ffffff" letter-spacing="-1">Tu tienda de redes</text>
  <text x="80" y="345" font-family="Arial, sans-serif" font-weight="800"
        font-size="58" fill="#ffffff" letter-spacing="-1">y componentes</text>

  <!-- Subtítulo -->
  <text x="80" y="410" font-family="Arial, sans-serif" font-weight="400"
        font-size="28" fill="#94a3b8">
    Switches · Routers · Procesadores · Almacenamiento
  </text>

  <!-- Badges -->
  <rect x="80"  y="460" width="180" height="44" rx="22" fill="#0ea5e9" fill-opacity="0.15"
        stroke="#0ea5e9" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="170" y="487" font-family="Arial, sans-serif" font-weight="600"
        font-size="20" fill="#38bdf8" text-anchor="middle">Envío gratis</text>

  <rect x="276" y="460" width="200" height="44" rx="22" fill="#6366f1" fill-opacity="0.15"
        stroke="#6366f1" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="376" y="487" font-family="Arial, sans-serif" font-weight="600"
        font-size="20" fill="#a5b4fc" text-anchor="middle">Garantía oficial</text>

  <rect x="492" y="460" width="220" height="44" rx="22" fill="#10b981" fill-opacity="0.15"
        stroke="#10b981" stroke-opacity="0.4" stroke-width="1.5"/>
  <text x="602" y="487" font-family="Arial, sans-serif" font-weight="600"
        font-size="20" fill="#34d399" text-anchor="middle">Soporte técnico</text>

  <!-- URL -->
  <text x="80" y="578" font-family="Arial, sans-serif" font-weight="500"
        font-size="24" fill="#475569">tecomred.pe</text>

  <!-- Elementos decorativos derecha -->
  <g opacity="0.12">
    <rect x="820" y="80"  width="300" height="160" rx="20" fill="none"
          stroke="url(#brand)" stroke-width="2"/>
    <rect x="860" y="120" width="220" height="30"  rx="6"  fill="#0ea5e9"/>
    <rect x="860" y="165" width="160" height="20"  rx="4"  fill="#6366f1"/>
    <rect x="860" y="197" width="180" height="20"  rx="4"  fill="#94a3b8"/>

    <rect x="840" y="280" width="340" height="200" rx="20" fill="none"
          stroke="url(#brand)" stroke-width="2"/>
    <rect x="870" y="310" width="80"  height="80"  rx="12" fill="#0ea5e9"/>
    <rect x="970" y="315" width="160" height="20"  rx="4"  fill="#94a3b8"/>
    <rect x="970" y="347" width="120" height="16"  rx="4"  fill="#475569"/>
    <rect x="970" y="375" width="140" height="14"  rx="4"  fill="#1e293b"/>

    <rect x="820" y="520" width="340" height="60"  rx="12" fill="url(#brand)" fill-opacity="0.3"/>
  </g>
</svg>
`;

try {
  await sharp(Buffer.from(svg)).resize(1200, 630).png({ compressionLevel: 9 }).toFile(OUT);
  console.log(`✅ og-image.png generado en: ${OUT}`);
} catch (err) {
  console.error('❌ Error generando og-image:', err.message);
  process.exit(1);
}
