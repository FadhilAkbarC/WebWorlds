# WebWorlds All-In-One README (AI Development Reference)

This document is the single source of truth for AI-driven development on WebWorlds. It describes the architecture, performance model, and the exact guardrails you must follow to keep the system fast, stable, and scalable.

## 1. System Goals (Non-Negotiable)
- Instant-perceived loads on mobile and desktop.
- Zero chunk 404s and zero ChunkLoadError in production.
- Minimal client JavaScript on first load.
- Stable caching with safe invalidation.
- Clear split between mobile and desktop UI.

## 2. Architecture Overview
- Frontend: Next.js App Router (React 18), output `standalone`.
- Backend: Express + MongoDB (Mongoose).
- Device routing: server-side proxy + `/m` mobile routes.
- Caching layers:
  - Browser + CDN caching for static assets.
  - Next.js fetch caching + ISR for server-rendered pages.
  - Backend in-memory cache for hot data and response caching for public GET routes.

## 3. Repo Layout
- `frontend/`
  - `src/app/`: App Router pages (server by default; client only when needed)
  - `src/components/desktop`: Desktop UI
  - `src/components/mobile`: Mobile UI
  - `src/components/shared`: Shared UI + resilience utilities
  - `src/lib/`: API clients (client + server)
  - `src/stores/`: Zustand stores
  - `src/proxy.ts`: Device-aware route rewrite (mobile/desktop)
- `backend/`
  - `src/app.ts`: Express app
  - `src/routes/`: API routes
  - `src/controllers/`: Route handlers
  - `src/services/database.service.ts`: cached DB access
  - `src/middleware/responseCache.ts`: response-level cache + cache headers

## 4. Mobile/Desktop Separation (Hard Rule)
- Mobile routes live under `/m/*`.
- Desktop routes live under `/`.
- `frontend/src/proxy.ts` rewrites device traffic to `/m` (server-side only).
- Client-side navigation MUST stay in `/m` using `MobileLink`.

## 5. Data Fetching Strategy
### Server-side (preferred)
- Use `frontend/src/lib/serverApi.ts` for server fetch.
- Fetch uses `next: { revalidate }` for ISR and caching.
- Pages like home, games list, and trending are server-rendered first.

### Client-side (when interactivity needed)
- Use Zustand stores for live interaction.
- Hydrate stores with server data using `hydrateFromServer` to avoid double-fetch.

## 6. Performance Playbook (Always Apply)
### Frontend
- Convert static pages to server components (remove `use client`).
- Avoid global state for static content.
- Use `next/image` with `avif`/`webp`.
- Use dynamic imports with `lazyWithRetry` for heavy components.
- Avoid unnecessary prefetch. Use `AppLink` with explicit `prefetch` only when needed.

### Backend
- Response compression enabled (`compression`).
- ETag enabled for conditional requests.
- In-memory response cache for public GET endpoints (short TTL + SWR).
- DB queries cached in `database.service.ts`.

### Caching Targets
- Static assets: `Cache-Control: public, max-age=31536000, immutable`.
- Images: `Cache-Control: public, max-age=60, stale-while-revalidate=86400`.
- Public API GET: `public/private, max-age=20–30s, stale-while-revalidate`.

## 7. Speed & Quality Targets (Best-in-Class)
Reference the metrics below for any optimization work:
- Lighthouse score: 95+ (Desktop), 90+ (Mobile)
- Core Web Vitals (Field Data):
  - LCP < 2.5s
  - INP < 200ms
  - CLS < 0.1

## 8. Key Files You Must Know
- `frontend/src/proxy.ts`: device routing
- `frontend/src/lib/serverApi.ts`: server-side fetch
- `frontend/src/components/shared/ChunkRecovery.tsx`: chunk error recovery
- `frontend/src/lib/lazyWithRetry.ts`: retry dynamic chunks
- `backend/src/middleware/responseCache.ts`: cached GET responses

## 9. Environment Variables
### Frontend
- `NEXT_PUBLIC_API_URL` (required)
- `NEXT_PUBLIC_SOCKET_URL`

### Backend
- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `PORT`

## 10. Commands
### Frontend
- `npm run dev`
- `npm run build`
- `npm run start`

### Backend
- `npm run dev`
- `npm run build`
- `npm run start`

## 11. AI Development Rules
- Prefer server components for static or list pages.
- Hydrate client stores with server data to avoid double fetch.
- Avoid breaking `/m` routing.
- Never introduce long-polling or unnecessary background requests.
- Any major change must preserve or improve performance and stability.

## 12. Deployment Checklist
- `npm run build` (frontend + backend) passes with zero warnings.
- No `_next/static` 404s in production.
- No `ChunkLoadError` in production.
- Mobile stays in `/m` routes for client-side navigation.
- All caching headers verified.

## 13. Troubleshooting
- Chunk 404s: verify `standalone` output and `scripts/copy-standalone-static.mjs`.
- Slow pages: verify server data fetch is used and client store is hydrated.
- Mixed UI: confirm `MobileLink` usage and proxy rewrite.

---
If you are an AI agent, this README is mandatory. Do not deviate without explicit instruction.
