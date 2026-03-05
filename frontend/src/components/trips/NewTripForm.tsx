'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const VIBES = [
  { id: 'adventure',  label: 'Adventure',  icon: '🧗' },
  { id: 'foodie',     label: 'Foodie',     icon: '🍝' },
  { id: 'cultural',   label: 'Cultural',   icon: '🏛' },
  { id: 'romantic',   label: 'Romantic',   icon: '♡'  },
  { id: 'hiking',     label: 'Hiking',     icon: '🥾' },
  { id: 'relaxation', label: 'Relaxation', icon: '🌅' },
  { id: 'solo',       label: 'Solo',       icon: '🧳' },
  { id: 'nightlife',  label: 'Nightlife',  icon: '🌙' },
  { id: 'budget',     label: 'Budget',     icon: '💸' },
  { id: 'luxury',     label: 'Luxury',     icon: '✦'  },
]

const EMOJIS = ['✈', '🌋', '🏖', '🗼', '🏔', '🌿', '🏙', '🗺', '🌊', '🍷', '🎭', '🧳', '🌸', '🏝', '🎿']

const INPUT_CLS =
  'w-full border border-mist rounded-xl px-4 py-3 text-sm text-ink bg-white focus:outline-none focus:border-terra focus:ring-1 focus:ring-terra/30 placeholder-slate/50'

const LABEL_CLS = 'block text-slate text-xs font-mono uppercase tracking-wider mb-1.5'

export function NewTripForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedVibes, setSelectedVibes] = useState<string[]>([])
  const [selectedEmoji, setSelectedEmoji] = useState('✈')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleVibe(id: string) {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const destination = data.get('destination') as string
    const country     = data.get('country') as string
    const startDate   = data.get('startDate') as string
    const endDate     = data.get('endDate') as string
    const travelers   = parseInt(data.get('travelers') as string) || 1
    const budgetStr   = data.get('budget') as string
    const budget      = budgetStr ? parseFloat(budgetStr) : undefined
    const customTitle = data.get('title') as string
    const title       = customTitle.trim() || destination

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
            country:   country || undefined,
            startDate: startDate || undefined,
            endDate:   endDate || undefined,
            travelers,
            budget,
            vibes:     selectedVibes,
            coverEmoji: selectedEmoji,
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
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-6">

      {/* ── Destination ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-5">Destination</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="destination" className={LABEL_CLS}>City / Region *</label>
            <input
              id="destination"
              name="destination"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. Sicily, Italy"
              className={INPUT_CLS}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className={LABEL_CLS}>Country</label>
              <input
                id="country"
                name="country"
                type="text"
                autoComplete="off"
                placeholder="e.g. Italy"
                className={INPUT_CLS}
              />
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
      </div>

      {/* ── Dates & Travelers ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-5">Dates &amp; Travelers</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className={LABEL_CLS}>Start date</label>
            <input id="startDate" name="startDate" type="date" className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="endDate" className={LABEL_CLS}>End date</label>
            <input id="endDate" name="endDate" type="date" className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="travelers" className={LABEL_CLS}>
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
            <label htmlFor="budget" className={LABEL_CLS}>Total budget (USD)</label>
            <input
              id="budget"
              name="budget"
              type="number"
              min={0}
              step={50}
              placeholder="e.g. 3200"
              className={INPUT_CLS}
            />
          </div>
        </div>
      </div>

      {/* ── Vibes ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-1">Trip vibes</h2>
        <p className="text-slate text-xs mb-4">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {VIBES.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => toggleVibe(v.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-[1.5px] text-sm transition-all duration-150 ${
                selectedVibes.includes(v.id)
                  ? 'bg-ocean border-ocean text-white'
                  : 'bg-white border-mist text-ink hover:border-terra hover:text-terra'
              }`}
            >
              <span>{v.icon}</span>
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Cover emoji ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-mist p-7">
        <h2 className="font-serif text-xl font-bold text-ink mb-1">Cover icon</h2>
        <p className="text-slate text-xs mb-4">Pick an emoji for your trip card</p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setSelectedEmoji(emoji)}
              className={`w-11 h-11 text-xl rounded-xl border-[1.5px] transition-all duration-150 ${
                selectedEmoji === emoji
                  ? 'border-terra bg-terra/10'
                  : 'border-mist bg-foam hover:border-terra/40'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-terra text-white py-3.5 px-8 rounded-full text-sm font-semibold transition-all duration-200 hover:bg-terra-lt disabled:opacity-50 disabled:cursor-not-allowed self-start"
      >
        {loading ? 'Creating trip…' : 'Create trip →'}
      </button>
    </form>
  )
}
