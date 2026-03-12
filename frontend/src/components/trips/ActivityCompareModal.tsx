'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { AFFILIATES } from '@/config/affiliates'
import { trackBookingClick } from '@/utils/bookingTracking'

// ── Types ────────────────────────────────────────────────────────────────────
type Review = {
  author: string
  rating: number
  text: string
  date: string
}

type Tour = {
  id: number
  bookingCompany: string
  provider: string
  price: number
  currency: string
  rating: number
  reviewCount: number
  duration: string
  badge: string | null
  groupSize: string
  pickup: boolean
  pickupDetails: string
  cancel: string
  tags: string[]
  snippet: string
  itinerary: string[]
  reviews: Review[]
  bookingUrl?: string
}

type Activity = {
  name: string
  icon: string
  category: string
  minPrice: number
  maxPrice: number
  currency: string
  topRating: number
  totalReviews: number
  companies: number
  tours: Tour[]
}

// ── Approximate USD exchange rates (1 unit of foreign = X USD) ───────────────
const USD_RATES: Record<string, number> = {
  AUD: 0.64, NZD: 0.59, EUR: 1.09, GBP: 1.27, CHF: 1.11, CAD: 0.73,
  JPY: 0.0067, KRW: 0.00075, CNY: 0.14, HKD: 0.13, SGD: 0.75, TWD: 0.031,
  THB: 0.028, MYR: 0.22, IDR: 0.000064, PHP: 0.018, VND: 0.000040,
  INR: 0.012, LKR: 0.0034, BDT: 0.0091, NPR: 0.0075,
  AED: 0.27, SAR: 0.27, QAR: 0.27, OMR: 2.60, JOD: 1.41, ILS: 0.27,
  TRY: 0.031, EGP: 0.021, MAD: 0.10, ZAR: 0.055, KES: 0.0078,
  TZS: 0.00038, GHS: 0.068, NGN: 0.00067, ETB: 0.018,
  BRL: 0.20, ARS: 0.0011, CLP: 0.0011, COP: 0.00025, PEN: 0.27, MXN: 0.058,
  CZK: 0.044, HUF: 0.0028, PLN: 0.25, SEK: 0.095, NOK: 0.094, DKK: 0.15,
}

function toUSD(price: number, currency: string): string {
  const rate = USD_RATES[currency.toUpperCase()]
  if (!rate) return `~$${Math.round(price)} USD`
  const usd = price * rate
  return `$${usd < 10 ? usd.toFixed(2) : Math.round(usd)} USD`
}

// ── Search URL builder (never uses AI-hallucinated URLs) ──────────────────────
function getSearchUrl(bookingCompany: string, activityName: string, destination: string, provider?: string): string {
  const co    = bookingCompany.toLowerCase()
  // Include provider name so results land on (or very near) the specific operator
  const terms = provider ? `${activityName} ${provider} ${destination}` : `${activityName} ${destination}`
  const q     = encodeURIComponent(terms)
  if (co.includes('getyourguide')) return `https://www.getyourguide.com/s/?q=${q}&partner_id=${AFFILIATES.GYG_ID}`
  if (co.includes('viator'))       return `https://www.viator.com/search/${q}?pid=${AFFILIATES.VIATOR_ID}&mcid=42383&medium=api`
  if (co.includes('klook'))        return `https://www.klook.com/en-US/search/?keyword=${q}`
  if (co.includes('airbnb'))       return `https://www.airbnb.com/experiences?query=${q}`
  if (co.includes('tripadvisor'))  return `https://www.tripadvisor.com/Search?q=${q}`
  if (co.includes('musement'))     return `https://www.musement.com/us/search/#?query=${q}`
  // Fallback: Google search targeted at the specific platform
  return `https://www.google.com/search?q=${encodeURIComponent(`${activityName} ${provider ?? ''} ${destination} site:${co.replace(/\s/g, '')}.com`)}`
}

// ── Derive platform key from booking company name (for tracking) ──────────────
function getPlatformKey(bookingCompany: string): string {
  const co = bookingCompany.toLowerCase()
  if (co.includes('getyourguide')) return 'getyourguide'
  if (co.includes('viator'))       return 'viator'
  if (co.includes('klook'))        return 'klook'
  if (co.includes('airbnb'))       return 'airbnb'
  if (co.includes('tripadvisor'))  return 'tripadvisor'
  if (co.includes('musement'))     return 'musement'
  return co
}

// ── CSS constants ─────────────────────────────────────────────────────────────
const OVERLAY    = 'fixed inset-0 z-[1000] bg-[rgba(7,24,37,0.82)] backdrop-blur-[5px] flex items-center justify-center p-2 sm:p-6'
const MODAL      = 'bg-surface rounded-[24px] w-full max-w-[900px] max-h-[92vh] overflow-hidden flex flex-col shadow-[0_48px_96px_rgba(0,0,0,0.5)] border border-white/[0.08]'
const MODAL_HD   = 'px-4 sm:px-7 pt-4 sm:pt-[22px] pb-4 border-b border-mist flex items-start justify-between flex-shrink-0'
const MODAL_BODY = 'overflow-y-auto px-4 sm:px-7 py-4 sm:py-5 flex-1'
const X_BTN      = 'w-8 h-8 rounded-full border-[1.5px] border-mist bg-transparent text-[15px] text-slate cursor-pointer flex items-center justify-center flex-shrink-0 hover:bg-mist transition-colors'

