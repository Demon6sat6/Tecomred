import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outDir = existsSync('frontend/public')
  ? 'frontend/public/products'
  : 'tecomred/frontend/public/products';

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

// Helper for sleek SVG wrapper
function wrapSvg(content, width = 600, height = 450) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1120" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>
    <linearGradient id="gridGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2" />
      <stop offset="50%" stop-color="#818cf8" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#c084fc" stop-opacity="0.2" />
    </linearGradient>
    <radialGradient id="cardGlow" cx="50%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#050811" stop-opacity="0" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <circle cx="${width/2}" cy="${height/2 - 20}" r="180" fill="url(#cardGlow)" />
  
  <!-- Subtle technical grid background -->
  <g stroke="#ffffff" stroke-opacity="0.04" stroke-width="1">
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="0" y1="${i * 50}" x2="${width}" y2="${i * 50}" />`).join('')}
    ${Array.from({ length: 13 }).map((_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${height}" />`).join('')}
  </g>
  ${content}
</svg>`;
}

// 1. Cisco 2960-X Switch
const ciscoSvg = wrapSvg(`
  <!-- Chassis -->
  <rect x="50" y="160" width="500" height="120" rx="10" fill="#1e293b" stroke="#334155" stroke-width="3" />
  <rect x="50" y="160" width="500" height="24" rx="6" fill="#0f172a" />
  
  <!-- Rack Ears -->
  <path d="M35 170 h15 v100 h-15 a4 4 0 0 1 -4 -4 v-92 a4 4 0 0 1 4 -4 z" fill="#334155" />
  <circle cx="42" cy="190" r="5" fill="#64748b" />
  <circle cx="42" cy="250" r="5" fill="#64748b" />
  <path d="M550 170 h15 a4 4 0 0 1 4 4 v92 a4 4 0 0 1 -4 4 h-15 z" fill="#334155" />
  <circle cx="558" cy="190" r="5" fill="#64748b" />
  <circle cx="558" cy="250" r="5" fill="#64748b" />

  <!-- Cisco Logo & Label -->
  <text x="80" y="177" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="13" letter-spacing="2">CISCO</text>
  <text x="145" y="177" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="11">Catalyst 2960-X Series 24-Port Gigabit</text>
  <circle cx="70" cy="173" r="3" fill="#10b981" filter="url(#glow)" />

  <!-- 24 RJ45 Ports in 2 rows of 12 -->
  <g transform="translate(80, 200)">
    ${Array.from({ length: 12 }).map((_, i) => `
      <!-- Top Port -->
      <rect x="${i * 26}" y="0" width="22" height="18" rx="2" fill="#090d16" stroke="#475569" stroke-width="1.2" />
      <circle cx="${i * 26 + 11}" cy="-4" r="2" fill="${i % 3 === 0 ? '#10b981' : '#38bdf8'}" />
      <rect x="${i * 26 + 4}" y="3" width="14" height="10" rx="1" fill="#1e293b" />
      <line x1="${i * 26 + 7}" y1="3" x2="${i * 26 + 7}" y2="7" stroke="#e2e8f0" stroke-width="0.8" />
      <line x1="${i * 26 + 11}" y1="3" x2="${i * 26 + 11}" y2="7" stroke="#e2e8f0" stroke-width="0.8" />
      <line x1="${i * 26 + 15}" y1="3" x2="${i * 26 + 15}" y2="7" stroke="#e2e8f0" stroke-width="0.8" />

      <!-- Bottom Port -->
      <rect x="${i * 26}" y="24" width="22" height="18" rx="2" fill="#090d16" stroke="#475569" stroke-width="1.2" />
      <circle cx="${i * 26 + 11}" cy="46" r="2" fill="${i % 2 === 0 ? '#10b981' : '#f59e0b'}" />
      <rect x="${i * 26 + 4}" y="27" width="14" height="10" rx="1" fill="#1e293b" />
      <line x1="${i * 26 + 7}" y1="33" x2="${i * 26 + 7}" y2="37" stroke="#e2e8f0" stroke-width="0.8" />
      <line x1="${i * 26 + 11}" y1="33" x2="${i * 26 + 11}" y2="37" stroke="#e2e8f0" stroke-width="0.8" />
      <line x1="${i * 26 + 15}" y1="33" x2="${i * 26 + 15}" y2="37" stroke="#e2e8f0" stroke-width="0.8" />
    `).join('')}
  </g>

  <!-- 4 SFP Uplink Ports -->
  <g transform="translate(425, 204)">
    <rect x="0" y="0" width="30" height="38" rx="3" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
    <rect x="40" y="0" width="30" height="38" rx="3" fill="#020617" stroke="#38bdf8" stroke-width="1.5" />
    <text x="7" y="24" fill="#38bdf8" font-family="monospace" font-size="9" font-weight="bold">SFP1</text>
    <text x="47" y="24" fill="#38bdf8" font-family="monospace" font-size="9" font-weight="bold">SFP2</text>
    <circle cx="15" cy="-5" r="2.5" fill="#10b981" filter="url(#glow)" />
    <circle cx="55" cy="-5" r="2.5" fill="#10b981" filter="url(#glow)" />
  </g>

  <!-- Badge Info -->
  <rect x="180" y="320" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="343" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">24x Gigabit PoE+ | 4x 10G SFP+</text>
