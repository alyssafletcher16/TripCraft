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
# TRIPCRAFT.md — Feature Update
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
| 1.1 | Destination field — single "City / Country" field with live autocomplete dropdown (Google Places Autocomplete) | ☐ | Drives all downstream recommendations |
| 1.2 | Custom tag input — user can type and add their own vibe tag if none of the presets fit | ☐ | Add a "+ Add your own" chip at end of vibe list |
| 1.3 | Total number of travelers — with "(including yourself)" label | ✅ | Done |
| 1.4 | Trip dates, days, budget, theme | ✅ | Done |
| 1.5 | All setup fields editable after creation via ✏ Edit details | ✅ | Done |

---

### 🔴 AREA 2 — Itinerary Builder (Core Planning)
*The main workspace. This is where users spend most of their time.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 2.1 | Days split into Morning / Afternoon / Evening sections | ☐ | Each block shows clearly which time slot it belongs to |
| 2.2 | Activity blocks show time prominently (e.g. 9:00 AM — Hot Air Balloon) | ☐ | Time is the most important field for daily planning |
| 2.3 | Overnight city label clearly visible on each day (e.g. "Staying in: Palermo") | ☐ | Critical for multi-city trips |
| 2.4 | Edit block inline — click any block to edit all fields | ☐ | Currently blocks cannot be edited after adding |
| 2.5 | Delete block — trash icon on each block | ☐ | Currently no way to remove a block |
| 2.6 | Participant selector per block — who is joining this activity (default: all travelers) | ☐ | Impacts per-person budget calculation |
| 2.7 | Confirmation # field only visible once status = "booked" | ☐ | Reduces clutter during planning phase |
| 2.8 | Contact details auto-populated when clicking "View details" on a block | ☐ | Phone, website, address pulled from Google Places cache |
| 2.9 | "Book" button links to actual listing page (affiliate link) | ☐ | Core monetization — GetYourGuide, Viator, Booking.com |
| 2.10 | Shareable read-only link for completed itinerary | ☐ | e.g. tripcraft.com/trips/share/abc123 |
| 2.11 | Calendar sync (Google Calendar + Apple Calendar) | ☐ | Export each day/block as calendar events |
| 2.12 | Mobile-friendly itinerary view (reference mode on trip) | ☐ | Clean read-only view optimized for phone use |

---

### 🔴 AREA 3 — Activity & Hotel Selection (The Intelligence Layer)
*Where Tripcraft earns trust. Real data, real comparisons, real confidence.*

**Activity Flow:**
| # | Feature | Status | Notes |
|---|---|---|---|
| 3.1 | When adding activity block: option to (A) type it in manually OR (B) search from list | ☐ | Remove compare button from main itinerary view |
| 3.2 | Search results show real options powered by Google Places + GetYourGuide API | ☐ | Ranked by internet popularity / review count |
| 3.3 | Click review count to see real reviews inline | ☐ | Expandable panel showing top reviews with author + rating |
| 3.4 | Company comparison — side by side diff of tour itinerary timing, inclusions, price, cancellation | ☐ | Scrape or use affiliate API data |
| 3.5 | Paste multiple URLs to compare — user pastes 2-3 tour links, tool extracts and compares key details | ☐ | Use Claude API to parse and diff the pages |
| 3.6 | Cancellation policy auto-populated and flexible — support tiered policies (e.g. 100% refund >7 days, 50% refund 3-7 days, no refund <3 days) | ☐ | Replace single cancel field with structured policy |

**Hotel Flow:**
| # | Feature | Status | Notes |
|---|---|---|---|
| 3.7 | When adding hotel block: option to type in hotel name OR search from list | ☐ | Same dual-entry pattern as activities |
| 3.8 | Hotel comparison — compare 2-3 hotels side by side (price, rating, location, amenities) | ☐ | Powered by Google Places data |
| 3.9 | Contact details auto-populated (phone, address, website, check-in hours) | ☐ | From PlaceCache |

---

### 🟡 AREA 4 — Smart Sidebar (Contextual Suggestions)
*Suggestions that appear as you build, not before you need them.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 4.1 | Right sidebar shows suggested hotels, activities, restaurants based on destination | ☐ | Powered by Google Places + internet popularity |
| 4.2 | Each suggestion tagged clearly as Hotel / Activity / Restaurant | ☐ | Color-coded badge |
| 4.3 | Click suggestion to add directly to current day | ☐ | One-click add to itinerary |
| 4.4 | Suggestions update as destination or dates change | ☐ | Re-fetch when trip details edited |

---

### 🟡 AREA 5 — Smart Panels (To Do, Budget, Research)
*Supporting tools that live alongside the itinerary.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 5.1 | Smart To Do list — auto-generated checklist based on trip type and destination | ☐ | Currently missing from trip view |
| 5.2 | Budget breakdown — tab inside trip view | ☐ | Overall view + per-person view toggle |
| 5.3 | Budget per-person calculation — respects participant selector per block | ☐ | Divides cost by number of participants on each block |
| 5.4 | Research tab — Trip Intelligence panel (AI-synthesized insights from real reviews) | ☐ | Powered by intelligenceService.ts (built, needs credits) |
| 5.5 | Smart panels accessible as tabs (To Do / Budget / Research) to the right of itinerary | ☐ | Replaces current static right panel |

---

### 🟢 AREA 6 — Discover (Community)
*Lower priority until core planning is solid.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 6.1 | Community itinerary feed | ☐ | |
| 6.2 | Friends feed | ☐ | |
| 6.3 | Interactive map with region filter | ☐ | |
| 6.4 | Fork trip | ☐ | |

