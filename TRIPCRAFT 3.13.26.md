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
- **Folder structure:** Monorepo with `/frontend` and `/backend`

## Repo Structure
```
TripCraft/
├── TRIPCRAFT.md            ← this file — read at start of every Claude session
├── tripcraft-v15.jsx       ← UI source of truth (latest prototype)
├── package.json            ← root workspace (npm run dev starts both)
├── frontend/
│   ├── src/app/            ← App Router pages (/, /trips, /discover, /profile, /login, /register)
│   ├── src/components/     ← layout/, ui/, auth/, trips/, discover/, profile/
│   ├── src/lib/auth.ts     ← NextAuth config
│   ├── src/lib/api.ts      ← typed API client
│   └── tailwind.config.ts  ← full design system
└── backend/
    ├── prisma/schema.prisma ← full DB schema
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
GETYOURGUIDE_PARTNER_ID=""
VIATOR_PARTNER_ID=""
BOOKING_AID=""
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

## Product Focus
Trip planning is the core product. Everything else (Discover, Profile, Reflect) supports it.
Build and polish the trip planning experience first before expanding other areas.

---

## Feature Areas (Priority Order)

---

### 🔴 AREA 1 — Trip Creation (Setup)
*The entry point. Must be fast, smart, and confidence-building.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 1.1 | Destination field — single "City / Country" field with live autocomplete (Google Places) | ☐ | Drives all downstream recommendations |
| 1.2 | Custom vibe tag input — user can type and add their own if no preset fits | ☐ | "+ Add your own" chip at end of vibe list |
| 1.3 | Total number of travelers — with "(including yourself)" label | ✅ | Done |
| 1.4 | Trip dates, days, budget, theme | ✅ | Done |
| 1.5 | All setup fields editable after creation via ✏ Edit details | ✅ | Done |

---

### 🔴 AREA 2 — Itinerary Builder (Core Planning)
*The main workspace. This is where users spend most of their time.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 2.1 | Days split into Morning / Afternoon / Evening sections | ✅ | Prototype (v15) — needs backend |
| 2.2 | Activity blocks show time prominently (e.g. 9:00 AM — Hot Air Balloon) | ✅ | Prototype (v15) — needs backend |
| 2.3 | Overnight city label clearly visible on each day (e.g. "Staying in: Palermo") | ✅ | Prototype (v15) — needs backend |
| 2.4 | Edit block inline — click any block to edit all fields | ☐ | **START HERE — most blocking right now** |
| 2.5 | Delete block — trash icon on each block | ☐ | Currently no way to remove a block |
| 2.6 | Participant selector per block — who is joining (default: all travelers) | ☐ | Impacts per-person budget calculation |
| 2.7 | Confirmation # field only visible once status = "booked" | ☐ | Reduces clutter during planning phase |
| 2.8 | Contact details auto-populated when clicking "View details" (phone, website, address) | ☐ | Pulled from Google Places cache |
| 2.9 | "Book" button links to actual listing page (affiliate link) | ☐ | Core monetization — GetYourGuide, Viator, Booking.com |
| 2.10 | Shareable read-only link for completed itinerary | ☐ | e.g. tripcraft.com/trips/share/abc123 |
| 2.11 | Calendar sync (Google Calendar + Apple Calendar) | ☐ | Export each day/block as calendar events |
| 2.12 | Mobile-friendly itinerary view (reference mode) | ☐ | Clean read-only view optimized for phone use during trip |

---

### 🔴 AREA 3 — Activity & Hotel Selection (The Intelligence Layer)
*Where Tripcraft earns trust. Real data, real comparisons, real confidence.*

**Activity Flow:**

| # | Feature | Status | Notes |
|---|---|---|---|
| 3.1 | Adding activity: option to (A) type manually OR (B) search from list | ☐ | Remove compare button from main itinerary view |
| 3.2 | Search results powered by Google Places + GetYourGuide API | ☐ | Ranked by popularity / review count |
| 3.3 | Click review count to see real reviews inline | ☐ | Expandable panel with top reviews + author + rating |
| 3.4 | Company comparison — side-by-side diff of timing, inclusions, price, cancellation | ☐ | Scrape or use affiliate API data |
| 3.5 | Paste 2-3 URLs to compare — Claude API extracts and diffs key details | ☐ | See URL Paste Comparison section below |
| 3.6 | Tiered cancellation policy (100% >7 days, 50% 3-7 days, 0% <3 days) | ☐ | See Cancellation Policy Structure below |

**Hotel Flow:**

| # | Feature | Status | Notes |
|---|---|---|---|
| 3.7 | Adding hotel: option to type name OR search from list | ☐ | Same dual-entry pattern as activities |
| 3.8 | Hotel comparison — compare 2-3 hotels side by side (price, rating, location, amenities) | ☐ | Powered by Google Places |
| 3.9 | Contact details auto-populated (phone, address, website, check-in hours) | ☐ | From PlaceCache |

---

### 🟡 AREA 4 — Smart Sidebar (Contextual Suggestions)
*Suggestions that appear as you build, not before you need them.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 4.1 | Right sidebar shows suggested hotels, activities, restaurants based on destination | ✅ | Prototype (v15) — needs real Places API data |
| 4.2 | Each suggestion tagged clearly as Hotel / Activity / Restaurant | ✅ | Prototype (v15) |
| 4.3 | Click suggestion to add directly to current day | ☐ | One-click add to itinerary |
| 4.4 | Suggestions update as destination or dates change | ☐ | Re-fetch when trip details edited |

---

### 🟡 AREA 5 — Smart Panels (To Do, Budget, Research)
*Supporting tools that live alongside the itinerary.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 5.1 | Smart To Do list — auto-generated checklist by trip type + destination | ✅ | Prototype (v15) — needs backend |
| 5.2 | Budget breakdown tab — overall + per-person toggle | ✅ | Prototype (v15) — needs backend |
| 5.3 | Budget per-person respects participant selector per block | ☐ | Depends on 2.6 |
| 5.4 | Research tab — AI-synthesized insights from real reviews | ✅ | Prototype (v15) — needs Anthropic credits |
| 5.5 | Smart panels as tabs (To Do / Budget / Research) to right of itinerary | ✅ | Prototype (v15) |

---

### 🟢 AREA 6 — Discover (Community)
*Lower priority until core planning is solid.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 6.1 | Community itinerary feed with filter chips | ✅ | Prototype (v15) — needs backend |
| 6.2 | Friends feed | ✅ | Prototype (v15) — needs backend |
| 6.3 | Interactive world map with destination pins | ✅ | Prototype (v15) — needs backend |
| 6.4 | Fork trip from Discover | ☐ | |
| 6.5 | Sharing flow — anonymous vs public choice when trip marked complete | ✅ | Prototype (v15) — needs backend |
| 6.6 | Anonymous posts: no name in Community, real name in Friends feed | ✅ | Prototype (v15) — needs backend |
| 6.7 | Public posts: @handle in Community (clickable → profile), real name in Friends feed | ✅ | Prototype (v15) — needs backend |

---

### 🟢 AREA 7 — Profile & Lifecycle
*Lower priority until users have trips to archive.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 7.1 | World map header with visited city pins | ☐ | |
| 7.2 | Draggable trip rankings (Completed tab) | ✅ | Drag to reorder permanent life ranking |
| 7.3 | Trip detail modal (photos, thoughts, itinerary tabs) | ☐ | |
| 7.4 | Post-trip reflection flow (8 questions) | ✅ | Prototype (v15) — needs backend |
| 7.5 | Unified Upcoming / Completed tab structure | ✅ | Replaces My Trips / Archive tabs |
| 7.6 | Share toggle on Completed tab cards (Friends only / Everyone) | ✅ | |
| 7.7 | Auto-route uploaded trips by parsed date | ✅ | COMPLETED if past, PLANNING if future/null |

---

### 🟢 AREA 8 — Auth & Account

| # | Feature | Status | Notes |
|---|---|---|---|
| 8.1 | Email/password register + login | ✅ | Working |
| 8.2 | Google OAuth | ☐ | In progress |
| 8.3 | Admin view of all users | ✅ | Use npx prisma studio |

---

## URL Paste Comparison — How to Build (Area 3.5)

When user pastes 2-3 URLs of tour pages:
1. Backend fetches each URL's HTML content
2. Sends to Claude API (claude-haiku-4-5) with prompt:
   "Extract from this tour page: tour name, price, duration, what's included,
    what's not included, cancellation policy, departure time, meeting point.
    Return as JSON."
3. Frontend renders side-by-side comparison table
4. Highlights differences in red, matches in green

Claude Code prompt when ready:
> "Build a POST /api/compare/urls endpoint that accepts an array of 2-3 URLs,
> fetches each page's HTML, sends each to Claude API (claude-haiku-4-5) to extract
> tour details as structured JSON, then returns a comparison object showing
> all fields side by side with differences flagged."

---

## Cancellation Policy Structure (Area 3.6)

Replace the single cancel field with this data model:
```
cancelPolicy: {
  tiers: [
    { daysBeforeTrip: 7,  refundPercent: 100 },
    { daysBeforeTrip: 3,  refundPercent: 50  },
    { daysBeforeTrip: 0,  refundPercent: 0   },
  ],
  notes: "Free cancellation up to 7 days before. 50% refund 3-7 days. No refund within 3 days."
}
```

UI shows as:
- ✅ 100% refund if cancelled 7+ days before
- ⚠️ 50% refund if cancelled 3–7 days before
- ❌ No refund within 3 days

---

## Affiliate Link Strategy (Area 2.9)

When user clicks "Book":
- Activities → GetYourGuide or Viator affiliate link
- Hotels → Booking.com affiliate link or direct hotel website
- Flights → Skyscanner affiliate link

Format: wrap the real URL with your affiliate tracking parameter
- GetYourGuide: `https://www.getyourguide.com/[activity]?partner_id=YOUR_ID`
- Viator: `https://www.viator.com/[activity]?pid=YOUR_PARTNER_ID`
- Booking.com: `https://www.booking.com/[hotel].html?aid=YOUR_AID`

