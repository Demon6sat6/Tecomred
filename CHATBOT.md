# 💬 Guía del Chatbot Profesional — TecomRed

El chatbot de TecomRed es un asistente virtual inteligente que muestra productos, información y responde preguntas de forma profesional.

---

## 🎯 Características Profesionales

### 📦 **Mostrar Productos**
El chatbot muestra productos en cards interactivas con:
- ✅ Imagen del producto
- ✅ Nombre y categoría
- ✅ Rating con estrellas
- ✅ Precio destacado
- ✅ Botón "Ver detalles" (abre la página del producto)
- ✅ Botón "Agregar al carrito" (agrega directamente)

### 🎴 **Cards de Información**
Muestra información estructurada en cards profesionales:
- ✅ Título destacado
- ✅ Lista de items con label y valor
- ✅ Footer con nota adicional
- ✅ Diseño glass morphism

### 🔘 **Botones de Acción**
Botones interactivos para navegación rápida:
- ✅ Múltiples opciones
- ✅ Colores diferenciados
- ✅ Hover effects

---

## 🗣️ Comandos y Palabras Clave

### **Búsqueda de Productos**

| Escribe | El bot muestra |
|---------|----------------|
| `switch` o `switches` | Todos los switches disponibles |
| `router` o `routers` | Todos los routers disponibles |
| `procesador` o `cpu` | Procesadores en stock |
| `memoria` o `ram` | Memorias RAM disponibles |
| `almacenamiento`, `ssd`, `disco` | Opciones de almacenamiento |
| `producto`, `catalogo`, `ver` | Productos populares |
| `oferta`, `descuento`, `promocion` | Productos en oferta |
| `nuevo`, `novedad` | Productos recién llegados |

### **Información General**

| Escribe | El bot responde |
|---------|-----------------|
| `hola`, `buenos días`, `buenas` | Saludo de bienvenida |
| `precio`, `costo`, `cuanto` | Muestra botones de categorías |
| `gracias` | Mensaje de despedida |
| Cualquier otra cosa | Menú de opciones disponibles |

### **Respuestas Rápidas** (Botones)

Al abrir el chat, verás 4 botones:

1. **¿Tienen stock?** → Muestra productos populares con stock
2. **Tiempos de envío** → Card con información de envío
3. **Métodos de pago** → Card con opciones de pago
4. **Soporte técnico** → Card con datos de contacto

---

## 🎨 Tipos de Mensajes

### 1. **Mensaje de Texto**
```
Usuario: "Hola"
Bot: "¡Hola! 👋 ¿En qué puedo ayudarte?"
```

### 2. **Productos (Cards Interactivas)**
```
Usuario: "switches"
Bot: "Encontré estos switches para ti:"
[Card 1: Switch Cisco Catalyst]
  - Imagen
  - Nombre
  - Rating: ⭐ 4.8
  - Precio: $485.00
  - [Ver] [🛒]
[Card 2: Switch TP-Link]
  ...
[Ver todos los productos →]
```

### 3. **Card de Información**
```
Usuario: "Tiempos de envío"
Bot: [Card]
  🚚 Información de Envío
  ─────────────────────
  Envío estándar: 24-48 horas
  Envío express: 12-24 horas
  Envío gratis: Compras +$100
  Cobertura: Todo el país
  ─────────────────────
  Rastreo en tiempo real incluido
```

### 4. **Botones de Acción**
```
Usuario: "precio"
Bot: "¿Qué producto te interesa?"
[Ver Switches] [Ver Routers] [Ver todo]
```

---

## 🛒 Funcionalidades Integradas

### **Agregar al Carrito**
Desde el chatbot puedes agregar productos directamente:
1. El bot muestra productos
2. Haces clic en el botón 🛒
3. Aparece un toast de confirmación
4. El bot confirma: "✅ Producto agregado al carrito"

### **Ver Detalles**
Haz clic en el botón 🔗 para:
- Abrir la página del producto
- Ver especificaciones completas
- Leer reseñas
- Ver productos relacionados

### **Ir al Catálogo**
Al final de cada lista de productos:
- Link "Ver todos los productos →"
- Te lleva al catálogo completo
- El chat se cierra automáticamente

---

## 💡 Ejemplos de Uso

### **Ejemplo 1: Buscar Switches**
```
👤 Usuario: "Necesito un switch"
🤖 Bot: "Encontré estos switches para ti:"
     [Muestra 3 switches con imágenes y precios]
👤 Usuario: [Clic en 🛒 del Switch Cisco]
🤖 Bot: "✅ Switch Cisco Catalyst agregado al carrito"
```

