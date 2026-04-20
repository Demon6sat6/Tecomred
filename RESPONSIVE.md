# 📱 Guía de Visualización Responsive — TecomRed

La tienda **TecomRed** está completamente optimizada para verse perfecta en cualquier dispositivo.

## 🖥️ Pantalla Completa (Desktop)

**Resoluciones soportadas:** 1920x1080, 2560x1440, 3840x2160 (4K)

### Características Desktop:
- Navbar con menú desplegable de categorías
- Hero con imagen de producto a la derecha
- Grid de 4 columnas en productos destacados
- Grid de 6 columnas en categorías
- Sidebar de filtros visible permanentemente
- Carrito con resumen sticky
- Footer con 4 columnas

### Cómo ver:
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador en pantalla completa.

---

## 📱 Móvil (Mobile)

**Resoluciones soportadas:** 375x667 (iPhone SE), 390x844 (iPhone 12/13), 414x896 (iPhone 11 Pro Max)

### Características Móvil:
- Navbar compacto con menú hamburguesa
- Hero con texto centrado (imagen oculta)
- Grid de 1 columna en productos
- Grid de 2 columnas en categorías
- Filtros colapsables con botón
- Carrito con layout vertical
- Footer con 2 columnas
- Toast notifications adaptadas
- Barra de anuncios con texto más pequeño
- Botones y textos optimizados para touch

### Cómo probar en Chrome DevTools:
1. Abre http://localhost:5173
2. Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
3. Presiona `Ctrl+Shift+M` o haz clic en el ícono de dispositivo móvil
4. Selecciona un dispositivo:
   - iPhone SE (375x667)
   - iPhone 12 Pro (390x844)
   - Pixel 5 (393x851)
   - Samsung Galaxy S20 Ultra (412x915)

---

## 📲 Tablet

**Resoluciones soportadas:** 768x1024 (iPad), 820x1180 (iPad Air), 1024x1366 (iPad Pro)

### Características Tablet:
- Navbar completo (sin hamburguesa)
- Hero con imagen visible
- Grid de 2 columnas en productos
- Grid de 3 columnas en categorías
- Filtros en sidebar
- Layout híbrido entre móvil y desktop

### Cómo probar:
En Chrome DevTools, selecciona:
- iPad (768x1024)
- iPad Air (820x1180)
- iPad Pro (1024x1366)

---

## 🎯 Breakpoints de Tailwind

La tienda usa los breakpoints estándar de Tailwind CSS:

```
sm:  640px   → Móvil grande / Tablet pequeña
md:  768px   → Tablet
lg:  1024px  → Laptop
xl:  1280px  → Desktop
2xl: 1536px  → Desktop grande
```

---

## ✅ Checklist de Responsive

### Componentes optimizados:
- ✅ AnnouncementBar — Texto adaptado, botones táctiles
- ✅ Navbar — Menú hamburguesa en móvil
- ✅ Hero — Layout vertical en móvil, horizontal en desktop
- ✅ ProductCard — Tamaños de imagen y texto adaptados
- ✅ BrandsBar — Velocidad de marquee ajustada
- ✅ Testimonials — 1 columna móvil, 3 desktop
- ✅ Footer — 2 columnas móvil, 4 desktop
- ✅ Cart — Layout vertical en móvil
- ✅ Checkout — Formularios apilados en móvil
- ✅ ToastContainer — Posición y tamaño adaptados
- ✅ Products (filtros) — Sidebar colapsable en móvil

---

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## 📐 Tamaños de Fuente Responsive

```css
/* Móvil → Desktop */
text-xs    → text-sm
text-sm    → text-base
text-base  → text-lg
text-lg    → text-xl
text-xl    → text-2xl
text-2xl   → text-3xl
text-3xl   → text-4xl
```

---

## 🎨 Espaciado Responsive

```css
/* Móvil → Desktop */
p-3   → p-4   → p-6
gap-2 → gap-3 → gap-4
mb-4  → mb-6  → mb-8
py-8  → py-12 → py-16
```

---

## 💡 Tips para Testing

1. **Prueba en modo retrato y paisaje** en móvil
2. **Verifica el touch target** — mínimo 44x44px
3. **Revisa el scroll horizontal** — no debe existir
4. **Prueba la navegación táctil** — menús, botones, links
5. **Verifica las imágenes** — deben cargar rápido y verse bien
6. **Prueba el carrito** — agregar/quitar productos
7. **Revisa los formularios** — inputs deben ser fáciles de tocar

---

## 🌐 Navegadores Soportados

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Chrome Mobile
- ✅ Safari iOS

---

**¡La tienda está lista para cualquier dispositivo!** 🎉
