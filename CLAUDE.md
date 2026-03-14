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

### Key Data Models

`Trip` → has many `ItineraryDay` → has many `Block` (type: TRANSPORT/STAY/ACTIVITY/FOOD/NOTE, status: BOOKED/PENDING/CANCELLED)

Trip status: `PLANNING` → `ACTIVE` → `COMPLETED`. Completed trips can have a `TripReflection`.

`Community` model controls public visibility and upvotes. Public trips appear in `/discover`.

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

Vercel deploys the frontend only (`vercel.json`). Always commit before deploying — git and Vercel must stay in sync.

**Always run `vercel --prod` from the repo root (`/TripCraft/TripCraft`), never from `frontend/`.** The root is linked to the correct `tripcraft_vercel` project; `frontend/` is linked to a stale `frontend` project and will deploy to the wrong URL.