---

### 🟢 AREA 7 — Profile & Archive
*Lower priority until users have trips to archive.*

| # | Feature | Status | Notes |
|---|---|---|---|
| 7.1 | World map header with visited city pins | ☐ | |
| 7.2 | Draggable trip rankings | ☐ | |
| 7.3 | Trip detail modal (photos, thoughts, itinerary) | ☐ | |
| 7.4 | Post-trip reflection flow (8 questions) | ☐ | |

---

### 🟢 AREA 8 — Auth & Account
| # | Feature | Status | Notes |
|---|---|---|---|
| 8.1 | Email/password register + login | ✅ | Working |
| 8.2 | Google OAuth | ☐ | In progress |
| 8.3 | Admin view of all users (Prisma Studio for now) | ✅ | Use npx prisma studio |

---

## URL Paste Comparison — How to Build (Area 3.5)

When user pastes 2-3 URLs of tour pages:
1. Backend fetches each URL's HTML content
2. Sends to Claude API (claude-haiku-4-5) with prompt:
   "Extract from this tour page: tour name, price, duration, whats included,
    whats not included, cancellation policy, departure time, meeting point.
    Return as JSON."
3. Frontend renders side-by-side comparison table
4. Highlights differences in red, matches in green

Claude Code prompt when ready:
"Build a POST /api/compare/urls endpoint that accepts an array of 2-3 URLs,
fetches each page's HTML, sends each to Claude API (claude-haiku-4-5) to extract
tour details as structured JSON, then returns a comparison object showing
all fields side by side with differences flagged."

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
  ✅ 100% refund if cancelled 7+ days before
  ⚠  50% refund if cancelled 3–7 days before
  ❌ No refund within 3 days

---

## Affiliate Link Strategy (Area 2.9)

When user clicks "Book":
- Activities → GetYourGuide affiliate link or Viator affiliate link
- Hotels → Booking.com affiliate link or direct hotel website
- Flights → Skyscanner affiliate link

Format: wrap the real URL with your affiliate tracking parameter
GetYourGuide: https://www.getyourguide.com/[activity]?partner_id=YOUR_ID
Viator: https://www.viator.com/[activity]?pid=YOUR_PARTNER_ID
Booking.com: https://www.booking.com/[hotel].html?aid=YOUR_AID

Store affiliate IDs in backend/.env:
GETYOURGUIDE_PARTNER_ID=""
VIATOR_PARTNER_ID=""
BOOKING_AID=""

---

## Mobile View Strategy (Area 2.12)

Two modes for the itinerary:
1. Planning mode (desktop) — full builder with sidebar, blocks, panels
2. Reference mode (mobile) — read-only, day-by-day, time-ordered,
   optimized for checking on your phone during the trip

Reference mode URL: /trips/[id]/view
Shareable link points to reference mode

---

## Build Order Recommendation

Given the feature list, build in this sequence:

Session 1:  2.4 + 2.5  — Edit and delete blocks (most blocking right now)
Session 2:  1.1        — Destination autocomplete
Session 3:  2.1 + 2.2  — Morning/afternoon/evening split + time display
Session 4:  3.1 + 3.2  — Activity search flow redesign
Session 5:  3.3        — Click to see reviews
Session 6:  5.1 + 5.5  — Smart to do list + tabbed panels
Session 7:  4.1 + 4.2  — Right sidebar suggestions
Session 8:  5.2 + 5.3  — Budget breakdown + per person view
Session 9:  3.6        — Flexible cancellation policy
Session 10: 2.7        — Confirmation # only when booked
Session 11: 2.6        — Participant selector
Session 12: 3.5        — URL paste comparison
Session 13: 2.9        — Affiliate book links
Session 14: 2.10       — Shareable link
Session 15: 2.11       — Calendar sync
Session 16: 2.12       — Mobile reference view

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

### Infrastructure
- [x] Monorepo scaffolded
- [x] Next.js 14 frontend initialized
- [x] Express backend initialized
- [x] Prisma schema with 11 models
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

### Trip Planning (Core — current focus)
- [x] Trip creation form
- [x] Itinerary builder scaffold
- [x] Block creation (flight, hotel, activity, food, note)
- [ ] Edit + delete blocks
- [ ] Destination autocomplete (City / Country single field)
- [ ] Morning / afternoon / evening day split
- [ ] Activity time display
- [ ] Overnight city label per day
- [ ] Activity search flow (type in OR search list)
- [ ] Hotel search flow (type in OR search list)
- [ ] Click reviews to read them inline
- [ ] URL paste comparison
- [ ] Flexible cancellation policy (tiered)
- [ ] Confirmation # only shows when status = booked
- [ ] Participant selector per block
- [ ] Smart To Do list
- [ ] Budget tab — overall + per person view
- [ ] Research tab — Trip Intelligence panel
- [ ] Right sidebar suggestions (hotel / activity / restaurant)
- [ ] Affiliate book links
- [ ] Shareable read-only link
- [ ] Calendar sync
- [ ] Mobile reference view

### Discover
- [ ] Community feed
- [ ] Friends feed
- [ ] Interactive map

### Profile & Archive
- [ ] World map header
- [ ] Draggable rankings
- [ ] Trip detail modal
- [ ] Post-trip reflection flow
- [ ] Photo upload
- [ ] PDF itinerary upload

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
