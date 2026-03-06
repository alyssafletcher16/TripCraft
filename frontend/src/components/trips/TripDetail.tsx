'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { ItineraryDay } from './ItineraryDay'
import { ReflectionModal } from './ReflectionModal'
import { Badge } from '@/components/ui/Badge'
import type { Trip, TripStatus } from '@/types'

const STATUS_LABEL: Record<TripStatus, string> = {
  PLANNING: 'Planning', ACTIVE: 'Active', COMPLETED: 'Completed', DRAFT: 'Draft',
}
const STATUS_VARIANT: Record<TripStatus, 'gold' | 'green' | 'ocean' | 'slate'> = {
  ACTIVE: 'gold', COMPLETED: 'green', PLANNING: 'ocean', DRAFT: 'slate',
}

// ── Add Day inline form ────────────────────────────────────────────────────────
function AddDayForm({
  tripId,
  nextDayNum,
  startDate,
  accessToken,
  onSuccess,
  onCancel,
}: {
  tripId: string
  nextDayNum: number
  startDate: string | null
  accessToken?: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-fill date based on trip start date + day offset
  const autoDate = startDate
    ? new Date(new Date(startDate).getTime() + (nextDayNum - 1) * 86_400_000)
        .toISOString()
        .split('T')[0]
    : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips/${tripId}/days`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            dayNum: nextDayNum,
            name: data.get('name'),
            theme: data.get('theme') || null,
            date: data.get('date') || null,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to add day' }))
        throw new Error(err.error || 'Failed to add day')
      }

      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-mist p-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="bg-ocean text-white font-mono text-[10px] px-3 py-1 rounded-full tracking-[1px]">
          Day {String(nextDayNum).padStart(2, '0')}
        </span>
        <h3 className="font-serif text-base font-bold text-ink">Add a day</h3>
      </div>

      <div className="grid grid-cols-[1fr_160px] gap-3">
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Day name *
          </label>
          <input
            name="name"
            type="text"
            required
            autoComplete="off"
            placeholder="e.g. Arrival & Palermo"
            className="w-full border border-mist rounded-xl px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-terra"
          />
        </div>
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            name="date"
            type="date"
            defaultValue={autoDate}
            className="w-full border border-mist rounded-xl px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-terra"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
          Theme (optional)
        </label>
        <input
          name="theme"
          type="text"
          autoComplete="off"
          placeholder="e.g. Baroque churches, street food, hidden gems"
          className="w-full border border-mist rounded-xl px-3 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-terra"
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-terra text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-terra-lt disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add day'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-slate hover:text-ink border border-mist"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ── Main trip detail view ──────────────────────────────────────────────────────
export function TripDetail({ tripId }: { tripId: string }) {
  const { data: session, status: sessionStatus } = useSession()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingDay, setAddingDay] = useState(false)
  const [reflecting, setReflecting] = useState(false)

  const fetchTrip = useCallback(() => {
    if (!session?.accessToken) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Trip not found')
        return r.json()
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

  if (loading || sessionStatus === 'loading') {
    return <div className="animate-pulse bg-white rounded-2xl border border-mist h-64" />
  }

  if (error || !trip) {
    return <p className="text-slate text-sm">{error || 'Trip not found'}</p>
  }

  return (
    <>
    <div className="max-w-3xl flex flex-col gap-6">

      {/* ── Trip header ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-7">
        <div className="flex items-start gap-4 mb-4">
          <span className="text-4xl leading-none">{trip.coverEmoji ?? '✈'}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="font-serif text-2xl font-bold text-ink">{trip.title}</h1>
              <Badge variant={STATUS_VARIANT[trip.status]}>
                {STATUS_LABEL[trip.status]}
              </Badge>
            </div>
            <p className="text-slate text-sm">
              {trip.destination}{trip.country ? `, ${trip.country}` : ''}
            </p>
          </div>
        </div>

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
        {trip.days.length === 0 && !addingDay && (
          <div className="bg-white rounded-2xl border border-mist p-10 text-center">
            <p className="text-slate text-sm">No days yet — add your first day below.</p>
          </div>
        )}

        {trip.days.map((day) => (
          <ItineraryDay key={day.id} day={day} onBlockAdded={fetchTrip} />
        ))}

        {addingDay ? (
          <AddDayForm
            tripId={tripId}
            nextDayNum={trip.days.length + 1}
            startDate={trip.startDate}
            accessToken={session?.accessToken}
            onSuccess={() => {
              setAddingDay(false)
              fetchTrip()
            }}
            onCancel={() => setAddingDay(false)}
          />
        ) : (
          <button
            onClick={() => setAddingDay(true)}
            className="w-full py-3 border border-dashed border-mist rounded-2xl text-slate text-sm hover:border-terra/40 hover:text-terra transition-colors"
          >
            + Add Day {trip.days.length + 1}
          </button>
        )}
      </div>
    </div>

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
