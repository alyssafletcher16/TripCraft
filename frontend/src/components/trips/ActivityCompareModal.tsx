'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

// ── Static data (mirrors prototype TOUR_GROUPS / ACTIVITY_LIST) ───────────────
const TOUR_GROUPS: Record<string, Tour[]> = {
  'Hot Air Balloon': [
    { id: 1, company: 'Royal Balloon',       price: 195, rating: 4.9, reviews: 4820, duration: '1.5 hrs',  badge: 'Best Seller', groupSize: 'Max 16', pickup: true,  cancel: 'Free cancel <24h',  tags: ['Sunrise', 'Champagne', 'Small group'],      snippet: '"Worth every penny — champagne at sunrise was unforgettable"' },
    { id: 2, company: 'Butterfly Balloons',  price: 165, rating: 4.7, reviews: 2310, duration: '1.5 hrs',  badge: 'Top Rated',   groupSize: 'Max 20', pickup: true,  cancel: 'Free cancel <48h',  tags: ['Budget pick', 'Hotel pickup'],               snippet: '"Great value, larger basket but still magical"' },
    { id: 3, company: 'Voyager Balloons',    price: 220, rating: 4.8, reviews: 1890, duration: '2 hrs',    badge: 'Premium',     groupSize: 'Max 8',  pickup: true,  cancel: 'Non-refundable',    tags: ['Private option', 'Gourmet brkfst'],         snippet: '"Extra hour makes a huge difference for photos"' },
    { id: 4, company: 'Kapadokya Balloons',  price: 145, rating: 4.5, reviews:  980, duration: '1 hr',     badge: null,          groupSize: 'Max 24', pickup: false, cancel: 'Free cancel <24h',  tags: ['Budget', 'No frills'],                       snippet: '"Does the job, no champagne but still flew"' },
  ],
  'Underground City Tour': [
    { id: 5, company: 'Cappadocia Tours Co.', price: 55, rating: 4.7, reviews: 2341, duration: 'Full day', badge: 'Top Rated',   groupSize: 'Max 15', pickup: true,  cancel: 'Free cancel <24h',  tags: ['Lunch incl.', '2 sites'],                   snippet: '"Guide made history come alive"' },
    { id: 6, company: 'Middle Earth Travel',  price: 48, rating: 4.6, reviews: 1120, duration: '8 hrs',    badge: null,          groupSize: 'Max 20', pickup: true,  cancel: 'Free cancel <48h',  tags: ['Flexible stops'],                            snippet: '"Relaxed itinerary, not rushed"' },
    { id: 7, company: 'Argos Tours',          price: 75, rating: 4.9, reviews:  650, duration: 'Full day', badge: 'Hidden gem',  groupSize: 'Max 8',  pickup: true,  cancel: 'Non-refundable',    tags: ['Small group', 'Wine tasting'],               snippet: '"8-person max means zero crowds"' },
  ],
  'Pottery Workshop': [
    { id: 8, company: 'Red River Ceramics',  price: 38, rating: 4.8, reviews:  987, duration: '2 hrs',    badge: 'Unique exp.', groupSize: 'Max 10', pickup: false, cancel: 'Free cancel <24h',  tags: ['Take-home piece', 'Hands-on'],               snippet: '"My pot survived the flight home"' },
    { id: 9, company: 'Avanos Art Studio',   price: 28, rating: 4.5, reviews:  430, duration: '1.5 hrs',  badge: null,          groupSize: 'Max 15', pickup: false, cancel: 'Free cancel <24h',  tags: ['Budget pick', 'Beginner friendly'],          snippet: '"Short and sweet intro to the craft"' },
  ],
}

const ACTIVITY_LIST = Object.keys(TOUR_GROUPS).map((name, i) => ({
  name,
  icon:         (['🎈', '🏛', '🏺'] as const)[i],
  category:     (['Adventure', 'Cultural', 'Cultural'] as const)[i],
  minPrice:     Math.min(...TOUR_GROUPS[name].map((t) => t.price)),
  maxPrice:     Math.max(...TOUR_GROUPS[name].map((t) => t.price)),
  topRating:    Math.max(...TOUR_GROUPS[name].map((t) => t.rating)),
  totalReviews: TOUR_GROUPS[name].reduce((a, t) => a + t.reviews, 0),
  companies:    TOUR_GROUPS[name].length,
}))

type Tour = {
  id: number; company: string; price: number; rating: number; reviews: number
  duration: string; badge: string | null; groupSize: string; pickup: boolean
  cancel: string; tags: string[]; snippet: string
}

// ── Badge colours (prototype inline logic) ────────────────────────────────────
function TourBadge({ badge }: { badge: string | null }) {
  if (!badge) return null
  const bg =
    badge === 'Best Seller' ? 'bg-terra' :
    badge === 'Premium'     ? 'bg-ocean' :
                              'bg-[#2E7D4F]'
  return (
    <span className={`${bg} text-white text-[9px] font-semibold uppercase tracking-[0.5px] px-2 py-px rounded-full`}>
      {badge}
    </span>
  )
}

