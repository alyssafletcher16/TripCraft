'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { ActivityCompareModal } from './ActivityCompareModal'

const BLOCK_TYPES = [
  { id: 'TRANSPORT', label: 'Transport', bg: '#FCE8E8', color: '#C04040', description: 'Flights, trains, transfers',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg> },
  { id: 'STAY',      label: 'Stay',      bg: '#E3EEF5', color: '#2A6080', description: 'Hotels, Airbnbs, hostels',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/></svg> },
  { id: 'ACTIVITY',  label: 'Activity',  bg: '#EEF0FA', color: '#3B4A8A', description: 'Tours, sights, experiences',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg> },
  { id: 'FOOD',      label: 'Food',      bg: '#FEF0E6', color: '#9A4E10', description: 'Restaurants, cafés, markets',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-2.28-.73-3.71-2.07-4.99C12.54 8.71 11 8 9 8S5.17 8.7 3.84 9.9C2.6 11.1 2 12.64 2 15H1v1h15.03v-1z"/></svg> },
  { id: 'NOTE',      label: 'Note',      bg: '#F0F4F8', color: '#4A6070', description: 'Reminders, packing, info',
    svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg> },
] as const

type BlockTypeId = (typeof BLOCK_TYPES)[number]['id']

const INPUT = 'w-full border border-mist rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-terra'

interface Props {
  dayId: string
  tripId?: string
  destination?: string
  vibes?: string[]
  date?: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddBlockForm({ dayId, tripId, destination, vibes, date, onSuccess, onCancel }: Props) {
  const { data: session } = useSession()

  // Step 1: type not picked yet
  // Step 2a: ACTIVITY + picking method (browse vs custom)
  // Step 2b: browse → mounts ActivityCompareModal
  // Step 2c: form → shows fields
  const [step, setStep] = useState<'type' | 'activity-method' | 'form'>('type')
  const [blockType, setBlockType] = useState<BlockTypeId | null>(null)
  const [showBrowse, setShowBrowse] = useState(false)

  const [status, setStatus] = useState<'BOOKED' | 'PENDING'>('PENDING')
  const [cancelSafe, setCancelSafe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickType(id: BlockTypeId) {
    setBlockType(id)
    if (id === 'ACTIVITY') {
      setStep('activity-method')
    } else {
      setStep('form')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)
    const selectedType = BLOCK_TYPES.find((t) => t.id === blockType)!

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/days/${dayId}/blocks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            type: blockType,
            title: data.get('title'),
            detail: data.get('detail') || null,
            price: data.get('price') || null,
            status,
            confCode: data.get('confCode') || null,
            cancelPolicy: data.get('cancelPolicy') || null,
            cancelSafe,
            bgColor: selectedType.bg,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to add block' }))
        throw new Error(err.error || 'Failed to add block')
      }

      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Browse mode: mount ActivityCompareModal as overlay ────────────────────
  if (showBrowse) {
    return (
      <ActivityCompareModal
        dayId={dayId}
        tripId={tripId}
        destination={destination}
        vibes={vibes}
        date={date}
        onClose={() => setShowBrowse(false)}
        onBlockAdded={onSuccess}
      />
    )
  }

  // ── Step 1: Type picker ────────────────────────────────────────────────────
  if (step === 'type') {
    return (
      <div className="bg-foam border border-mist rounded-xl p-4">
        <div className="text-[10px] font-mono text-slate uppercase tracking-wider mb-3">
          What kind of block?
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {BLOCK_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => pickType(t.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-[1.5px] border-mist bg-white hover:border-terra hover:bg-foam transition-all group"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: t.bg, color: t.color }}>{t.svg}</span>
              <span className="text-[11px] font-semibold text-ink group-hover:text-terra transition-colors">{t.label}</span>
              <span className="text-[9px] text-slate text-center leading-tight">{t.description}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate hover:text-ink border border-mist"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2a: Activity method picker ───────────────────────────────────────
  if (step === 'activity-method') {
    return (
      <div className="bg-foam border border-mist rounded-xl p-4">
        <button
          type="button"
          onClick={() => setStep('type')}
          className="text-[11px] text-slate hover:text-ink mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <div className="text-[10px] font-mono text-slate uppercase tracking-wider mb-3">
          Add activity
        </div>

        {/* Browse option — primary */}
        <button
          type="button"
          onClick={() => setShowBrowse(true)}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-terra/30 bg-white hover:border-terra hover:bg-foam transition-all text-left mb-2.5 group"
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF0FA] flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-ink text-sm group-hover:text-terra transition-colors">
              Browse top {destination ? `${destination} ` : ''}activities
            </div>
            <div className="text-[11px] text-slate mt-0.5">
              Compare tour companies, see reviews, itinerary details &amp; pricing
            </div>
          </div>
          <span className="text-slate text-lg group-hover:text-terra transition-colors">→</span>
        </button>

        {/* Custom option */}
        <button
          type="button"
          onClick={() => setStep('form')}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-[1.5px] border-mist bg-white hover:border-terra/40 hover:bg-foam transition-all text-left group"
        >
          <div className="w-11 h-11 rounded-[12px] bg-[#EEF0FA] flex items-center justify-center text-xl flex-shrink-0">
            ✏️
          </div>
          <div className="flex-1">
            <div className="font-semibold text-ink text-sm">Add my own activity</div>
            <div className="text-[11px] text-slate mt-0.5">
              Manually enter a custom activity, entrance fee, or self-guided plan
            </div>
          </div>
          <span className="text-slate text-lg">→</span>
        </button>

        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm text-slate hover:text-ink border border-mist"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2b: Manual form (Activity custom OR any other type) ──────────────
  const selectedType = BLOCK_TYPES.find((t) => t.id === blockType)!

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-foam border border-mist rounded-xl p-4 flex flex-col gap-3"
    >
      {/* Back + type header */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (blockType === 'ACTIVITY') setStep('activity-method')
            else setStep('type')
          }}
          className="text-[11px] text-slate hover:text-ink flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ml-1"
          style={{ background: selectedType.bg, color: '#0A1F30' }}
        >
          <span className="w-4 h-4 flex items-center justify-center">{selectedType.svg}</span>
          <span>{selectedType.label}</span>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
          Title *
        </label>
        <input
          name="title"
          type="text"
          required
          autoComplete="off"
          placeholder={
            blockType === 'ACTIVITY' ? 'e.g. Blue Mountains Day Trip' :
            blockType === 'STAY'     ? 'e.g. Park Hyatt Sydney' :
            blockType === 'TRANSPORT'? 'e.g. Flight SYD → MEL' :
            blockType === 'FOOD'     ? 'e.g. Dinner at Quay Restaurant' :
            'Note title'
          }
          className={INPUT}
        />
      </div>

      {/* Detail + Price */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Detail
          </label>
          <input
            name="detail"
            type="text"
            autoComplete="off"
            placeholder="Notes, operator, address…"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Price
          </label>
          <input
            name="price"
            type="text"
            autoComplete="off"
            placeholder="e.g. $89 AUD"
            className={INPUT}
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-2 items-center">
        <span className="text-slate text-[10px] font-mono uppercase tracking-wider">Status:</span>
        {(['PENDING', 'BOOKED'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
              status === s
                ? s === 'BOOKED'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
                : 'bg-white border border-mist text-slate'
            }`}
          >
            {s.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Conf code + cancel policy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Confirmation #
          </label>
          <input
            name="confCode"
            type="text"
            autoComplete="off"
            placeholder="e.g. BK-7291038"
            className={`${INPUT} font-mono`}
          />
        </div>
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Cancellation
          </label>
          <input
            name="cancelPolicy"
            type="text"
            autoComplete="off"
            placeholder="e.g. Free cancel by May 10"
            className={INPUT}
          />
        </div>
      </div>

      {/* Cancel safe toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={cancelSafe}
          onChange={(e) => setCancelSafe(e.target.checked)}
          className="w-4 h-4 rounded accent-green-600"
        />
        <span className="text-sm text-slate">Free / safe cancellation</span>
      </label>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="bg-terra text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-terra-lt disabled:opacity-50"
        >
          {loading ? 'Adding…' : 'Add block'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm text-slate hover:text-ink border border-mist"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
