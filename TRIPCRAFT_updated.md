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
- **UI source of truth:** `tripcraft-v15.jsx` in repo root

---

## Tech Stack
- **Frontend:** Next.js 14 App Router + Tailwind CSS
- **Backend:** Express + Node.js (port 4000)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (email/password to start)

## Repo Structure
```
TripCraft/
├── TRIPCRAFT.md            ← this file — read at start of every Claude session
├── tripcraft-v15.jsx       ← UI source of truth (latest prototype)
├── package.json            ← root workspace (npm run dev starts both)
├── frontend/src/
│   ├── app/                ← App Router pages
│   ├── components/         ← layout/, ui/, auth/, trips/, discover/, profile/
│   ├── lib/auth.ts         ← NextAuth config
│   └── lib/api.ts          ← typed API client
└── backend/src/
    ├── index.ts            ← Express on :4000
    ├── routes/             ← users, trips, days, blocks, reflections, discover
    └── middleware/auth.ts  ← JWT verification
```

## Local Dev
```bash
npm run dev          # starts both servers
# frontend → http://localhost:3000
# backend  → http://localhost:4000/api/health
npm run db:migrate   # run DB migrations
npx prisma studio    # admin DB view
```

---

## Product Focus
Trip planning is the core product. Everything else (Discover, Profile, Reflect) supports it. Build and polish the trip planning experience first.

---

## URL Paste Comparison — How to Build

When user pastes 2–3 tour URLs:
1. Backend fetches each URL's HTML
2. Sends to Claude API (claude-haiku-4-5): *"Extract: tour name, price, duration, inclusions, cancellation policy, departure time, meeting point. Return JSON."*
3. Frontend renders side-by-side comparison, differences in red, matches in green

Endpoint: `POST /api/compare/urls` — accepts array of URLs, returns comparison object.

## Cancellation Policy Structure

```js
cancelPolicy: {
  tiers: [
    { daysBeforeTrip: 7, refundPercent: 100 },
    { daysBeforeTrip: 3, refundPercent: 50 },
    { daysBeforeTrip: 0, refundPercent: 0 },
  ]
}
```
UI: ✅ 100% if 7+ days · ⚠️ 50% if 3–7 days · ❌ No refund within 3 days

## Affiliate Links
- Activities → GetYourGuide (`?partner_id=`) or Viator (`?pid=`)
- Hotels → Booking.com (`?aid=`)
- Flights → Skyscanner
- Store IDs in `backend/.env`: `GETYOURGUIDE_PARTNER_ID`, `VIATOR_PARTNER_ID`, `BOOKING_AID`

## Mobile View Strategy
- **Planning mode (desktop):** full builder with sidebar, blocks, panels
- **Reference mode (mobile):** read-only, day-by-day, time-ordered — URL: `/trips/[id]/view`

---

## Database Models
| Model | Key Fields |
|---|---|
| User | id, name, email, passwordHash |
| Trip | id, userId, dest, dates, days, travelers, budget, theme, status (ACTIVE/COMPLETED; PLANNING legacy) |
| TripVibe | tripId, vibe |
| ItineraryDay | id, tripId, dayNum, name, theme, date, stayingIn |
| Block | id, dayId, type, title, detail, price, status (BOOKED/PENDING), confCode, cancelPolicy (JSON tiered), participants |
| Photo | id, tripId, dayId, url, isCover |
| Reflection | id, tripId, rank, expectation, futureSelfNote, bestDecision, regret, changes, rebook, tripTitle |
| Community | id, tripId, isAnonymous, isPublic, friendsOnly, upvotes |
| Upvote | id, communityId, userId |
| Friend | id, userId, friendId |
| ItineraryDoc | id, tripId, fileUrl, fileName |
| PlaceCache | id, placeId, name, address, phone, website, lat, lng, rating, photos |

---

## Locked Product Decisions

