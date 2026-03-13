'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { Trip } from '@/types'
import { UploadItineraryModal } from '@/components/itinerary/UploadItineraryModal'
import { useCityPhoto } from '@/hooks/useCityPhoto'

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

interface CompletedTabProps {
  refreshKey: number
}

export function CompletedTab({ refreshKey }: CompletedTabProps) {
  const { data: session, status } = useSession()
  const token = (session as { accessToken?: string })?.accessToken

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOverId = useRef<string | null>(null)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!token) { setLoading(false); return }
    setLoading(true)

    fetch(`${API}/api/trips`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Trip[]) => {
        if (!Array.isArray(data)) { setLoading(false); return }
        const completed = data
          .filter((t) => t.status === 'COMPLETED')
          .sort((a, b) => {
            if (a.rank != null && b.rank != null) return a.rank - b.rank
            if (a.rank != null) return -1
            if (b.rank != null) return 1
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          })
          .map((t, i) => ({ ...t, rank: i + 1 }))
        setTrips(completed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, status, refreshKey])

  async function persistOrder(ordered: Trip[]) {
    if (!token) return
    await fetch(`${API}/api/trips/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ order: ordered.map((t, i) => ({ id: t.id, rank: i + 1 })) }),
    })
  }

  function handleDragStart(id: string) {
    setDraggingId(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    dragOverId.current = id
  }

  function handleDrop() {
    const fromId = draggingId
    const toId = dragOverId.current
    if (!fromId || !toId || fromId === toId) {
      setDraggingId(null)
      dragOverId.current = null
      return
    }
    setTrips((prev) => {
      const from = prev.findIndex((t) => t.id === fromId)
      const to = prev.findIndex((t) => t.id === toId)
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      const ranked = next.map((t, i) => ({ ...t, rank: i + 1 }))
      persistOrder(ranked)
      return ranked
    })
    setDraggingId(null)
    dragOverId.current = null
  }

  function isAnonymous(trip: Trip) {
    return !!trip.community?.isAnonymous
  }

  async function handleAnonToggle(trip: Trip) {
    const next = !isAnonymous(trip)
    setTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, community: { isPublic: false, friendsOnly: false, ...t.community, isAnonymous: next } }
          : t
      )
    )
    await fetch(`${API}/api/trips/${trip.id}/community`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isAnonymous: next }),
    }).catch(() => {})
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
    <div className="p-4 sm:p-8 md:p-12 max-w-3xl">
      {showImport && <UploadItineraryModal onClose={() => setShowImport(false)} />}
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-ink mb-2">Past Trips</h2>
      <button
        onClick={() => setShowImport(true)}
        className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-terra text-white text-sm font-semibold hover:bg-terra/90 transition-colors mb-4"
      >
        Import itinerary
      </button>
      {trips.length > 0 && (
        <p className="text-slate text-sm mb-6">Drag to reorder your permanent ranking.</p>
      )}

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-mist p-8 text-center max-w-md mt-4">
          <div className="text-4xl mb-4">🏁</div>
          <h3 className="font-serif text-xl font-bold text-ink mb-2">No completed trips yet</h3>
          <p className="text-slate text-sm">When you mark a trip as done, it will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {trips.map((trip, index) => {
            const range = dateRange(trip.startDate, trip.endDate)
            const anon = isAnonymous(trip)
            const isDragging = draggingId === trip.id

            return (
              <div
                key={trip.id}
                draggable
                onDragStart={() => handleDragStart(trip.id)}
                onDragOver={(e) => handleDragOver(e, trip.id)}
                onDrop={handleDrop}
                onDragEnd={() => { setDraggingId(null); dragOverId.current = null }}
                className={`flex items-center gap-3 sm:gap-4 bg-white rounded-2xl border px-4 py-3 cursor-grab active:cursor-grabbing transition-all ${
                  dragOverId.current === trip.id && !isDragging ? 'border-ocean shadow-md' : 'border-mist'
                } ${isDragging ? 'opacity-40' : 'opacity-100'}`}
              >
                {/* Rank badge */}
                <div className="flex-shrink-0 w-10 text-center select-none">
                  <span className="text-sm font-mono font-semibold text-gold">#{index + 1}</span>
                </div>

                {/* Cover */}
                <TripCover destination={trip.destination} coverEmoji={trip.coverEmoji} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/trips/${trip.id}`} className="font-semibold text-ink text-sm hover:underline truncate block">
                    {trip.title}
                  </Link>
                  <p className="text-slate text-xs truncate">
                    {trip.destination}
                    {trip.itineraryImport && (
                      <span className="ml-2 text-slate/40 text-[10px]">Imported</span>
                    )}
                  </p>
                  {range && (
                    <p className="text-slate/50 text-[10px] font-mono uppercase mt-0.5">{range}</p>
                  )}
                  {trip.reflection ? (
                    <span className="text-[10px] text-success/70 font-medium">Reflected</span>
                  ) : (
                    <Link
                      href={`/trips/${trip.id}`}
                      className="text-[10px] text-slate/40 hover:text-slate underline"
                    >
                      Add reflection
                    </Link>
                  )}
                </div>

                {/* Anonymous toggle */}
                <div className="flex items-center gap-2 flex-shrink-0 select-none">
                  <span className="text-[9px] text-slate/40 uppercase tracking-wider font-mono">ANON</span>
                  <button
                    onClick={() => handleAnonToggle(trip)}
                    className={`relative w-9 h-5 rounded-full transition-colors focus:outline-none ${
                      anon ? 'bg-ocean' : 'bg-mist'
                    }`}
                    aria-label={anon ? 'Anonymous — click to show your name' : 'Named — click to post anonymously'}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        anon ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
