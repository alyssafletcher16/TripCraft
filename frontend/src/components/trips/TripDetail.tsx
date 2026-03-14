'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useCityPhoto } from '@/hooks/useCityPhoto'
import { useSession } from 'next-auth/react'
import { ItineraryDay } from './ItineraryDay'
import { ReflectionModal } from './ReflectionModal'
import { GlobalItinerarySearch } from './GlobalItinerarySearch'
import { ActivityCompareModal, type Tour } from './ActivityCompareModal'
import { Badge } from '@/components/ui/Badge'
import type { Trip, TripStatus, ChecklistItem, Block } from '@/types'
import { api } from '@/lib/api'

// ── Geo helpers (world map) ────────────────────────────────────────────────────
function geo(lon: number, lat: number): [number, number] {
  return [(lon + 180) / 360 * 500, (90 - lat) / 180 * 200]
}
const CITY_COORDS: Record<string, [number, number]> = {
  'paris': [2, 49], 'france': [2, 47], 'rome': [12, 42], 'italy': [12, 42],
  'amalfi': [14, 40], 'amalfi coast': [14, 40], 'cinque terre': [10, 44],
  'sicily': [14, 37], 'palermo': [13, 38], 'barcelona': [2, 41], 'spain': [-4, 40],
  'lisbon': [-9, 39], 'portugal': [-9, 39], 'prague': [14, 50], 'london': [0, 51],
  'amsterdam': [5, 52], 'berlin': [13, 52], 'vienna': [16, 48], 'athens': [24, 38],
  'greece': [22, 38], 'kyoto': [136, 35], 'tokyo': [140, 36], 'japan': [138, 36],
  'bangkok': [101, 14], 'thailand': [101, 14], 'bali': [115, -8], 'indonesia': [118, -2],
  'singapore': [104, 1], 'vietnam': [108, 14], 'india': [78, 22], 'nepal': [84, 28],
  'new york': [-74, 41], 'nyc': [-74, 41], 'usa': [-98, 38], 'miami': [-80, 26],
  'los angeles': [-118, 34], 'mexico': [-99, 23], 'oaxaca': [-97, 17],
  'peru': [-76, -10], 'lima': [-77, -12], 'salkantay': [-72, -13],
  'machu picchu': [-72, -13], 'argentina': [-65, -35], 'patagonia': [-70, -45],
  'brazil': [-53, -10], 'morocco': [-8, 32], 'marrakech': [-8, 32],
  'kenya': [37, 0], 'australia': [135, -25], 'sydney': [151, -34],
  'new zealand': [174, -41], 'canada': [-95, 55],
}
function destinationToCoords(dest: string): [number, number] | null {
  const lower = dest.toLowerCase()
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(key)) return coords
  }
  return null
}
const P = (pts: [number, number][], i: number) => `${i === 0 ? 'M' : 'L'} ${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`
const mkPath = (pts: [number, number][]) => pts.map((_, i) => P(pts, i)).join(' ') + 'Z'
const ALL_LAND = [
  mkPath([geo(-168,66),geo(-145,61),geo(-135,58),geo(-124,48),geo(-124,40),geo(-117,33),geo(-110,23),geo(-105,19),geo(-90,16),geo(-80,9),geo(-78,9),geo(-76,15),geo(-80,25),geo(-80,32),geo(-76,35),geo(-70,42),geo(-63,45),geo(-53,47),geo(-55,52),geo(-56,58),geo(-65,62),geo(-80,63),geo(-95,62),geo(-100,72),geo(-120,70),geo(-140,60),geo(-158,55)]),
  mkPath([geo(-80,9),geo(-77,8),geo(-76,2),geo(-80,-2),geo(-80,-10),geo(-75,-14),geo(-70,-20),geo(-70,-30),geo(-72,-38),geo(-70,-45),geo(-68,-55),geo(-64,-55),geo(-58,-51),geo(-52,-32),geo(-40,-22),geo(-35,-8),geo(-35,-5),geo(-48,0),geo(-60,8),geo(-63,10),geo(-75,11)]),
  mkPath([geo(-9,37),geo(-9,44),geo(-2,44),geo(2,47),geo(1,51),geo(4,52),geo(8,55),geo(10,58),geo(15,56),geo(18,60),geo(28,64),geo(32,65),geo(30,60),geo(24,56),geo(22,54),geo(14,53),geo(14,47),geo(8,47),geo(12,44),geo(16,41),geo(18,39),geo(16,38),geo(12,38),geo(16,37),geo(22,38),geo(26,40),geo(29,41),geo(30,44),geo(22,38),geo(14,36),geo(8,36),geo(-5,36)]),
  mkPath([geo(-6,36),geo(5,37),geo(12,36),geo(18,30),geo(26,30),geo(33,28),geo(44,11),geo(51,11),geo(51,3),geo(44,-4),geo(39,-8),geo(35,-20),geo(32,-30),geo(18,-35),geo(14,-34),geo(8,-22),geo(8,-14),geo(-4,4),geo(-8,5),geo(-18,14),geo(-18,20),geo(-14,28),geo(-8,36)]),
  mkPath([geo(26,40),geo(36,36),geo(36,42),geo(42,42),geo(54,42),geo(60,44),geo(68,38),geo(72,24),geo(80,10),geo(92,8),geo(100,4),geo(104,2),geo(104,10),geo(116,20),geo(122,30),geo(130,34),geo(140,36),geo(145,44),geo(142,52),geo(135,54),geo(130,60),geo(140,60),geo(155,60),geo(162,64),geo(165,70),geo(140,70),geo(108,73),geo(90,72),geo(70,68),geo(54,68),geo(40,62),geo(32,65),geo(30,60),geo(24,56),geo(30,48),geo(30,44)]),
  mkPath([geo(114,-22),geo(122,-18),geo(130,-12),geo(136,-12),geo(142,-11),geo(150,-22),geo(154,-26),geo(152,-38),geo(148,-38),geo(140,-38),geo(132,-34),geo(126,-34),geo(120,-34),geo(114,-34),geo(114,-28)]),
]

// ── Types ──────────────────────────────────────────────────────────────────────
type ResearchItem = {
  id: string
  activityName: string
  tour: {
    provider: string
    bookingCompany: string
    price: number
    currency: string
    duration: string
    groupSize: string
    pickupDetails: string
    cancel: string
    bookingUrl?: string
  }
  savedAt: string
}

type SearchActivity = {
  name: string
  icon: string
  category: string
  minPrice: number
  maxPrice: number
  currency: string
  topRating: number
  totalReviews: number
  companies: number
}

type SavedLink = {
  id: string
  url: string
  title: string
  platform: string
  savedAt: string
}

