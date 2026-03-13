'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Block } from './Block'
import { AddBlockForm } from './AddBlockForm'
import { EditBlockModal } from './EditBlockModal'
import type { Block as BlockType, ItineraryDay as DayType } from '@/types'

interface Props {
  day: DayType
  destination?: string
  vibes?: string[]
  onBlockAdded?: () => void
}

export function ItineraryDay({ day, destination, vibes, onBlockAdded }: Props) {
  const tripId = day.tripId
  const { data: session } = useSession()
  const [open, setOpen] = useState(true)
  const [addingBlock, setAddingBlock] = useState(false)
  const [blocks, setBlocks] = useState<BlockType[]>(day.blocks)
  const [editingBlock, setEditingBlock] = useState<BlockType | null>(null)

  useEffect(() => {
    setBlocks(day.blocks)
  }, [day.blocks])

  async function handleDelete(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/days/${day.id}/blocks/${blockId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }
    ).catch(() => {})
  }

  function handleSaved(updated: BlockType) {
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setEditingBlock(null)
  }

  return (
    <div className="bg-white rounded-2xl border-[1.5px] border-mist overflow-hidden hover:border-terra/30 transition-colors">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-foam text-left"
      >
        <div className="flex items-center gap-3">
          <span className="bg-ocean text-white font-mono text-[10px] px-3 py-1 rounded-full tracking-[1px]">
            Day {String(day.dayNum).padStart(2, '0')}
          </span>
          {day.theme && <div className="text-[11px] text-slate">{day.theme}</div>}
        </div>
        <div className="flex items-center gap-3">
          {day.date && (
            <span className="font-mono text-[10px] text-slate uppercase tracking-wide">
              {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className="text-slate text-sm">{open ? '▴' : '▾'}</span>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-4 py-4 flex flex-col gap-2.5">
          {day.photos.length > 0 && (
            <div className="flex gap-2 mb-1 flex-wrap">
              {day.photos.map((p) => (
                <div
                  key={p.id}
                  className="w-[72px] h-[56px] rounded-[10px] border-2 border-mist overflow-hidden bg-foam flex items-center justify-center"
                >
                  {p.url ? (
                    <img src={p.url} alt={p.caption ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate/40">
                      <path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}

          {blocks.map((block) => (
            <Block
              key={block.id}
              block={block}
              tripId={tripId}
              destination={destination}
              onEdit={() => setEditingBlock(block)}
              onDelete={() => handleDelete(block.id)}
            />
          ))}

          {blocks.length === 0 && !addingBlock && (
            <p className="text-slate text-sm py-2 text-center">
              No blocks yet — add flights, hotels, or activities.
            </p>
          )}

          {addingBlock ? (
            <AddBlockForm
              dayId={day.id}
              tripId={tripId}
              destination={destination}
              vibes={vibes}
              date={day.date ?? undefined}
              onSuccess={() => {
                setAddingBlock(false)
                onBlockAdded?.()
              }}
              onCancel={() => setAddingBlock(false)}
            />
          ) : (
            <button
              onClick={() => setAddingBlock(true)}
              className="w-full py-2.5 border border-dashed border-mist rounded-xl text-slate text-sm hover:border-terra/40 hover:text-terra transition-colors"
            >
              + Add block
            </button>
          )}
        </div>
      )}

      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onClose={() => setEditingBlock(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