Store affiliate IDs in `backend/.env` (keys already added above).

---

## Mobile View Strategy (Area 2.12)

Two modes for the itinerary:
1. **Planning mode (desktop)** — full builder with sidebar, blocks, panels
2. **Reference mode (mobile)** — read-only, day-by-day, time-ordered, optimized for checking on your phone during the trip

Reference mode URL: `/trips/[id]/view`
Shareable link points to reference mode.

---

## Build Order Recommendation

| Session | Features | Why |
|---|---|---|
| 1 | 2.4 + 2.5 | Edit and delete blocks — most blocking right now |
| 2 | 1.1 | Destination autocomplete |
| 3 | 3.1 + 3.2 | Activity search flow redesign |
| 4 | 3.3 | Click to see reviews inline |
| 5 | 5.1 + 5.5 | Smart To Do list + tabbed panels (backend) |
| 6 | 4.1 + 4.3 | Right sidebar suggestions (real Places API data) |
| 7 | 5.2 + 5.3 | Budget breakdown + per person view |
| 8 | 3.6 | Tiered cancellation policy |
| 9 | 2.7 | Confirmation # only when booked |
| 10 | 2.6 | Participant selector |
| 11 | 3.5 | URL paste comparison (Claude API) |
| 12 | 2.9 | Affiliate book links |
| 13 | 2.10 | Shareable read-only link |
| 14 | 2.11 | Calendar sync |
| 15 | 2.12 | Mobile reference view |
| 16 | 6.5–6.7 | Sharing + community posting (backend) |
| 17 | 7.1 | World map header |
| 18 | 7.3 | Trip detail modal |
| 19 | 7.4 | Post-trip reflection (backend) |

