'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCityPhoto } from '@/hooks/useCityPhoto'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

const BLOCK_EMOJI: Record<string, string> = {
  TRANSPORT: '✈️',
  STAY: '🏨',
  ACTIVITY: '🎯',
  FOOD: '🍽️',
  NOTE: '📝',
}

const STATUS_STYLE: Record<string, string> = {
  BOOKED:    'bg-emerald-50 text-emerald-700',
  PENDING:   'bg-amber-50 text-amber-700',
  CANCELLED: 'bg-red-50 text-red-500 line-through',
}

interface Block {
  id: string
  type: string
  title: string
  detail: string | null
  price: string | null
  status: string
  emoji: string | null
}

interface Day {
  id: string
  dayNum: number
  name: string
  theme: string | null
  date: string | null
  blocks: Block[]
}

interface PublicTrip {
  id: string
  destination: string
  country: string | null
  startDate: string | null
  endDate: string | null
  travelers: number
  budget: number | null
  coverEmoji: string | null
  vibes: { vibe: string }[]
  user: { id: string | null; name: string | null; avatar: string | null }
  days: Day[]
  _count: { upvotes: number }
}

export function PublicTripView({ tripId }: { tripId: string }) {
  const router = useRouter()
  const { data: session } = useSession()
  const [trip, setTrip] = useState<PublicTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [upvoted, setUpvoted] = useState(false)
  const photoUrl = useCityPhoto(trip?.destination ?? '')

  const handleUpvote = useCallback(async () => {
    if (!session?.accessToken) return
    setUpvoted((prev) => !prev)
    await fetch(`${API}/api/discover/${tripId}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).catch(() => setUpvoted((prev) => !prev))
  }, [session, tripId])

  useEffect(() => {
    fetch(`${API}/api/discover/${tripId}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null }
        return r.json()
      })
      .then((data) => {
        if (data) setTrip(data)
        setLoading(false)
      })
      .catch(() => { setNotFound(true); setLoading(false) })
  }, [tripId])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-48 bg-white rounded-2xl border border-mist animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white rounded-2xl border border-mist animate-pulse" />
        ))}
      </div>
    )
  }

  if (notFound || !trip) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <div className="font-serif text-xl font-bold text-ink mb-2">Trip not found</div>
        <p className="text-sm text-slate mb-6">This itinerary isn't public or doesn't exist.</p>
        <button onClick={() => router.push('/discover')} className="btn-outline text-sm px-5 py-2.5">
          ← Back to Discover
        </button>
      </div>
    )
  }

  const authorInitial = (trip.user.name ?? 'A')[0].toUpperCase()

  let durationLabel = ''
  if (trip.startDate && trip.endDate) {
    const days = Math.round(
      (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86_400_000
    ) + 1
    durationLabel = `${days} day${days !== 1 ? 's' : ''}`
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="text-[12px] text-slate hover:text-terra transition-colors mb-5 flex items-center gap-1"
      >
        ← Back
      </button>

      {/* Hero */}
      <div className="relative h-52 rounded-2xl overflow-hidden mb-6 flex items-end">
        {photoUrl ? (
          <img src={photoUrl} alt={trip.destination} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-ocean/10 flex items-center justify-center text-6xl">
            {trip.coverEmoji ?? '✈️'}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-[rgba(13,43,69,0.85)]" />
        <div className="relative p-5 w-full">
          <div className="font-serif text-3xl font-bold text-white leading-tight">{trip.destination}</div>
          {trip.country && <div className="text-sm text-white/70 mt-0.5">{trip.country}</div>}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {trip.vibes.map(({ vibe }) => (
              <span key={vibe} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wide">
                {vibe}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="bg-white rounded-2xl border border-mist px-5 py-4 flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-ocean flex items-center justify-center text-white text-[11px] font-semibold">
            {authorInitial}
          </div>
          <span className="text-sm text-slate">by {trip.user.name ?? 'Anonymous'}</span>
        </div>
        <div className="h-4 w-px bg-mist" />
        {durationLabel && <span className="text-sm text-slate">{durationLabel}</span>}
        <span className="text-sm text-slate">{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
        {trip.budget && <span className="text-sm text-slate">${trip.budget.toLocaleString()} budget</span>}
        <button
          onClick={handleUpvote}
          className="ml-auto text-[12px] font-semibold transition-colors"
          style={{ color: upvoted ? '#C9A84C' : '#5B7A8E' }}
          title={session ? 'Upvote this trip' : 'Sign in to upvote'}
        >
          ↑ {trip._count.upvotes + (upvoted ? 1 : 0)}
        </button>
      </div>

      {/* Days */}
      <div className="space-y-4">
        {trip.days.length === 0 && (
          <div className="bg-white rounded-2xl border border-mist p-8 text-center text-slate text-sm">
            No itinerary days added yet.
          </div>
        )}
        {trip.days.map((day) => (
          <div key={day.id} className="bg-white rounded-2xl border border-mist overflow-hidden">
            {/* Day header */}
            <div className="px-5 py-3.5 border-b border-mist flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ocean/10 text-ocean text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                {day.dayNum}
              </div>
              <div>
                <div className="font-semibold text-ink text-[14px]">{day.name}</div>
                {day.theme && <div className="text-[11px] text-slate">{day.theme}</div>}
              </div>
              {day.date && (
                <div className="ml-auto text-[11px] text-slate font-mono">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              )}
            </div>

            {/* Blocks */}
            <div className="divide-y divide-mist">
              {day.blocks.length === 0 && (
                <div className="px-5 py-4 text-[12px] text-slate/60 italic">No items for this day.</div>
              )}
              {day.blocks.map((block) => (
                <div key={block.id} className="px-5 py-3.5 flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{block.emoji ?? BLOCK_EMOJI[block.type] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium text-ink">{block.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[block.status] ?? ''}`}>
                        {block.status.toLowerCase()}
                      </span>
                    </div>
                    {block.detail && <div className="text-[12px] text-slate mt-0.5 truncate">{block.detail}</div>}
                  </div>
                  {block.price && (
                    <div className="text-[12px] text-ink font-medium flex-shrink-0">{block.price}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