### **Ejemplo 2: Ver Ofertas**
```
👤 Usuario: "¿Tienen ofertas?"
🤖 Bot: "🔥 ¡Tenemos estas ofertas especiales para ti!"
     [Muestra productos con descuento]
```

### **Ejemplo 3: Información de Envío**
```
👤 Usuario: [Clic en "Tiempos de envío"]
🤖 Bot: [Card con información detallada]
     🚚 Información de Envío
     - Envío estándar: 24-48 horas
     - Envío express: 12-24 horas
     - Envío gratis: Compras +$100
     - Cobertura: Todo el país
```

### **Ejemplo 4: Buscar por Categoría**
```
👤 Usuario: "Quiero ver procesadores"
🤖 Bot: "Tenemos estos procesadores en stock:"
     [Intel Core i7-13700K - $389.00]
     [Ver detalles] [Agregar 🛒]
```

---

## 🎨 Diseño Profesional

### **Colores y Estilos**
- **Header:** Gradiente azul/índigo
- **Mensajes del bot:** Fondo gris translúcido
- **Mensajes del usuario:** Gradiente azul
- **Cards de productos:** Glass morphism con hover effect
- **Botones:** Colores diferenciados por tipo

### **Animaciones**
- ✅ Slide-up al abrir
- ✅ Typing indicator (3 puntos)
- ✅ Smooth scroll
- ✅ Hover effects en cards
- ✅ Active states en botones

### **Responsive**
- **Móvil:** Ocupa casi toda la pantalla
- **Desktop:** Ventana de 420px de ancho
- **Altura:** 85vh en móvil, 600px en desktop

---

## 🔧 Personalización

### **Agregar Nuevas Palabras Clave**

Edita `src/components/Chatbot.tsx` en la función `handleSend`:

```typescript
else if (lowerMessage.includes('tu_palabra')) {
  addBotMessage({
    text: 'Tu respuesta aquí',
  });
  setTimeout(() => {
    const tusFiltrados = products.filter(p => p.category === 'TuCategoria');
    addBotMessage({
      type: 'products',
      data: tusFiltrados.slice(0, 3),
    });
  }, 500);
}
```

### **Agregar Nuevas Respuestas Rápidas**

Modifica el array `quickReplies`:

```typescript
const quickReplies = [
  { 
    icon: TuIcono, 
    text: 'Tu texto', 
    action: 'tu_accion'
  },
  // ...
];
```

### **Personalizar Cards**

Modifica el objeto `data` en `addBotMessage`:

```typescript
addBotMessage({
  type: 'card',
  data: {
    title: '🎯 Tu Título',
    items: [
      { label: 'Campo 1', value: 'Valor 1' },
      { label: 'Campo 2', value: 'Valor 2' },
    ],
    footer: 'Nota adicional',
  },
});
```

---

## 📊 Estadísticas

- **Palabras clave:** 20+ reconocidas
- **Categorías:** 10 categorías de productos
- **Tipos de mensaje:** 4 (texto, productos, cards, botones)
- **Respuestas rápidas:** 4 predefinidas
- **Productos por respuesta:** 3 máximo
- **Tiempo de respuesta:** 800-1200ms (simulado)

---

## 🚀 Próximas Mejoras

- [ ] Integración con IA real (OpenAI, Dialogflow)
- [ ] Historial persistente
- [ ] Búsqueda por precio
- [ ] Comparador de productos
- [ ] Recomendaciones personalizadas
- [ ] Soporte multiidioma
- [ ] Integración con WhatsApp
- [ ] Analytics de conversaciones

---

## 💬 Ejemplos de Conversaciones Completas

### **Conversación 1: Compra Rápida**
```
👤: "Hola"
🤖: "¡Hola! 👋 ¿En qué puedo ayudarte?"
👤: "Necesito un router"
🤖: "Estos son nuestros routers disponibles:"
    [MikroTik RB4011 - $210.00] [Ver] [🛒]
    [Ubiquiti EdgeRouter X - $59.00] [Ver] [🛒]
👤: [Clic en 🛒 del MikroTik]
🤖: "✅ Router MikroTik agregado al carrito"
👤: "Gracias"
🤖: "¡De nada! 😊 ¿Necesitas algo más?"
```

### **Conversación 2: Información**
```
👤: [Clic en "Métodos de pago"]
🤖: [Card]
    💳 Métodos de Pago
    Tarjetas: Visa, Mastercard, Amex
    Transferencia: Bancaria directa
    PayPal: Pago seguro
    Contra entrega: Zonas seleccionadas
    ─────────────────────
    Todos los pagos son 100% seguros
👤: "Perfecto, gracias"
🤖: "¡De nada! 😊"
```

---

**¡El chatbot está listo para atender a tus clientes de forma profesional!** 🎉💬
