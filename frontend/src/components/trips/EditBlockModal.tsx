'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Modal } from '@/components/ui/Modal'
import type { Block } from '@/types'

const INPUT = 'w-full border border-mist rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:border-terra'

interface Props {
  block: Block
  onClose: () => void
  onSaved: (updated: Block) => void
}

export function EditBlockModal({ block, onClose, onSaved }: Props) {
  const { data: session } = useSession()
  const [status, setStatus] = useState<'BOOKED' | 'PENDING' | 'CANCELLED'>(block.status)
  const [cancelSafe, setCancelSafe] = useState(block.cancelSafe)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const data = new FormData(e.currentTarget)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/days/${block.dayId}/blocks/${block.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            title: data.get('title'),
            detail: data.get('detail') || null,
            price: data.get('price') || null,
            status,
            confCode: data.get('confCode') || null,
            cancelPolicy: data.get('cancelPolicy') || null,
            cancelSafe,
          }),
        }
      )

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to save' }))
        throw new Error(err.error || 'Failed to save')
      }

      const updated: Block = await res.json()
      onSaved(updated)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open title="Edit block" onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">Title *</label>
          <input
            name="title"
            type="text"
            required
            autoFocus
            defaultValue={block.title}
            className={INPUT}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
          <div>
            <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">Detail</label>
            <input
              name="detail"
              type="text"
              defaultValue={block.detail ?? ''}
              placeholder="Notes, operator, address…"
              className={INPUT}
            />
          </div>
          <div>
            <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">Price</label>
            <input
              name="price"
              type="text"
              defaultValue={block.price ?? ''}
              placeholder="e.g. $89 AUD"
              className={INPUT}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-slate text-[10px] font-mono uppercase tracking-wider">Status:</span>
          {(['PENDING', 'BOOKED', 'CANCELLED'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
                status === s
                  ? s === 'BOOKED'
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : s === 'CANCELLED'
                    ? 'bg-red-100 text-red-700 border border-red-300'
                    : 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-white border border-mist text-slate'
              }`}
            >
              {s.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">Confirmation #</label>
            <input
              name="confCode"
              type="text"
              defaultValue={block.confCode ?? ''}
              placeholder="e.g. BK-7291038"
              className={`${INPUT} font-mono`}
            />
          </div>
          <div>
            <label className="block text-slate text-[10px] font-mono uppercase tracking-wider mb-1">Cancellation</label>
            <input
              name="cancelPolicy"
              type="text"
              defaultValue={block.cancelPolicy ?? ''}
              placeholder="e.g. Free cancel by May 10"
              className={INPUT}
            />
          </div>
        </div>

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
            {loading ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-slate hover:text-ink border border-mist"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
