# WebWorlds

Single source of truth documentation for this repository.
Dokumen ini adalah sumber kebenaran tunggal untuk pengembangan WebWorlds.

## Project Overview / Ikhtisar Proyek

**English**
WebWorlds is a full-stack web gaming platform where users can create, publish, and play lightweight games in the browser. The system uses a Next.js App Router frontend and an Express + MongoDB backend, optimized for fast navigation, cache-aware data delivery, and clear mobile/desktop behavior.

**Bahasa Indonesia**
WebWorlds adalah platform game web full-stack untuk membuat, mempublikasikan, dan memainkan game ringan langsung dari browser. Sistem menggunakan frontend Next.js App Router dan backend Express + MongoDB, dengan fokus pada performa navigasi cepat, caching yang aman, dan perilaku mobile/desktop yang jelas.

## Current System State / Kondisi Sistem Saat Ini

- Frontend framework: `Next.js 16.1.6` (`frontend/package.json`)
- Frontend output mode: `standalone` (`frontend/next.config.ts`)
- Mobile route namespace: `/mobile/*`
- Legacy mobile compatibility: `/m/*` is redirected (HTTP 308) to `/mobile/*` (`frontend/src/proxy.ts`)
- Backend entrypoint: `backend/src/server.ts`
- Backend app factory: `backend/src/create-app.ts`
- Backend runtime build target: `backend/dist/server.js`
- API base behavior:
  - Client-side calls use `frontend/src/lib/api-client.ts`
  - Server-side calls use `frontend/src/lib/server-api-client.ts`
  - Frontend rewrite proxies `/api/:path*` to backend target from `NEXT_PUBLIC_API_URL` or `API_URL` (`frontend/next.config.ts`)

## Architecture and Repo Paths / Arsitektur dan Path Repo

### Root Layout

```text
WebWorlds/
  backend/     # Express + MongoDB API
  frontend/    # Next.js App Router UI
  shared/      # Shared area (currently minimal)
  README.md    # This document (single doc policy)
```

### Frontend Key Paths

- `frontend/src/app/`: App Router routes (desktop + mobile)
- `frontend/src/app/mobile/`: Mobile-specific route tree
- `frontend/src/proxy.ts`: Device-aware routing, `/mobile` rewrite, legacy `/m` redirect
- `frontend/src/lib/api-client.ts`: Browser/API client helpers
- `frontend/src/lib/server-api-client.ts`: Server-side fetch helpers
- `frontend/src/lib/lazy-with-retry.ts`: Dynamic import retry strategy
- `frontend/src/components/shared/ChunkRecovery.tsx`: Chunk load recovery UI

### Backend Key Paths

- `backend/src/create-app.ts`: Express app composition (middleware, routes, docs endpoint)
- `backend/src/server.ts`: Server startup, DB init, graceful shutdown
- `backend/src/routes/*.routes.ts`: Route definitions
- `backend/src/controllers/*.controller.ts`: Request handlers
- `backend/src/middleware/response-cache.ts`: Cache headers + in-memory response cache logic
- `backend/src/middleware/error-handler.ts`: AppError and global error handling
- `backend/src/services/database.service.ts`: Data access helpers

## How the System Works / Cara Kerja Sistem

### Request and Routing Flow / Alur Request dan Routing

1. User opens frontend route (`/` desktop or `/mobile/*` mobile).
2. `frontend/src/proxy.ts` decides desktop/mobile behavior:
   - Forces legacy `/m/*` to `/mobile/*` using redirect.
   - Uses cookie/user-agent for mobile rewrite when needed.
3. Frontend data fetching:
   - Server components call `server-api-client.ts`.
   - Client components/stores call `api-client.ts`.
4. `/api/:path*` can be rewritten to backend target via `frontend/next.config.ts`.
5. Backend (`create-app.ts`) validates security/cors/rate limit, then dispatches routes.

### Caching and Performance Behavior / Perilaku Caching dan Performa

- Frontend static chunks: immutable long cache
- Next image endpoint: short TTL + stale-while-revalidate
- Public backend GET endpoints use response cache middleware with route-specific TTL values
- Compression enabled on backend (`compression`)
- CSS preload warnings are treated as non-critical optimization hints (not runtime failures)

## Setup and Run Local / Setup dan Menjalankan Lokal

### Prerequisites

- Node.js `>=18`
- npm `>=9`
- MongoDB (local or cloud)

### 1) Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# or use .env.example as baseline
npm run dev
```

Frontend default local URL: `http://localhost:3000`

### 2) Backend Setup

```bash
cd backend
npm install
# copy env template manually if needed
npm run dev
```

Backend default local URL: `http://localhost:5000`
Health check: `http://localhost:5000/health`

### Environment Files Used / File Env yang Digunakan

