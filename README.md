# TecomRed Monorepo

Proyecto organizado en dos aplicaciones:

- `frontend`: tienda web (React + Vite + TypeScript).
- `backend`: API (Express + TypeScript).

## Estructura

```text
tecomred/
├── frontend/
├── backend/
├── package.json
└── README.md
```

## Instalación

```bash
cd tecomred
npm install
npm --prefix frontend install
npm --prefix backend install
```

## Desarrollo

```bash
npm run dev
```

Servicios:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000/api/health`

## Scripts (raíz)

- `npm run dev`: ejecuta frontend + backend.
- `npm run dev:frontend`: solo frontend.
- `npm run dev:backend`: solo backend.
- `npm run build`: build de frontend y backend.
- `npm run lint`: lint de frontend y backend.

## Documentación por app

- Frontend: `frontend/README.md`
- Backend: `backend/README.md`
