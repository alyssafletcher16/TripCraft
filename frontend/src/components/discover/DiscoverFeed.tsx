'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { CommunityCard } from './CommunityCard'
import type { DiscoverTrip } from './CommunityCard'
import { DiscoverMap } from './DiscoverMap'
import type { MapCluster } from './DiscoverMap'
import { api } from '@/lib/api'

const TAGS = ['Adventure', 'Hiking', 'Cultural', 'Romantic', 'Foodie', 'Relaxation', 'Solo', 'Nightlife', 'Budget', 'Luxury']

const REGIONS = ['Africa', 'Asia', 'Europe', 'Middle East', 'North America', 'South America', 'Oceania']

const BUDGET_RANGES = ['Under $1K', '$1K–$3K', '$3K–$7K', '$7K+']

const DAYS_RANGES = ['1–3 days', '4–7 days', '8–14 days', '15+ days']

const COUNTRY_REGION: Record<string, string> = {
  France: 'Europe', Germany: 'Europe', Italy: 'Europe', Spain: 'Europe',
  'United Kingdom': 'Europe', Portugal: 'Europe', Greece: 'Europe',
  Netherlands: 'Europe', Switzerland: 'Europe', Austria: 'Europe',
  Belgium: 'Europe', Sweden: 'Europe', Norway: 'Europe', Denmark: 'Europe',
  Finland: 'Europe', Poland: 'Europe', 'Czech Republic': 'Europe',
  Hungary: 'Europe', Croatia: 'Europe', Romania: 'Europe', Ireland: 'Europe',
  Iceland: 'Europe', Scotland: 'Europe', Slovakia: 'Europe', Slovenia: 'Europe',
  Japan: 'Asia', China: 'Asia', Thailand: 'Asia', Vietnam: 'Asia',
  Indonesia: 'Asia', India: 'Asia', 'South Korea': 'Asia', Singapore: 'Asia',
  Malaysia: 'Asia', Philippines: 'Asia', Cambodia: 'Asia', Nepal: 'Asia',
  'Sri Lanka': 'Asia', Taiwan: 'Asia', 'Hong Kong': 'Asia', Laos: 'Asia',
  Myanmar: 'Asia', Bangladesh: 'Asia', Bhutan: 'Asia', Mongolia: 'Asia',
  'United States': 'North America', Canada: 'North America', Mexico: 'North America',
  Cuba: 'North America', Jamaica: 'North America', 'Costa Rica': 'North America',
  Panama: 'North America', Guatemala: 'North America', Belize: 'North America',
  'Dominican Republic': 'North America', Haiti: 'North America',
  Brazil: 'South America', Argentina: 'South America', Colombia: 'South America',
  Peru: 'South America', Chile: 'South America', Ecuador: 'South America',
  Bolivia: 'South America', Uruguay: 'South America', Venezuela: 'South America',
  Paraguay: 'South America', Guyana: 'South America', Suriname: 'South America',
  Morocco: 'Africa', Egypt: 'Africa', 'South Africa': 'Africa', Kenya: 'Africa',
  Tanzania: 'Africa', Ghana: 'Africa', Nigeria: 'Africa', Ethiopia: 'Africa',
  Rwanda: 'Africa', Senegal: 'Africa', Tunisia: 'Africa', Algeria: 'Africa',
  Uganda: 'Africa', Mozambique: 'Africa', Zimbabwe: 'Africa', Namibia: 'Africa',
  UAE: 'Middle East', Turkey: 'Middle East', Israel: 'Middle East',
  Jordan: 'Middle East', 'Saudi Arabia': 'Middle East', Qatar: 'Middle East',
  Oman: 'Middle East', Bahrain: 'Middle East', Kuwait: 'Middle East',
  Lebanon: 'Middle East', Iran: 'Middle East', Iraq: 'Middle East',
  Australia: 'Oceania', 'New Zealand': 'Oceania', Fiji: 'Oceania',
  'Papua New Guinea': 'Oceania', Samoa: 'Oceania', Vanuatu: 'Oceania',
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggle: (val: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const count = selected.size

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border-[1.5px] text-sm transition-all whitespace-nowrap"
        style={{
          borderColor: count > 0 ? '#0D2B45' : '#D6E4EE',
          background: count > 0 ? '#0D2B45' : '#fff',
          color: count > 0 ? '#fff' : '#0A1F30',
        }}
      >
        {label}
        {count > 0 && (
          <span className="bg-white/25 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center font-bold">
            {count}
          </span>
        )}
        <svg className="w-3 h-3 opacity-60" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border-[1.5px] border-mist rounded-2xl shadow-[0_8px_24px_rgba(13,43,69,0.12)] z-20 min-w-[180px] py-2">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2.5 px-4 py-2 cursor-pointer hover:bg-foam transition-colors text-sm text-ink"
            >
              <input
                type="checkbox"
                checked={selected.has(opt)}
                onChange={() => onToggle(opt)}
                className="w-3.5 h-3.5 accent-ocean rounded"
              />
              {opt}
            </label>
          ))}
          {count > 0 && (
            <>
              <div className="h-px bg-mist mx-3 my-1.5" />
              <button
                onClick={onClear}
                className="w-full text-left px-4 py-1.5 text-[12px] text-terra hover:text-terra/70 transition-colors"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function DiscoverFeed() {
  const { data: session } = useSession()
  const [search, setSearch] = useState('')
  const [sortByUpvotes, setSortByUpvotes] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedCity, setSelectedCity] = useState<MapCluster | null>(null)
  const [allCards, setAllCards] = useState<DiscoverTrip[]>([])
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

  const fetchFeed = useCallback(async (token?: string) => {
    setLoading(true)
    const url = `${API}/api/discover?sort=popular&limit=60`
    try {
      const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      const data = await res.json()
      const trips: DiscoverTrip[] = Array.isArray(data.trips) ? data.trips : []
      setAllCards(trips)
      // Seed upvoted state from server data
      setUpvoted(new Set(trips.filter((t) => (t as any).userUpvoted).map((t) => t.id)))
    } catch {
      setAllCards([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeed(session?.accessToken ?? undefined) }, [fetchFeed, session?.accessToken])

  // Client-side filtering + sorting
  const cards = useMemo(() => {
    let result = [...allCards]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.destination.toLowerCase().includes(q) ||
        (c.country ?? '').toLowerCase().includes(q) ||
        (c.user.name ?? '').toLowerCase().includes(q) ||
        c.vibes.some((v) => v.vibe.toLowerCase().includes(q))
      )
    }

    if (selectedRegions.size > 0) {
      result = result.filter((c) => {
        const region = COUNTRY_REGION[c.country ?? '']
        return region && selectedRegions.has(region)
      })
    }

    if (selectedTags.size > 0) {
      result = result.filter((c) => c.vibes.some((v) => selectedTags.has(v.vibe)))
    }

    if (selectedCity) {
      result = result.filter((c) =>
        c.destination.toLowerCase().includes(selectedCity.label.toLowerCase())
      )
    }

    if (sortByUpvotes) {
      result = [...result].sort((a, b) => b._count.upvotes - a._count.upvotes)
    }

    return result
  }, [allCards, search, selectedRegions, selectedTags, selectedCity, sortByUpvotes])

  function toggleRegion(r: string) {
    setSelectedRegions((prev) => {
      const next = new Set(prev)
      next.has(r) ? next.delete(r) : next.add(r)
      return next
    })
  }

  function toggleTag(t: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(t) ? next.delete(t) : next.add(t)
      return next
    })
  }

  async function handleUpvote(tripId: string) {
    if (!session?.accessToken) return
    const wasUpvoted = upvoted.has(tripId)
    // Optimistic update
    setUpvoted((prev) => {
      const next = new Set(prev)
      wasUpvoted ? next.delete(tripId) : next.add(tripId)
      return next
    })
    setAllCards((prev) =>
      prev.map((c) =>
        c.id === tripId
          ? { ...c, _count: { ...c._count, upvotes: c._count.upvotes + (wasUpvoted ? -1 : 1) } }
          : c
      )
    )
    const ok = await fetch(`${API}/api/discover/${tripId}/upvote`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    }).then((r) => r.ok).catch(() => false)
    if (!ok) {
      // Revert on failure
      setUpvoted((prev) => {
        const next = new Set(prev)
        wasUpvoted ? next.add(tripId) : next.delete(tripId)
        return next
      })
      setAllCards((prev) =>
        prev.map((c) =>
          c.id === tripId
            ? { ...c, _count: { ...c._count, upvotes: c._count.upvotes + (wasUpvoted ? 1 : -1) } }
            : c
        )
      )
    }
  }

  const hasActiveFilters = search.trim() || selectedRegions.size > 0 || selectedTags.size > 0 || sortByUpvotes

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

      {/* ── Search + Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search bar */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate pointer-events-none"
            viewBox="0 0 16 16" fill="none"
          >
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search destinations, travelers, tags..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border-[1.5px] border-mist rounded-full bg-white focus:outline-none focus:border-ocean/50 text-ink placeholder:text-slate/60"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate hover:text-ink text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort by upvotes toggle */}
          <button
            onClick={() => setSortByUpvotes((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border-[1.5px] text-sm transition-all whitespace-nowrap"
            style={{
              borderColor: sortByUpvotes ? '#0D2B45' : '#D6E4EE',
              background: sortByUpvotes ? '#0D2B45' : '#fff',
              color: sortByUpvotes ? '#fff' : '#0A1F30',
            }}
          >
            ↑ Top Rated
          </button>

          {/* Region multi-select */}
          <MultiSelectDropdown
            label="Region"
            options={REGIONS}
            selected={selectedRegions}
            onToggle={toggleRegion}
            onClear={() => setSelectedRegions(new Set())}
          />

          {/* Tags multi-select */}
          <MultiSelectDropdown
            label="Tags"
            options={TAGS}
            selected={selectedTags}
            onToggle={toggleTag}
            onClear={() => setSelectedTags(new Set())}
          />

          {/* Clear all filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch('')
                setSortByUpvotes(false)
                setSelectedRegions(new Set())
                setSelectedTags(new Set())
              }}
              className="text-[12px] text-slate hover:text-terra transition-colors whitespace-nowrap px-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active filter summary */}
      {(selectedRegions.size > 0 || selectedTags.size > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[...selectedRegions].map((r) => (
            <span
              key={r}
              className="flex items-center gap-1 bg-ocean/10 text-ocean rounded-full px-2.5 py-0.5 text-[11px]"
            >
              {r}
              <button onClick={() => toggleRegion(r)} className="hover:opacity-60 ml-0.5">✕</button>
            </span>
          ))}
          {[...selectedTags].map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 bg-terra/10 text-terra rounded-full px-2.5 py-0.5 text-[11px]"
            >
              {t}
              <button onClick={() => toggleTag(t)} className="hover:opacity-60 ml-0.5">✕</button>
            </span>
          ))}
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
            {hasActiveFilters || selectedCity
              ? 'No trips match your filters'
              : 'No trips shared yet'}
          </div>
          <p className="text-[13px] text-slate">
            {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Be the first to share a trip here.'}
          </p>
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
