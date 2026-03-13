'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.accessToken) {
      setLoading(false)
      return
    }

    fetch(`${API}/api/trips`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setTrips(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load trips')
        setLoading(false)
      })
  }, [session, status])

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
      // revert on failure
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

  if (error) {
    return <p className="text-slate text-sm">{error}</p>
  }

  if (trips.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-mist p-12 text-center max-w-md">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {trips.map((trip) => (
        <TripCard
          key={trip.id}
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
          onStatusChange={handleStatusChange}
          onTogglePublic={handleTogglePublic}
        />
      ))}
    </div>
  )
}
