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
