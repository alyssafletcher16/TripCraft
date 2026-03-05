'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

const BLOCK_TYPES = [
  { id: 'TRANSPORT', label: 'Transport', icon: '✈', bg: '#FCE8E8' },
  { id: 'STAY',      label: 'Stay',      icon: '🏨', bg: '#E3EEF5' },
  { id: 'ACTIVITY',  label: 'Activity',  icon: '🏔', bg: '#EEF0FA' },
  { id: 'FOOD',      label: 'Food',      icon: '🍽', bg: '#FEF0E6' },
  { id: 'NOTE',      label: 'Note',      icon: '📝', bg: '#F0F4F8' },
] as const

type BlockTypeId = (typeof BLOCK_TYPES)[number]['id']

const INPUT = 'w-full border border-mist rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-terra'

interface Props {
  dayId: string
  onSuccess: () => void
  onCancel: () => void
}

export function AddBlockForm({ dayId, onSuccess, onCancel }: Props) {
  const { data: session } = useSession()
  const [blockType, setBlockType] = useState<BlockTypeId>('ACTIVITY')
  const [status, setStatus] = useState<'BOOKED' | 'PENDING'>('PENDING')
  const [cancelSafe, setCancelSafe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
            emoji: selectedType.icon,
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-foam border border-mist rounded-xl p-4 flex flex-col gap-3"
    >
      {/* Block type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {BLOCK_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setBlockType(t.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              blockType === t.id
                ? 'bg-ocean text-white'
                : 'bg-white border border-mist text-slate hover:border-terra/40'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
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
          placeholder="e.g. Flight JFK → Rome (FCO)"
          className={INPUT}
        />
      </div>

      {/* Detail + Price */}
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">
            Detail
          </label>
          <input
            name="detail"
            type="text"
            autoComplete="off"
            placeholder="Optional notes"
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
            placeholder="e.g. $680"
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
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
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
      <div className="grid grid-cols-2 gap-3">
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
          className="bg-terra text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-terra-lt disabled:opacity-50"
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