`);

// 2. MikroTik RB4011 Router
const mikrotikSvg = wrapSvg(`
  <!-- Chassis -->
  <rect x="90" y="150" width="420" height="150" rx="8" fill="#111827" stroke="#374151" stroke-width="3" />
  <rect x="90" y="150" width="420" height="26" rx="6" fill="#1f2937" />
  
  <text x="110" y="168" fill="#ef4444" font-family="system-ui, sans-serif" font-weight="900" font-size="14" letter-spacing="1">MikroTik</text>
  <text x="185" y="168" fill="#cbd5e1" font-family="system-ui, sans-serif" font-weight="600" font-size="11">RouterBOARD RB4011iGS+RM</text>
  <circle cx="490" cy="163" r="3.5" fill="#10b981" filter="url(#glow)" />

  <!-- 10 GbE Ports -->
  <g transform="translate(115, 195)">
    ${Array.from({ length: 10 }).map((_, i) => `
      <rect x="${i * 28}" y="0" width="24" height="28" rx="2" fill="#030712" stroke="#4b5563" stroke-width="1" />
      <circle cx="${i * 28 + 12}" cy="34" r="2" fill="${i === 0 ? '#3b82f6' : '#10b981'}" />
      <text x="${i * 28 + 12}" y="20" fill="#9ca3af" font-family="system-ui" font-size="9" text-anchor="middle">${i + 1}</text>
    `).join('')}
  </g>

  <!-- 10G SFP+ Cage -->
  <g transform="translate(420, 195)">
    <rect x="0" y="0" width="48" height="34" rx="3" fill="#030712" stroke="#ef4444" stroke-width="1.5" />
    <text x="24" y="22" fill="#ef4444" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">10G SFP+</text>
    <circle cx="24" cy="42" r="2.5" fill="#ef4444" filter="url(#glow)" />
  </g>

  <!-- Cooling Fins Representation -->
  <g stroke="#374151" stroke-width="2">
    ${Array.from({ length: 24 }).map((_, i) => `<line x1="${110 + i * 16}" y1="260" x2="${110 + i * 16}" y2="285" />`).join('')}
  </g>

  <!-- Badge -->
  <rect x="190" y="335" width="220" height="36" rx="18" fill="#1e293b" stroke="#ef4444" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="358" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Quad-Core 1.4GHz | 10G SFP+</text>
`);

// 3. Cable Cat6 UTP 305m
const cableSvg = wrapSvg(`
  <!-- Box / Reel -->
  <rect x="170" y="110" width="260" height="230" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
  
  <!-- Handle -->
  <rect x="250" y="80" width="100" height="40" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
  <rect x="265" y="95" width="70" height="15" rx="4" fill="#1e293b" />

  <!-- Box graphics -->
  <circle cx="300" cy="220" r="65" fill="#0f172a" stroke="#334155" stroke-width="3" />
  <circle cx="300" cy="220" r="30" fill="#020617" />
  <path d="M300 190 Q340 220 300 250" stroke="#38bdf8" stroke-width="6" fill="none" stroke-linecap="round" />

  <!-- Cable coming out of hole -->
  <path d="M300 220 C240 280, 160 260, 120 320 C100 350, 140 390, 200 370" stroke="#0284c7" stroke-width="10" fill="none" stroke-linecap="round" />
  
  <!-- RJ45 connector head -->
  <rect x="190" y="355" width="45" height="30" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="2" transform="rotate(-15 190 355)" />
  <rect x="230" y="360" width="8" height="18" fill="#f59e0b" transform="rotate(-15 190 355)" />

  <text x="300" y="150" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle">CAT6 UTP</text>
  <text x="300" y="170" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">BOBINA 305 METROS</text>

  <!-- Badge -->
  <rect x="180" y="375" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="398" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">100% Cobre | 23AWG Gigabit</text>