- `frontend/.env.local.example`
- `frontend/.env.example`
- `backend/.env.example`

### Main Environment Variables / Variabel Environment Utama

**Frontend**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`
- `API_URL` (optional, server-side fallback)

**Backend**
- `NODE_ENV`
- `PORT`
- `HOST`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRY`
- `CORS_ORIGIN`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LIMIT_MAX_REQUESTS`
- `LOG_LEVEL`

## Build, Check, and Deploy / Build, Check, dan Deploy

### Frontend Commands

```bash
cd frontend
npm run dev
npm run lint
npm run build
npm run start
npm run analyze
```

### Backend Commands

```bash
cd backend
npm run dev
npm run type-check
npm run build
npm run start
npm run db:init
npm run db:seed
npm run db:reset
```

### Deployment Notes / Catatan Deploy

- Root `Procfile` starts backend from monorepo root context:
  - `web: cd backend && npm install --omit=dev && npm run build && npm start`
- `backend/Procfile` supports backend-only runtime context.
- `railway.json` deploy start command:
  - `cd backend && npm ci --omit=dev && npm run build && npm start`
- Frontend is configured for standalone output and can be deployed independently.

## API Surface Summary (Current) / Ringkasan API Aktif

Base URL: `/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)
- `GET /api/auth/profile/:id`

### Games

- `GET /api/games`
- `GET /api/games/:id`
- `GET /api/games/:id/like-status`
- `GET /api/games/creator/:creatorId`
- `POST /api/games` (auth required)
- `PUT /api/games/:id` (auth required)
- `DELETE /api/games/:id` (auth required)
- `POST /api/games/:id/publish` (auth required)
- `POST /api/games/:id/like` (auth required)
- `POST /api/games/:id/unlike` (auth required)

### Groups

- `GET /api/groups`
- `GET /api/groups/mine` (auth required)
- `GET /api/groups/:id`
- `POST /api/groups` (auth required)
- `POST /api/groups/:id/join` (auth required)
- `POST /api/groups/:id/leave` (auth required)

### Users

- `GET /api/users`

### Comments and Activities

- `GET /api/games/:gameId/comments`
- `POST /api/games/:gameId/comments` (auth required)
- `DELETE /api/comments/:commentId` (auth required)
- `POST /api/comments/:commentId/like` (auth required)
- `POST /api/comments/:commentId/unlike` (auth required)
- `GET /api/users/:userId/activities`

## Performance and Caching Notes / Catatan Performa dan Caching

**English**
- CSS preload warnings can appear due to route-level chunk preloading and are informational in this architecture.
- Keep preload strategy enabled; removing it can hurt navigation performance.
- Static chunk caching and image cache headers are explicitly configured in `frontend/next.config.ts`.
- Backend response cache middleware is applied to selected public GET routes for speed and lower DB load.

**Bahasa Indonesia**
- Warning preload CSS bisa muncul karena preloading chunk per route dan sifatnya informatif, bukan error fungsional.
- Strategi preload tetap dipertahankan karena membantu kecepatan navigasi.
- Cache untuk static chunk dan image sudah dikonfigurasi eksplisit di `frontend/next.config.ts`.
- Middleware cache respons backend dipasang pada endpoint GET publik tertentu untuk menurunkan beban database.

## Troubleshooting / Panduan Troubleshooting

### CORS blocked

- Ensure `CORS_ORIGIN` includes the exact frontend origin.
- In production, use full domain (including protocol), can be comma-separated in backend config.

### API not reachable from frontend

- Verify `NEXT_PUBLIC_API_URL` and optional `API_URL`.
- Confirm rewrite logic in `frontend/next.config.ts` resolves to backend `/api` path.

### Auth errors (401/403)

- Check token issuance (`/api/auth/login`) and Authorization header formatting.
- Confirm backend `JWT_SECRET` is set and stable.

### Build mismatch or path errors after refactor

- Re-check canonical paths in this README.
- Ensure imports use current filenames (`*.controller.ts`, `*.routes.ts`, `create-app.ts`, `/mobile` routes).

### Legacy mobile links still in use

- `/m/*` should auto-redirect to `/mobile/*`.
- If behavior differs, inspect `frontend/src/proxy.ts` deployment output.

## Contribution and Maintenance Rules / Aturan Kontribusi dan Pemeliharaan

1. **One-Readme Policy (mandatory):**
   - Only root `README.md` is allowed for project markdown documentation.
2. Do not add new project-level `.md` files unless policy is intentionally changed.
3. Keep this README aligned with real code/config state.
4. If architecture, routes, env, scripts, or deployment flow changes, update this README in the same PR/commit.
5. Prefer concise, operational, and verifiable documentation over historical narrative.

## License

MIT