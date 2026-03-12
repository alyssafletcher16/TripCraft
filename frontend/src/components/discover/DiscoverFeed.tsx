'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CommunityCard } from './CommunityCard'
import type { DiscoverTrip } from './CommunityCard'
import { FriendCard } from './FriendCard'
import type { FriendEntry } from './FriendCard'
import { DiscoverMap } from './DiscoverMap'
import type { MapCluster } from './DiscoverMap'

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

// ── Static fallback cards ─────────────────────────────────────────────────────
const STATIC_CARDS: DiscoverTrip[] = [
  { id: 's1', destination: 'Amalfi Coast', country: 'Italy',    coverEmoji: '🌋', travelers: 2, budget: 2800, startDate: null, endDate: null, vibes: [{vibe:'Romantic'},{vibe:'Relaxation'}], user: { name: 'mara.v',   avatar: null }, _count: { upvotes: 214 } },
  { id: 's2', destination: 'Oaxaca',       country: 'Mexico',   coverEmoji: '🌵', travelers: 1, budget: 900,  startDate: null, endDate: null, vibes: [{vibe:'Cultural'},{vibe:'Budget'}],     user: { name: 'j.ramos',  avatar: null }, _count: { upvotes: 188 } },
  { id: 's3', destination: 'Salkantay',    country: 'Peru',     coverEmoji: '🏔', travelers: 4, budget: 1400, startDate: null, endDate: null, vibes: [{vibe:'Hiking'},{vibe:'Adventure'}],    user: { name: 'alyssa.t', avatar: null }, _count: { upvotes: 341 } },
  { id: 's4', destination: 'Kyoto',        country: 'Japan',    coverEmoji: '🌸', travelers: 2, budget: 3100, startDate: null, endDate: null, vibes: [{vibe:'Cultural'},{vibe:'Luxury'}],     user: { name: 'koda.s',   avatar: null }, _count: { upvotes: 276 } },
  { id: 's5', destination: 'Lisbon',       country: 'Portugal', coverEmoji: '🏄', travelers: 3, budget: 1200, startDate: null, endDate: null, vibes: [{vibe:'Budget'},{vibe:'Foodie'}],       user: { name: 'priya.n',  avatar: null }, _count: { upvotes: 159 } },
  { id: 's6', destination: 'Patagonia',    country: 'Argentina',coverEmoji: '🦅', travelers: 3, budget: 2600, startDate: null, endDate: null, vibes: [{vibe:'Hiking'},{vibe:'Adventure'}],    user: { name: 'marcos.g', avatar: null }, _count: { upvotes: 422 } },
]

// ── Static friends feed ───────────────────────────────────────────────────────
const FRIENDS_FEED: FriendEntry[] = [
  { user: 'Sara K.',  initial: 'S', color: '#4A6FA5', action: 'just posted photos from',    dest: 'Cinque Terre, Italy', time: '2h ago',     meta: '5 days · 2 travelers · $1,800',  tags: ['Coastal', 'Romantic'],   photos: ['🌊', '🏘', '🍋'], flag: '🌊', votes: 47  },
  { user: 'James R.', initial: 'J', color: '#3A7D5A', action: 'shared their itinerary for', dest: 'Bali, Indonesia',     time: 'Yesterday',  meta: '10 days · 1 traveler · $1,400', tags: ['Adventure', 'Cultural'], photos: ['🌺', '🌊', '🛕'], flag: '🌺', votes: 89  },
  { user: 'Mia C.',   initial: 'M', color: '#8A4F3A', action: 'completed a trip to',        dest: 'Morocco',             time: '3 days ago', meta: '8 days · 4 travelers · $2,200',  tags: ['Cultural', 'Foodie'],    photos: ['🏜', '🕌', '🌶'], flag: '🏜', votes: 134 },
]

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export function DiscoverFeed() {
  const { data: session } = useSession()
  const [feedTab, setFeedTab] = useState<'community' | 'friends'>('community')
  const [filter, setFilter] = useState('Trending')
  const [selectedCity, setSelectedCity] = useState<MapCluster | null>(null)
  const [cards, setCards] = useState<DiscoverTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set())

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
      if (trips.length > 0) {
        setCards(trips)
      } else if (selectedCity?.itins && selectedCity.itins.length > 0) {
        setCards(selectedCity.itins.map((i) => STATIC_CARDS[i]).filter(Boolean))
      } else {
        setCards(STATIC_CARDS)
      }
    } catch {
      if (selectedCity?.itins && selectedCity.itins.length > 0) {
        setCards(selectedCity.itins.map((i) => STATIC_CARDS[i]).filter(Boolean))
      } else {
        setCards(STATIC_CARDS)
      }
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
      <DiscoverMap onCitySelect={setSelectedCity} selectedCity={selectedCity} />

      {/* Selected city banner */}
      {selectedCity && (
        <div className="mt-3 bg-white rounded-2xl border-[1.5px] border-mist px-5 py-3.5 flex items-center justify-between">
          <div>
            <div className="font-serif text-xl font-bold text-ink">{selectedCity.label}</div>
            <div className="text-[12px] text-slate mt-0.5">
              {selectedCity.count} itineraries · Showing top-rated below
            </div>
          </div>
          <button
            onClick={() => setSelectedCity(null)}
            className="border-[1.5px] border-mist text-slate px-4 py-1.5 rounded-full text-[12px] hover:border-terra/40 hover:text-terra transition-colors"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-mist my-5" />

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 mb-7 border-b border-mist">
        {(['community', 'friends'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFeedTab(t)}
            className="px-5 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-all"
            style={{
              borderBottomColor: feedTab === t ? '#C4603A' : 'transparent',
              color: feedTab === t ? '#C4603A' : '#5B7A8E',
            }}
          >
            {t === 'community' ? '🌍 Community' : '👥 Friends'}
            {t === 'friends' && (
              <span className="ml-2 text-[9px] bg-terra text-white rounded-full px-1.5 py-0.5">
                3 new
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Community tab ── */}
      {feedTab === 'community' && (
        <>
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
              {cards.map((card, i) => (
                <CommunityCard
                  key={card.id}
                  card={card}
                  index={i}
                  upvoted={upvoted.has(card.id)}
                  onUpvote={handleUpvote}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Friends tab ── */}
      {feedTab === 'friends' && (
        <div className="max-w-[680px]">
          {FRIENDS_FEED.map((entry, i) => (
            <FriendCard key={i} entry={entry} />
          ))}
          <div className="bg-white rounded-[18px] border-[1.5px] border-dashed border-mist p-8 text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="font-serif text-base font-bold text-ink mb-1">Find more travelers</div>
            <p className="text-[13px] text-slate">Follow friends to see their trips in real time.</p>
          </div>
        </div>
      )}
    </div>
  )
}
