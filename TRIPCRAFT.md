# Tripcraft — Project Context

## What it is
A full-stack travel itinerary platform. Users plan trips, book activities, track confirmations, reflect post-trip, and discover community itineraries. The core value proposition is decision clarity — not booking replacement. Tripcraft sits above platforms like Expedia/Airbnb as an intelligence layer.

---

## Design System
- **Primary:** Deep Ocean `#0D2B45`
- **Action/CTA:** Terracotta `#C4603A` (lighter: `#D97A56`)
- **Trust/Achievement:** Soft Gold `#C9A84C` (lighter: `#E2C06A`)
- **Backgrounds:** Foam `#EEF4F8`, Mist `#D6E4EE`, Surface `#F4F8FB`
- **Text:** Ink `#0A1F30`, Slate `#5B7A8E`
- **Status:** Green `#2E7D4F`, Amber `#9D4E1F`, Red `#C04040`
- **Fonts:** Cormorant Garamond (headings/display), DM Sans (body), DM Mono (data/labels/mono)
- **Source of truth for UI:** `tripcraft-v5.jsx` in repo root

---

## Tech Stack
- **Frontend:** Next.js 14 App Router + Tailwind CSS
- **Backend:** Express + Node.js (port 4000)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (email/password to start)
- **Folder structure:** Monorepo with `/frontend` and `/backend`

## Repo Structure
```
TripCraft/
├── TRIPCRAFT.md            ← this file — read at start of every Claude Code session
├── tripcraft-v5.jsx        ← UI source of truth
├── package.json            ← root workspace (npm run dev starts both)
├── frontend/
│   ├── src/app/            ← App Router pages (/, /trips, /discover, /profile, /login, /register)
│   ├── src/components/     ← layout/, ui/, auth/, trips/, discover/, profile/
│   ├── src/lib/auth.ts     ← NextAuth config
│   ├── src/lib/api.ts      ← typed API client
│   └── tailwind.config.ts  ← full design system
└── backend/
    ├── prisma/schema.prisma ← full DB schema (11 models)
    └── src/
        ├── index.ts         ← Express on :4000
        ├── routes/          ← users, trips, days, blocks, reflections, discover
        └── middleware/auth.ts ← JWT verification
```

---

## Environment Variables

### backend/.env
```
DATABASE_URL="postgresql://localhost:5432/tripcraft"
NEXTAUTH_SECRET="tripcraft-secret-key-change-in-production"
JWT_SECRET="tripcraft-jwt-secret-change-in-production"
```

### frontend/.env.local
```
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tripcraft-secret-key-change-in-production"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## Local Dev
```bash
# Start both servers
npm run dev
# frontend → http://localhost:3000
# backend  → http://localhost:4000/api/health

# Run DB migrations
npm run db:migrate
```

---

## Core Features (Priority Order)
1. Trip creation — destination, dates, travelers, budget, vibes, theme
2. Day-by-day itinerary builder — blocks (flight, hotel, activity, food, note)
3. Booking confirmations + cancellation deadlines per block
4. Activity comparison — multiple tour companies, side-by-side
5. Trip Intelligence panel — synthesized review insights
6. Post-trip reflection — 8-question flow, fully editable
7. Discover feed — community + friends tabs, interactive map with region filtering
8. Profile — world map with visited city pins, draggable trip rankings, trip detail modal
9. Photo upload — per day, per trip, cover photo selection

---

## Database Models
| Model | Key Fields |
|---|---|
| User | id, name, email, passwordHash, createdAt |
| Trip | id, userId, dest, dates, days, travelers, budget, theme, status (draft/active/completed) |
| TripVibe | tripId, vibe |
| ItineraryDay | id, tripId, dayNumber, name, theme, date |
| Block | id, dayId, type (flight/hotel/activity/food/note), title, detail, price, status (booked/pending), confirmationNo, cancelDeadline, cancelIsFree |
| Photo | id, tripId, dayId, url, isCover |
| Reflection | id, tripId, rank (0–100), expectation, futureSelfNote, bestDecision, regret, changes (array), rebook (JSON), tripTitle |
| Community | id, tripId, isPublic, upvotes |
| Upvote | id, communityId, userId |
| Friend | id, userId, friendId |
| ItineraryDoc | id, tripId, fileUrl, fileName |

---

## Product Decisions (Locked)
- **Travelers field** always labeled "Total number of travelers (including yourself)"
- **Vibes** are multi-select chips — user can select any combination
- **Cancellation deadlines** shown green ✓ (free/safe) or amber ⚠ (deadline/non-refundable) per block
- **Confirmation numbers** displayed as `CONF #XXXXX` on booked blocks
- **Discover map** — Europe/Asia/Americas zoom to city-level pins; Africa/S.America select directly and filter cards
- **Profile rankings** are drag-to-reorder; ranks auto-update (#1 of my life, #2 overall, etc.)
- **Non-Tripcraft trips** can upload a PDF/Word itinerary doc
- **Trip details** (dest, dates, travelers, budget, theme, vibes) are editable at any time via ✏ Edit details button
- **Post-trip reflection** has 8 steps: ranking slider, expectation match, future-you note, what to change, best decision, skip next time, rebook ratings, title + photos
- **Cover photo** — user selects from trip photos; if none selected, shows default emoji icon on profile card

---

## Monetization (for context)
- **Freemium:** 2 free itineraries, then paid packs ($19/5, $39/15, $59/6-month unlimited)
- **Affiliate:** 3–10% commission via GetYourGuide, Viator, Booking.com, Airbnb
- **Future B2B:** Anonymized trip intelligence sold to hotels/tour operators

---

## Build Status
- [x] Monorepo scaffolded
- [x] Next.js 14 frontend initialized
- [x] Express backend initialized
- [x] Prisma schema with 11 models
- [x] NextAuth configured
- [x] Route shells created (users, trips, days, blocks, reflections, discover)
- [x] Design system in Tailwind config
- [x] PostgreSQL connected + migrations run
- [ ] Landing page (convert from tripcraft-v5.jsx)
- [ ] Auth — register + login forms working
- [ ] Trip creation flow working end-to-end
- [ ] Itinerary builder working end-to-end
- [ ] Block creation (flight, hotel, activity, food, note)
- [ ] Activity comparison modal
- [ ] Post-trip reflection flow
- [ ] Discover feed — community tab
- [ ] Discover feed — friends tab
- [ ] Interactive discover map
- [ ] Profile page — world map header
- [ ] Profile page — draggable rankings
- [ ] Trip detail modal (photos, thoughts, itinerary)
- [ ] Photo upload
- [ ] PDF itinerary upload

---

## How to Use This File

**At the start of every Claude Code session:**
> "Read TRIPCRAFT.md first, then let's work on [feature]."

**After each Claude Code session:**
- Check off completed items in Build Status above
- Add any new decisions made to Product Decisions

**When designing in Claude Web (claude.ai):**
- Prototype new UI features as JSX first
- Make product decisions before handing to Claude Code
- Update this doc with decisions, then give to Claude Code to implement
