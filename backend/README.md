# TecomRed Backend

Backend base para producción con Express + TypeScript.

## Scripts

- `npm run dev`: inicia API en modo desarrollo
- `npm run build`: compila a `dist`
- `npm run start`: ejecuta API compilada

## Variables de entorno

1. Copia `.env.example` como `.env`.
2. Ajusta valores según entorno.

Variables actuales:

- `NODE_ENV`: `development|test|production`
- `PORT`: puerto API (default `4000`)
- `CORS_ORIGIN`: origen permitido para frontend

## Endpoints iniciales

- `GET /api`: estado básico del servicio
- `GET /api/health`: healthcheck con timestamp
- `POST /api/auth/login`: login admin (retorna token API)
- `GET /api/orders`: listar pedidos (requiere `Authorization: Bearer <token>`)
- `POST /api/orders`: crear pedido (requiere token)
- `PATCH /api/orders/:id/status`: actualizar estado de pedido (requiere token)

## Catálogo de productos

MySQL (`products`) es la fuente de verdad del catálogo. `GET /api/products` devuelve
todos los productos para el panel; `GET /api/products?active=true` devuelve los
publicados. Crear, actualizar y eliminar requieren autorización de administrador.
Si MySQL falla, la API devuelve un error y el navegador muestra el problema;
no se sirven productos de ejemplo desde memoria ni `localStorage`.

Las 40 imágenes de `frontend/public/productos_tienda_tecnologia_20` se importan
una sola vez con `node scripts/import-public-products.mjs`. El comando es
idempotente por ruta de imagen y las registra también en la biblioteca de medios
del panel. Para retirar los 12 productos de ejemplo de una
base local, primero guarda una copia de la tabla `products` y ejecuta
`node scripts/import-public-products.mjs --replace-demo`. Esta opción comprueba
que los registros 1–12 aún son los ejemplos y que no tienen pedidos asociados.

Las fichas importadas son **borradores** (`is_active=0`, precio y stock en 0):
las fotos y nombres de archivo no confirman modelo, precio ni disponibilidad.
Completa esos datos en el panel y marca «Publicar en la tienda». La API exige
un precio mayor que cero para publicar. La tienda y el carrito refrescan el
catálogo desde la API aproximadamente cada cinco segundos mientras la pestaña
está visible. `node scripts/verify-catalog.mjs` comprueba crear, publicar,
listar y eliminar un producto temporal contra la API y MySQL locales.
