'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { useCityPhoto } from '@/hooks/useCityPhoto'
import type { TripStatus } from '@/types'

interface TripCardProps {
  id: string
  title: string
  destination: string
  status: TripStatus
  coverEmoji?: string | null
  startDate?: string | null
  endDate?: string | null
  travelers?: number
  upvotes?: number
  isPublic?: boolean
  rank?: number | null
  isDragging?: boolean
  row?: boolean
  onTogglePublic?: (id: string, newVal: boolean) => void
  onStatusChange?: (id: string, status: TripStatus) => void
}

const statusVariant: Record<TripStatus, 'gold' | 'green' | 'slate' | 'ocean'> = {
  ACTIVE:    'gold',
  COMPLETED: 'green',
  PLANNING:  'ocean',
}

const STATUS_LABELS: Record<TripStatus, string> = {
  PLANNING:  'Planning',
  ACTIVE:    'Active',
  COMPLETED: 'Completed',
}

export function TripCard({ id, title, destination, status, startDate, endDate, travelers, isPublic, rank, isDragging, row, onTogglePublic, onStatusChange }: TripCardProps) {
  const photoUrl = useCityPhoto(destination)

  if (row) {
    return (
      <Link href={`/trips/${id}`} className="block">
        <div
          className={`bg-white rounded-xl border-[1.5px] overflow-hidden transition-all duration-150 hover:shadow-md cursor-pointer flex ${
            isDragging ? 'border-terra/60 shadow-xl opacity-80' : 'border-mist hover:border-terra/40'
          }`}
        >
          {/* Thumbnail */}
          <div className="relative w-24 flex-shrink-0 bg-foam overflow-hidden">
            {photoUrl && (
              <img
                src={photoUrl}
                alt={destination}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
            {rank != null && (
              <span className="absolute top-2 left-2 bg-terra text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                #{rank}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 px-4 py-3 flex items-center justify-between gap-3 min-w-0">
            <div className="min-w-0">
              <h3 className="font-serif text-base font-bold text-ink leading-tight truncate">{title}</h3>
              <p className="text-slate text-xs mt-0.5 truncate">{destination}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate font-mono uppercase tracking-wide mt-1.5">
                {startDate && <span>{startDate}{endDate ? ` → ${endDate}` : ''}</span>}
                {travelers && travelers > 1 && <span>{travelers} travelers</span>}
              </div>
            </div>

            {/* Controls */}
            <div className="flex-shrink-0 flex flex-col items-end gap-2" onClick={(e) => e.preventDefault()}>
              {onStatusChange !== undefined && (
                <select
                  value={status}
                  onChange={(e) => { onStatusChange(id, e.target.value as TripStatus) }}
                  className="text-[11px] font-mono border border-mist rounded-full px-2.5 py-1 bg-white text-ink focus:outline-none focus:border-ocean cursor-pointer"
                >
                  {(['PLANNING', 'ACTIVE', 'COMPLETED', 'DRAFT'] as TripStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              )}
              {onTogglePublic !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate font-mono uppercase tracking-wide">Share</span>
                  <button
                    onClick={() => onTogglePublic(id, !isPublic)}
                    className="relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                    style={{ background: isPublic ? '#C4603A' : '#D6E4EE' }}
                    aria-pressed={isPublic}
                  >
                    <span
                      className="pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 mt-px"
                      style={{ transform: isPublic ? 'translateX(16px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/trips/${id}`} className="block">
      <div
        className={`bg-white rounded-2xl border-[1.5px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer ${
          isDragging ? 'border-terra/60 shadow-xl opacity-80 scale-[1.02]' : 'border-mist hover:border-terra/40'
        }`}
      >
        {/* Cover photo */}
        <div className="relative h-36 bg-foam overflow-hidden">
          {photoUrl && (
            <img
              src={photoUrl}
              alt={destination}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {rank != null && (
              <span className="bg-terra text-white text-[10px] font-bold font-mono px-2 py-0.5 rounded-full">
                #{rank}
              </span>
            )}
            <Badge variant={statusVariant[status]}>{STATUS_LABELS[status].toLowerCase()}</Badge>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-serif text-xl font-bold text-ink mb-0.5">{title}</h3>
          <p className="text-slate text-sm mb-3">{destination}</p>

          <div className="flex items-center gap-4 text-[11px] text-slate font-mono uppercase tracking-wide">
            {startDate && (
              <span>
                {startDate}{endDate ? ` → ${endDate}` : ''}
              </span>
            )}
            {travelers && travelers > 1 && <span>{travelers} travelers</span>}
          </div>

          {(onStatusChange !== undefined || onTogglePublic !== undefined) && (
            <div className="mt-4 pt-3.5 border-t border-mist space-y-3">
              {onStatusChange !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate font-mono uppercase tracking-wide">Status</span>
                  <select
                    value={status}
                    onClick={(e) => e.preventDefault()}
                    onChange={(e) => { e.preventDefault(); onStatusChange(id, e.target.value as TripStatus) }}
                    className="text-[11px] font-mono border border-mist rounded-full px-2.5 py-1 bg-white text-ink focus:outline-none focus:border-ocean cursor-pointer"
                  >
                    {(['PLANNING', 'ACTIVE', 'COMPLETED', 'DRAFT'] as TripStatus[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              )}
              {onTogglePublic !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate font-mono uppercase tracking-wide">Share to community</span>
                  <button
                    onClick={(e) => { e.preventDefault(); onTogglePublic(id, !isPublic) }}
                    className="relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                    style={{ background: isPublic ? '#C4603A' : '#D6E4EE' }}
                    aria-pressed={isPublic}
                  >
                    <span
                      className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                      style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }}
                    />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