- **Status enum:** ACTIVE · COMPLETED only (UI exposes 2 statuses; PLANNING exists in DB mapped to ACTIVE for legacy compat)
- **Travelers field:** always labeled "Total number of travelers (including yourself)"
- **Vibes:** multi-select chips + custom text input
- **Sharing:** anonymous = no name in Community, real name in Friends; public = @handle in Community (clickable → profile)
- **Profile Active tab:** numbered list, no drag, always private (was "Upcoming"); no eyebrow label; reduced top padding; "Mark complete" button per trip (replaces dropdown) — clicking opens confirm panel with community sharing option
- **Profile Completed tab:** titled "Past Trips"; drag to reorder = permanent life ranking (rank shown as #1, #2… with no sub-label); city photo cover (same as Active tab); Import itinerary button left-aligned below title; no "Completed" eyebrow
- **Share toggle (Public/Anon):** On both Active and Completed tabs. Trips are always added to Community on completion. At completion, confirm panel asks "This trip will be shared with the community. Do you want your itinerary to be shared publicly or anonymously?" with a Public | Anon pill toggle (default: Public). On Completed tab, same pill toggle per trip to change after the fact. Public = @handle shown in community feed; Anon = no name shown.
- **Imported trips:** always private on upload, "Imported" badge, auto-COMPLETED if past date
- **Sidebar:** Top-level links: Discover, My Profile. Below those, "Active Itineraries" sub-section — shows only PLANNING/ACTIVE trips; completed trips not listed; trip city shown beneath name; no status indicators. Top navbar has no center nav links (Discover/Profile removed — sidebar handles those).
- **Cancellation UI:** green ✓ (free) · amber ⚠ (deadline) · structured tiers
- **Conf #:** show as `CONF #XXXXX`, only visible when status = BOOKED
- **Cover photo:** user picks from trip photos; defaults to emoji icon if none

---

## Monetization
- **Freemium:** 2 free itineraries → paid packs ($19/5, $39/15, $59/6-month unlimited)
- **Affiliate:** 3–10% commission via GetYourGuide, Viator, Booking.com
- **Future B2B:** Anonymized trip intelligence sold to hotels/tour operators

---

## How to Use This File

**At the start of every Claude session:**
> "Read TRIPCRAFT.md, then let's work on [feature]."

**After completing a feature:** check it off below.
**After a product decision:** add it to Locked Product Decisions above.
**After a new prototype:** update UI source of truth reference in Design System.

---

## Stack
- Next.js 14 App Router + Tailwind · Express :4000 · PostgreSQL + Prisma · NextAuth
- UI source of truth: `tripcraft-v15.jsx`
- Design tokens: ocean `#0D2B45` · terra `#C4603A` · gold `#C9A84C` · foam `#EEF4F8` · mist `#D6E4EE` · ink `#0A1F30` · slate `#5B7A8E`
- Fonts: Cormorant Garamond (headings) · DM Sans (body) · DM Mono (labels)

---

## 🔴 Trip Planning — Core (do these first)

- [x] **Edit block** — click any block to edit all fields inline
- [x] **Delete block** — trash icon on hover, confirm before delete
- [ ] **Destination autocomplete** — single "City, Country" field, Google Places API
- [ ] **Activity entry: type in OR browse** — currently only browse exists; add manual text entry path
- [ ] **Hotel entry: type in OR search** — same dual-entry pattern
- [ ] **Click reviews inline** — expand real reviews from Places API on activity blocks
- [ ] **Tiered cancellation policy** — replace single cancel field with structured tiers (100% >7d / 50% 3–7d / 0% <3d)
- [ ] **Confirmation # gated** — only show conf # field when block status = BOOKED
- [ ] **Participant selector** — per block, who's joining (default: all travelers)
- [ ] **URL paste comparison** — paste 2–3 tour URLs → Claude API extracts + diffs key details
- [ ] **Shareable read-only link** — `/trips/[id]/view` public route
- [ ] **Calendar sync** — export blocks as Google Calendar + Apple Calendar events
- [ ] **Mobile reference view** — read-only, time-ordered, phone-optimized

---

## 🟡 Smart Sidebar & Panels

- [ ] **Sidebar suggestions: one-click add** — clicking a suggestion adds it directly to current day
- [ ] **Sidebar suggestions: auto-refresh** — re-fetch when destination or dates change
- [ ] **Trip Intelligence tab** — wire up Anthropic API to synthesize real review insights (credits needed)

---

## 🟢 Discover

- [ ] **Community feed** — backend connected (currently UI only)
- [ ] **Friends feed** — backend connected (currently UI only)
- [ ] **Discover map** — backend connected (currently UI only)
- [x] **Sharing flow** — on COMPLETED, confirm panel always posts to community; Public/Anon pill toggle (default Public); same pill on Completed tab to change after the fact
- [ ] **Fork trip** — copy any community itinerary to your own trips

---

## 🟢 Profile & Lifecycle

- [ ] **World map header** — visited city pins on profile page
- [ ] **Trip detail modal** — photos / thoughts / itinerary tabs on completed trip cards
- [ ] **Photo upload** — per day, per trip, cover photo selection

---

## 🟢 Auth

- [ ] **Google OAuth** — sign in with Google

---

## ✅ Already Built — Do Not Rebuild

- Auth: email/password register + login
- Trip creation form (dest, dates, travelers, budget, vibes, theme)
- Itinerary builder: day cards, block types (transport/stay/activity/food/note)
- Edit block (pencil on hover) + delete block (trash on hover, optimistic UI)
- Add block form: type picker + activity compare modal browse path
- Activity compare modal (GetYourGuide / Viator)
- Smart To Do tab — backend connected (toggle, add, delete)
- Budget tab — backend connected, per-person toggle, category bars
- Research tab — insights, saved tour comparisons, saved social links
- Right sidebar suggestions — pulling from `/api/activities`
- Affiliate links — `BookingCTA`, `useBookingLinks`, `affiliates.ts`, `bookingTracking.ts`
- "Book now ↗" CTA on pending activity/stay blocks
- Post-trip reflection modal — backend connected
- Map tab — SVG world map with destination pin + itinerary sequence
- Profile: Upcoming / Completed tabs, draggable rankings, share toggle
- PDF/DOCX/XLSX/CSV/TXT itinerary import — Claude parses → review → save; "Import itinerary" button on Completed tab; auto-COMPLETED if past date; "Imported" badge; routes: POST /api/itinerary/upload, POST /api/itinerary/save
- Trip status system: ACTIVE / COMPLETED (2 statuses in UI; PLANNING in DB maps to ACTIVE)
- Google Places API + PlaceCache + intelligence service (built, needs credits)
- Back button on trip detail page — top-left, calls router.back() to return to previous page (Active tab, sidebar nav, etc.)
- Stats banner on home page — hidden until real data is available (STATS constant removed)

---

## Locked Product Decisions

- **Status enum:** ACTIVE · COMPLETED only (UI exposes 2 statuses; PLANNING exists in DB mapped to ACTIVE for legacy compat)
- **Travelers field:** always labeled "Total number of travelers (including yourself)"
- **Vibes:** multi-select chips + custom text input
- **Sharing:** anonymous = no name in Community, real name in Friends; public = @handle in Community (clickable → profile)
- **Profile Active tab:** numbered list, no drag, always private (was "Upcoming"); no eyebrow label; reduced top padding; "Mark complete" button per trip (replaces dropdown) — clicking opens confirm panel with community sharing option
- **Profile Completed tab:** titled "Past Trips"; drag to reorder = permanent life ranking (rank shown as #1, #2… with no sub-label); city photo cover (same as Active tab); Import itinerary button left-aligned below title; no "Completed" eyebrow
- **Share toggle (Public/Anon):** On both Active and Completed tabs. Trips are always added to Community on completion. At completion, confirm panel asks "This trip will be shared with the community. Do you want your itinerary to be shared publicly or anonymously?" with a Public | Anon pill toggle (default: Public). On Completed tab, same pill toggle per trip to change after the fact. Public = @handle shown in community feed; Anon = no name shown.
- **Imported trips:** always private on upload, "Imported" badge, auto-COMPLETED if past date
- **Sidebar:** Top-level links: Discover, My Profile. Below those, "Active Itineraries" sub-section — shows only PLANNING/ACTIVE trips; completed trips not listed; trip city shown beneath name; no status indicators. Top navbar has no center nav links (Discover/Profile removed — sidebar handles those).
- **Cancellation UI:** green ✓ (free) · amber ⚠ (deadline) · structured tiers (see URL paste spec)
- **Conf #:** show as `CONF #XXXXX`, only visible when status = BOOKED
- **Cover photo:** user picks from trip photos; defaults to emoji icon if none

---

## Build Order (recommended sessions)

1. Edit + delete blocks
2. Destination autocomplete
3. Activity + hotel search flow (type in OR browse)
4. Click to see reviews inline
5. Trip Intelligence (Anthropic credits)
6. Sidebar one-click add + auto-refresh
7. Tiered cancellation policy
8. Conf # gating + participant selector
9. URL paste comparison
10. Shareable link + calendar sync + mobile view
11. Discover backend (community + friends + map + sharing)
12. World map header + trip detail modal + photo upload
13. Google OAuth
