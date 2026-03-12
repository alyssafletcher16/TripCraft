'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ItineraryDay } from './ItineraryDay'
import { ReflectionModal } from './ReflectionModal'
import { GlobalItinerarySearch } from './GlobalItinerarySearch'
import { ActivityCompareModal, type Tour } from './ActivityCompareModal'
import { Badge } from '@/components/ui/Badge'
import type { Trip, TripStatus } from '@/types'

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

const STATUS_LABEL: Record<TripStatus, string> = {
  PLANNING: 'Planning', ACTIVE: 'Active', COMPLETED: 'Completed', DRAFT: 'Draft',
}
const STATUS_VARIANT: Record<TripStatus, 'gold' | 'green' | 'ocean' | 'slate'> = {
  ACTIVE: 'gold', COMPLETED: 'green', PLANNING: 'ocean', DRAFT: 'slate',
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

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

// ── Main trip detail view ──────────────────────────────────────────────────────
export function TripDetail({ tripId }: { tripId: string }) {
  const { data: session, status: sessionStatus } = useSession()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reflecting, setReflecting] = useState(false)

  // ── Global search + research state ──────────────────────────────────────
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
        // Auto-create days from trip duration if none exist yet
        if (data.days.length === 0 && data.startDate && data.endDate) {
          const start = new Date(data.startDate)
          const end = new Date(data.endDate)
          const numDays = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
          await Promise.all(
            Array.from({ length: numDays }, (_, i) => {
              const date = new Date(start.getTime() + i * 86_400_000).toISOString().split('T')[0]
              return fetch(`${API}/api/trips/${tripId}/days`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.accessToken}`,
                },
                body: JSON.stringify({ dayNum: i + 1, name: `Day ${i + 1}`, date, theme: null }),
              })
            })
          )
          // Re-fetch so we get the created days
          return fetch(`${API}/api/trips/${tripId}`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }).then((r) => r.json())
        }
        return data
      })
      .then((data) => {
        setTrip(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load trip')
        setLoading(false)
      })
  }, [session?.accessToken, tripId])

  useEffect(() => {
    if (sessionStatus !== 'loading') fetchTrip()
  }, [fetchTrip, sessionStatus])

  // Load research items from localStorage
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          type: 'ACTIVITY',
          title: `${item.activityName} · ${item.tour.provider}`,
          detail: `${item.tour.duration} · ${item.tour.groupSize} · via ${item.tour.bookingCompany}. ${item.tour.pickupDetails}`,
          price: `${item.tour.currency} ${item.tour.price}/person`,
          status: 'PENDING',
          confCode: null,
          cancelPolicy: item.tour.cancel,
          cancelSafe: item.tour.cancel.startsWith('Free'),
          bgColor: '#EEF0FA',
        }),
      })
      if (!res.ok) throw new Error('Failed to add block')
      removeResearchItem(item.id)
      setResearchAddPending(null)
      fetchTrip()
    } catch {} finally {
      setResearchAdding(false)
    }
  }

  if (loading || sessionStatus === 'loading') {
    return <div className="animate-pulse bg-white rounded-2xl border border-mist h-64" />
  }

  if (error || !trip) {
    return <p className="text-slate text-sm">{error || 'Trip not found'}</p>
  }

  const coverPhotoSrc = `https://loremflickr.com/1200/400/${encodeURIComponent(trip.destination)},travel,city`
  const tripDays = trip.days.map((d) => ({ id: d.id, dayNum: d.dayNum, name: d.name, date: d.date }))

  return (
    <>
    <div className="max-w-3xl flex flex-col gap-6">

      {/* ── Trip header ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist overflow-hidden">
        {/* Cover photo */}
        <div className="relative h-48 bg-foam overflow-hidden">
          <img
            src={coverPhotoSrc}
            alt={trip.destination}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-7 right-7 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-white drop-shadow">{trip.title}</h1>
                <Badge variant={STATUS_VARIANT[trip.status]}>
                  {STATUS_LABEL[trip.status]}
                </Badge>
              </div>
              <p className="text-white/80 text-sm drop-shadow">
                {trip.destination}{trip.country ? `, ${trip.country}` : ''}
              </p>
            </div>
            <span className="text-3xl leading-none drop-shadow">{trip.coverEmoji ?? '✈'}</span>
          </div>
        </div>

        <div className="px-7 py-5">
          {/* Meta */}
          <div className="flex flex-wrap gap-5 text-[11px] font-mono text-slate uppercase tracking-wide mb-4">
            {trip.startDate && (
              <span>
                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                {trip.endDate
                  ? ` – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : ''}
              </span>
            )}
            <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
            {trip.budget != null && <span>${trip.budget.toLocaleString()} budget</span>}
          </div>

          {/* Vibes */}
          {trip.vibes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {trip.vibes.map((v) => (
                <span
                  key={v.id}
                  className="bg-ocean/8 text-ocean text-xs px-3 py-1 rounded-full border border-ocean/15"
                >
                  {v.vibe}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Global itinerary search ──────────────────────────────── */}
      <GlobalItinerarySearch
        destination={trip.destination}
        onSelectActivity={(act) => setSearchActivity(act as SearchActivity)}
      />

      {/* ── Reflect banner — shown for completed trips ──────────── */}
      {trip.status === 'COMPLETED' && !trip.reflection && (
        <div className="rounded-2xl p-5 flex items-center gap-4 border border-gold/20"
          style={{ background: 'linear-gradient(135deg, #0D2B45, #143352)' }}>
          <div className="flex-1">
            <div className="font-serif text-lg font-bold text-white">How was {trip.destination}?</div>
            <div className="text-[12px] text-white/60 mt-0.5">Take 2 minutes to reflect on your trip — your insights help future travelers.</div>
          </div>
          <button
            onClick={() => setReflecting(true)}
            className="flex-shrink-0 px-5 py-2 rounded-full text-[12px] font-semibold transition-all hover:bg-gold/30"
            style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#E2C06A' }}
          >
            Reflect on this trip →
          </button>
        </div>
      )}

      {/* Reflection summary — shown when reflection exists */}
      {trip.reflection && (
        <div className="bg-white rounded-2xl border border-mist p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✦</span>
              <span className="font-mono text-[10px] text-slate uppercase tracking-wider">Trip Reflection</span>
            </div>
            <button
              onClick={() => setReflecting(true)}
              className="text-[11px] text-slate hover:text-terra transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="text-[13px] text-slate leading-relaxed space-y-1">
            {trip.reflection.tripTitle && (
              <div className="font-serif text-base font-bold text-ink mb-1">{trip.reflection.tripTitle}</div>
            )}
            {trip.reflection.rank != null && (
              <div>🏆 <span className="text-terra font-semibold">
                {trip.reflection.rank < 25 ? "Worst trip I've taken" : trip.reflection.rank < 50 ? "Solid but not top-tier" : trip.reflection.rank < 75 ? "One of my favorites" : "Top 3 of my life"}
              </span></div>
            )}
            {trip.reflection.expectation && <div>💭 {trip.reflection.expectation}</div>}
            {trip.reflection.sentence && <div>📝 <em>"{trip.reflection.sentence.slice(0, 100)}{trip.reflection.sentence.length > 100 ? '…' : ''}"</em></div>}
          </div>
        </div>
      )}

      {/* ── Itinerary days ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {trip.days.length === 0 && (
          <div className="bg-white rounded-2xl border border-mist p-10 text-center">
            <p className="text-slate text-sm">
              {trip.startDate && trip.endDate
                ? 'Setting up your itinerary…'
                : 'Add start and end dates to your trip to generate your itinerary.'}
            </p>
          </div>
        )}

        {trip.days.map((day) => (
          <ItineraryDay key={day.id} day={day} destination={trip.destination} vibes={trip.vibes.map((v) => v.vibe)} onBlockAdded={fetchTrip} />
        ))}
      </div>

      {/* ── Research tab ────────────────────────────────────────── */}
      {researchItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-mist overflow-hidden">
          <div className="px-7 py-4 border-b border-mist flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate uppercase tracking-wider">Research</span>
            <span className="bg-ocean/10 text-ocean text-[10px] font-bold px-2 py-0.5 rounded-full">
              {researchItems.length}
            </span>
            <span className="text-[11px] text-slate ml-1">· saved for later</span>
          </div>
          <div className="divide-y divide-mist">
            {researchItems.map((item) => (
              <div key={item.id} className="px-7 py-4 flex items-center gap-4">
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
                <div className="flex items-center gap-2 flex-shrink-0">
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
                    onClick={() => setResearchAddPending(item)}
                    className="px-3 py-1.5 rounded-full bg-terra text-white text-xs font-medium hover:bg-terra-lt transition-colors whitespace-nowrap"
                  >
                    Add to Day
                  </button>
                  <button
                    onClick={() => removeResearchItem(item.id)}
                    className="p-1.5 text-slate hover:text-terra transition-colors"
                    title="Remove"
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
    </div>

    {/* ── Global search compare modal ──────────────────────────── */}
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

    {/* ── Research: day picker ─────────────────────────────────── */}
    {researchAddPending && tripDays.length > 0 && (
      <ResearchDayPicker
        days={tripDays}
        adding={researchAdding}
        onPick={(dayId) => addResearchItemToDay(researchAddPending, dayId)}
        onCancel={() => setResearchAddPending(null)}
      />
    )}

    {/* ── Reflection modal ────────────────────────────────────── */}
    {reflecting && (
      <ReflectionModal
        trip={trip}
        accessToken={session?.accessToken}
        onClose={() => setReflecting(false)}
        onSaved={() => {
          setReflecting(false)
          fetchTrip()
        }}
      />
    )}
    </>
  )
}