// ── CSS class constants (exact prototype mapping) ─────────────────────────────
// .overlay → fixed inset-0 z-[1000] bg-[rgba(7,24,37,0.82)] backdrop-blur-[5px] flex items-center justify-center p-6
// .modal   → bg-surface rounded-[24px] w-full max-w-[860px] max-h-[92vh] overflow-hidden flex flex-col shadow-[...] border border-white/[0.08]
// .modal-hd → px-7 pt-[22px] pb-4 border-b border-mist flex items-start justify-between flex-shrink-0
// .modal-body → overflow-y-auto px-7 py-5 flex-1

const OVERLAY = 'fixed inset-0 z-[1000] bg-[rgba(7,24,37,0.82)] backdrop-blur-[5px] flex items-center justify-center p-6'
const MODAL   = 'bg-surface rounded-[24px] w-full max-w-[860px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_48px_96px_rgba(0,0,0,0.5)] border border-white/[0.08]'
const MODAL_HD   = 'px-7 pt-[22px] pb-4 border-b border-mist flex items-start justify-between flex-shrink-0'
const MODAL_BODY = 'overflow-y-auto px-7 py-5 flex-1'
const X_BTN  = 'w-8 h-8 rounded-full border-[1.5px] border-mist bg-transparent text-[15px] text-slate cursor-pointer flex items-center justify-center flex-shrink-0 hover:bg-mist transition-colors'

