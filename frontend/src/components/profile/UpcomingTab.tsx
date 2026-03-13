'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Trip, TripStatus } from '@/types'
import { useCityPhoto } from '@/hooks/useCityPhoto'
import { useSidebar } from '@/components/layout/SidebarContext'
import { UploadItineraryModal } from '@/components/itinerary/UploadItineraryModal'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function dateRange(startDate: string | null, endDate: string | null) {
  const s = fmtDate(startDate)
  const e = fmtDate(endDate)
  if (s && e && s !== e) return `${s} → ${e}`
  return s ?? e ?? null
}

// Sub-component so each row can call useCityPhoto as a hook
function TripCover({ destination, coverEmoji }: { destination: string; coverEmoji?: string | null }) {
  const photoUrl = useCityPhoto(destination)
  return (
    <div className="w-11 h-11 rounded-xl bg-foam overflow-hidden flex-shrink-0 relative">
      {photoUrl ? (
        <>
          <img
            src={photoUrl}
            alt={destination}
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="text-lg drop-shadow">{coverEmoji || '◻'}</span>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xl">
          {coverEmoji || '◻'}
        </div>
      )}
    </div>
  )
}

interface UpcomingTabProps {
  onTripCompleted: () => void
}

export function UpcomingTab({ onTripCompleted }: UpcomingTabProps) {
  const { data: session, status } = useSession()
  const token = (session as { accessToken?: string })?.accessToken
  const { incrementRefreshKey } = useSidebar()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [shareAnonymous, setShareAnonymous] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!token) { setLoading(false); return }

    fetch(`${API}/api/trips`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Trip[]) => {
        if (!Array.isArray(data)) { setLoading(false); return }
        const upcoming = data.filter((t) => t.status === 'PLANNING' || t.status === 'ACTIVE')
        setTrips(upcoming)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, status])

  async function handleStatusChange(tripId: string, newStatus: string) {
    if (newStatus === 'COMPLETED') {
      setShareAnonymous(false)
      setPendingCompleteId(tripId)
      return
    }
    // PLANNING <-> ACTIVE change — save immediately
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status: newStatus as TripStatus } : t))
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {
      setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status: t.status } : t))
    })
  }

  async function confirmComplete(tripId: string) {
    setConfirming(true)
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'COMPLETED' }),
    })
    await fetch(`${API}/api/trips/${tripId}/community`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isPublic: true, isAnonymous: shareAnonymous }),
    }).catch(() => {})
    setTrips((prev) => prev.filter((t) => t.id !== tripId))
    setPendingCompleteId(null)
    setConfirming(false)
    incrementRefreshKey()
    onTripCompleted()
  }

  if (loading || status === 'loading') {
    return (
      <div className="p-4 sm:p-8 md:p-12 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-mist h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 pt-2 sm:p-8 sm:pt-4 md:p-12 md:pt-6 max-w-3xl">
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-6">Your active trips</h2>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist p-8 text-center max-w-md">
          <div className="text-4xl mb-4">✈</div>
          <h3 className="font-serif text-xl font-bold text-ink mb-2">No upcoming trips</h3>
          <p className="text-slate text-sm mb-6">Plan a new trip or upload an existing itinerary.</p>
          <Link
            href="/trips/new"
            className="bg-terra text-white py-2.5 px-6 rounded-full text-sm font-semibold hover:bg-terra-lt transition-colors"
          >
            Plan a trip →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trips.map((trip, index) => {
            const range = dateRange(trip.startDate, trip.endDate)
            const isPending = pendingCompleteId === trip.id
            return (
              <div key={trip.id}>
                <div className={`flex items-center gap-3 sm:gap-4 bg-white rounded-2xl border px-4 py-3 transition-colors ${isPending ? 'border-success/30' : 'border-mist'}`}>
                  {/* Rank */}
                  <span className="text-xs font-mono text-slate/40 w-5 text-center flex-shrink-0">
                    #{index + 1}
                  </span>

                  {/* Cover photo */}
                  <TripCover destination={trip.destination} coverEmoji={trip.coverEmoji} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/trips/${trip.id}`} className="font-semibold text-ink text-sm hover:underline truncate block">
                      {trip.title}
                    </Link>
                    <p className="text-slate text-xs truncate">{trip.destination}</p>
                    {(range || trip.travelers > 1) && (
                      <p className="text-slate/60 text-[10px] font-mono uppercase mt-0.5">
                        {range}
                        {range && trip.travelers > 1 ? '  ·  ' : ''}
                        {trip.travelers > 1 ? `${trip.travelers} TRAVELERS` : ''}
                      </p>
                    )}
                  </div>

                  {/* Mark complete button */}
                  <button
                    onClick={() => handleStatusChange(trip.id, 'COMPLETED')}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-colors flex-shrink-0 bg-gold/10 text-gold border-gold/30 hover:bg-gold/20"
                  >
                    Mark complete
                  </button>
                </div>

                {/* Confirm complete prompt */}
                {isPending && (
                  <div className="mx-4 mb-1 px-4 py-2.5 rounded-b-xl bg-success/5 border border-t-0 border-success/20">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-[11px] text-slate">This trip will be shared with the community. Do you want your itinerary to be shared publicly or anonymously?</p>
                      {/* Public / Anon pill toggle */}
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
                        onClick={() => confirmComplete(trip.id)}
                        className="text-xs font-semibold text-white bg-success px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingCompleteId(null)}
                        className="text-xs text-slate hover:text-ink"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
