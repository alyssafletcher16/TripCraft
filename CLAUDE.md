# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See TRIPCRAFT_updated.md in the repo root for full product context, feature priorities, build order, and all product decisions.

## Commands

### Development
```bash
npm run dev              # Run backend (port 4000) + frontend (port 3000) concurrently
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### Database (Prisma)
```bash
npm run db:generate      # Generate Prisma client after schema changes
npm run db:migrate       # Apply migrations to the database
npm run db:studio        # Open Prisma Studio GUI
```

### Build
```bash
npm run build            # Build both workspaces
```

### Frontend (from `frontend/`)
```bash
npx next build           # Build Next.js app
npx next lint            # Lint frontend code
```

## Architecture Overview

**Monorepo** with two npm workspaces:
- `frontend/` — Next.js 14 (App Router), React 18, Tailwind CSS, NextAuth
- `backend/` — Express.js, Prisma ORM, PostgreSQL

### Authentication Flow

NextAuth (`frontend/src/lib/auth.ts`) uses JWT strategy:
1. CredentialsProvider calls `POST /api/users/login` on the Express backend
2. JWT callback stores `token.id = user.id`; session callback adds `accessToken` (7-day HS256 JWT)
3. Frontend passes `session.accessToken` as `Authorization: Bearer` on all API calls
4. Backend `requireAuth` middleware (`backend/src/middleware/auth.ts`) verifies the token and sets `req.userId`

Google OAuth also supported via NextAuth → `POST /api/users/oauth` for upsert.

### Frontend Data Fetching

No Redux/Zustand — components fetch directly using the centralized API client at `frontend/src/lib/api.ts`. This exports typed methods (e.g., `api.trips.get(id, token)`) that wrap a `request()` helper adding the auth header. Data is stored in component-level `useState`.

### Backend Route Structure

All routes under `backend/src/routes/`:
- `users.ts` — Auth (register/login/OAuth), profile CRUD
- `trips.ts` — Trip CRUD + itinerary file import (PDF/DOCX/Excel parsed via Anthropic Claude)
- `days.ts` / `blocks.ts` — Itinerary day and block CRUD
- `reflections.ts` — Post-trip reflection form (8 fields)
- `discover.ts` — Public community feed with upvoting
- `intelligence.ts` — AI-generated traveler insights via Anthropic SDK
- `activities.ts` / `compare.ts` — Activity search and comparison
- `bookingClicks.ts` — Affiliate click tracking (GetYourGuide, Viator, Booking.com)
- `social.ts` — Follow system: search users, follow/unfollow, accept/reject requests, public traveler profiles

### Key Data Models

`Trip` → has many `ItineraryDay` → has many `Block` (type: TRANSPORT/STAY/ACTIVITY/FOOD/NOTE, status: BOOKED/PENDING/CANCELLED)

Trip status: `PLANNING` → `ACTIVE` → `COMPLETED`. Completed trips can have a `TripReflection`.

`Community` model controls public visibility and upvotes. Public trips appear in `/discover`.

`User` has `isPrivate Boolean` — when true, follow requests are `PENDING` until accepted. `Follow` model tracks follower/following relationships with status `PENDING | ACCEPTED`.

### UI & Styling

Custom Tailwind color palette in `frontend/tailwind.config.ts`:
- **Blues**: `ocean` (#0D2B45), `tide`, `deep`
- **Accents**: `terra` (rust orange), `gold`
- **Neutrals**: `foam`, `mist`, `ink`, `slate`, `surface`

Custom fonts: Cormorant Garamond (serif headings), DM Sans (body), DM Mono.

Custom utility classes defined in `frontend/src/app/globals.css`: `.btn-primary`, `.btn-ghost`, `.btn-outline`, `.card`, `.nav-link`, `.sidebar-item`, `.page-title`, `.eyebrow`.

### Path Aliases

Frontend uses `@/*` → `frontend/src/*` (configured in `tsconfig.json`).

### Deployment

This project has **two separate deployments** that must both be kept in sync:

#### Frontend — Vercel
Vercel deploys the frontend only (`vercel.json`). Always commit before deploying — git and Vercel must stay in sync.

**Always run `vercel --prod` from the repo root (`/TripCraft/TripCraft`), never from `frontend/`.** The root is linked to the correct `tripcraft_vercel` project; `frontend/` is linked to a stale `frontend` project and will deploy to the wrong URL.

#### Backend — Render (`https://tripcraft-w3yf.onrender.com`)
The Express backend is deployed on Render and **auto-deploys when commits are pushed to `origin/main`**. Vercel does NOT deploy the backend.

**Critical rule: after any backend change, always `git push origin main`** so Render picks up the new code. If you only run `vercel --prod` without pushing first, the backend on Render will be out of date and new API routes will return `Cannot GET /api/...`.

#### Production Database — Render PostgreSQL
The production database is separate from the local `localhost:5432/tripcraft` database. They are **not in sync** — schema changes applied locally do NOT affect production.

**After any `schema.prisma` change, apply it to production:**
```bash
DATABASE_URL="postgresql://tripcraft_db_8vrc_user:...@dpg-d6oeieh5pdvs73ehf97g-a.oregon-postgres.render.com/tripcraft_db_8vrc" npx prisma db push
```
The internal Render hostname (`dpg-...a` without suffix) only works from within Render's network. Always use the **external hostname** ending in `.oregon-postgres.render.com` when running Prisma commands locally against production.

#### Deployment checklist
1. `git add ... && git commit` — stage and commit all changes
2. `git push origin main` — triggers Render backend redeploy
3. `vercel --prod` (from repo root) — deploys frontend to Vercel
4. If `schema.prisma` changed: run `prisma db push` against the production DATABASE_URL (step above)

### Pre-Deployment UI & Responsiveness Checklist

Before every deployment, verify that all UI changes are fully responsive and dynamic across device sizes. This is a hard requirement — do not deploy frontend changes without completing this checklist.

**Breakpoints to verify** (using Tailwind's scale):
- Mobile: `sm` (≥640px) and below — single-column layouts, stacked navigation, touch-friendly tap targets
- Tablet: `md` (≥768px) — transitional layouts, sidebars may collapse
- Desktop: `lg` (≥1024px) and `xl` (≥1280px) — full layouts with sidebars and multi-column views

**What to check on every changed component:**
1. No horizontal overflow or clipped content at any breakpoint
2. Text is readable — no truncation of important content, no font sizes below 14px on mobile
3. Interactive elements (buttons, inputs, modals) are accessible and correctly sized on touch screens
4. Sidebars, drawers, and navigation collapse gracefully on smaller screens
5. Images and cards scale correctly — no broken aspect ratios or overflow
6. Modals and overlays are fully visible and dismissible on mobile
7. Flex/grid layouts reflow correctly — no items escaping their containers

**How to test before deploying:**
- Use Chrome DevTools (or equivalent) responsive mode to simulate `375px` (mobile), `768px` (tablet), and `1280px` (desktop)
- Toggle the sidebar open/closed at each breakpoint if the changed page includes it
- Scroll through the full page at each breakpoint to catch overflow issues

If any breakpoint fails these checks, fix the responsive styles before deploying.
