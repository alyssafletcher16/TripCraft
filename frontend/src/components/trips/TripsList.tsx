'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TripCard } from './TripCard'
import type { Trip, TripStatus } from '@/types'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function TripsList() {
  const { data: session, status } = useSession()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOver = useRef<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.accessToken) { setLoading(false); return }

    fetch(`${API}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data: Trip[]) => {
        if (!Array.isArray(data)) { setLoading(false); return }
        // Sort by existing rank first, then unranked at the end by updatedAt
        const sorted = [...data].sort((a, b) => {
          if (a.rank != null && b.rank != null) return a.rank - b.rank
          if (a.rank != null) return -1
          if (b.rank != null) return 1
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
        // Assign sequential ranks to reflect list order
        const withRanks = sorted.map((t, i) => ({ ...t, rank: i + 1 }))
        setTrips(withRanks)
        setLoading(false)
      })
      .catch(() => { setError('Failed to load trips'); setLoading(false) })
  }, [session, status])

  async function persistOrder(ordered: Trip[]) {
    if (!session?.accessToken) return
    await fetch(`${API}/api/trips/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ order: ordered.map((t, i) => ({ id: t.id, rank: i + 1 })) }),
    })
  }

  function handleDragStart(id: string) {
    setDraggingId(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    dragOver.current = id
  }

  function handleDrop() {
    if (!draggingId || !dragOver.current || draggingId === dragOver.current) {
      setDraggingId(null)
      return
    }
    setTrips((prev) => {
      const from = prev.findIndex((t) => t.id === draggingId)
      const to = prev.findIndex((t) => t.id === dragOver.current)
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      const ranked = next.map((t, i) => ({ ...t, rank: i + 1 }))
      persistOrder(ranked)
      return ranked
    })
    setDraggingId(null)
    dragOver.current = null
  }

  async function handleStatusChange(tripId: string, newStatus: TripStatus) {
    if (!session?.accessToken) return
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status: newStatus } : t))
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => {
      setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, status: t.status } : t))
    })
  }

  async function handleTogglePublic(tripId: string, newVal: boolean) {
    if (!session?.accessToken) return
    setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, isPublic: newVal } : t))
    await fetch(`${API}/api/trips/${tripId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
      body: JSON.stringify({ isPublic: newVal }),
    }).catch(() => {
      setTrips((prev) => prev.map((t) => t.id === tripId ? { ...t, isPublic: !newVal } : t))
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-mist h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-slate text-sm">{error}</p>

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-mist p-6 sm:p-12 text-center max-w-md">
        <div className="text-4xl mb-4">✈</div>
        <h3 className="font-serif text-xl font-bold text-ink mb-2">No trips yet</h3>
        <p className="text-slate text-sm mb-6">Create your first itinerary to get started.</p>
        <Link
          href="/trips/new"
          className="bg-terra text-white py-2.5 px-6 rounded-full text-sm font-semibold hover:bg-terra-lt transition-colors"
        >
          Plan a trip →
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="hidden sm:block text-[11px] text-slate font-mono uppercase tracking-wide mb-4">
        Drag to reorder your ranking
      </p>
      <div className="flex flex-col gap-2">
        {trips.map((trip) => (
          <div
            key={trip.id}
            draggable
            onDragStart={() => handleDragStart(trip.id)}
            onDragOver={(e) => handleDragOver(e, trip.id)}
            onDrop={handleDrop}
            onDragEnd={() => setDraggingId(null)}
            className={`relative group transition-opacity duration-150 flex items-center gap-2 ${
              draggingId && draggingId !== trip.id ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {/* Drag handle */}
            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="text-slate/50">
                <circle cx="4" cy="2" r="1.2"/><circle cx="8" cy="2" r="1.2"/>
                <circle cx="4" cy="6" r="1.2"/><circle cx="8" cy="6" r="1.2"/>
                <circle cx="4" cy="10" r="1.2"/><circle cx="8" cy="10" r="1.2"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
            <TripCard
              id={trip.id}
              title={trip.title}
              destination={trip.destination}
              status={trip.status}
              coverEmoji={trip.coverEmoji}
              startDate={
                trip.startDate
                  ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : null
              }
              endDate={
                trip.endDate
                  ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : null
              }
              travelers={trip.travelers}
              isPublic={trip.isPublic}
              rank={trip.rank}
              isDragging={draggingId === trip.id}
              row
              onStatusChange={handleStatusChange}
              onTogglePublic={handleTogglePublic}
            />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