---

## Database Models

| Model | Key Fields |
|---|---|
| User | id, name, email, passwordHash, createdAt |
| Trip | id, userId, dest, dates, days, travelers, budget, theme, status (PLANNING/ACTIVE/COMPLETED) |
| TripVibe | tripId, vibe |
| ItineraryDay | id, tripId, dayNumber, name, theme, date, stayingIn |
| Block | id, dayId, type (flight/hotel/activity/food/note), title, detail, price, status (booked/pending), confirmationNo, cancelPolicy (JSON tiered), participants |
| Photo | id, tripId, dayId, url, isCover |
| Reflection | id, tripId, rank (0–100), expectation, futureSelfNote, bestDecision, regret, changes (array), rebook (JSON), tripTitle |
| Community | id, tripId, isAnonymous, isPublic, friendsOnly, upvotes |
| Upvote | id, communityId, userId |
| Friend | id, userId, friendId |
| ItineraryDoc | id, tripId, fileUrl, fileName |
| PlaceCache | id, placeId, name, address, phone, website, lat, lng, rating, photos (JSON) |

---

## Product Decisions (Locked)

**Trip lifecycle:**
- All trips live in one unified place. Two tabs on profile: **Upcoming** (PLANNING + ACTIVE) and **Completed** (COMPLETED).
- Upcoming tab — numbered list by excitement/priority. No drag reorder. No share toggle — upcoming trips are always private.
- Completed tab — drag to reorder = permanent life ranking. Rank labels: "#1 of my life", "#2 overall", "#3 overall", etc.
- Share toggle only on Completed tab cards. Toggle off = private. Toggle on = inline choice: "Friends only" or "Everyone".