`);

// 4. Intel Core i7-13700K CPU
const intelCpuSvg = wrapSvg(`
  <!-- Substrate PCB -->
  <rect x="160" y="90" width="280" height="280" rx="14" fill="#047857" stroke="#10b981" stroke-width="3" />
  
  <!-- Alignment notches -->
  <circle cx="160" cy="190" r="8" fill="#0b1120" />
  <circle cx="160" cy="270" r="8" fill="#0b1120" />
  <circle cx="440" cy="190" r="8" fill="#0b1120" />
  <circle cx="440" cy="270" r="8" fill="#0b1120" />
  <polygon points="175,105 195,105 175,125" fill="#f59e0b" />

  <!-- Heat Spreader (IHS) -->
  <rect x="190" y="120" width="220" height="220" rx="8" fill="#94a3b8" stroke="#cbd5e1" stroke-width="3" />
  <rect x="200" y="130" width="200" height="200" rx="6" fill="#64748b" />

  <!-- Intel Branding -->
  <text x="300" y="180" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="28" text-anchor="middle" letter-spacing="-1">intel</text>
  <text x="300" y="215" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="800" font-size="20" text-anchor="middle">CORE i7</text>
  <text x="300" y="240" fill="#e2e8f0" font-family="system-ui, sans-serif" font-weight="600" font-size="13" text-anchor="middle">i7-13700K</text>
  <text x="300" y="265" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">SRMB8 3.40GHZ</text>
  <text x="300" y="285" fill="#94a3b8" font-family="monospace" font-size="10" text-anchor="middle">LGA1700 UNLOCKED</text>

  <!-- Gold contacts preview -->
  <g fill="#f59e0b" opacity="0.6">
    <circle cx="180" cy="150" r="2" /><circle cx="180" cy="165" r="2" /><circle cx="180" cy="180" r="2" />
    <circle cx="420" cy="150" r="2" /><circle cx="420" cy="165" r="2" /><circle cx="420" cy="180" r="2" />
  </g>

  <!-- Badge -->
  <rect x="180" y="390" width="240" height="34" rx="17" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="412" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">16 Cores | 24 Threads | 5.4GHz</text>
`);

// 5. Kingston Fury DDR5 RAM
const ramSvg = wrapSvg(`
  <!-- PCB -->
  <rect x="60" y="170" width="480" height="130" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2" />

  <!-- Heat spreader shield -->
  <path d="M70 170 h460 l-15 45 h-430 z" fill="#1e293b" stroke="#475569" stroke-width="1" />
  <rect x="70" y="210" width="460" height="65" fill="#111827" stroke="#334155" stroke-width="1" />

  <!-- RGB Lightbar at the top -->
  <rect x="80" y="165" width="440" height="12" rx="4" fill="url(#gridGlow)" filter="url(#glow)" />

  <!-- Kingston Fury Logo -->
  <text x="140" y="245" fill="#ef4444" font-family="system-ui, sans-serif" font-weight="900" font-size="20" letter-spacing="2">FURY</text>
  <text x="215" y="245" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="16">BEAST</text>
  <text x="370" y="245" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="700" font-size="14">DDR5 32GB</text>
  <text x="370" y="262" fill="#94a3b8" font-family="monospace" font-size="11">5600MT/s CL36 XMP 3.0</text>

  <!-- Gold Pins (Bottom edge) -->
  <g fill="#f59e0b">
    ${Array.from({ length: 48 }).map((_, i) => `
      <rect x="${75 + i * 9.5}" y="278" width="5.5" height="18" rx="1" />
    `).join('')}
  </g>
  <!-- Center Key Notch -->
  <rect x="300" y="274" width="12" height="24" rx="2" fill="#050811" />

  <!-- Badge -->
  <rect x="180" y="340" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="363" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">32GB Dual Channel | 5600MHz</text>
