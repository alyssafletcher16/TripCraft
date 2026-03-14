'use client'

import { useEffect, useRef, useState } from 'react'
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
        <div className="w-full h-full flex items-center justify-center text-xl">{coverEmoji || '◻'}</div>
      )}
    </div>
  )
}

export function MyTripsTab() {
  const { data: session, status } = useSession()
  const token = (session as { accessToken?: string })?.accessToken
  const { incrementRefreshKey } = useSidebar()

  const [activeTrips, setActiveTrips] = useState<Trip[]>([])
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [shareAnonymous, setShareAnonymous] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOverId = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!token) { setLoading(false); return }
    setLoading(true)

    fetch(`${API}/api/trips`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Trip[]) => {
        if (!Array.isArray(data)) { setLoading(false); return }
        setActiveTrips(data.filter((t) => t.status === 'PLANNING' || t.status === 'ACTIVE'))
        const completed = data
          .filter((t) => t.status === 'COMPLETED')
          .sort((a, b) => {
            if (a.rank != null && b.rank != null) return a.rank - b.rank
            if (a.rank != null) return -1
            if (b.rank != null) return 1
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          })
          .map((t, i) => ({ ...t, rank: i + 1 }))
        setCompletedTrips(completed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, status])

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
    const moved = activeTrips.find((t) => t.id === tripId)
    if (moved) {
      setActiveTrips((prev) => prev.filter((t) => t.id !== tripId))
      setCompletedTrips((prev) => {
        const next = [{ ...moved, status: 'COMPLETED' as TripStatus }, ...prev]
        return next.map((t, i) => ({ ...t, rank: i + 1 }))
      })
    }
    setPendingCompleteId(null)
    setConfirming(false)
    incrementRefreshKey()
  }

  async function persistCompletedOrder(ordered: Trip[]) {
    if (!token) return
    await fetch(`${API}/api/trips/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ order: ordered.map((t, i) => ({ id: t.id, rank: i + 1 })) }),
    })
  }

  function handleDragStart(id: string) { setDraggingId(id) }
  function handleDragOver(e: React.DragEvent, id: string) { e.preventDefault(); dragOverId.current = id }
  function handleDrop() {
    const fromId = draggingId
    const toId = dragOverId.current
    if (!fromId || !toId || fromId === toId) { setDraggingId(null); dragOverId.current = null; return }
    setCompletedTrips((prev) => {
      const from = prev.findIndex((t) => t.id === fromId)
      const to = prev.findIndex((t) => t.id === toId)
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      const ranked = next.map((t, i) => ({ ...t, rank: i + 1 }))
      persistCompletedOrder(ranked)
      return ranked
    })
    setDraggingId(null)
    dragOverId.current = null
  }

  function isAnonymous(trip: Trip) { return !!trip.community?.isAnonymous }

  async function handleSetAnon(trip: Trip, makeAnon: boolean) {
    if (isAnonymous(trip) === makeAnon) return
    setCompletedTrips((prev) =>
      prev.map((t) =>
        t.id === trip.id
          ? { ...t, community: { isPublic: false, friendsOnly: false, ...t.community, isAnonymous: makeAnon } }
          : t
      )
    )
    await fetch(`${API}/api/trips/${trip.id}/community`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isAnonymous: makeAnon }),
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
    <div className="p-4 pt-2 sm:p-8 sm:pt-4 md:p-12 md:pt-6 max-w-3xl">
      {showImport && <UploadItineraryModal onClose={() => setShowImport(false)} />}

      {/* ── Active ── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-ink">Active</h2>
          <Link href="/trips/new" className="text-xs font-semibold text-terra hover:underline">
            + New trip
          </Link>
        </div>

        {activeTrips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-mist p-6 text-center">
            <p className="text-slate text-sm">
              No active trips.{' '}
              <Link href="/trips/new" className="text-terra hover:underline">Plan one →</Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {activeTrips.map((trip, index) => {
              const range = dateRange(trip.startDate, trip.endDate)
              const isPending = pendingCompleteId === trip.id
              return (
                <div key={trip.id}>
                  <div className={`flex items-center gap-3 sm:gap-4 bg-white rounded-2xl border px-4 py-3 transition-colors ${isPending ? 'border-success/30' : 'border-mist'}`}>
                    <span className="text-xs font-mono text-slate/40 w-5 text-center flex-shrink-0">
                      #{index + 1}
                    </span>
                    <TripCover destination={trip.destination} coverEmoji={trip.coverEmoji} />
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
                    {/* Action button — mark trip as complete */}
                    <button
                      onClick={() => { setShareAnonymous(false); setPendingCompleteId(trip.id) }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer focus:outline-none transition-colors flex-shrink-0 bg-ocean text-white hover:bg-ocean/90"
                    >
                      Mark complete
                    </button>
                  </div>

                  {/* Confirm complete prompt */}
                  {isPending && (
                    <div className="mx-4 mb-1 px-4 py-2.5 rounded-b-xl bg-success/5 border border-t-0 border-success/20">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <p className="text-[11px] text-slate">Share publicly or anonymously when marking complete?</p>
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

      {/* ── Completed ── */}
      <div>
        <h2 className="font-serif text-xl font-bold text-ink mb-2">Completed</h2>
        <button
          onClick={() => setShowImport(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-terra text-white text-xs font-semibold hover:bg-terra/90 transition-colors mb-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Import itinerary
        </button>
        {completedTrips.length > 0 && (
          <p className="text-slate/60 text-[11px] font-mono uppercase tracking-wide mb-4">
            Drag to reorder your ranking
          </p>
        )}

        {completedTrips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-mist p-6 text-center">
            <p className="text-slate text-sm">No completed trips yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {completedTrips.map((trip, index) => {
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
                  <div className="flex-shrink-0 w-10 text-center select-none">
                    <span className="text-sm font-mono font-semibold text-gold">#{index + 1}</span>
                  </div>
                  <TripCover destination={trip.destination} coverEmoji={trip.coverEmoji} />
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
                      <Link
                        href={`/trips/${trip.id}`}
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success/80 border border-success/20 hover:bg-success/20 transition-colors mt-0.5"
                      >
                        View Reflection
                      </Link>
                    ) : (
                      <Link
                        href={`/trips/${trip.id}`}
                        className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-mist text-slate border border-mist hover:bg-ocean/10 hover:text-ocean hover:border-ocean/20 transition-colors mt-0.5"
                      >
                        Add Reflection
                      </Link>
                    )}
                  </div>

                  {/* Status tag + Public/Anon */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Completed
                    </span>
                    <div className="flex rounded-full border border-mist bg-foam text-[10px] font-semibold overflow-hidden select-none">
                      <button
                        type="button"
                        onClick={() => handleSetAnon(trip, false)}
                        className={`px-2.5 py-1 transition-colors ${!anon ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                      >
                        Public
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetAnon(trip, true)}
                        className={`px-2.5 py-1 transition-colors ${anon ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                      >
                        Anon
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
