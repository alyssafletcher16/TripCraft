'use client'

import { useEffect, useRef, useState } from 'react'

type Activity = {
  name: string
  icon: string
  category: string
  minPrice: number
  maxPrice: number
  currency: string
  topRating: number
  totalReviews: number
  companies: number
}

const CATEGORY_TYPE: Record<string, { label: string; bg: string; color: string }> = {
  'Nature':      { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Adventure':   { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Cultural':    { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Scenic':      { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Sports':      { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Water':       { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Nightlife':   { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' },
  'Food & Drink':{ label: 'Food',     bg: '#FEF0E6', color: '#9A4E10' },
}

const TABS = ['All', 'Activity', 'Food'] as const
type Tab = (typeof TABS)[number]

function getTypeStyle(category: string) {
  return CATEGORY_TYPE[category] ?? { label: 'Activity', bg: '#EEF0FA', color: '#3B4A8A' }
}

interface Props {
  destination: string
  onSelectActivity: (activity: Activity) => void
}

export function GlobalItinerarySearch({ destination, onSelectActivity }: Props) {
  const [query, setQuery] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!destination) return
    setLoading(true)
    fetch(`/api/activities?destination=${encodeURIComponent(destination)}`)
      .then((r) => r.json())
      .then((data) => setActivities(data.activities ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [destination])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = activities.filter((a) => {
    const matchesQuery = !query.trim() || a.name.toLowerCase().includes(query.toLowerCase())
    const typeStyle = getTypeStyle(a.category)
    const matchesTab = activeTab === 'All' || typeStyle.label === activeTab
    return matchesQuery && matchesTab
  })

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={`Search activities in ${destination}…`}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-mist bg-white text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-terra transition-colors shadow-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl border border-mist shadow-xl z-50 overflow-hidden">
          {/* Tab filters */}
          <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-mist">
            <span className="text-[10px] font-mono text-slate uppercase tracking-wider mr-1 flex-shrink-0">
              Filter:
            </span>
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTab === tab ? 'bg-ocean text-white' : 'text-slate hover:text-ink hover:bg-foam'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-5 text-slate text-xs">
                <svg
                  className="animate-spin w-3.5 h-3.5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Loading activities…
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-5 text-center text-slate text-xs">
                {query ? `No results for "${query}"` : 'No activities available'}
              </div>
            )}
            {!loading &&
              filtered.map((act) => {
                const typeStyle = getTypeStyle(act.category)
                return (
                  <button
                    key={act.name}
                    onClick={() => {
                      onSelectActivity(act)
                      setOpen(false)
                      setQuery('')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-foam text-left transition-colors border-b border-mist/50 last:border-0"
                  >
                    <span className="text-xl flex-shrink-0">{act.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">{act.name}</div>
                      {act.minPrice > 0 && (
                        <div className="text-[11px] text-slate mt-px">
                          {act.currency} {act.minPrice}–{act.maxPrice} · ★ {act.topRating}
                        </div>
                      )}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{ background: typeStyle.bg, color: typeStyle.color }}
                    >
                      {typeStyle.label}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