`);

// 6. Samsung 970 EVO Plus M.2 NVMe SSD
const ssdSamsungSvg = wrapSvg(`
  <!-- M.2 PCB -->
  <rect x="90" y="160" width="420" height="130" rx="8" fill="#044e36" stroke="#059669" stroke-width="2.5" />
  
  <!-- Mount screw notch -->
  <circle cx="90" cy="225" r="10" fill="#050811" stroke="#059669" stroke-width="2" />
  <circle cx="90" cy="225" r="5" fill="#050811" />

  <!-- Gold M-Key pins -->
  <g fill="#f59e0b" transform="translate(480, 170)">
    ${Array.from({ length: 14 }).map((_, i) => `<rect x="${i * 2}" y="0" width="1.5" height="24" />`).join('')}
    <rect x="9" y="0" width="4" height="24" fill="#044e36" />
    ${Array.from({ length: 14 }).map((_, i) => `<rect x="${i * 2}" y="85" width="1.5" height="24" />`).join('')}
  </g>

  <!-- Black Heat Label -->
  <rect x="130" y="175" width="330" height="100" rx="4" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
  
  <text x="150" y="210" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="18">SAMSUNG</text>
  <text x="250" y="210" fill="#ef4444" font-family="system-ui, sans-serif" font-weight="800" font-size="14">V-NAND SSD</text>
  <text x="150" y="240" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="800" font-size="20">970 EVO Plus</text>
  <text x="320" y="240" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="800" font-size="22">1TB</text>
  <text x="150" y="260" fill="#94a3b8" font-family="monospace" font-size="11">NVMe M.2 2280 | PCIe Gen 3.0 x4</text>

  <!-- NAND Chips visible -->
  <rect x="375" y="185" width="70" height="80" rx="2" fill="#1e293b" stroke="#334155" />
  <circle cx="385" cy="195" r="2" fill="#64748b" />

  <!-- Badge -->
  <rect x="180" y="340" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="363" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Lectura 3500MB/s | NVMe 1TB</text>
`);

// 7. Intel X550-T2 10GbE Network Card
const nicIntelSvg = wrapSvg(`
  <!-- PCIe PCB -->
  <rect x="130" y="130" width="340" height="190" rx="8" fill="#064e3b" stroke="#10b981" stroke-width="2.5" />
  
  <!-- Metal Bracket -->
  <rect x="95" y="80" width="35" height="260" rx="4" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2" />
  <!-- RJ45 10G ports on bracket -->
  <rect x="100" y="140" width="25" height="32" rx="2" fill="#020617" stroke="#334155" />
  <circle cx="120" cy="135" r="2.5" fill="#10b981" filter="url(#glow)" />
  <rect x="100" y="185" width="25" height="32" rx="2" fill="#020617" stroke="#334155" />
  <circle cx="120" cy="180" r="2.5" fill="#10b981" filter="url(#glow)" />

  <!-- Black Heatsink over Controller -->
  <rect x="230" y="155" width="130" height="120" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
  <!-- Heatsink fins -->
  <g stroke="#334155" stroke-width="3">
    ${Array.from({ length: 9 }).map((_, i) => `<line x1="${242 + i * 13}" y1="165" x2="${242 + i * 13}" y2="265" />`).join('')}
  </g>
  <text x="295" y="215" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="16" text-anchor="middle">intel</text>
  <text x="295" y="235" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">10GbE</text>

  <!-- PCIe x4 Gold edge -->
  <g fill="#f59e0b" transform="translate(160, 320)">
    ${Array.from({ length: 32 }).map((_, i) => `<rect x="${i * 6}" y="0" width="3.5" height="20" rx="1" />`).join('')}
  </g>

  <!-- Badge -->
  <rect x="180" y="370" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="393" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Dual Port 10GbE | PCIe 3.0</text>
`);

// 8. Ubiquiti UniFi U6 Pro AP
const unifiSvg = wrapSvg(`
  <!-- Round Dome -->
  <circle cx="300" cy="200" r="130" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3" />
  <circle cx="300" cy="200" r="126" fill="#f1f5f9" />
  
  <!-- Subtle inner bevel -->
  <circle cx="300" cy="200" r="115" fill="#f8fafc" />

  <!-- Ubiquiti Glowing Blue Ring -->
  <circle cx="300" cy="200" r="45" fill="none" stroke="#38bdf8" stroke-width="4.5" filter="url(#glow)" />
  <circle cx="300" cy="200" r="45" fill="none" stroke="#0284c7" stroke-width="3" />

  <!-- UniFi Logo in Center -->
  <text x="300" y="196" fill="#0284c7" font-family="system-ui, sans-serif" font-weight="900" font-size="18" text-anchor="middle">U</text>
  <text x="300" y="210" fill="#64748b" font-family="system-ui, sans-serif" font-weight="700" font-size="9" text-anchor="middle">UniFi 6</text>

  <!-- WiFi 6 Arcs -->
  <g stroke="#38bdf8" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6">
    <path d="M260 110 A 60 60 0 0 1 340 110" />
    <path d="M240 95 A 85 85 0 0 1 360 95" />
  </g>

  <!-- Badge -->
  <rect x="180" y="360" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="383" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">WiFi 6 AX5400 | 300+ Clientes</text>