**Imported trips:**
- Always saved as private on upload. User opts into sharing from Completed tab after marking done.
- Show a small "Imported" badge in muted text on completed cards — no other special treatment.
- Auto-assigned COMPLETED if parsed start date is in the past, PLANNING if future or null.
- Logic lives in both `itinerary.ts` save and `trips.ts` import/confirm endpoints.

**Status enum:** Three values only: PLANNING, ACTIVE, COMPLETED. DRAFT removed.

**Sidebar:** One flat "My Itineraries" list. All upcoming + 3 most recent completed, capped at 8 total. Status labels: gold "planning", green "active", muted text for completed. "See all" link if more than 8.

**Sharing:**
- Sharing modal appears first time a trip is marked COMPLETED. Three options: anonymous, public, don't share.
- Anonymous = no name in Community, real name always in Friends feed.
- Public = @handle in Community (clickable → profile page), real name in Friends feed.
- Posted trips appear at top of Community and Friends feed with "your trip" badge.

**Community model:** `isAnonymous` boolean + `friendsOnly` boolean. `isPublic=false` + `friendsOnly=true` = friends feed only.

**Travelers field:** always labeled "Total number of travelers (including yourself)"

**Vibes:** multi-select chips — any combination + custom vibe input.

**Cancellation:** structured tiered policy (see Area 3.6). Shown green ✓ (free) or amber ⚠ (deadline/non-refundable) per block.

**Confirmation numbers:** displayed as `CONF #XXXXX` on booked blocks only — hidden during planning phase.

**Discover map:** pins with trip counts, hover tooltips, click for destination detail bar.

**Non-Tripcraft trips:** can upload PDF/Word itinerary doc.

**Trip details:** dest, dates, travelers, budget, theme, vibes all editable at any time via ✏ Edit.

**Post-trip reflection:** 8 steps — ranking slider, expectation match, future-you note, what to change, best decision, skip next time, rebook ratings, title + photos.

**Cover photo:** selected from trip photos; defaults to emoji icon if none selected.

---