const STATUS_LABEL: Record<TripStatus, string> = {
  PLANNING: 'Active', ACTIVE: 'Active', COMPLETED: 'Completed',
}
const STATUS_VARIANT: Record<TripStatus, 'gold' | 'green' | 'ocean' | 'slate'> = {
  ACTIVE: 'gold', COMPLETED: 'green', PLANNING: 'gold',
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

// ── Price parser ───────────────────────────────────────────────────────────────
function parsePrice(s: string | null): number {
  if (!s) return 0
  const m = s.match(/([\d,]+)/)
  return m ? parseInt(m[1].replace(/,/g, '')) : 0
}

function detectPlatform(url: string): string {
  const u = url.toLowerCase()
  if (u.includes('tiktok'))    return 'TikTok'
  if (u.includes('instagram')) return 'Instagram'
  if (u.includes('youtube') || u.includes('youtu.be')) return 'YouTube'
  if (u.includes('reddit'))    return 'Reddit'
  if (u.includes('twitter') || u.includes('x.com'))  return 'X'
  return 'Link'
}

// ── Suggestions panel (Itinerary right rail) ────────────────────────────────
function SuggestionsPanel({
  destination,
  onAdd,
}: {
  destination: string
  onAdd: (act: SearchActivity) => void
}) {
  const [acts, setActs] = useState<SearchActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/api/activities?destination=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((d) => { setActs((d.activities ?? []).slice(0, 6)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [destination])

  return (
    <div className="sticky top-4">
      <div className="font-mono text-[9px] text-slate tracking-[2px] uppercase mb-3">
        Suggested for {destination.split(',')[0]}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-mist p-3 animate-pulse">
              <div className="h-3 bg-foam rounded w-3/4 mb-2" />
              <div className="h-2.5 bg-foam rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {acts.map((act) => (
            <div
              key={act.name}
              className="bg-foam rounded-xl border-[1.5px] border-mist p-3 flex gap-2.5 items-start hover:border-terra hover:bg-white transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-white border border-mist flex items-center justify-center text-base flex-shrink-0">
                {act.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium text-ink truncate">{act.name}</div>
                <div className="text-[10px] text-slate mt-0.5">
                  {act.currency}{act.minPrice}–{act.maxPrice} · ★{act.topRating}
                </div>
              </div>
              <button
                onClick={() => onAdd(act)}
                className="flex-shrink-0 text-[11px] text-slate border-[1.5px] border-mist rounded-lg px-2 py-1 group-hover:border-terra group-hover:text-terra transition-colors bg-white"
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Intel panel */}
      <div className="mt-4 rounded-xl overflow-hidden border border-mist">
        <div className="bg-ocean px-3 py-2.5">
          <div className="font-mono text-[9px] text-gold/80 tracking-[1.5px] uppercase">Trip Intel</div>
        </div>
        <div className="bg-white divide-y divide-mist">
          {[
            { c: '#5BAD7A', t: `Book popular activities early — demand peaks 2–4 weeks before travel.` },
            { c: '#D4A843', t: `Compare prices across Viator and GetYourGuide for the same tour.` },
            { c: '#6B9FD4', t: `Free cancellation tours let you lock in dates without risk.` },
          ].map((ins, i) => (
            <div key={i} className="flex gap-2.5 px-3 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full mt-[5px] flex-shrink-0" style={{ background: ins.c }} />
              <p className="text-[11px] text-slate leading-relaxed">{ins.t}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Map tab ────────────────────────────────────────────────────────────────────
function MapTab({ trip }: { trip: Trip }) {
  const coords = destinationToCoords(trip.destination)
  const pin = coords ? geo(...coords) : null

  const allBlocks = trip.days.flatMap((d) => d.blocks)
  const booked   = allBlocks.filter((b) => b.status === 'BOOKED').length
  const pending  = allBlocks.filter((b) => b.status === 'PENDING').length

  let duration = 0
  if (trip.startDate && trip.endDate) {
    duration = Math.round(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86_400_000
    ) + 1
  } else {
    duration = trip.days.length
  }

  return (
    <div className="flex flex-col gap-5">
      {/* World map */}
      <div className="rounded-2xl overflow-hidden border border-mist" style={{ background: '#071825' }}>
        <div className="px-5 py-3 border-b border-white/6 flex items-center justify-between">
          <div>
            <span className="font-serif text-white text-base font-bold">{trip.destination}</span>
            {trip.country && <span className="text-slate text-xs ml-2">· {trip.country}</span>}
          </div>
          {trip.startDate && (
            <span className="font-mono text-[10px] text-slate tracking-wide">
              {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {trip.endDate ? ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
            </span>
          )}
        </div>
        <div className="relative" style={{ height: 260 }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 500 200"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Grid */}
            {Array.from({ length: 18 }).map((_, i) => (
              <line key={`v${i}`} x1={(i+1)*500/18} y1={0} x2={(i+1)*500/18} y2={200} stroke="#fff" strokeWidth={0.3} opacity={0.05}/>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={(i+1)*200/8} x2={500} y2={(i+1)*200/8} stroke="#fff" strokeWidth={0.3} opacity={0.05}/>
            ))}
            {/* Continents */}
            {ALL_LAND.map((d, i) => (
              <path key={i} d={d} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth={0.7} strokeLinejoin="round"/>
            ))}
            {/* Destination pin */}
            {pin && (
              <g>
                <circle cx={pin[0]} cy={pin[1]} r={14} fill="rgba(201,168,76,0.12)">
                  <animate attributeName="r" values="10;18;10" dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx={pin[0]} cy={pin[1]} r={6} fill="rgba(201,168,76,0.35)"/>
                <circle cx={pin[0]} cy={pin[1]} r={3.5} fill="#C9A84C"/>
                <circle cx={pin[0]} cy={pin[1]} r={1.8} fill="#fff"/>
              </g>
            )}
            {!pin && (
              <text x="250" y="105" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.3)" fontFamily="DM Mono, monospace">
                Add destination coordinates to see pin
              </text>
            )}
          </svg>
        </div>
        {/* Stats strip */}
        <div className="px-5 py-3 border-t border-white/6 flex flex-wrap gap-x-6 gap-y-2">
          {[
            { n: duration || '—', l: 'Days' },
            { n: trip.days.length, l: 'Itinerary days' },
            { n: allBlocks.length, l: 'Total stops' },
            { n: booked, l: 'Booked' },
            { n: pending, l: 'Pending' },
          ].map((s, i) => (
            <div key={i}>
              <div className="font-serif text-lg font-bold text-gold">{s.n}</div>
              <div className="text-[10px] text-slate mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day timeline */}
      <div className="bg-white rounded-2xl border border-mist overflow-hidden">
        <div className="px-5 py-3 border-b border-mist">
          <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Itinerary Sequence</span>
        </div>
        <div className="divide-y divide-mist">
          {trip.days.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate">No days added yet.</p>
          )}
          {trip.days.map((day, idx) => (
            <div key={day.id} className="px-5 py-4 flex gap-4">
              <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 40 }}>
                <div className="w-7 h-7 rounded-full bg-ocean text-white text-[11px] font-bold font-mono flex items-center justify-center">
                  {day.dayNum}
                </div>
                {idx < trip.days.length - 1 && (
                  <div className="w-px flex-1 min-h-[20px]" style={{ background: 'linear-gradient(to bottom, #D6E4EE, transparent)' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-ink text-sm">{day.name || `Day ${day.dayNum}`}</span>
                  {day.date && (
                    <span className="font-mono text-[10px] text-slate">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                {day.blocks.length === 0 ? (
                  <p className="text-[11px] text-slate italic">No blocks yet</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {day.blocks.map((b) => (
                      <span
                        key={b.id}
                        className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border"
                        style={{
                          background: b.status === 'BOOKED' ? 'rgba(46,125,79,0.08)' : 'rgba(157,78,31,0.08)',
                          borderColor: b.status === 'BOOKED' ? 'rgba(46,125,79,0.25)' : 'rgba(157,78,31,0.25)',
                          color: b.status === 'BOOKED' ? '#2E7D4F' : '#9D4E1F',
                        }}
                      >
                        {b.emoji ?? (b.type === 'STAY' ? '🏨' : b.type === 'TRANSPORT' ? '✈' : b.type === 'FOOD' ? '🍽' : '📍')}
                        {b.title.length > 28 ? b.title.slice(0, 28) + '…' : b.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── To Do tab ──────────────────────────────────────────────────────────────────
function TodoTab({
  trip,
  accessToken,
  onUpdate,
}: {
  trip: Trip
  accessToken?: string
  onUpdate: () => void
}) {
  const [items, setItems] = useState<ChecklistItem[]>(trip.checklist ?? [])
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  const [pendingBlocks, setPendingBlocks] = useState<Block[]>(
    trip.days.flatMap((d) => d.blocks.filter((b) => b.status === 'PENDING'))
  )

  useEffect(() => {
    setPendingBlocks(trip.days.flatMap((d) => d.blocks.filter((b) => b.status === 'PENDING')))
  }, [trip.days])

  async function markBooked(block: Block) {
    setPendingBlocks((p) => p.filter((b) => b.id !== block.id))
    try {
      await fetch(`${API}/api/days/${block.dayId}/blocks/${block.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ status: 'BOOKED' }),
      })
      onUpdate()
    } catch {}
  }

  const done = items.filter((i) => i.done).length
  const total = items.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  async function toggle(item: ChecklistItem) {
    setItems((p) => p.map((i) => i.id === item.id ? { ...i, done: !i.done } : i))
    try {
      await fetch(`${API}/api/trips/${trip.id}/checklist/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ done: !item.done }),
      })
    } catch {}
  }

  async function addItem() {
    if (!newLabel.trim()) return
    setAdding(true)
    try {
      const res = await fetch(`${API}/api/trips/${trip.id}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ label: newLabel.trim() }),
      })
      if (res.ok) {
        const item = await res.json()
        setItems((p) => [...p, item])
        setNewLabel('')
        setShowAdd(false)
        onUpdate()
      }
    } finally { setAdding(false) }
  }

  async function deleteItem(id: string) {
    setItems((p) => p.filter((i) => i.id !== id))
    await fetch(`${API}/api/trips/${trip.id}/checklist/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => {})
  }

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      {/* Progress */}
      <div className="bg-white rounded-2xl border border-mist p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-xl font-bold text-ink">Smart To Do</h2>
          <span
            className="font-mono text-sm font-medium"
            style={{ color: pct === 100 ? '#2E7D4F' : '#C4603A' }}
          >
            {pct}% complete
          </span>
        </div>
        <div className="h-1.5 bg-foam rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #C4603A, #C9A84C)' }}
          />
        </div>
      </div>

      {/* Pending blocks — auto-derived bookings */}
      {pendingBlocks.length > 0 && (
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="px-5 py-3 border-b border-mist flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Action needed from itinerary</span>
            <span className="bg-terra/10 text-terra text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingBlocks.length}</span>
          </div>
          <div className="divide-y divide-mist">
            {pendingBlocks.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                <button
                  onClick={() => markBooked(b)}
                  className="w-5 h-5 rounded-md border-2 border-mist flex-shrink-0 flex items-center justify-center transition-all hover:border-ocean hover:bg-ocean/10"
                  title="Mark as booked"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-ink">Book: {b.title}</div>
                  {b.price && <div className="text-[11px] text-slate">{b.price}</div>}
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(157,78,31,0.08)', color: '#9D4E1F', border: '1px solid rgba(157,78,31,0.2)' }}
                >
                  pending
                </span>
                {b.bookingUrl && (
                  <a
                    href={b.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-terra font-medium hover:underline whitespace-nowrap"
                  >
                    Book →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist items */}
      {items.length > 0 && (
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="px-5 py-3 border-b border-mist">
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Your checklist</span>
          </div>
          <div className="divide-y divide-mist">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3 group">
                <button
                  onClick={() => toggle(item)}
                  className="w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all"
                  style={{
                    borderColor: item.done ? '#0D2B45' : '#D6E4EE',
                    background: item.done ? '#0D2B45' : 'transparent',
                  }}
                >
                  {item.done && (
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span
                  className="flex-1 text-sm transition-colors"
                  style={{ color: item.done ? '#5B7A8E' : '#0A1F30', textDecoration: item.done ? 'line-through' : 'none' }}
                >
                  {item.label}
                </span>
                {item.deadline && (
                  <span className="font-mono text-[10px] text-terra flex-shrink-0">{item.deadline}</span>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 sm:p-1 text-slate hover:text-red-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add item */}
      {showAdd ? (
        <div className="bg-white rounded-2xl border-[1.5px] border-terra p-4 flex gap-2">
          <input
            autoFocus
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addItem(); if (e.key === 'Escape') { setShowAdd(false); setNewLabel('') } }}
            placeholder="e.g. Book travel insurance"
            className="flex-1 text-sm outline-none text-ink placeholder:text-slate"
          />
          <button
            onClick={addItem}
            disabled={adding || !newLabel.trim()}
            className="px-4 py-1.5 rounded-full bg-terra text-white text-xs font-semibold disabled:opacity-40"
          >
            {adding ? '…' : 'Add'}
          </button>
          <button
            onClick={() => { setShowAdd(false); setNewLabel('') }}
            className="px-3 py-1.5 rounded-full border border-mist text-xs text-slate"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl border-[1.5px] border-dashed border-mist text-slate text-sm hover:border-terra hover:text-terra transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
          </svg>
          Add checklist item
        </button>
      )}
    </div>
  )
}

// ── Budget tab ─────────────────────────────────────────────────────────────────
function BudgetTab({ trip, accessToken, onUpdate }: { trip: Trip; accessToken?: string; onUpdate?: () => void }) {
  const [perPerson, setPerPerson] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)
  const div = perPerson ? (trip.travelers || 1) : 1
  const pp = perPerson ? ' / person' : ''

  const allBlocks = trip.days.flatMap((d) => d.blocks)

  const CATS = [
    { key: 'STAY',      label: 'Accommodation', icon: '🏨', pct: 0.40 },
    { key: 'ACTIVITY',  label: 'Activities',     icon: '🎭', pct: 0.20 },
    { key: 'FOOD',      label: 'Food & Drink',   icon: '🍽', pct: 0.25 },
    { key: 'TRANSPORT', label: 'Transport',       icon: '✈',  pct: 0.10 },
    { key: 'NOTE',      label: 'Other',           icon: '📝', pct: 0.05 },
  ] as const

  const totalBudget = trip.budget ?? 0
  const budgetBase  = perPerson && trip.budgetType === 'total'
    ? totalBudget / (trip.travelers || 1)
    : (!perPerson && trip.budgetType === 'per_person')
    ? totalBudget * (trip.travelers || 1)
    : totalBudget

  const rows = CATS.map(({ key, label, icon, pct }) => {
    const blocks = allBlocks.filter((b) => b.type === key)
    const spent   = blocks.reduce((s, b) => s + (b.priceValue ?? parsePrice(b.price)), 0) / div
    const target  = budgetBase > 0 ? Math.round(budgetBase * pct) : 0
    const over    = target > 0 && spent > target
    const fillPct = target > 0 ? Math.min((spent / target) * 100, 100) : 0
    return { key, label, icon, spent: Math.round(spent), target, over, fillPct, count: blocks.length }
  })

  const totalSpent = rows.reduce((s, r) => s + r.spent, 0)

  function startEditBudget() {
    setBudgetInput(trip.budget ? String(trip.budget) : '')
    setEditingBudget(true)
  }

  async function saveBudget() {
    const val = parseFloat(budgetInput)
    if (isNaN(val) || val < 0) { setEditingBudget(false); return }
    if (!accessToken) return
    setSavingBudget(true)
    try {
      await api.trips.update(trip.id, { budget: val }, accessToken)
      onUpdate?.()
    } finally {
      setSavingBudget(false)
      setEditingBudget(false)
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-mist p-5">
          <div className="text-[11px] text-slate mb-1.5">Current Trip Cost{pp}</div>
          <div className="font-mono text-2xl font-medium text-ink">${totalSpent.toLocaleString()}</div>
        </div>
        <div
          className="bg-white rounded-2xl border border-mist p-5 cursor-pointer group relative"
          onClick={() => !editingBudget && startEditBudget()}
          title="Click to edit budget"
        >
          <div className="text-[11px] text-slate mb-1.5 flex items-center justify-between">
            <span>{trip.budget ? `Budget${pp}` : 'No budget set'}</span>
            {!editingBudget && (
              <svg className="w-3 h-3 text-slate opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            )}
          </div>
          {editingBudget ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <span className="font-mono text-xl text-ocean">$</span>
              <input
                autoFocus
                type="number"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveBudget(); if (e.key === 'Escape') setEditingBudget(false) }}
                onBlur={saveBudget}
                className="font-mono text-xl font-medium text-ocean w-full bg-transparent border-b border-ocean outline-none"
                disabled={savingBudget}
              />
            </div>
          ) : (
            <div className="font-mono text-2xl font-medium text-ocean">
              {trip.budget ? `$${Math.round(budgetBase).toLocaleString()}` : '—'}
            </div>
          )}
        </div>
      </div>

      {/* View toggle for multi-traveler trips */}
      {trip.travelers > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate font-mono">View:</span>
          <div className="flex rounded-full border border-mist overflow-hidden text-[11px] font-mono">
            <button
              onClick={() => setPerPerson(false)}
              className="px-4 py-1.5 transition-colors"
              style={{ background: !perPerson ? '#0D2B45' : 'transparent', color: !perPerson ? '#fff' : '#5B7A8E' }}
            >
              See all
            </button>
            <button
              onClick={() => setPerPerson(true)}
              className="px-4 py-1.5 transition-colors border-l border-mist"
              style={{ background: perPerson ? '#0D2B45' : 'transparent', color: perPerson ? '#fff' : '#5B7A8E' }}
            >
              Per traveler
            </button>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.key} className="bg-white rounded-2xl border border-mist p-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-medium text-ink flex items-center gap-2">
                <span>{r.icon}</span>{r.label}
                {r.count > 0 && (
                  <span className="font-mono text-[10px] text-slate bg-foam px-1.5 py-0.5 rounded-full">
                    {r.count} item{r.count !== 1 ? 's' : ''}
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px]" style={{ color: r.over ? '#C04040' : '#5B7A8E' }}>
                ${r.spent.toLocaleString()}{pp}
                {r.target > 0 && <span className="text-mist"> / ${r.target.toLocaleString()}{pp}</span>}
              </span>
            </div>
            <div className="h-1.5 bg-foam rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: r.count === 0 ? '0%' : `${r.fillPct}%`,
                  background: r.over ? '#C04040' : '#C4603A',
                }}
              />
            </div>
            {r.over && (
              <div className="font-mono text-[10px] text-[#C04040] mt-1.5">
                ⚠ ${(r.spent - r.target).toLocaleString()} over estimate
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Remaining */}
      {trip.budget && (
        <div
          className="px-5 py-3.5 rounded-2xl text-[13px]"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', color: '#5B7A8E' }}
        >
          💡 ${Math.max(0, Math.round(budgetBase) - totalSpent).toLocaleString()} remaining{pp} · {trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

// ── Research tab ───────────────────────────────────────────────────────────────
function ResearchTab({
  trip,
  tripId,
  researchItems,
  onAddToDay,
  onRemoveResearch,
}: {
  trip: Trip
  tripId: string
  researchItems: ResearchItem[]
  onAddToDay: (item: ResearchItem) => void
  onRemoveResearch: (id: string) => void
}) {
  const [filter, setFilter] = useState<'tours' | 'stays' | 'tips' | 'blogs' | 'saved' | 'links'>('tours')
  const [savedLinks, setSavedLinks] = useState<SavedLink[]>([])
  const [linkInput, setLinkInput] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [addingLink, setAddingLink] = useState(false)
  type ResearchResult = { title: string; url: string; description: string; source: string; rating?: string; price?: string }
  const [researchData, setResearchData] = useState<{ blogs: ResearchResult[]; tours: ResearchResult[]; stays: ResearchResult[]; tips: ResearchResult[] } | null>(null)
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchError, setResearchError] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`tripcraft_links_${tripId}`)
      if (stored) setSavedLinks(JSON.parse(stored))
    } catch {}
  }, [tripId])

  useEffect(() => {
    if (!trip.destination) return
    const cacheKey = `tripcraft_research_data_${trip.destination}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try { setResearchData(JSON.parse(cached)); return } catch {}
    }
    setResearchLoading(true)
    setResearchError(false)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    fetch(`${API_URL}/api/blogs/${encodeURIComponent(trip.destination)}`)
      .then((r) => r.json())
      .then((data) => {
        const parsed = {
          blogs: data.blogs ?? [],
          tours: data.tours ?? [],
          stays: data.stays ?? [],
          tips: data.tips ?? [],
        }
        setResearchData(parsed)
        sessionStorage.setItem(cacheKey, JSON.stringify(parsed))
      })
      .catch(() => setResearchError(true))
      .finally(() => setResearchLoading(false))
  }, [trip.destination])

  function saveLink() {
    if (!linkInput.trim()) return
    const link: SavedLink = {
      id: Date.now().toString(),
      url: linkInput.trim(),
      title: linkTitle.trim() || linkInput.trim(),
      platform: detectPlatform(linkInput.trim()),
      savedAt: new Date().toISOString(),
    }
    const updated = [link, ...savedLinks]
    setSavedLinks(updated)
    localStorage.setItem(`tripcraft_links_${tripId}`, JSON.stringify(updated))
    setLinkInput('')
    setLinkTitle('')
    setAddingLink(false)
  }

  function removeLink(id: string) {
    const updated = savedLinks.filter((l) => l.id !== id)
    setSavedLinks(updated)
    localStorage.setItem(`tripcraft_links_${tripId}`, JSON.stringify(updated))
  }

  const PLATFORM_COLORS: Record<string, string> = {
    TikTok: '#010101', Instagram: '#E1306C', YouTube: '#FF0000',
    Reddit: '#FF4500', X: '#000000', Link: '#5B7A8E',
  }

  const FILTERS = [
    { id: 'tours',  label: 'Top Tours' },
    { id: 'stays',  label: 'Where to Stay' },
    { id: 'tips',   label: 'Tips & Tricks' },
    { id: 'blogs',  label: 'Blog Posts' },
    { id: 'saved',  label: `Saved Tours (${researchItems.length})` },
    { id: 'links',  label: `Social Links (${savedLinks.length})` },
  ] as const

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      <div>
        <h2 className="font-serif text-2xl font-bold text-ink mb-1">Research Hub</h2>
        <p className="text-sm text-slate">
          {researchData
            ? `Tours, stays, tips & blog posts for ${trip.destination}`
            : `Research hub for ${trip.destination}`}
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              background: filter === f.id ? '#0D2B45' : '#fff',
              color: filter === f.id ? '#fff' : '#5B7A8E',
              borderColor: filter === f.id ? '#0D2B45' : '#D6E4EE',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Web research — one category at a time */}
      {(filter === 'tours' || filter === 'stays' || filter === 'tips' || filter === 'blogs') && (
        <>
          {researchLoading && (
            <div className="bg-white rounded-2xl border border-mist px-5 py-10 text-center">
              <div className="inline-block w-5 h-5 border-2 border-ocean/30 border-t-ocean rounded-full animate-spin mb-3" />
              <p className="text-slate text-sm">Finding top suggestions for {trip.destination.split(',')[0]}…</p>
            </div>
          )}
          {researchError && (
            <div className="bg-white rounded-2xl border border-mist px-5 py-8 text-center">
              <p className="text-slate text-sm">Could not load suggestions. Try again later.</p>
            </div>
          )}
          {researchData && (() => {
            const categoryMap: Record<string, { label: string; dot: string }> = {
              tours: { label: 'Top Tours & Experiences', dot: '#2E7D4F' },
              stays: { label: 'Where to Stay',           dot: '#0D2B45' },
              tips:  { label: 'Tips & Tricks',           dot: '#D4A843' },
              blogs: { label: 'Travel Blog Posts',       dot: '#5B7A8E' },
            }
            const { label, dot } = categoryMap[filter]
            const items = researchData[filter as keyof typeof researchData]
            if (items.length === 0) return (
              <div className="bg-white rounded-2xl border border-mist px-5 py-8 text-center">
                <p className="text-slate text-sm">No results found for this category.</p>
              </div>
            )
            return (
              <div className="bg-white rounded-2xl border border-mist overflow-hidden">
                <div className="px-5 py-3.5 border-b border-mist flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate uppercase tracking-wider">{label}</span>
                  <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="divide-y divide-mist">
                  {items.map((item, i) => (
                    <a
                      key={i}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 px-5 py-4 hover:bg-foam/50 transition-colors group"
                    >
                      <div className="w-2 h-2 rounded-full mt-[5px] flex-shrink-0 transition-opacity group-hover:opacity-100 opacity-60" style={{ background: dot }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] text-ocean font-medium leading-snug group-hover:underline">{item.title}</p>
                        {item.description && (
                          <p className="text-[12px] text-ink/70 leading-relaxed mt-0.5">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {item.rating && (
                            <span className="font-mono text-[10px] text-[#2E7D4F]">★ {item.rating}</span>
                          )}
                          {item.price && (
                            <span className="font-mono text-[10px] text-slate">{item.price}</span>
                          )}
                          <span className="font-mono text-[10px] text-slate flex items-center gap-1">
                            {item.source} <span className="opacity-50">↗</span>
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )
          })()}
        </>
      )}

      {/* Saved tour comparisons */}
      {filter === 'saved' && researchItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="px-5 py-3.5 border-b border-mist flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Saved Tour Comparisons</span>
            <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-0.5 rounded-full">
              {researchItems.length}
            </span>
          </div>
          <div className="divide-y divide-mist">
            {researchItems.map((item) => (
              <div key={item.id} className="px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink text-sm truncate">{item.activityName}</div>
                  <div className="text-[11px] text-slate mt-0.5">
                    {item.tour.provider} · {item.tour.bookingCompany} · {item.tour.duration}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] font-semibold text-[#2E7D4F]">
                      {item.tour.currency} {item.tour.price}/person
                    </span>
                    {item.tour.cancel.startsWith('Free') && (
                      <span className="text-[10px] text-[#2E7D4F] border border-[#2E7D4F]/30 rounded-full px-2 py-px">
                        Free cancel
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.tour.bookingUrl && (
                    <a
                      href={item.tour.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-full border border-terra text-terra text-xs font-medium hover:bg-terra/5 transition-colors whitespace-nowrap"
                    >
                      Book ↗
                    </a>
                  )}
                  <button
                    onClick={() => onAddToDay(item)}
                    className="px-3 py-1.5 rounded-full bg-terra text-white text-xs font-medium hover:bg-terra-lt transition-colors whitespace-nowrap"
                  >
                    Add to Day
                  </button>
                  <button
                    onClick={() => onRemoveResearch(item.id)}
                    className="p-1.5 text-slate hover:text-red-500 transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved social / web links */}
      {filter === 'links' && (
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="px-5 py-3.5 border-b border-mist flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Saved Social & Web Links</span>
              {savedLinks.length > 0 && (
                <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {savedLinks.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setAddingLink((p) => !p)}
              className="text-xs text-terra font-medium hover:underline"
            >
              + Add link
            </button>
          </div>

          {/* Add link form */}
          {addingLink && (
            <div className="px-5 py-4 border-b border-mist flex flex-col gap-2 bg-foam">
              <input
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Paste a TikTok, Instagram, YouTube, or web link…"
                className="w-full text-sm px-3 py-2 rounded-xl border border-mist bg-white outline-none focus:border-terra transition-colors"
              />
              <input
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder="Title / description (optional)"
                className="w-full text-sm px-3 py-2 rounded-xl border border-mist bg-white outline-none focus:border-terra transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveLink}
                  disabled={!linkInput.trim()}
                  className="px-4 py-1.5 rounded-full bg-terra text-white text-xs font-semibold disabled:opacity-40"
                >
                  Save link
                </button>
                <button
                  onClick={() => { setAddingLink(false); setLinkInput(''); setLinkTitle('') }}
                  className="px-4 py-1.5 rounded-full border border-mist text-xs text-slate"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {savedLinks.length === 0 && !addingLink ? (
            <div className="px-5 py-8 text-center">
              <p className="text-2xl mb-2">🔗</p>
              <p className="text-sm text-slate mb-1">No links saved yet</p>
              <p className="text-xs text-slate">
                Save TikToks, Instagram reels, YouTube guides, and web articles here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-mist">
              {savedLinks.map((link) => {
                const color = PLATFORM_COLORS[link.platform] ?? '#5B7A8E'
                return (
                  <div key={link.id} className="flex items-center gap-3 px-5 py-3.5 group">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: color }}
                    >
                      {link.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{link.title}</div>
                      <div className="text-[11px] text-slate truncate">{link.platform} · {new Date(link.savedAt).toLocaleDateString()}</div>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate hover:text-terra transition-colors flex-shrink-0"
                    >
                      Open ↗
                    </a>
                    <button
                      onClick={() => removeLink(link.id)}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 sm:p-1 text-slate hover:text-red-500 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Research Day Picker ────────────────────────────────────────────────────────
function ResearchDayPicker({
  days,
  adding,
  onPick,
  onCancel,
}: {
  days: Array<{ id: string; dayNum: number; name: string | null; date: string | null }>
  adding: boolean
  onPick: (dayId: string) => void
  onCancel: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
        <div className="font-serif text-lg font-bold text-ink mb-1">Add to which day?</div>
        <div className="text-xs text-slate mb-4">Choose the day to add this activity.</div>
        <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
          {days.map((day) => (
            <button
              key={day.id}
              onClick={() => onPick(day.id)}
              disabled={adding}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-mist hover:border-terra hover:bg-foam text-left transition-colors disabled:opacity-50"
            >
              <span className="w-7 h-7 rounded-full bg-ocean text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {day.dayNum}
              </span>
              <div>
                <div className="text-sm font-medium text-ink">{day.name || `Day ${day.dayNum}`}</div>
                {day.date && (
                  <div className="text-[11px] text-slate">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="mt-3 w-full py-2 border border-mist rounded-xl text-sm text-slate hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Tab config ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'itinerary', label: 'Itinerary' },
  { id: 'map',       label: 'Map'       },
  { id: 'todo',      label: 'To Do'     },
  { id: 'budget',    label: 'Budget'    },
  { id: 'research',  label: 'Research'  },
] as const
type TabId = typeof TABS[number]['id']

const TAB_ICONS: Record<TabId, ReactNode> = {
  itinerary: (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="14" y2="18"/>
    </svg>
  ),
  map: (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  todo: (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/>
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  budget: (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  research: (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
}

// ── Main trip detail view ──────────────────────────────────────────────────────
export function TripDetail({ tripId }: { tripId: string }) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [trip, setTrip] = useState<Trip | null>(null)
  const cityPhoto = useCityPhoto(trip?.destination ?? '')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reflecting, setReflecting] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('itinerary')
  const [pendingComplete, setPendingComplete] = useState(false)
  const [shareAnonymous, setShareAnonymous] = useState(false)
  const [confirming, setConfirming] = useState(false)

  // Research state
  const [searchActivity, setSearchActivity] = useState<SearchActivity | null>(null)
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([])
  const [researchAddPending, setResearchAddPending] = useState<ResearchItem | null>(null)
  const [researchAdding, setResearchAdding] = useState(false)

  const fetchTrip = useCallback(() => {
    if (!session?.accessToken) return
    fetch(`${API}/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Trip not found')
        return r.json()
      })
      .then(async (data: Trip) => {
        if (data.days.length === 0 && data.startDate && data.endDate) {
          const start = new Date(data.startDate)
          const end   = new Date(data.endDate)
          const numDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
          await Promise.all(
            Array.from({ length: numDays }, (_, i) => {
              const date = new Date(start.getTime() + i * 86_400_000).toISOString().split('T')[0]
              return fetch(`${API}/api/trips/${tripId}/days`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
                body: JSON.stringify({ dayNum: i + 1, name: `Day ${i + 1}`, date, theme: null }),
              })
            })
          )
          return fetch(`${API}/api/trips/${tripId}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }).then((r) => r.json())
        }
        return data
      })
      .then((data) => { setTrip(data); setLoading(false) })
      .catch(() => { setError('Failed to load trip'); setLoading(false) })
  }, [session?.accessToken, tripId])

  useEffect(() => {
    if (sessionStatus !== 'loading') fetchTrip()
  }, [fetchTrip, sessionStatus])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`tripcraft_research_${tripId}`)
      if (stored) setResearchItems(JSON.parse(stored))
    } catch {}
  }, [tripId])

  function saveForLater(tour: Tour, actName: string) {
    const item: ResearchItem = {
      id: `${Date.now()}`,
      activityName: actName,
      tour: {
        provider: tour.provider,
        bookingCompany: tour.bookingCompany,
        price: tour.price,
        currency: tour.currency,
        duration: tour.duration,
        groupSize: tour.groupSize,
        pickupDetails: tour.pickupDetails,
        cancel: tour.cancel,
        bookingUrl: tour.bookingUrl,
      },
      savedAt: new Date().toISOString(),
    }
    const updated = [...researchItems, item]
    setResearchItems(updated)
    localStorage.setItem(`tripcraft_research_${tripId}`, JSON.stringify(updated))
    setSearchActivity(null)
  }

  function removeResearchItem(id: string) {
    const updated = researchItems.filter((i) => i.id !== id)
    setResearchItems(updated)
    localStorage.setItem(`tripcraft_research_${tripId}`, JSON.stringify(updated))
  }

  async function addResearchItemToDay(item: ResearchItem, dayId: string) {
    setResearchAdding(true)
    try {
      const res = await fetch(`${API}/api/days/${dayId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.accessToken}` },
        body: JSON.stringify({
          type: 'ACTIVITY',
          title: `${item.activityName} · ${item.tour.provider}`,
          detail: `${item.tour.duration} · ${item.tour.groupSize} · via ${item.tour.bookingCompany}. ${item.tour.pickupDetails}`,
          price: `${item.tour.currency} ${item.tour.price}/person`,
          status: 'PENDING',
          confCode: null,
          cancelPolicy: item.tour.cancel,
          cancelSafe: item.tour.cancel.startsWith('Free'),
          bookingUrl: item.tour.bookingUrl ?? null,
          bgColor: '#EEF0FA',
        }),
      })
      if (!res.ok) throw new Error()
      removeResearchItem(item.id)
      setResearchAddPending(null)
      fetchTrip()
    } catch {} finally { setResearchAdding(false) }
  }

  async function handleStatusChange(newStatus: TripStatus) {
    if (!session?.accessToken || !trip) return
    if (newStatus === 'COMPLETED') {
      setShareAnonymous(false)
      setPendingComplete(true)
      return
    }
    setTrip((prev) => prev ? { ...prev, status: newStatus } : prev)
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {
      setTrip((prev) => prev ? { ...prev, status: trip.status } : prev)
    })
  }

  async function confirmComplete() {
    if (!session?.accessToken || !trip) return
    setConfirming(true)
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    await fetch(`${API}/api/trips/${tripId}/community`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ isPublic: true, isAnonymous: shareAnonymous }),
    }).catch(() => {})
    setTrip((prev) => prev ? { ...prev, status: 'COMPLETED' } : prev)
    setPendingComplete(false)
    setConfirming(false)
    setReflecting(true)
  }

  if (loading || sessionStatus === 'loading') {
    return <div className="animate-pulse bg-white rounded-2xl border border-mist h-64" />
  }
  if (error || !trip) {
    return <p className="text-slate text-sm">{error || 'Trip not found'}</p>
  }

  const tripDays = trip.days.map((d) => ({ id: d.id, dayNum: d.dayNum, name: d.name, date: d.date }))
  const pendingCount = trip.days.flatMap((d) => d.blocks).filter((b) => b.status === 'PENDING').length
  const todoCount    = (trip.checklist?.filter((c) => !c.done).length ?? 0) + pendingCount

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* ── Breadcrumb + Back button ───────────────────────────── */}
        <div className="flex flex-col gap-1.5 -mt-2">
          <nav className="flex items-center gap-1 text-[11px] text-slate/60 font-mono tracking-wide">
            <a href="/" className="hover:text-slate transition-colors">Home</a>
            <span className="mx-0.5">›</span>
            <a href="/profile" className="hover:text-slate transition-colors">Profile</a>
            <span className="mx-0.5">›</span>
            <a href="/profile" className="hover:text-slate transition-colors">{STATUS_LABEL[trip.status]}</a>
            <span className="mx-0.5">›</span>
            <span className="text-slate/80 truncate max-w-[140px]">{trip.destination}</span>
          </nav>
          <button
            onClick={() => router.push('/profile')}
            className="self-start flex items-center gap-1.5 text-[12px] text-slate hover:text-ink transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* ── Trip header ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          {/* Cover photo — clean, no text overlay */}
          <div className="relative h-48 bg-foam overflow-hidden">
            <img
              src={cityPhoto ?? undefined}
              alt={trip.destination}
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            {trip.coverEmoji && (
              <span className="absolute top-3 right-3 text-3xl leading-none drop-shadow">{trip.coverEmoji}</span>
            )}
          </div>

          {/* Confirm complete panel */}
          {pendingComplete && (
            <div className="px-4 sm:px-7 py-3 border-b border-mist bg-success/5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                <p className="text-[11px] text-slate">This trip will be shared with the community. Do you want your itinerary to be shared publicly or anonymously?</p>
                <div className="flex rounded-full border border-mist bg-foam text-[11px] font-semibold overflow-hidden flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShareAnonymous(false)}
                    className={`px-3 py-1 transition-colors ${!shareAnonymous ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                  >
                    Public
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareAnonymous(true)}
                    className={`px-3 py-1 transition-colors ${shareAnonymous ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                  >
                    Anon
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={confirming}
                  onClick={confirmComplete}
                  className="text-xs font-semibold text-white bg-success px-3 py-1.5 rounded-lg disabled:opacity-60"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setPendingComplete(false)}
                  className="text-xs text-slate hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Info block — title, city, meta, actions */}
          <div className="px-4 sm:px-7 py-4">
            <div className="flex items-start justify-between gap-4">
              {/* Left: title + city + meta */}
              <div className="min-w-0">
                <h1 className="font-serif text-2xl font-bold text-ink leading-tight">{trip.title}</h1>
                <p className="text-slate text-sm mt-0.5">
                  {trip.destination}{trip.country ? `, ${trip.country}` : ''}
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-5 text-[11px] font-mono text-slate uppercase tracking-wide mt-2">
                  {trip.startDate && (
                    <span>
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {trip.endDate ? ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                    </span>
                  )}
                  <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Right: budget + action */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {trip.budget != null && (
                  <span className="text-[11px] font-mono text-slate uppercase tracking-wide">
                    {trip.budgetType === 'per_person'
                      ? `$${trip.budget.toLocaleString()}/person`
                      : `$${trip.budget.toLocaleString()} total`}
                  </span>
                )}
                {trip.status !== 'COMPLETED' && !pendingComplete && (
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-lg bg-ocean text-white hover:bg-ocean/90 transition-colors cursor-pointer"
                  >
                    Mark complete
                  </button>
                )}
                {trip.status === 'COMPLETED' && (
                  <span className="text-[11px] font-mono border border-mist rounded-full px-3 py-1.5 bg-foam text-slate">
                    Completed
                  </span>
                )}
              </div>
            </div>

            {trip.vibes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {trip.vibes.map((v) => (
                  <span key={v.id} className="bg-ocean/8 text-ocean text-xs px-3 py-1 rounded-full border border-ocean/15">
                    {v.vibe}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Reflection banners ────────────────────────────────── */}
        {trip.status === 'COMPLETED' && !trip.reflection && (
          <div
            className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border border-gold/20"
            style={{ background: 'linear-gradient(135deg, #0D2B45, #143352)' }}
          >
            <div className="flex-1">
              <div className="font-serif text-lg font-bold text-white">How was {trip.destination}?</div>
              <div className="text-[12px] text-white/60 mt-0.5">Take 2 minutes to reflect — your insights help future travelers.</div>
            </div>
            <button
              onClick={() => setReflecting(true)}
              className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-full text-[12px] font-semibold transition-all hover:bg-gold/30"
              style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#E2C06A' }}
            >
              Reflect on this trip →
            </button>
          </div>
        )}
        {trip.reflection && (
          <div className="bg-white rounded-2xl border border-mist p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✦</span>
                <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Trip Reflection</span>
              </div>
              <button
                onClick={() => setReflecting(true)}
                className="text-[11px] font-semibold px-3 py-1 rounded-full border border-mist text-slate hover:border-terra/40 hover:text-terra transition-colors"
              >
                Edit Reflection
              </button>
            </div>
            <div className="space-y-3">
              {trip.reflection.tripTitle && (
                <div className="font-serif text-lg font-bold text-ink">"{trip.reflection.tripTitle}"</div>
              )}
              {trip.reflection.rank != null && (
                <div className="flex items-center gap-2 text-[13px]">
                  <span>🏆</span>
                  <span className="text-terra font-semibold">
                    {trip.reflection.rank < 25 ? "Worst trip I've taken" : trip.reflection.rank < 50 ? "Solid but not top-tier" : trip.reflection.rank < 75 ? "One of my favorites" : "Top 3 of my life"}
                  </span>
                  <span className="text-slate/40 text-[11px] font-mono">({trip.reflection.rank}/100)</span>
                </div>
              )}
              {trip.reflection.expectation && (
                <div className="text-[13px] text-slate">💭 <span className="text-ink">{trip.reflection.expectation}</span></div>
              )}
              {trip.reflection.sentence && (
                <div className="bg-foam rounded-xl p-3 border border-mist">
                  <div className="text-[10px] font-mono text-slate uppercase tracking-wider mb-1">Note to future self</div>
                  <div className="text-[13px] text-ink leading-relaxed italic">"{trip.reflection.sentence}"</div>
                </div>
              )}
              {trip.reflection.bestDecision && (
                <div className="text-[13px] text-slate">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate/60 block mb-0.5">Best decision</span>
                  <span className="text-ink">{trip.reflection.bestDecision}</span>
                </div>
              )}
              {trip.reflection.regret && (
                <div className="text-[13px] text-slate">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate/60 block mb-0.5">Skip next time</span>
                  <span className="text-ink">{trip.reflection.regret}</span>
                </div>
              )}
              {Array.isArray(trip.reflection.changes) && (trip.reflection.changes as string[]).length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate/60 mb-1.5">What I'd change</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(trip.reflection.changes as string[]).map((c: string) => (
                      <span key={c} className="text-[11px] px-2.5 py-1 rounded-full bg-ocean/5 border border-ocean/10 text-ocean/70">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {trip.reflection.rebook && Object.keys(trip.reflection.rebook as Record<string, string>).length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate/60 mb-1.5">Would rebook?</div>
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(trip.reflection.rebook as Record<string, string>).map(([item, verdict]) => (
                      <div key={item} className="flex items-center justify-between text-[12px]">
                        <span className="text-slate truncate mr-3">{item}</span>
                        <span className={`font-semibold flex-shrink-0 ${verdict === 'Absolutely' ? 'text-success' : verdict === 'No' ? 'text-terra' : 'text-gold'}`}>
                          {verdict}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab bar ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="flex border-b border-mist overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const badge = tab.id === 'todo' && todoCount > 0 ? todoCount
                : tab.id === 'research' && researchItems.length > 0 ? researchItems.length
                : null
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-3 sm:py-3.5 text-[12px] sm:text-[13px] whitespace-nowrap transition-all border-b-2 -mb-px flex-shrink-0"
                  style={{
                    fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? '#C4603A' : '#5B7A8E',
                    borderBottomColor: activeTab === tab.id ? '#C4603A' : 'transparent',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#C4603A' : 'transparent'}`,
                  }}
                >
                  {TAB_ICONS[tab.id]}
                  {tab.label}
                  {badge != null && (
                    <span
                      className="text-[9px] font-bold rounded-full px-1.5 py-px font-mono min-w-[18px] text-center"
                      style={{
                        background: activeTab === tab.id ? '#C4603A' : 'rgba(91,122,142,0.15)',
                        color: activeTab === tab.id ? '#fff' : '#5B7A8E',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Tab content ─────────────────────────────────────── */}
          <div className="p-3 sm:p-6 overflow-y-auto" style={{ minHeight: 480, maxHeight: '70vh' }}>

            {/* Itinerary tab */}
            {activeTab === 'itinerary' && (
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left: global search + days */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  <GlobalItinerarySearch
                    destination={trip.destination}
                    onSelectActivity={(act) => setSearchActivity(act as SearchActivity)}
                  />
                  {trip.days.length === 0 && (
                    <div className="bg-foam rounded-2xl border border-mist p-10 text-center">
                      <p className="text-slate text-sm">
                        {trip.startDate && trip.endDate
                          ? 'Setting up your itinerary…'
                          : 'Add start and end dates to generate your itinerary.'}
                      </p>
                    </div>
                  )}
                  {trip.days.map((day) => (
                    <ItineraryDay
                      key={day.id}
                      day={day}
                      destination={trip.destination}
                      vibes={trip.vibes.map((v) => v.vibe)}
                      onBlockAdded={fetchTrip}
                    />
                  ))}
                </div>

                {/* Right: suggestions panel — desktop only */}
                <div className="hidden lg:block" style={{ width: 260, flexShrink: 0 }}>
                  <SuggestionsPanel
                    destination={trip.destination}
                    onAdd={(act) => setSearchActivity(act)}
                  />
                </div>
              </div>
            )}

            {/* Map tab */}
            {activeTab === 'map' && <MapTab trip={trip} />}

            {/* To Do tab */}
            {activeTab === 'todo' && (
              <TodoTab trip={trip} accessToken={session?.accessToken} onUpdate={fetchTrip} />
            )}

            {/* Budget tab */}
            {activeTab === 'budget' && <BudgetTab trip={trip} accessToken={session?.accessToken} onUpdate={fetchTrip} />}

            {/* Research tab */}
            {activeTab === 'research' && (
              <ResearchTab
                trip={trip}
                tripId={tripId}
                researchItems={researchItems}
                onAddToDay={setResearchAddPending}
                onRemoveResearch={removeResearchItem}
              />
            )}

          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      {searchActivity && (
        <ActivityCompareModal
          destination={trip.destination}
          vibes={trip.vibes.map((v) => v.vibe)}
          days={tripDays}
          initialActivity={searchActivity as never}
          tripId={trip.id}
          onClose={() => setSearchActivity(null)}
          onBlockAdded={() => { setSearchActivity(null); fetchTrip() }}
          onSaveForLater={saveForLater}
        />
      )}
      {researchAddPending && tripDays.length > 0 && (
        <ResearchDayPicker
          days={tripDays}
          adding={researchAdding}
          onPick={(dayId) => addResearchItemToDay(researchAddPending, dayId)}
          onCancel={() => setResearchAddPending(null)}
        />
      )}
      {reflecting && (
        <ReflectionModal
          trip={trip}
          accessToken={session?.accessToken}
          onClose={() => setReflecting(false)}
          onSaved={() => { setReflecting(false); fetchTrip() }}
        />
      )}
    </>
  )
}