`);

// 9. TP-Link TL-SG108E Switch
const tplinkSvg = wrapSvg(`
  <!-- Metal Case -->
  <rect x="110" y="160" width="380" height="130" rx="8" fill="#1e293b" stroke="#475569" stroke-width="3" />
  <rect x="110" y="160" width="380" height="24" rx="6" fill="#0f172a" />
  
  <text x="130" y="177" fill="#10b981" font-family="system-ui, sans-serif" font-weight="900" font-size="13">tp-link</text>
  <text x="185" y="177" fill="#94a3b8" font-family="system-ui, sans-serif" font-weight="600" font-size="11">TL-SG108E 8-Port Gigabit Easy Smart</text>
  <circle cx="470" cy="172" r="3" fill="#10b981" filter="url(#glow)" />

  <!-- 8 Gigabit Ports -->
  <g transform="translate(135, 205)">
    ${Array.from({ length: 8 }).map((_, i) => `
      <rect x="${i * 42}" y="0" width="32" height="34" rx="3" fill="#030712" stroke="#64748b" stroke-width="1.5" />
      <circle cx="${i * 42 + 16}" cy="44" r="2.5" fill="#10b981" />
      <text x="${i * 42 + 16}" y="22" fill="#cbd5e1" font-family="system-ui" font-size="11" font-weight="bold" text-anchor="middle">${i + 1}</text>
    `).join('')}
  </g>

  <!-- Badge -->
  <rect x="180" y="340" width="240" height="36" rx="18" fill="#1e293b" stroke="#10b981" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="363" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">8x Gigabit | VLAN | QoS | Web</text>
`);

// 10. Kit Herramientas de Red
const toolsSvg = wrapSvg(`
  <!-- Tool Case Base -->
  <rect x="100" y="100" width="400" height="260" rx="16" fill="#0f172a" stroke="#334155" stroke-width="3" />
  
  <!-- Heavy Duty Crimper Tool -->
  <path d="M140 130 L220 250 L200 320" stroke="#ef4444" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M220 250 L280 320" stroke="#ef4444" stroke-width="18" stroke-linecap="round" fill="none" />
  <rect x="130" y="120" width="60" height="50" rx="6" fill="#475569" stroke="#94a3b8" stroke-width="2" />
  <circle cx="160" cy="145" r="8" fill="#0f172a" />

  <!-- Cable Tester Unit -->
  <rect x="320" y="140" width="90" height="160" rx="8" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
  <rect x="335" y="155" width="60" height="30" rx="3" fill="#020617" />
  <text x="365" y="174" fill="#38bdf8" font-family="system-ui" font-weight="bold" font-size="10" text-anchor="middle">TESTER</text>
  
  <!-- LED sequence lights on tester -->
  <g transform="translate(345, 195)">
    ${Array.from({ length: 8 }).map((_, i) => `
      <circle cx="10" cy="${i * 11}" r="3" fill="${i < 4 ? '#10b981' : '#64748b'}" />
      <text x="25" y="${i * 11 + 3}" fill="#94a3b8" font-family="monospace" font-size="8">${i + 1}</text>
    `).join('')}
  </g>

  <!-- Wire Stripper -->
  <rect x="230" y="140" width="60" height="40" rx="8" fill="#f59e0b" stroke="#d97706" stroke-width="2" />
  <circle cx="260" cy="160" r="10" fill="#0f172a" />

  <!-- Badge -->
  <rect x="180" y="380" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="403" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">Crimpadora + Tester + Pelacables</text>
