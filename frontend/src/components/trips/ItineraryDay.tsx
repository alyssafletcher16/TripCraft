'use client'

import { useState } from 'react'
import { Block } from './Block'
import type { ItineraryDay as DayType } from '@/types'

export function ItineraryDay({ day }: { day: DayType }) {
  const [open, setOpen] = useState(true)

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
          <div>
            <div className="font-serif text-lg font-bold text-ink">{day.name}</div>
            {day.theme && <div className="text-[11px] text-slate">{day.theme}</div>}
          </div>
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
                  className="w-[72px] h-[56px] rounded-[10px] border-2 border-mist flex items-center justify-center text-2xl bg-foam"
                >
                  {p.emoji ?? '📷'}
                </div>
              ))}
            </div>
          )}

          {day.blocks.map((block) => (
            <Block key={block.id} block={block} />
          ))}

          {day.blocks.length === 0 && (
            <p className="text-slate text-sm py-4 text-center">No blocks yet — add flights, hotels, or activities.</p>
          )}
        </div>
      )}
    </div>
  )
}
