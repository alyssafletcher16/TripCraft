'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CommunityCard } from './CommunityCard'
import type { DiscoverTrip } from './CommunityCard'
import { DiscoverMap } from './DiscoverMap'
import type { MapCluster } from './DiscoverMap'
import { api } from '@/lib/api'

// ── Filter chips ──────────────────────────────────────────────────────────────
const FILTERS = ['Trending', 'Hiking', 'Foodie', 'Budget', 'Couples', 'Solo', 'Adventure']

const FILTER_VIBE: Record<string, string> = {
  Trending:  '',
  Hiking:    'Hiking',
  Foodie:    'Foodie',
  Budget:    'Budget',
  Couples:   'Romantic',
  Solo:      'Solo',
  Adventure: 'Adventure',
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function DiscoverFeed() {
  const { data: session } = useSession()
  // friends tab removed
  const [filter, setFilter] = useState('Trending')
  const [selectedCity, setSelectedCity] = useState<MapCluster | null>(null)
  const [cards, setCards] = useState<DiscoverTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())
  const [destinationCounts, setDestinationCounts] = useState<Record<string, number>>({})
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`${API}/api/discover/stats`)
      .then((r) => r.json())
      .then((data) => { if (data.counts) setDestinationCounts(data.counts) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!session?.accessToken) return
    api.social.following(session.accessToken)
      .then((data) => {
        const d = data as { following?: { followingId: string }[] }
        if (d.following) {
          setFollowingIds(new Set(d.following.map((f) => f.followingId)))
        }
      })
      .catch(() => {})
  }, [session?.accessToken])

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    const vibe = FILTER_VIBE[filter]
    let url = `${API}/api/discover?sort=popular${vibe ? `&vibe=${encodeURIComponent(vibe)}` : ''}&limit=12`
    if (selectedCity) {
      url += `&destination=${encodeURIComponent(selectedCity.label)}`
    }
    try {
      const res = await fetch(url)
      const data = await res.json()
      const trips: DiscoverTrip[] = Array.isArray(data.trips) ? data.trips : []
      setCards(trips)
    } catch {
      setCards([])
    } finally {
      setLoading(false)
    }
  }, [filter, selectedCity])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  async function handleUpvote(tripId: string) {
    if (!session?.accessToken) return
    setUpvoted((prev) => {
      const next = new Set(prev)
      next.has(tripId) ? next.delete(tripId) : next.add(tripId)
      return next
    })
    await fetch(`${API}/api/discover/${tripId}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).catch(() => {
      setUpvoted((prev) => {
        const next = new Set(prev)
        next.has(tripId) ? next.delete(tripId) : next.add(tripId)
        return next
      })
    })
  }

  return (
    <div>
      {/* ── Interactive map ── */}
      <DiscoverMap onCitySelect={setSelectedCity} selectedCity={selectedCity} destinationCounts={destinationCounts} />

      {/* Selected city banner */}
      {selectedCity && (
        <div className="mt-3 bg-white rounded-2xl border-[1.5px] border-mist px-4 sm:px-5 py-3 sm:py-3.5 flex flex-row items-center justify-between gap-3">
          <div>
            <div className="font-serif text-xl font-bold text-ink">{selectedCity.label}</div>
            <div className="text-[12px] text-slate mt-0.5">
              {cards.length} itineraries · Showing top-rated below
            </div>
          </div>
          <button
            onClick={() => setSelectedCity(null)}
            className="border-[1.5px] border-mist text-slate px-4 py-2 rounded-full text-[12px] hover:border-terra/40 hover:text-terra transition-colors flex-shrink-0"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-mist my-5" />

      {/* Filter chips */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full border-[1.5px] text-[12px] transition-all"
            style={{
              borderColor: filter === f ? '#0D2B45' : '#D6E4EE',
              background:  filter === f ? '#0D2B45' : '#fff',
              color:       filter === f ? '#fff'    : '#0A1F30',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* City filter label */}
      {selectedCity && (
        <div className="font-mono text-[10px] text-terra tracking-[1.5px] uppercase mb-3.5">
          Showing itineraries tagged &ldquo;{selectedCity.label}&rdquo;
        </div>
      )}

      {/* Card grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-white rounded-[18px] border-[1.5px] border-mist animate-pulse" />
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="py-16 text-center">
          <div className="text-3xl mb-3">🗺️</div>
          <div className="font-serif text-base font-bold text-ink mb-1">
            {selectedCity ? `No itineraries yet for ${selectedCity.label}` : 'No trips shared yet'}
          </div>
          <p className="text-[13px] text-slate">Be the first to share a trip here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {cards.map((card, i) => (
            <CommunityCard
              key={card.id}
              card={card}
              index={i}
              upvoted={upvoted.has(card.id)}
              onUpvote={handleUpvote}
              initialFollowing={card.user.id ? followingIds.has(card.user.id) : false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