// ── CompareModal ──────────────────────────────────────────────────────────────
function CompareModal({
  actName,
  tours,
  onClose,
  onAdd,
}: {
  actName: string
  tours: Tour[]
  onClose: () => void
  onAdd: (tour: Tour, actName: string) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const bestPrice  = Math.min(...tours.map((t) => t.price))
  const bestRating = Math.max(...tours.map((t) => t.rating))
  const pickedTour = tours.find((t) => t.id === picked)

  return (
    <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        {/* Header */}
        <div className={MODAL_HD}>
          <div>
            {/* .modal-title */}
            <div className="font-serif text-2xl font-bold text-ink">Compare: {actName}</div>
            {/* .modal-sub */}
            <div className="text-xs text-slate mt-[3px] font-mono">
              {tours.length} companies · GetYourGuide &amp; Viator · prices per person
            </div>
          </div>
          <button className={X_BTN} onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className={MODAL_BODY}>
          {/* .compare-table */}
          <table className="w-full border-collapse text-[13px] mb-4">
            <thead>
              <tr>
                {['Company', 'Price', 'Rating', 'Reviews', 'Duration', 'Group', 'Cancellation', ''].map((h, i) => (
                  <th
                    key={h || i}
                    className={`bg-ocean text-white/80 px-[14px] py-[10px] text-left text-[10px] font-medium font-mono tracking-[1px] ${i === 0 ? 'rounded-l-[10px]' : ''} ${i === 7 ? 'rounded-r-[10px]' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr
                  key={t.id}
                  className="group hover:bg-foam transition-colors"
                >
                  {/* Company */}
                  <td className="px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle">
                    <div className="font-semibold text-ink mb-0.5">{t.company}</div>
                    <TourBadge badge={t.badge} />
                  </td>
                  {/* Price (.best-v → text-success font-semibold) */}
                  <td className={`px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle ${t.price === bestPrice ? 'text-[#2E7D4F] font-semibold' : ''}`}>
                    ${t.price}
                  </td>
                  {/* Rating */}
                  <td className="px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle text-gold font-semibold">
                    {t.rating === bestRating ? '★ ' : ''}{t.rating}
                  </td>
                  {/* Reviews */}
                  <td className={`px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle ${t.reviews === Math.max(...tours.map((x) => x.reviews)) ? 'text-[#2E7D4F] font-semibold' : ''}`}>
                    {t.reviews.toLocaleString()}
                  </td>
                  {/* Duration */}
                  <td className="px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle text-slate text-[12px]">{t.duration}</td>
                  {/* Group */}
                  <td className="px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle text-slate text-[12px]">{t.groupSize}</td>
                  {/* Cancellation */}
                  <td className={`px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle text-[11px] ${t.cancel.startsWith('Free') ? 'text-[#2E7D4F]' : 'text-[#C04040]'}`}>
                    {t.cancel}
                  </td>
                  {/* Select button (.sel-btn / .sel-btn.on) */}
                  <td className="px-[14px] py-3 border-b border-mist group-last:border-b-0 align-middle">
                    <button
                      onClick={() => setPicked(picked === t.id ? null : t.id)}
                      className={`py-[7px] px-4 rounded-full border-[1.5px] text-xs cursor-pointer transition-all whitespace-nowrap ${
                        picked === t.id
                          ? 'bg-terra text-white border-terra'
                          : 'border-mist text-slate hover:border-terra hover:text-terra'
                      }`}
                    >
                      {picked === t.id ? '✓ Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Selected tour preview */}
          {pickedTour && (
            <div className="bg-foam rounded-[14px] p-5 border border-mist">
              <div className="font-serif text-[18px] font-bold text-ink mb-1.5">{pickedTour.company}</div>
              <div className="text-[13px] text-slate italic mb-3">{pickedTour.snippet}</div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {pickedTour.tags.map((tag) => (
                  <span key={tag} className="bg-white border border-mist rounded-full px-3 py-[4px] text-[11px] text-slate">
                    ✓ {tag}
                  </span>
                ))}
                {pickedTour.pickup && (
                  <span className="bg-[rgba(46,125,79,0.1)] rounded-full px-3 py-[4px] text-[11px] text-[#2E7D4F]">
                    ✓ Hotel pickup
                  </span>
                )}
              </div>
              <button
                onClick={() => onAdd(pickedTour, actName)}
                className="bg-terra text-white border-none py-[11px] px-7 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-terra-lt transition-colors"
              >
                Add {pickedTour.company} to itinerary →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ActivityModal ─────────────────────────────────────────────────────────────
function ActivityModal({
  dayName,
  onClose,
  onCompare,
}: {
  dayName: string
  onClose: () => void
  onCompare: (actName: string) => void
}) {
  const [filter, setFilter] = useState('All')
  const filtered = filter === 'All' ? ACTIVITY_LIST : ACTIVITY_LIST.filter((a) => a.category === filter)

  return (
    <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        {/* Header */}
        <div className={MODAL_HD}>
          <div>
            <div className="font-serif text-2xl font-bold text-ink">Add Activity</div>
            <div className="text-xs text-slate mt-[3px] font-mono">
              {dayName} · real data from GetYourGuide &amp; Viator
            </div>
            {/* Category filter tabs */}
            <div className="flex gap-1.5 mt-3">
              {['All', 'Adventure', 'Cultural'].map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`py-[6px] px-4 rounded-full border-none text-xs font-medium cursor-pointer transition-colors ${
                    filter === c ? 'bg-ocean text-white' : 'bg-mist text-slate hover:text-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <button className={X_BTN} onClick={onClose}>✕</button>
        </div>

        {/* Activity list */}
        <div className={MODAL_BODY}>
          {filtered.map((act) => (
            <div
              key={act.name}
              className="bg-white rounded-2xl border-[1.5px] border-mist p-[18px] mb-2.5 cursor-pointer transition-all hover:border-terra"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: act.category === 'Adventure' ? '#EEF0FA' : '#E3EEF5' }}
                >
                  {act.icon}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-serif text-[18px] font-bold text-ink mb-[3px]">{act.name}</div>
                  <div className="flex gap-3.5 text-xs text-slate">
                    <span>★ up to {act.topRating}</span>
                    <span>{act.totalReviews.toLocaleString()} total reviews</span>
                    <span className="text-terra font-medium">${act.minPrice}–${act.maxPrice}/person</span>
                  </div>
                </div>

                {/* Right: company count + compare CTA */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <div className="text-[11px] text-slate font-mono">{act.companies} companies</div>
                  <button
                    onClick={() => onCompare(act.name)}
                    className="bg-terra text-white border-none py-[9px] px-[18px] rounded-full text-xs font-semibold cursor-pointer hover:bg-terra-lt transition-colors"
                  >
                    ⇄ Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main export: entry point ───────────────────────────────────────────────────
interface ActivityCompareModalProps {
  dayId: string
  dayName: string
  onClose: () => void
  onBlockAdded: () => void
}

export function ActivityCompareModal({
  dayId,
  dayName,
  onClose,
  onBlockAdded,
}: ActivityCompareModalProps) {
  const { data: session } = useSession()
  const [comparing, setComparing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  async function handleAdd(tour: Tour, actName: string) {
    setAdding(true)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/days/${dayId}/blocks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            type: 'ACTIVITY',
            title: `${actName} · ${tour.company}`,
            detail: tour.snippet.replace(/^"|"$/g, ''),
            price: `$${tour.price}/person`,
            status: 'PENDING',
            confCode: null,
            cancelPolicy: tour.cancel,
            cancelSafe: tour.cancel.startsWith('Free'),
            emoji: '🏔',
            bgColor: '#EEF0FA',
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to add block')
      onBlockAdded()
      onClose()
    } catch {
      // block failed — keep modal open so user sees the issue
    } finally {
      setAdding(false)
    }
  }

  // CompareModal stacks on top of ActivityModal
  if (comparing) {
    return (
      <CompareModal
        actName={comparing}
        tours={TOUR_GROUPS[comparing]}
        onClose={() => setComparing(null)}
        onAdd={adding ? () => {} : handleAdd}
      />
    )
  }

  return (
    <ActivityModal
      dayName={dayName}
      onClose={onClose}
      onCompare={setComparing}
    />
  )
}
