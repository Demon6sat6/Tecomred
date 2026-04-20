# 🛒 TecomRed — Tienda de Redes y Componentes

Tienda e-commerce profesional especializada en equipos de red, componentes de computadoras y tecnología empresarial.

![TecomRed](https://img.shields.io/badge/React-19.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan) ![Vite](https://img.shields.io/badge/Vite-8.0-purple)

---

## ✨ Características Principales

### 🛍️ **E-commerce Completo**
- ✅ Catálogo de productos con filtros avanzados
- ✅ Carrito de compras con gestión de cantidades
- ✅ Proceso de checkout en 3 pasos
- ✅ Búsqueda en tiempo real
- ✅ Categorías organizadas
- ✅ Productos destacados y nuevos
- ✅ Sistema de badges (Nuevo, Oferta, Popular)

### 💬 **Chatbot Inteligente Profesional**
- ✅ Asistente virtual flotante
- ✅ **Muestra productos en cards interactivas**
- ✅ **Botón "Ver detalles" y "Agregar al carrito"**
- ✅ **Cards de información estructurada**
- ✅ **Botones de acción dinámicos**
- ✅ Respuestas rápidas predefinidas (4 botones)
- ✅ **20+ palabras clave reconocidas**
- ✅ **Búsqueda por categoría** (switches, routers, procesadores, etc.)
- ✅ **Búsqueda por tipo** (ofertas, nuevos, populares)
- ✅ Indicador de escritura animado
- ✅ Historial de conversación
- ✅ Integración con carrito de compras
- ✅ Toast notifications al agregar productos
- ✅ Diseño responsive y profesional

### 🎨 **Diseño Profesional**
- ✅ Tema oscuro moderno
- ✅ Gradientes azul/índigo
- ✅ Efectos glass morphism
- ✅ Animaciones suaves
- ✅ Scroll reveal
- ✅ Hover effects
- ✅ Skeleton loading

### 📱 **100% Responsive**
- ✅ Móvil (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ 4K (2560px+)
- ✅ Touch-friendly
- ✅ Menú hamburguesa en móvil

### 🚀 **UX Optimizada**
- ✅ Toast notifications al agregar al carrito
- ✅ Feedback visual inmediato
- ✅ Barra de anuncios rotativa
- ✅ Newsletter en footer
- ✅ Testimonios de clientes
- ✅ Carrusel de marcas
- ✅ Indicador de página activa

---

## 📦 Stack Tecnológico

```
Frontend:     React 19.2 + TypeScript 6.0
Build:        Vite 8.0
Estilos:      Tailwind CSS 4.0
Routing:      React Router 6
Iconos:       Lucide React
Estado:       Context API
Fuente:       Inter (Google Fonts)
```

---

## 🚀 Inicio Rápido

### Instalación

```bash
cd tecomred
npm install
```

### Desarrollo

```bash
npm run dev
```

Abre http://localhost:5173

### Build para Producción

```bash
npm run build
```

### Preview del Build

```bash
npm run preview
```

---

## 📂 Estructura del Proyecto

```
tecomred/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── AnnouncementBar.tsx   # Barra de anuncios
│   │   ├── BrandsBar.tsx         # Carrusel de marcas
│   │   ├── Chatbot.tsx           # 💬 Chatbot flotante
│   │   ├── Footer.tsx            # Footer con newsletter
│   │   ├── Navbar.tsx            # Navbar con dropdown
│   │   ├── ProductCard.tsx       # Card de producto
│   │   ├── Testimonials.tsx      # Testimonios
│   │   └── ToastContainer.tsx    # Notificaciones
│   │
│   ├── context/             # Context API
│   │   ├── CartContext.tsx       # Estado del carrito
│   │   └── ToastContext.tsx      # Estado de toasts
│   │
│   ├── data/                # Datos estáticos
│   │   └── products.ts           # Catálogo de productos
│   │
│   ├── hooks/               # Custom hooks
│   │   └── useScrollReveal.ts    # Animaciones scroll
│   │
│   ├── pages/               # Páginas principales
│   │   ├── Home.tsx              # Página de inicio
│   │   ├── Products.tsx          # Catálogo con filtros
│   │   ├── ProductDetail.tsx     # Detalle de producto
│   │   ├── Cart.tsx              # Carrito de compras
│   │   ├── Checkout.tsx          # Proceso de pago
│   │   └── Contact.tsx           # Formulario de contacto
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
│
├── public/                  # Assets estáticos
├── RESPONSIVE.md            # Guía de responsive
└── README.md                # Este archivo
```

---

## 💬 Chatbot — Características

### **Tipos de Mensajes**
1. **Texto simple** — Respuestas conversacionales
2. **Cards de productos** — Muestra productos con imagen, precio, rating y botones
3. **Cards de información** — Información estructurada (envío, pago, soporte)
4. **Botones de acción** — Navegación rápida por categorías

### **Búsqueda Inteligente**
El chatbot reconoce y muestra productos cuando escribes:
- `switch`, `switches` → Muestra switches disponibles
- `router`, `routers` → Muestra routers disponibles
- `procesador`, `cpu` → Muestra procesadores
- `memoria`, `ram` → Muestra memorias RAM
- `almacenamiento`, `ssd`, `disco` → Muestra opciones de almacenamiento
- `oferta`, `descuento` → Muestra productos en oferta
- `nuevo`, `novedad` → Muestra productos nuevos
- `producto`, `catalogo` → Muestra productos populares

### **Respuestas Rápidas (Botones)**
- 📦 **¿Tienen stock?** → Muestra productos populares
- 🚚 **Tiempos de envío** → Card con información de envío
- 💳 **Métodos de pago** → Card con opciones de pago
- 🎧 **Soporte técnico** → Card con datos de contacto

### **Acciones desde el Chat**
- **Ver detalles** 🔗 → Abre la página del producto
- **Agregar al carrito** 🛒 → Agrega directamente al carrito
- **Ver todos** → Link al catálogo completo

Ver `CHATBOT.md` para guía completa de uso.

---

## 🎨 Personalización

### Colores
Edita `src/index.css` para cambiar el gradiente principal:

```css
.gradient-brand {
  background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
}
```

### Productos
Edita `src/data/products.ts` para agregar/modificar productos.

### Categorías
Modifica el array `categories` en `src/data/products.ts`.

---

## 📱 Testing Responsive

### Chrome DevTools
1. Presiona `F12`
2. Presiona `Ctrl+Shift+M`
3. Selecciona dispositivo:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)

Ver `RESPONSIVE.md` para guía completa.

---

## 🌐 Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Home con hero, categorías, productos destacados |
| `/productos` | Catálogo con filtros y búsqueda |
| `/producto/:id` | Detalle de producto individual |
| `/carrito` | Carrito de compras |
| `/checkout` | Proceso de pago (3 pasos) |
| `/contacto` | Formulario de contacto |

---

## 🔧 Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Linter ESLint
```

---

## 📊 Métricas

- **Productos:** 12 productos de ejemplo
- **Categorías:** 10 categorías
- **Páginas:** 6 páginas principales
- **Componentes:** 15+ componentes reutilizables
- **Responsive:** 4 breakpoints (sm, md, lg, xl)
- **Bundle size:** ~321KB JS + ~59KB CSS (gzipped: ~95KB + ~10KB)

---

## 🚀 Próximas Mejoras

- [ ] Integración con backend real
- [ ] Sistema de autenticación
- [ ] Panel de administración
- [ ] Pasarela de pago real
- [ ] Sistema de reviews
- [ ] Wishlist / Favoritos
- [ ] Comparador de productos
- [ ] Filtros avanzados
- [ ] Búsqueda con Algolia
- [ ] Analytics

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👨‍💻 Desarrollo

Desarrollado con ❤️ usando React, TypeScript y Tailwind CSS.

**Características destacadas:**
- ✅ Chatbot inteligente con respuestas rápidas
- ✅ Diseño responsive completo
- ✅ Animaciones suaves
- ✅ UX optimizada
- ✅ Código limpio y mantenible

---

## 📞 Soporte

¿Necesitas ayuda? Usa el chatbot en la esquina inferior derecha o contáctanos:

- 📧 Email: info@tecomred.com
- 📱 Teléfono: +1 (234) 567-890
- 🌐 Web: http://localhost:5173

---

**¡Gracias por usar TecomRed!** 🎉