`);

// 11. EdgeRouter X
const edgeRouterSvg = wrapSvg(`
  <!-- Metal Case -->
  <rect x="130" y="150" width="340" height="150" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" />
  
  <text x="155" y="180" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="15" letter-spacing="1">EdgeRouter X</text>
  <text x="375" y="180" fill="#64748b" font-family="monospace" font-size="11">ER-X</text>

  <!-- 5 Gigabit Ports with PoE in/out -->
  <g transform="translate(155, 210)">
    ${Array.from({ length: 5 }).map((_, i) => `
      <rect x="${i * 58}" y="0" width="46" height="38" rx="3" fill="#020617" stroke="${i === 0 ? '#38bdf8' : i === 4 ? '#10b981' : '#475569'}" stroke-width="1.5" />
      <circle cx="${i * 58 + 23}" cy="48" r="2.5" fill="${i === 0 ? '#38bdf8' : '#10b981'}" />
      <text x="${i * 58 + 23}" y="18" fill="#cbd5e1" font-family="system-ui" font-size="10" font-weight="bold" text-anchor="middle">eth${i}</text>
      <text x="${i * 58 + 23}" y="30" fill="${i === 0 ? '#38bdf8' : i === 4 ? '#10b981' : '#64748b'}" font-family="system-ui" font-size="8" text-anchor="middle">${i === 0 ? 'PoE In' : i === 4 ? 'PoE Out' : 'Data'}</text>
    `).join('')}
  </g>

  <!-- Badge -->
  <rect x="180" y="340" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="363" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">5x GbE | Dual-Core | EdgeOS</text>
`);

// 12. Kingston A400 2.5" SATA SSD
const ssdKingstonSvg = wrapSvg(`
  <!-- 2.5" Metal Casing -->
  <rect x="150" y="110" width="300" height="230" rx="12" fill="#1f2937" stroke="#374151" stroke-width="3" />
  
  <!-- Screws in corners -->
  <circle cx="165" cy="125" r="3.5" fill="#64748b" />
  <circle cx="435" cy="125" r="3.5" fill="#64748b" />
  <circle cx="165" cy="325" r="3.5" fill="#64748b" />
  <circle cx="435" cy="325" r="3.5" fill="#64748b" />

  <!-- Label area -->
  <rect x="175" y="145" width="250" height="160" rx="6" fill="#111827" stroke="#334155" stroke-width="1.5" />
  
  <!-- Kingston Red Mask Icon -->
  <path d="M205 175 C205 165, 220 160, 225 170 C230 160, 245 165, 245 175 C245 190, 225 205, 225 205 C225 205, 205 190, 205 175 Z" fill="#ef4444" />
  <text x="260" y="195" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="900" font-size="20">Kingston</text>

  <text x="300" y="240" fill="#38bdf8" font-family="system-ui, sans-serif" font-weight="900" font-size="32" text-anchor="middle">A400</text>
  <text x="300" y="270" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="16" text-anchor="middle">480GB SATA 2.5"</text>
  <text x="300" y="292" fill="#94a3b8" font-family="monospace" font-size="11" text-anchor="middle">SATA Rev 3.0 (6Gb/s)</text>

  <!-- Badge -->
  <rect x="180" y="370" width="240" height="36" rx="18" fill="#1e293b" stroke="#38bdf8" stroke-opacity="0.4" stroke-width="1.5" />
  <text x="300" y="393" fill="#f8fafc" font-family="system-ui, sans-serif" font-weight="700" font-size="12" text-anchor="middle">500MB/s Lectura | SATA III</text>
`);

writeFileSync(join(outDir, 'cisco-2960.svg'), ciscoSvg);
writeFileSync(join(outDir, 'mikrotik-rb4011.svg'), mikrotikSvg);
writeFileSync(join(outDir, 'cable-cat6.svg'), cableSvg);
writeFileSync(join(outDir, 'intel-i7.svg'), intelCpuSvg);
writeFileSync(join(outDir, 'ram-kingston.svg'), ramSvg);
writeFileSync(join(outDir, 'ssd-samsung.svg'), ssdSamsungSvg);
writeFileSync(join(outDir, 'nic-intel.svg'), nicIntelSvg);
writeFileSync(join(outDir, 'unifi-u6.svg'), unifiSvg);
writeFileSync(join(outDir, 'tplink-sg108e.svg'), tplinkSvg);
writeFileSync(join(outDir, 'tools-kit.svg'), toolsSvg);
writeFileSync(join(outDir, 'ubiquiti-edgerouter.svg'), edgeRouterSvg);
writeFileSync(join(outDir, 'ssd-kingston.svg'), ssdKingstonSvg);

console.log('✅ 12 High-tech product SVGs generated successfully in', outDir);