// ── Badge ─────────────────────────────────────────────────────────────────────
function TourBadge({ badge }: { badge: string | null }) {
  if (!badge) return null
  const bg =
    badge === 'Best Seller' ? 'bg-terra' :
    badge === 'Premium'     ? 'bg-ocean' :
    badge === 'Budget pick' ? 'bg-[#5B7A8E]' :
    badge === 'Iconic'      ? 'bg-[#9D4E1F]' :
                              'bg-[#2E7D4F]'
  return (
    <span className={`${bg} text-white text-[9px] font-semibold uppercase tracking-[0.5px] px-2 py-px rounded-full whitespace-nowrap`}>
      {badge}
    </span>
  )
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="text-gold text-[13px]">
      {'★'.repeat(full)}{'☆'.repeat(Math.max(0, 5 - full))}
    </span>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function ActivitySkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-2xl border-[1.5px] border-mist p-[18px] animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-[52px] h-[52px] rounded-[14px] bg-mist flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-mist rounded w-2/5 mb-2" />
              <div className="h-3 bg-mist rounded w-3/5" />
            </div>
            <div className="h-8 bg-mist rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── TourDetailPanel ───────────────────────────────────────────────────────────
function TourDetailPanel({
  tour,
  actName,
  allTours,
  destination,
  onBack,
  onAdd,
  adding,
  onBookClick,
}: {
  tour: Tour
  actName: string
  allTours: Tour[]
  destination: string
  onBack: () => void
  onAdd: () => void
  adding: boolean
  onBookClick: (platform: string, url: string, title: string) => void
}) {
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [showUSD, setShowUSD] = useState(false)
  const isNonUSD = tour.currency.toUpperCase() !== 'USD'
  const bookUrl = (tour as { bookingUrl?: string }).bookingUrl
    || getSearchUrl(tour.bookingCompany, actName, destination, tour.provider)

  return (
    <>
      {showReviewsModal && (
        <AllReviewsModal
          tours={allTours}
          activityName={actName}
          destination={destination}
          onClose={() => setShowReviewsModal(false)}
        />
      )}
    <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onBack()}>
      <div className={MODAL}>
        <div className={MODAL_HD}>
          <div className="flex items-start gap-3">
            <button onClick={onBack} className="mt-1 text-slate hover:text-ink transition-colors text-sm">
              ← Back
            </button>
            <div>
              <div className="font-serif text-2xl font-bold text-ink">{actName}</div>
              <div className="text-xs text-slate mt-[3px] font-mono">
                {tour.provider} · via {tour.bookingCompany}
              </div>
            </div>
          </div>
          <button className={X_BTN} onClick={onBack}>✕</button>
        </div>

        <div className={MODAL_BODY}>
          {/* Summary strip */}
          <div className="bg-foam rounded-2xl p-5 border border-mist mb-5 flex flex-wrap gap-5">
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Booking via</div>
              <div className="font-semibold text-ink text-[15px]">{tour.bookingCompany}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Tour operator</div>
              <div className="font-semibold text-ink text-[15px]">{tour.provider}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Price</div>
              <div className="font-semibold text-[#2E7D4F] text-[15px]">
                {showUSD ? toUSD(tour.price, tour.currency) : `${tour.currency} ${tour.price}`}
                {' '}<span className="text-slate text-[11px] font-normal">/ person</span>
              </div>
              {isNonUSD && (
                <button
                  type="button"
                  onClick={() => setShowUSD((v) => !v)}
                  className="text-[10px] font-mono text-ocean hover:underline mt-0.5 block"
                >
                  {showUSD ? `Show ${tour.currency}` : 'Show USD'}
                </button>
              )}
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Duration</div>
              <div className="font-semibold text-ink text-[15px]">{tour.duration}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Group size</div>
              <div className="font-semibold text-ink text-[15px]">{tour.groupSize}</div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Rating</div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-ink text-[15px]">{tour.rating}</span>
                <Stars rating={tour.rating} />
                <span className="text-slate text-[11px]">({tour.reviewCount.toLocaleString()})</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono text-slate uppercase tracking-[1px] mb-1">Cancellation</div>
              <div className={`font-semibold text-[13px] ${tour.cancel.startsWith('Free') ? 'text-[#2E7D4F]' : 'text-[#C04040]'}`}>
                {tour.cancel}
              </div>
            </div>
          </div>

          {/* Tags */}
          {tour.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {tour.tags.map((tag) => (
                <span key={tag} className="bg-white border border-mist rounded-full px-3 py-[4px] text-[11px] text-slate">
                  ✓ {tag}
                </span>
              ))}
            </div>
          )}

          {/* Pickup */}
          <div className="mb-5">
            <div className="text-[11px] font-mono text-slate uppercase tracking-[1px] mb-2">Pick-up / Meeting point</div>
            <div className="bg-[rgba(46,125,79,0.06)] border border-[rgba(46,125,79,0.2)] rounded-xl p-4 text-[13px] text-ink">
              {tour.pickup ? '🚌 ' : '📍 '}{tour.pickupDetails}
            </div>
          </div>

          {/* Itinerary */}
          <div className="mb-5">
            <div className="text-[11px] font-mono text-slate uppercase tracking-[1px] mb-3">Itinerary</div>
            <div className="flex flex-col gap-0">
              {tour.itinerary.map((step, i) => (
                <div key={i} className="flex gap-3 pb-3">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className="w-6 h-6 rounded-full bg-ocean text-white text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    {i < tour.itinerary.length - 1 && (
                      <div className="w-px bg-mist flex-1 mt-1 min-h-[16px]" />
                    )}
                  </div>
                  <div className="text-[13px] text-ink pt-1 pb-1 leading-relaxed">{step}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-mono text-slate uppercase tracking-[1px]">
                Traveller reviews ({tour.reviewCount.toLocaleString()})
              </div>
              <div className="flex items-center gap-1">
                <Stars rating={tour.rating} />
                <span className="text-[13px] font-semibold text-ink ml-1">{tour.rating}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {tour.reviews.slice(0, 2).map((review, i) => (
                <div key={i} className="bg-white border border-mist rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-ocean/10 text-ocean text-[11px] font-bold flex items-center justify-center">
                        {review.author[0]}
                      </div>
                      <span className="text-[13px] font-semibold text-ink">{review.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Stars rating={review.rating} />
                      <span className="text-[11px] font-mono text-slate">{review.date}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-ink leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-3">
              <button
                onClick={() => setShowReviewsModal(true)}
                className="flex-1 py-2.5 border border-mist rounded-xl text-slate text-[13px] hover:border-gold hover:text-gold transition-colors text-center"
              >
                ★ See all reviews across all options
              </button>
              <a
                href={bookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 border border-mist rounded-xl text-slate text-[13px] hover:border-ocean hover:text-ocean transition-colors text-center"
              >
                All reviews on {tour.bookingCompany} ↗
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 pt-1">
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onBookClick(getPlatformKey(tour.bookingCompany), bookUrl, actName)}
              className="flex-1 border-[1.5px] border-terra text-terra py-[11px] px-7 rounded-full text-[13px] font-semibold text-center hover:bg-terra/5 transition-colors"
            >
              Book on {tour.bookingCompany} ↗
            </a>
            <button
              onClick={onAdd}
              disabled={adding}
              className="flex-1 bg-terra text-white border-none py-[11px] px-7 rounded-full text-[13px] font-semibold cursor-pointer hover:bg-terra-lt transition-colors disabled:opacity-50"
            >
              {adding ? 'Adding…' : 'Add to itinerary →'}
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

// ── All Reviews Modal ─────────────────────────────────────────────────────────
type RichReview = Review & { provider: string; bookingCompany: string; bookingUrl?: string }

function AllReviewsModal({
  tours,
  activityName,
  destination,
  onClose,
}: {
  tours: Tour[]
  activityName: string
  destination: string
  onClose: () => void
}) {
  const [starFilter, setStarFilter] = useState<number | null>(null)
  const [sortReviews, setSortReviews] = useState<'default' | 'highest' | 'lowest'>('default')

  // Aggregate all reviews from all tours, tagging each with its source
  const allReviews: RichReview[] = tours.flatMap((t) =>
    t.reviews.map((r) => ({
      ...r,
      provider: t.provider,
      bookingCompany: t.bookingCompany,
      bookingUrl: t.bookingUrl,
    }))
  )

  const filtered = allReviews
    .filter((r) => starFilter === null || Math.round(r.rating) === starFilter)
    .sort((a, b) => {
      if (sortReviews === 'highest') return b.rating - a.rating
      if (sortReviews === 'lowest')  return a.rating - b.rating
      return 0
    })

  // Star distribution counts
  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: allReviews.filter((r) => Math.round(r.rating) === s).length,
  }))

  const avgRating = allReviews.length
    ? (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1)
    : '—'

  return (
    <div
      className="fixed inset-0 z-[1100] bg-[rgba(7,24,37,0.65)] backdrop-blur-[3px] flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[680px] max-h-[88vh] overflow-hidden flex flex-col shadow-2xl border border-mist">

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-mist flex items-start justify-between flex-shrink-0">
          <div>
            <div className="font-serif text-xl font-bold text-ink">{activityName}</div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-gold text-[15px]">★</span>
              <span className="font-semibold text-ink">{avgRating}</span>
              <span className="text-[12px] text-slate font-mono">
                {allReviews.length} reviews across {tours.length} options
              </span>
            </div>
          </div>
          <button className={X_BTN} onClick={onClose}>✕</button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-mist flex flex-wrap items-center gap-x-6 gap-y-2 flex-shrink-0 bg-foam/50">
          {/* Star filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Stars:</span>
            <button
              onClick={() => setStarFilter(null)}
              className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${
                starFilter === null ? 'bg-ocean border-ocean text-white' : 'border-mist bg-white text-slate hover:border-ocean hover:text-ocean'
              }`}
            >
              All ({allReviews.length})
            </button>
            {starCounts.filter((s) => s.count > 0).map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setStarFilter(starFilter === star ? null : star)}
                className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${
                  starFilter === star ? 'bg-gold border-gold text-white' : 'border-mist bg-white text-slate hover:border-gold hover:text-gold'
                }`}
              >
                {'★'.repeat(star)} ({count})
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Sort:</span>
            <select
              value={sortReviews}
              onChange={(e) => setSortReviews(e.target.value as typeof sortReviews)}
              className="border border-mist rounded-lg px-2.5 py-[5px] text-[11px] text-ink bg-white focus:outline-none focus:border-ocean appearance-none cursor-pointer pr-6"
            >
              <option value="default">Default</option>
              <option value="highest">Highest rated</option>
              <option value="lowest">Lowest rated</option>
            </select>
          </div>
        </div>

        {/* Review list */}
        <div className="overflow-y-auto px-6 py-4 flex flex-col gap-3">
          {filtered.length === 0 && (
            <p className="text-slate text-sm text-center py-8">No reviews match this filter.</p>
          )}
          {filtered.map((review, i) => (
            <div key={i} className="bg-foam border border-mist rounded-xl p-4">
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-ocean/10 text-ocean text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-ink leading-tight">{review.author}</div>
                    <div className="text-[10px] text-slate font-mono leading-tight">
                      via {review.bookingCompany} · {review.provider}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Stars rating={review.rating} />
                  <span className="text-[11px] font-mono text-slate">{review.date}</span>
                </div>
              </div>
              <p className="text-[13px] text-ink leading-relaxed">{review.text}</p>
            </div>
          ))}

          {/* Links to all platforms */}
          <div className="flex flex-col gap-2 pt-1">
            {tours.map((t, i) => (
              <a
                key={i}
                href={getSearchUrl(t.bookingCompany, activityName, destination, t.provider)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-center py-2 border border-mist rounded-xl text-[12px] text-slate hover:border-ocean hover:text-ocean transition-colors"
              >
                All reviews on {t.bookingCompany} — {t.provider} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CompareModal ──────────────────────────────────────────────────────────────
type SortKey = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'reviews'

function CompareModal({
  activity,
  destination,
  onClose,
  onAdd,
  adding,
  onBookClick,
}: {
  activity: Activity
  destination: string
  onClose: () => void
  onAdd: (tour: Tour, actName: string) => void
  adding: boolean
  onBookClick: (platform: string, url: string, title: string) => void
}) {
  const [detailTour, setDetailTour]         = useState<Tour | null>(null)
  const [showAllReviews, setShowAllReviews] = useState<Tour | null>(null)
  const [showUSD, setShowUSD]             = useState(false)
  const [sortBy, setSortBy]               = useState<SortKey>('default')
  const [platformFilter, setPlatformFilter] = useState('')
  const [minRating, setMinRating]         = useState<number | null>(null)
  const [durationBucket, setDurationBucket] = useState<string | null>(null)
  const [freeCancelOnly, setFreeCancelOnly] = useState(false)
  const [pickupOnly, setPickupOnly]       = useState(false)
  const [priceRange, setPriceRange]       = useState<string | null>(null)
  const [filterOpen, setFilterOpen]       = useState(false)

  // Still loading tours
  if (activity.tours.length === 0) {
    return (
      <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={MODAL}>
          <div className={MODAL_HD}>
            <div>
              <div className="font-serif text-2xl font-bold text-ink">{activity.name}</div>
              <div className="text-xs text-slate mt-[3px] font-mono">Finding tour options…</div>
            </div>
            <button className={X_BTN} onClick={onClose}>✕</button>
          </div>
          <div className={MODAL_BODY}>
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-14 bg-mist rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const companies = [...new Set(activity.tours.map((t) => t.bookingCompany))]
  const hasNonUSD = activity.tours.some((t) => t.currency.toUpperCase() !== 'USD')

  // ── Price range buckets (dynamic from data) ──────────────────────────────
  const allPrices = activity.tours.map((t) => t.price)
  const pMin = Math.min(...allPrices)
  const pMax = Math.max(...allPrices)
  const pMid1 = Math.round(pMin + (pMax - pMin) / 3)
  const pMid2 = Math.round(pMin + (2 * (pMax - pMin)) / 3)
  const currency0 = activity.tours[0]?.currency ?? ''
  const PRICE_BUCKETS = pMax > pMin ? [
    { key: 'low',  label: `Under ${currency0} ${pMid1}` },
    { key: 'mid',  label: `${currency0} ${pMid1}–${pMid2}` },
    { key: 'high', label: `Over ${currency0} ${pMid2}` },
  ] : []

  // ── Duration helpers ──────────────────────────────────────────────────────
  function parseDurationHours(dur: string): number {
    const s = dur.toLowerCase()
    if (s.includes('full day') || s.includes('whole day') || s.includes('all day')) return 8
    if (s.includes('half day')) return 4
    const hMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)/)
    if (hMatch) return parseFloat(hMatch[1])
    const dMatch = s.match(/(\d+)\s*day/)
    if (dMatch) return parseInt(dMatch[1]) * 8
    return 3
  }
  const DURATION_BUCKETS = [
    { key: 'short',   label: '< 3h' },
    { key: 'medium',  label: '3–6h' },
    { key: 'long',    label: '6h+' },
    { key: 'fullday', label: 'Full day' },
  ]

  // Apply filter then sort
  const activeFilterCount = (minRating ? 1 : 0) + (durationBucket ? 1 : 0) + (freeCancelOnly ? 1 : 0) + (pickupOnly ? 1 : 0) + (priceRange ? 1 : 0) + (platformFilter ? 1 : 0)
  const displayTours = activity.tours
    .filter((t) => !platformFilter || t.bookingCompany === platformFilter)
    .filter((t) => minRating === null || t.rating >= minRating)
    .filter((t) => !freeCancelOnly || t.cancel.toLowerCase().startsWith('free'))
    .filter((t) => !pickupOnly || t.pickup)
    .filter((t) => {
      if (!priceRange) return true
      if (priceRange === 'low')  return t.price < pMid1
      if (priceRange === 'mid')  return t.price >= pMid1 && t.price <= pMid2
      if (priceRange === 'high') return t.price > pMid2
      return true
    })
    .filter((t) => {
      if (!durationBucket) return true
      const h = parseDurationHours(t.duration)
      if (durationBucket === 'short')   return h < 3
      if (durationBucket === 'medium')  return h >= 3 && h < 6
      if (durationBucket === 'long')    return h >= 6 && h < 8
      if (durationBucket === 'fullday') return h >= 8
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'rating')     return b.rating - a.rating
      if (sortBy === 'reviews')    return b.reviewCount - a.reviewCount
      return 0
    })

  function clearAllFilters() {
    setPlatformFilter('')
    setMinRating(null)
    setDurationBucket(null)
    setFreeCancelOnly(false)
    setPickupOnly(false)
    setPriceRange(null)
  }

  const bestPrice   = displayTours.length ? Math.min(...displayTours.map((t) => t.price))       : 0
  const bestRating  = displayTours.length ? Math.max(...displayTours.map((t) => t.rating))      : 0
  const mostReviews = displayTours.length ? Math.max(...displayTours.map((t) => t.reviewCount)) : 0

  function handleSortBy(key: SortKey) {
    setSortBy(key)
  }

  if (detailTour) {
    return (
      <TourDetailPanel
        tour={detailTour}
        actName={activity.name}
        allTours={activity.tours}
        destination={destination}
        onBack={() => setDetailTour(null)}
        onAdd={() => onAdd(detailTour, activity.name)}
        adding={adding}
        onBookClick={onBookClick}
      />
    )
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'default',    label: 'Default' },
    { key: 'price-asc',  label: 'Price ↑' },
    { key: 'price-desc', label: 'Price ↓' },
    { key: 'rating',     label: 'Top rated' },
    { key: 'reviews',    label: 'Most reviews' },
  ]

  return (
    <>
      {showAllReviews !== null && (
        <AllReviewsModal
          tours={[showAllReviews]}
          activityName={activity.name}
          destination={destination}
          onClose={() => setShowAllReviews(null)}
        />
      )}

      <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={MODAL}>
          {/* Header */}
          <div className={MODAL_HD}>
            <div>
              <div className="font-serif text-2xl font-bold text-ink">Compare: {activity.name}</div>
              <div className="text-xs text-slate mt-[3px] font-mono flex items-center gap-3">
                <span>{activity.tours.length} options · prices per person</span>
                {hasNonUSD && (
                  <button
                    type="button"
                    onClick={() => setShowUSD((v) => !v)}
                    className="bg-foam border border-mist rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-ocean hover:border-ocean transition-colors"
                  >
                    {showUSD ? 'Local currency' : 'Show USD'}
                  </button>
                )}
              </div>
            </div>
            <button className={X_BTN} onClick={onClose}>✕</button>
          </div>

          {/* Sort + Filter bar */}
          <div className="px-4 sm:px-7 py-3 border-b border-mist flex-shrink-0 bg-foam/60">
            <div className="flex items-center gap-3">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortBy(e.target.value as SortKey)}
                  className="border border-mist rounded-lg px-2.5 py-[5px] text-[11px] text-ink bg-white focus:outline-none focus:border-ocean appearance-none cursor-pointer pr-6"
                >
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Filters dropdown button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-[5px] rounded-lg border text-[11px] font-medium transition-colors ${
                    activeFilterCount > 0
                      ? 'border-ocean bg-ocean text-white'
                      : 'border-mist bg-white text-slate hover:border-ocean hover:text-ocean'
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                    <path d="M1 2.5h10M3 6h6M5 9.5h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                  <span className="text-[9px] opacity-70">{filterOpen ? '▲' : '▼'}</span>
                </button>

                {filterOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-mist rounded-2xl shadow-lg p-4 w-72 flex flex-col gap-4">
                    {/* Platform */}
                    {companies.length > 1 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Platform</span>
                        <select
                          value={platformFilter}
                          onChange={(e) => setPlatformFilter(e.target.value)}
                          className="border border-mist rounded-lg px-2.5 py-[5px] text-[11px] text-ink bg-white focus:outline-none focus:border-ocean appearance-none cursor-pointer"
                        >
                          <option value="">All platforms</option>
                          {companies.map((co) => (
                            <option key={co} value={co}>{co}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Price */}
                    {PRICE_BUCKETS.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Price</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {PRICE_BUCKETS.map(({ key, label }) => (
                            <button key={key} type="button"
                              onClick={() => setPriceRange(priceRange === key ? null : key)}
                              className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${priceRange === key ? 'bg-ocean border-ocean text-white' : 'border-mist text-slate hover:border-ocean hover:text-ocean'}`}
                            >{label}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Min rating</span>
                      <div className="flex gap-1.5">
                        {[4.0, 4.5, 4.8].map((r) => (
                          <button key={r} type="button"
                            onClick={() => setMinRating(minRating === r ? null : r)}
                            className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${minRating === r ? 'bg-gold border-gold text-white' : 'border-mist text-slate hover:border-gold hover:text-gold'}`}
                          >★ {r}+</button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Duration</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {DURATION_BUCKETS.map(({ key, label }) => (
                          <button key={key} type="button"
                            onClick={() => setDurationBucket(durationBucket === key ? null : key)}
                            className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${durationBucket === key ? 'bg-ocean border-ocean text-white' : 'border-mist text-slate hover:border-ocean hover:text-ocean'}`}
                          >{label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Options</span>
                      <div className="flex gap-1.5 flex-wrap">
                        <button type="button" onClick={() => setFreeCancelOnly((v) => !v)}
                          className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${freeCancelOnly ? 'bg-[#2E7D4F] border-[#2E7D4F] text-white' : 'border-mist text-slate hover:border-[#2E7D4F] hover:text-[#2E7D4F]'}`}
                        >✓ Free cancel</button>
                        <button type="button" onClick={() => setPickupOnly((v) => !v)}
                          className={`py-[4px] px-3 rounded-full border text-[11px] font-medium transition-colors ${pickupOnly ? 'bg-[#2E7D4F] border-[#2E7D4F] text-white' : 'border-mist text-slate hover:border-[#2E7D4F] hover:text-[#2E7D4F]'}`}
                        >Pickup incl.</button>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-mist">
                      <button type="button" onClick={() => { clearAllFilters(); setFilterOpen(false) }}
                        className="text-[11px] text-terra hover:text-terra-lt font-medium"
                      >Clear all</button>
                      <button type="button" onClick={() => setFilterOpen(false)}
                        className="text-[11px] text-ocean font-semibold hover:opacity-70"
                      >Done</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Active filter count badge (when dropdown closed) */}
              {activeFilterCount > 0 && !filterOpen && (
                <button type="button" onClick={clearAllFilters}
                  className="text-[10px] text-terra hover:text-terra-lt font-medium underline ml-auto"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          <div className={MODAL_BODY}>
            {displayTours.length === 0 ? (
              <p className="text-slate text-sm text-center py-8">No results for the selected filters.</p>
            ) : (
              <>
                <table className="w-full border-collapse text-[13px] mb-4">
                  <thead>
                    <tr>
                      {['Platform', 'Operator', 'Price', 'Rating', 'Reviews', 'Duration', 'Group', 'Cancellation', ''].map((h, i) => (
                        <th
                          key={h || i}
                          className={`bg-ocean text-white/80 px-[12px] py-[10px] text-left text-[10px] font-medium font-mono tracking-[1px] ${i === 0 ? 'rounded-l-[10px]' : ''} ${i === 8 ? 'rounded-r-[10px]' : ''}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayTours.map((t) => (
                      <tr
                        key={t.id}
                        className="group hover:bg-foam transition-colors cursor-pointer"
                        onClick={() => setDetailTour(t)}
                      >
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle">
                          <div className="font-semibold text-ink text-[12px]">{t.bookingCompany}</div>
                          <TourBadge badge={t.badge} />
                        </td>
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle text-[12px] text-slate">
                          {t.provider}
                        </td>
                        <td className={`px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle font-semibold ${t.price === bestPrice ? 'text-[#2E7D4F]' : 'text-ink'}`}>
                          {showUSD && t.currency.toUpperCase() !== 'USD'
                            ? toUSD(t.price, t.currency)
                            : `${t.currency} ${t.price}`}
                        </td>
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle">
                          <span className={`font-semibold ${t.rating === bestRating ? 'text-gold' : 'text-ink'}`}>{t.rating}</span>
                          {t.rating === bestRating && <span className="text-gold ml-0.5">★</span>}
                        </td>
                        <td className={`px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle text-[12px] ${t.reviewCount === mostReviews ? 'text-[#2E7D4F] font-semibold' : 'text-slate'}`}>
                          {t.reviewCount.toLocaleString()}
                        </td>
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle text-slate text-[12px]">{t.duration}</td>
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle text-slate text-[12px]">{t.groupSize}</td>
                        <td className={`px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle text-[11px] ${t.cancel.startsWith('Free') ? 'text-[#2E7D4F]' : 'text-[#C04040]'}`}>
                          {t.cancel}
                        </td>
                        <td className="px-[12px] py-3 border-b border-mist group-last:border-b-0 align-middle">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={t.bookingUrl || getSearchUrl(t.bookingCompany, activity.name, destination, t.provider)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation()
                                const url = t.bookingUrl || getSearchUrl(t.bookingCompany, activity.name, destination, t.provider)
                                onBookClick(getPlatformKey(t.bookingCompany), url, activity.name)
                              }}
                              className="py-[7px] px-3 rounded-full border-[1.5px] border-terra text-xs text-terra font-medium whitespace-nowrap hover:bg-terra hover:text-white transition-colors"
                            >
                              Book ↗
                            </a>
                            <button
                              className="py-[7px] px-3 rounded-full border-[1.5px] border-mist text-xs cursor-pointer transition-all whitespace-nowrap text-slate hover:border-gold hover:text-gold"
                              onClick={(e) => { e.stopPropagation(); setShowAllReviews(t) }}
                            >
                              ★ Reviews
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="text-[11px] text-slate text-center mt-2">
                  Click a row to see full details
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ── URL Paste Compare ─────────────────────────────────────────────────────────
function UrlComparePanel({ onClose }: { onClose: () => void }) {
  const [urls, setUrls] = useState(['', ''])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')
  const [detailIdx, setDetailIdx] = useState<number | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  async function handleCompare() {
    const validUrls = urls.map((u) => u.trim()).filter(Boolean)
    if (validUrls.length === 0) { setError('Paste at least one URL'); return }
    setLoading(true); setError(''); setResults([])
    try {
      const res = await fetch(`${API}/api/compare/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: validUrls }),
      })
      const json = await res.json()
      const successful = (json.results ?? []).filter((r: any) => r.data)
      if (successful.length === 0) throw new Error('Could not extract tour data from those URLs')
      setResults(successful)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (detailIdx !== null && results[detailIdx]) {
    const d = results[detailIdx].data
    const tour: Tour = {
      id: detailIdx, bookingCompany: d.bookingCompany ?? 'Unknown', provider: d.provider ?? 'Unknown',
      price: d.priceValue ?? 0, currency: d.currency ?? 'USD', rating: d.rating ?? 0,
      reviewCount: d.reviewCount ?? 0, duration: d.duration ?? '—', badge: null,
      groupSize: d.groupSize ?? '—', pickup: d.pickupIncluded ?? false, pickupDetails: d.pickupDetails ?? '—',
      cancel: d.cancellation ?? '—', tags: d.tags ?? [], snippet: d.reviews?.[0]?.text?.slice(0, 120) ?? '',
      itinerary: d.itinerary ?? [], reviews: d.reviews ?? [], bookingUrl: d.bookingUrl ?? results[detailIdx].url,
    }
    return (
      <TourDetailPanel
        tour={tour} actName={d.activityName ?? 'Tour'}
        allTours={[tour]}
        destination={''}
        onBack={() => setDetailIdx(null)} onAdd={() => {}} adding={false}
        onBookClick={() => {}}
      />
    )
  }

  return (
    <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        <div className={MODAL_HD}>
          <div>
            <div className="font-serif text-2xl font-bold text-ink">Compare by URL</div>
            <div className="text-xs text-slate mt-[3px] font-mono">
              Paste GetYourGuide or Viator tour links — we'll extract and compare them
            </div>
          </div>
          <button className={X_BTN} onClick={onClose}>✕</button>
        </div>

        <div className={MODAL_BODY}>
          {results.length === 0 ? (
            <>
              <div className="flex flex-col gap-3 mb-5">
                {urls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <span className="text-[11px] font-mono text-slate w-16 flex-shrink-0">URL {i + 1}</span>
                    <input
                      type="url" value={url}
                      onChange={(e) => setUrls((prev) => { const n = [...prev]; n[i] = e.target.value; return n })}
                      placeholder="https://www.getyourguide.com/..."
                      className="flex-1 border border-mist rounded-xl px-4 py-2.5 text-[13px] text-ink bg-white focus:outline-none focus:border-terra"
                    />
                    {urls.length > 1 && (
                      <button onClick={() => setUrls((p) => p.filter((_, j) => j !== i))} className="text-slate hover:text-red-500 text-lg leading-none">×</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mb-4">
                {urls.length < 4 && (
                  <button onClick={() => setUrls((p) => [...p, ''])} className="py-2 px-4 border border-dashed border-mist rounded-xl text-slate text-[13px] hover:border-terra hover:text-terra transition-colors">
                    + Add URL
                  </button>
                )}
                <button onClick={handleCompare} disabled={loading} className="flex-1 bg-terra text-white rounded-full py-2.5 text-[13px] font-semibold hover:bg-terra-lt transition-colors disabled:opacity-50">
                  {loading ? 'Extracting tour data…' : 'Compare tours →'}
                </button>
              </div>
              {error && <p className="text-[#C04040] text-[13px]">{error}</p>}
              <div className="bg-foam rounded-xl p-4 border border-mist text-[12px] text-slate">
                <strong className="text-ink">How it works:</strong> Paste tour links from GetYourGuide, Viator, or similar booking sites. We use AI to extract the name, price, duration, itinerary, pickup details, and reviews from each page, then display them side by side.
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-[13px] text-slate">{results.length} tour{results.length !== 1 ? 's' : ''} compared</div>
                <button onClick={() => setResults([])} className="text-[13px] text-slate hover:text-terra">← New comparison</button>
              </div>
              <div className="flex flex-col gap-4">
                {results.map((r, i) => {
                  const d = r.data
                  return (
                    <div key={i} className="bg-white border-[1.5px] border-mist rounded-2xl p-5 hover:border-terra transition-colors">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="font-serif text-[18px] font-bold text-ink mb-0.5">{d.activityName}</div>
                          <div className="text-[12px] text-slate">{d.provider} · via {d.bookingCompany}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-[18px] font-bold text-[#2E7D4F]">{d.price}</div>
                          <div className="text-[11px] text-slate">per person</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-[12px] text-slate mb-3">
                        {d.rating && <span>★ {d.rating}</span>}
                        {d.reviewCount && <span>{d.reviewCount.toLocaleString()} reviews</span>}
                        {d.duration && <span>⏱ {d.duration}</span>}
                        {d.groupSize && <span>👥 {d.groupSize}</span>}
                        <span className={d.cancellation?.startsWith('Free') ? 'text-[#2E7D4F]' : 'text-[#C04040]'}>{d.cancellation}</span>
                      </div>
                      <button onClick={() => setDetailIdx(i)} className="py-2 px-4 border border-mist rounded-full text-[13px] text-slate hover:border-terra hover:text-terra transition-colors">
                        View full details →
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ActivityModal ─────────────────────────────────────────────────────────────
// Maps trip vibe keywords (and related terms) to activity categories
const VIBE_CATEGORY_MAP: Record<string, string[]> = {
  adventure:   ['Adventure'],
  foodie:      ['Food & Drink'],
  cultural:    ['Cultural'],
  romantic:    ['Scenic', 'Cultural'],
  hiking:      ['Nature', 'Adventure'],
  relaxation:  ['Scenic', 'Water'],
  nightlife:   ['Nightlife'],
  sports:      ['Sports'],
  nature:      ['Nature'],
  water:       ['Water'],
  scenic:      ['Scenic'],
}

function getSuggestedCategories(vibes: string[]): Set<string> {
  const cats = new Set<string>()
  for (const vibe of vibes) {
    const key = vibe.toLowerCase()
    const matched = VIBE_CATEGORY_MAP[key]
    if (matched) matched.forEach((c) => cats.add(c))
  }
  return cats
}

function ActivityModal({
  destination,
  activities,
  loading,
  error,
  vibes,
  onClose,
  onCompare,
  onUrlCompare,
}: {
  destination?: string
  activities: Activity[]
  loading: boolean
  error: string
  vibes?: string[]
  onClose: () => void
  onCompare: (activity: Activity) => void
  onUrlCompare: () => void
}) {
  const suggestedCategories = getSuggestedCategories(vibes ?? [])
  const hasSuggested = suggestedCategories.size > 0 && activities.some((a) => suggestedCategories.has(a.category))
  const categories = [
    ...(hasSuggested ? ['Suggested'] : []),
    'All',
    ...Array.from(new Set(activities.map((a) => a.category))),
  ]
  const [filter, setFilter] = useState(hasSuggested ? 'Suggested' : 'All')
  const filtered =
    filter === 'All' ? activities :
    filter === 'Suggested' ? activities.filter((a) => suggestedCategories.has(a.category)) :
    activities.filter((a) => a.category === filter)

  return (
    <div className={OVERLAY} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={MODAL}>
        <div className={MODAL_HD}>
          <div>
            <div className="font-serif text-2xl font-bold text-ink">Find Activities</div>
            <div className="text-xs text-slate mt-[3px] font-mono">
              {destination ?? 'Your destination'}
            </div>
            <div className="flex gap-1.5 mt-3">
              <button
                onClick={() => {}}
                className="py-[6px] px-4 rounded-full border-none text-xs font-medium cursor-default bg-ocean text-white"
              >
                Browse activities
              </button>
              <button
                onClick={onUrlCompare}
                className="py-[6px] px-4 rounded-full border-none text-xs font-medium cursor-pointer bg-mist text-slate hover:text-ink transition-colors"
              >
                Paste URL to compare
              </button>
            </div>
          </div>
          <button className={X_BTN} onClick={onClose}>✕</button>
        </div>

        {/* Category filter */}
        {!loading && activities.length > 0 && (
          <div className="px-4 sm:px-7 pt-3 pb-0 flex gap-1.5 flex-wrap flex-shrink-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`py-[5px] px-3 rounded-full border-none text-xs font-medium cursor-pointer transition-colors ${
                  filter === c ? 'bg-ocean/10 text-ocean border border-ocean/20' : 'bg-mist text-slate hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className={MODAL_BODY}>
          {/* Loading */}
          {loading && (
            <div>
              <div className="text-[13px] text-slate mb-4 flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-slate" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
                Finding top activities in {destination ?? 'your destination'}…
              </div>
              <ActivitySkeleton />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Activity list */}
          {!loading && !error && filtered.map((act) => (
            <div
              key={act.name}
              className="bg-white rounded-2xl border-[1.5px] border-mist p-[18px] mb-2.5 cursor-pointer transition-all hover:border-terra"
              onClick={() => onCompare(act)}
            >
              <div className="flex items-center gap-4">
                <div className="w-[52px] h-[52px] rounded-[14px] overflow-hidden flex-shrink-0 bg-foam">
                  <img
                    src={`https://loremflickr.com/104/104/${encodeURIComponent(act.name)},${encodeURIComponent(destination ?? 'travel')}`}
                    alt={act.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </div>
                <div className="flex-1">
                  <div className="font-serif text-[18px] font-bold text-ink mb-[3px]">{act.name}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate">
                    {act.topRating ? <span>★ up to {act.topRating}</span> : null}
                    {act.totalReviews ? <span>{act.totalReviews.toLocaleString()} reviews</span> : null}
                    {act.minPrice ? (
                      <span className="text-terra font-medium">
                        {act.currency ?? 'USD'} {act.minPrice}–{act.maxPrice}/person
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono text-slate/70 uppercase tracking-wider">
                    {act.companies ? `${act.companies} options · ` : ''}GetYourGuide, Viator, Klook &amp; more
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); onCompare(act) }}
                    className="bg-terra text-white border-none py-[9px] px-[18px] rounded-full text-xs font-semibold cursor-pointer hover:bg-terra-lt transition-colors"
                  >
                    ⇄ Compare
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && activities.length > 0 && (
            <p className="text-slate text-sm text-center py-8">No activities found in this category.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
interface ActivityCompareModalProps {
  dayId: string
  tripId?: string
  destination?: string
  vibes?: string[]
  onClose: () => void
  onBlockAdded: () => void
}

export function ActivityCompareModal({
  dayId,
  tripId,
  destination,
  vibes,
  onClose,
  onBlockAdded,
}: ActivityCompareModalProps) {
  const { data: session } = useSession()
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

  const [view, setView]                         = useState<'list' | 'compare' | 'url'>('list')
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [adding, setAdding]                     = useState(false)

  // ── Step 1: fetch lightweight activity list ──────────────────────────────
  const [activities, setActivities]     = useState<Activity[]>([])
  const [listLoading, setListLoading]   = useState(false)
  const [listError, setListError]       = useState('')

  useEffect(() => {
    if (!destination) return
    setListLoading(true)
    setListError('')
    fetch(`/api/activities?destination=${encodeURIComponent(destination)}`)
      .then((r) => { if (!r.ok) throw new Error('Failed to load activities'); return r.json() })
      .then((data) => setActivities(data.activities ?? []))
      .catch((err) => setListError(err.message ?? 'Could not load activities'))
      .finally(() => setListLoading(false))
  }, [destination])

  // ── Step 2: fetch tour details when user clicks Compare ──────────────────
  async function handleCompare(act: Activity) {
    // Show the compare modal immediately with loading state
    setSelectedActivity({ ...act, tours: [] })
    setView('compare')

    try {
      const res = await fetch(`/api/activities/tours`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, activityName: act.name }),
      })
      if (!res.ok) throw new Error('Failed to load tours')
      const data = await res.json()
      setSelectedActivity({ ...act, tours: data.tours ?? [], companies: data.tours?.length ?? act.companies })
    } catch {
      // leave tours as empty — CompareModal will show error
    }
  }

  function handleBookClick(platform: string, url: string, activityTitle: string) {
    trackBookingClick({ activityTitle, platform, url, tripId, token: session?.accessToken })
  }

  async function handleAdd(tour: Tour, actName: string) {
    setAdding(true)
    try {
      const res = await fetch(`${API}/api/days/${dayId}/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          type: 'ACTIVITY',
          title: `${actName} · ${tour.provider}`,
          detail: `${tour.duration} · ${tour.groupSize} · via ${tour.bookingCompany}. ${tour.pickupDetails}`,
          price: `${tour.currency} ${tour.price}/person`,
          status: 'PENDING',
          confCode: null,
          cancelPolicy: tour.cancel,
          cancelSafe: tour.cancel.startsWith('Free'),
          bgColor: '#EEF0FA',
        }),
      })
      if (!res.ok) throw new Error('Failed to add block')
      onBlockAdded()
      onClose()
    } catch {
      // keep modal open
    } finally {
      setAdding(false)
    }
  }

  if (view === 'url') return <UrlComparePanel onClose={onClose} />

  if (view === 'compare' && selectedActivity) {
    return (
      <CompareModal
        activity={selectedActivity}
        destination={destination ?? ''}
        onClose={() => setView('list')}
        onAdd={adding ? () => {} : handleAdd}
        adding={adding}
        onBookClick={handleBookClick}
      />
    )
  }

  return (
    <ActivityModal
      destination={destination}
      activities={activities}
      loading={listLoading}
      error={listError}
      vibes={vibes}
      onClose={onClose}
      onCompare={handleCompare}
      onUrlCompare={() => setView('url')}
    />
  )
}
