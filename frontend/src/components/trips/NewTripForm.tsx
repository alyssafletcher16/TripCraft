'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DESTINATIONS } from '@/data/destinations'
import { DateRangePicker } from './DateRangePicker'

const VIBES = [
  { id: 'adventure',  label: 'Adventure'  },
  { id: 'foodie',     label: 'Foodie'     },
  { id: 'cultural',   label: 'Cultural'   },
  { id: 'romantic',   label: 'Romantic'   },
  { id: 'hiking',     label: 'Hiking'     },
  { id: 'relaxation', label: 'Relaxation' },
  { id: 'solo',       label: 'Solo'       },
  { id: 'nightlife',  label: 'Nightlife'  },
  { id: 'budget',     label: 'Budget'     },
  { id: 'luxury',     label: 'Luxury'     },
]

const INPUT_CLS =
  'w-full border border-mist rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/30 placeholder-slate/50'

const LABEL_CLS = 'block text-slate text-xs font-mono uppercase tracking-wider mb-1.5'

export function NewTripForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [customVibeInput, setCustomVibeInput] = useState('')
  const [customVibes, setCustomVibes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [budgetType, setBudgetType] = useState<'total' | 'per_person'>('total')

  // Date range
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  // Destination autocomplete
  const [destQuery, setDestQuery]       = useState('')
  const [destCity, setDestCity]         = useState('')
  const [destCountry, setDestCountry]   = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Show all when empty, filter when typing — always alphabetized
  const filtered = DESTINATIONS
    .filter((d) =>
      destQuery.trim().length === 0
        ? true
        : d.label.toLowerCase().includes(destQuery.toLowerCase())
    )
    .sort((a, b) => a.label.localeCompare(b.label))

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectDestination(city: string, country: string, label: string) {
    setDestQuery(label)
    setDestCity(city)
    setDestCountry(country)
    setDropdownOpen(false)
  }

  function handleDestInput(value: string) {
    setDestQuery(value)
    setDestCity('')
    setDestCountry('')
    setDropdownOpen(true)
  }

  function toggleVibe(id: string) {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function addCustomVibe() {
    const tag = customVibeInput.trim().toLowerCase()
    if (!tag) return
    if (customVibes.includes(tag) || VIBES.some((v) => v.id === tag)) return
    setCustomVibes((prev) => [...prev, tag])
    setCustomVibeInput('')
  }

  function removeCustomVibe(tag: string) {
    setCustomVibes((prev) => prev.filter((v) => v !== tag))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const destination = destCity || destQuery.trim()
    const country     = destCountry || undefined
    const travelers   = parseInt(data.get('travelers') as string) || 1
    const budgetStr   = data.get('budget') as string
    const budget      = budgetStr ? parseFloat(budgetStr) : undefined
    const budgetTypeVal = budgetType
    const customTitle = data.get('title') as string
    const title       = customTitle.trim() || destination

    if (!destination) {
      setError('Please enter a destination')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/trips`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            title,
            destination,
            country,
            startDate: dateStart || undefined,
            endDate:   dateEnd || undefined,
            travelers,
            budget,
            budgetType: budgetTypeVal,
            vibes: [...selectedVibes, ...customVibes],
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create trip' }))
        throw new Error(err.error || 'Failed to create trip')
      }

      const trip = await res.json()
      router.push(`/trips/${trip.id}`)
    } catch (err: unknown) {
      if (
        err instanceof TypeError &&
        (err.message === 'Load failed' || err.message === 'Failed to fetch')
      ) {
        setError('Could not reach the server. Please make sure the backend is running.')
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl w-full flex flex-col gap-4 sm:gap-6">

      {/* ── Destination ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-5">Destination</h2>
        <div className="flex flex-col gap-4">

          <div>
            <label htmlFor="dest-input" className={LABEL_CLS}>City, Region, or Country *</label>
            <div className="relative" ref={dropdownRef}>
              <input
                id="dest-input"
                type="text"
                autoComplete="off"
                value={destQuery}
                onChange={(e) => handleDestInput(e.target.value)}
                onFocus={() => setDropdownOpen(true)}
                placeholder="e.g. Tokyo, Amalfi Coast, Iceland"
                className={INPUT_CLS}
              />

              {dropdownOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-mist rounded-xl shadow-lg overflow-hidden max-h-[280px] overflow-y-auto">
                  {filtered.length > 0 ? (
                    filtered.map((d) => (
                      <button
                        key={d.label}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectDestination(d.city, d.country, d.label)
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-ink hover:bg-foam transition-colors flex items-center justify-between gap-3 border-b border-mist/40 last:border-b-0"
                      >
                        <span className="font-medium">{d.city}</span>
                        <span className="text-slate text-xs flex-shrink-0">{d.country}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate">
                      No matches — you can still use this as a custom destination
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="title" className={LABEL_CLS}>Trip title (optional)</label>
            <input
              id="title"
              name="title"
              type="text"
              autoComplete="off"
              placeholder="Defaults to destination"
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* ── Dates & Travelers ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-5">Dates &amp; Travelers</h2>
        <div className="flex flex-col gap-4">

          <div>
            <label className={LABEL_CLS}>Trip dates</label>
            <DateRangePicker
              startDate={dateStart}
              endDate={dateEnd}
              onChange={(s, e) => { setDateStart(s); setDateEnd(e) }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="travelers" className={`${LABEL_CLS} mb-2`}>
                Total travelers (including you)
              </label>
              <input
                id="travelers"
                name="travelers"
                type="number"
                min={1}
                defaultValue={1}
                className={INPUT_CLS}
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                <label htmlFor="budget" className="text-slate text-xs font-mono uppercase tracking-wider">
                  Budget (USD)
                </label>
                <div className="flex rounded-lg border border-mist overflow-hidden text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setBudgetType('total')}
                    className={`px-2.5 py-1 transition-colors ${budgetType === 'total' ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                  >
                    Total
                  </button>
                  <button
                    type="button"
                    onClick={() => setBudgetType('per_person')}
                    className={`px-2.5 py-1 border-l border-mist transition-colors ${budgetType === 'per_person' ? 'bg-ocean text-white' : 'text-slate hover:text-ink'}`}
                  >
                    Per person
                  </button>
                </div>
              </div>
              <input
                id="budget"
                name="budget"
                type="number"
                min={0}
                step={50}
                placeholder={budgetType === 'total' ? 'e.g. 3200' : 'e.g. 1600'}
                className={INPUT_CLS}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Vibes ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-4 sm:p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-1">Trip vibes</h2>
        <p className="text-slate text-xs mb-4">Select all that apply, or add your own</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {VIBES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => toggleVibe(v.id)}
              className={`px-4 py-2 rounded-full border-[1.5px] text-sm transition-all duration-150 ${
                selectedVibes.includes(v.id)
                  ? 'bg-ocean border-ocean text-white'
                  : 'bg-white border-mist text-ink hover:border-terra hover:text-terra'
              }`}
            >
              {v.label}
            </button>
          ))}
          {customVibes.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] bg-ocean border-ocean text-white text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeCustomVibe(tag)}
                className="hover:opacity-70 leading-none"
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>

        {/* Custom vibe input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={customVibeInput}
            onChange={(e) => setCustomVibeInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addCustomVibe() }
            }}
            placeholder="Add a custom vibe…"
            className="flex-1 border border-mist rounded-xl px-4 py-2.5 text-sm text-ink bg-white focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/30 placeholder-slate/50"
          />
          <button
            type="button"
            onClick={addCustomVibe}
            disabled={!customVibeInput.trim()}
            className="px-4 py-2.5 rounded-xl border-[1.5px] border-terra text-terra text-sm font-medium hover:bg-terra hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-terra text-white py-3.5 px-8 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-terra-lt disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:self-start"
      >
        {loading ? 'Creating trip…' : 'Create trip →'}
      </button>
    </form>
  )
}