## Monetization (for context)
- **Freemium:** 2 free itineraries, then paid packs ($19/5 trips, $39/15 trips, $59/6-month unlimited)
- **Affiliate:** 3–10% commission via GetYourGuide, Viator, Booking.com, Airbnb
- **Future B2B:** Anonymized trip intelligence sold to hotels/tour operators

---

## Build Status

### Infrastructure
- [x] Monorepo scaffolded
- [x] Next.js 14 frontend initialized
- [x] Express backend initialized
- [x] Prisma schema
- [x] NextAuth configured
- [x] Route shells created (users, trips, days, blocks, reflections, discover)
- [x] Design system in Tailwind config
- [x] PostgreSQL connected + migrations run
- [x] Google Places API integrated (Places API New)
- [x] PlaceCache model + migration
- [x] Places search + detail routes working
- [x] Intelligence service built (needs Anthropic credits to go live)

### Auth & Account
- [x] Register + login forms working
- [x] Email/password auth saving to database
- [ ] Google OAuth

### Trip Planning — Core (current focus)
- [x] Trip creation form
- [x] Itinerary builder scaffold
- [x] Block creation (flight, hotel, activity, food, note)
- [x] Morning / afternoon / evening day split (prototype)
- [x] Activity time display (prototype)
- [x] Overnight city label per day (prototype)
- [x] Smart To Do panel (prototype)
- [x] Budget panel with per-person toggle (prototype)
- [x] Research / Trip Intelligence panel (prototype)
- [x] Right sidebar suggestions (prototype)
- [ ] **Edit + delete blocks** ← START HERE (Session 1)
- [ ] Destination autocomplete (Session 2)
- [ ] Activity search flow redesign — type in OR search list (Session 3)
- [ ] Hotel search flow — type in OR search list (Session 3)
- [ ] Click reviews to read inline (Session 4)
- [ ] Smart To Do list (backend connected) (Session 5)
- [ ] Budget tab (backend connected) (Session 7)
- [ ] Research tab — Trip Intelligence (Anthropic credits) (Session 5)
- [ ] Right sidebar suggestions (real Places API data) (Session 6)
- [ ] Tiered cancellation policy (Session 8)
- [ ] Confirmation # only shows when status = booked (Session 9)
- [ ] Participant selector per block (Session 10)
- [ ] URL paste comparison via Claude API (Session 11)
- [ ] Affiliate book links (Session 12)
- [ ] Shareable read-only link (Session 13)
- [ ] Calendar sync (Session 14)
- [ ] Mobile reference view (Session 15)

### Discover
- [x] Community feed (prototype)
- [x] Friends feed (prototype)
- [x] Interactive world map (prototype)
- [x] Sharing flow — anonymous vs public modal (prototype)
- [ ] Community feed (backend connected) (Session 16)
- [ ] Friends feed (backend connected) (Session 16)
- [ ] Interactive map (backend connected) (Session 16)
- [ ] Fork trip

### Profile & Lifecycle
- [x] Unified Upcoming / Completed tab structure
- [x] Draggable rankings on Completed tab
- [x] Share toggle on Completed tab cards
- [x] Uploaded trips auto-routed by parsed date
- [x] PDF itinerary upload
- [x] Post-trip reflection flow (prototype)
- [ ] World map header with visited city pins (Session 17)
- [ ] Trip detail modal — photos / thoughts / itinerary tabs (Session 18)
- [ ] Post-trip reflection (backend connected) (Session 19)
- [ ] Photo upload

---

## How to Use This File

**At the start of every Claude session:**
> "Read TRIPCRAFT.md first, then let's work on [feature]."

**After completing a feature:**
- Check off completed items in Build Status
- Add any new product decisions to Product Decisions (Locked)
- Update the UI source of truth reference when a new prototype version ships

**When designing in Claude Web (claude.ai):**
- Prototype new UI in JSX first, get it right, then hand to Claude Code
- Update `tripcraft-vXX.jsx` reference in Design System when a new version ships
- Make product decisions before implementing — update this doc first
