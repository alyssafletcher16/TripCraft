'use client'

import { Badge } from '@/components/ui/Badge'
import { BookingCTA } from '@/components/BookingCTA'
import type { Block as BlockType } from '@/types'

// SVG icons per block type — no emojis
const TYPE_ICONS: Record<string, { svg: React.ReactNode; bg: string; color: string }> = {
  TRANSPORT: {
    bg: '#FCE8E8', color: '#C04040',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
      </svg>
    ),
  },
  STAY: {
    bg: '#E3EEF5', color: '#2A6080',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>
      </svg>
    ),
  },
  ACTIVITY: {
    bg: '#EEF0FA', color: '#3B4A8A',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/>
      </svg>
    ),
  },
  FOOD: {
    bg: '#FEF0E6', color: '#9A4E10',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-2.28-.73-3.71-2.07-4.99C12.54 8.71 11 8 9 8S5.17 8.7 3.84 9.9C2.6 11.1 2 12.64 2 15H1v1h15.03v-1z"/>
      </svg>
    ),
  },
  NOTE: {
    bg: '#F0F4F8', color: '#4A6070',
    svg: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    ),
  },
}

interface BlockProps {
  block: BlockType
  tripId?: string
  destination?: string
  onEdit?: () => void
  onDelete?: () => void
}

export function Block({ block, tripId, destination, onEdit, onDelete }: BlockProps) {
  const meta = TYPE_ICONS[block.type] ?? TYPE_ICONS.NOTE

  return (
    <div className="group relative flex items-start gap-3 px-3.5 py-3 rounded-xl border-[1.5px] border-mist bg-surface hover:border-terra/30 hover:bg-[#FBF8F6] transition-all duration-150">
      {(onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="p-1.5 rounded-lg bg-white border border-mist text-slate hover:text-ocean hover:border-ocean/40 transition-colors"
              title="Edit"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="p-1.5 rounded-lg bg-white border border-mist text-slate hover:text-red-500 hover:border-red-200 transition-colors"
              title="Delete"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          )}
        </div>
      )}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: block.bgColor ?? meta.bg, color: meta.color }}
      >
        {meta.svg}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-ink leading-snug">{block.title}</p>
            {block.detail && <p className="text-xs text-slate mt-0.5 leading-relaxed">{block.detail}</p>}
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {block.price && <span className="text-xs font-mono text-slate">{block.price}</span>}
            <Badge variant={block.status === 'BOOKED' ? 'green' : block.status === 'CANCELLED' ? 'danger' : 'slate'}>
              {block.status.toLowerCase()}
            </Badge>
          </div>
        </div>

        {(block.confCode || block.cancelPolicy) && (
          <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-mono text-slate">
            {block.confCode && <span>Conf: {block.confCode}</span>}
            {block.cancelPolicy && (
              <span className={block.cancelSafe ? 'text-success' : 'text-caution'}>
                {block.cancelPolicy}
              </span>
            )}
          </div>
        )}

        {block.bookingUrl && block.status === 'PENDING' && (
          <div className="pt-2 mt-1.5 border-t border-mist/60">
            <a
              href={block.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-terra text-white text-[11px] font-semibold hover:bg-terra-lt transition-colors"
            >
              Book now ↗
            </a>
          </div>
        )}

        {!block.bookingUrl && destination && (block.type === 'ACTIVITY' || block.type === 'STAY') && (
          <BookingCTA block={block} destination={destination} tripId={tripId} />
        )}
      </div>
    </div>
  )
}
